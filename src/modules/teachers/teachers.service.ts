import { AssignClassDto, AssignSubjectDto, CreateTeacherDto, TeacherQueryDto, UpdateTeacherDto } from './teachers.dto';
import prisma from '../../config/db';
import bcrypt from 'bcryptjs';
import { paginate } from "../../utils/pagination.util";

export const TeachersService = {
  async create(dto: CreateTeacherDto) {
    const emailExists = await prisma.user.findUnique({ where: { email: dto.email } });
    if (emailExists) throw new Error('Email already exists');

    const employeeExists = await prisma.teacher.findUnique({ where: { employeeId: dto.TeachersId } });
    if (employeeExists) throw new Error('Teacher ID already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const teacherUser = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: hashedPassword,
        role: 'TEACHER',
        teacherProfile: {
          create: {
            employeeId: dto.TeachersId,
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            subjectSpecialization: dto.department ?? dto.designation,
            joiningDate: new Date(dto.dateOfJoining),
            photo: dto.avatarUrl,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        teacherProfile: true,
      },
    });

    return teacherUser;
  },

  async findAll(query: TeacherQueryDto) {
    const { page = '1', limit = '10', search } = query;

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { employeeId: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const { skip, take, meta } = await paginate(prisma.teacher, where, parseInt(page, 10), parseInt(limit, 10));

    const teachers = await prisma.teacher.findMany({
      where,
      skip,
      take,
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
        sectionTeacher: { include: { class: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { teachers, meta };
  },

  async findById(id: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
        sectionTeacher: { include: { class: { select: { id: true, name: true } } } },
        timetableSlots: {
          include: {
            subject: { select: { id: true, name: true } },
            section: { select: { id: true, name: true } },
          },
          take: 20,
        },
      },
    });

    if (!teacher) throw new Error('Teacher not found');
    return teacher;
  },

  async findByUserId(userId: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
        sectionTeacher: { include: { class: { select: { id: true, name: true } } } },
      },
    });

    if (!teacher) throw new Error('Teacher not found');
    return teacher;
  },

  async update(id: string, dto: UpdateTeacherDto) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new Error('Teacher not found');

    const { name, avatarUrl, ...teacherFields } = dto;

    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...teacherFields,
        ...(avatarUrl !== undefined && { photo: avatarUrl }),
        ...(name && {
          name,
          user: {
            update: {
              name,
            },
          },
        }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
        sectionTeacher: { include: { class: { select: { id: true, name: true } } } },
      },
    });

    return updatedTeacher;
  },

  async delete(id: string) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new Error('Teacher not found');

    await prisma.user.delete({ where: { id: teacher.userId } });
  },

  async uploadAvatar(id: string, avatarUrl: string) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new Error('Teacher not found');

    return prisma.teacher.update({ where: { id }, data: { photo: avatarUrl } });
  },

  async assignSubjects(id: string, dto: AssignSubjectDto) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new Error('Teacher not found');

    const validSubjects = await prisma.subject.findMany({ where: { id: { in: dto.subjectIds } }, select: { id: true } });
    if (validSubjects.length !== dto.subjectIds.length) {
      throw new Error('One or more subject IDs are invalid');
    }

    await prisma.subjectAssignment.deleteMany({ where: { teacherId: id } });

    if (dto.subjectIds.length > 0) {
      await prisma.subjectAssignment.createMany({
        data: dto.subjectIds.map((subjectId) => ({ teacherId: id, subjectId })),
      });
    }

    return prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
      },
    });
  },

  async assignClasses(id: string, dto: AssignClassDto) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new Error('Teacher not found');

    const sections = await prisma.section.findMany({ where: { classId: { in: dto.classIds } }, select: { id: true } });

    await prisma.teacher.update({
      where: { id },
      data: {
        sectionTeacher: {
          set: sections.map((s) => ({ id: s.id })),
        },
      },
    });

    return prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        sectionTeacher: { include: { class: { select: { id: true, name: true } } } },
      },
    });
  },

  async getTeacherSchedule(id: string) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new Error('Teacher not found');

    return prisma.timetableSlot.findMany({
      where: { teacherId: id },
      include: {
        subject: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  },

  async getDashboardStats(teacherId: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        subjectAssignments: { select: { id: true } },
        sectionTeacher: { select: { classId: true } },
      },
    });

    if (!teacher) throw new Error('Teacher not found');

    const classIds = Array.from(new Set(teacher.sectionTeacher.map((s) => s.classId)));

    const [totalStudents, totalClasses, totalSubjects, upcomingExams] = await Promise.all([
      prisma.student.count({
        where: {
          section: {
            classId: {
              in: classIds,
            },
          },
        },
      }),
      Promise.resolve(classIds.length),
      Promise.resolve(teacher.subjectAssignments.length),
      prisma.examSchedule.count({
        where: {
          classId: {
            in: classIds,
          },
          examDate: {
            gte: new Date(),
          },
        },
      }),
    ]);

    return {
      totalStudents,
      totalClasses,
      totalSubjects,
      upcomingExams,
    };
  },
};
