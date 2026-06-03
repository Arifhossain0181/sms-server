import { AssignClassDto, AssignSubjectDto, CreateTeacherDto, TeacherQueryDto, UpdateTeacherDto } from './teachers.dto';
import prisma from '../../config/db';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { paginate } from "../../utils/pagination.util";

export const TeachersService = {
  async getTeacherIdByUserId(userId: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: { id: true },
    });
    return teacher?.id ?? null;
  },

  async create(dto: CreateTeacherDto) {
     // 1. Email check
  const emailExists = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (emailExists) {
    throw { status: 409, message: "Email already exists" };
  }

  // 2. Decide teacher ID (manual OR auto)
  let employeeId: string;

  if (dto.TeachersId) {
    // manual input
    employeeId = dto.TeachersId;

    // duplicate check
    const exists = await prisma.teacher.findUnique({
      where: { employeeId },
    });

    if (exists) {
      throw { status: 409, message: "Teacher ID already exists" };
    }
  } else {
    // auto generate
    const lastTeacher = await prisma.teacher.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let next = 1;

    if (lastTeacher?.employeeId) {
      next = Number(lastTeacher.employeeId) + 1;
    }

    employeeId = String(next).padStart(2, "0");
  }

  // 3. Password
  const rawPassword =
    dto.password ?? randomBytes(4).toString("hex");

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // 4. Create
  const newTeacher = await prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      passwordHash: hashedPassword,
      role: "TEACHER",

      teacherProfile: {
        create: {
          employeeId, // FINAL VALUE (manual or auto)
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          gender: dto.gender,
          subjectSpecialization: dto.department,
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
      teacherProfile: {
        include: {
          subjectAssignments: {
            include: { subject: true }
          }
        }
      },
    },
  });

  // 5. Assign subject if provided
  if (dto.subjectId && newTeacher.teacherProfile?.id) {
    try {
      // Check if subject exists
      const subjectExists = await prisma.subject.findUnique({
        where: { id: dto.subjectId }
      });

      if (!subjectExists) {
        throw new Error(`Subject with ID ${dto.subjectId} not found`);
      }

      // Create subject assignment
      await prisma.subjectAssignment.create({
        data: {
          subjectId: dto.subjectId,
          teacherId: newTeacher.teacherProfile.id
        }
      });
    } catch (error) {
      console.warn("Subject assignment failed:", (error as any)?.message);
    }
  }

  return newTeacher;
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

    // Transform response to include gender and subject
    const transformedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      gender: teacher.gender ?? '—',
      createdAt: teacher.createdAt,
      subject: teacher.subjectAssignments?.[0]?.subject?.name ?? teacher.subjectSpecialization ?? '—',
      subjectId: teacher.subjectAssignments?.[0]?.subjectId,
      dateOfBirth: teacher.joiningDate,
      joiningDate: teacher.joiningDate,
   
    }));

    return { teachers: transformedTeachers, meta };
  },

 async findById(id: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      subjectAssignments: {
        include: { subject: { select: { id: true, name: true } } },
      },
      sectionTeacher: {
        include: { class: { select: { id: true, name: true } } },
      },
    },
  });

  if (!teacher) throw new Error("Teacher not found");

  return {
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone ?? "—",
    gender: teacher.gender ?? "—",
    dateOfBirth: teacher.joiningDate,  // Map to dateOfBirth if available
    employeeId: teacher.employeeId,
    designation: "—",
    department: teacher.subjectSpecialization ?? "—",
    qualification: "—",
    experience: 0,
    address: "—",
    joiningDate: teacher.joiningDate,
    salary: 0,
    
    // Subject information
    subject: teacher.subjectAssignments?.[0]?.subject?.name ?? "—",
    subjectId: teacher.subjectAssignments?.[0]?.subjectId ?? null,
    subjectAssignments: teacher.subjectAssignments?.map(sa => ({
      id: sa.id,
      subjectId: sa.subject.id,
      subjectName: sa.subject.name
    })) ?? [],

    // Class assignments
    classes: teacher.sectionTeacher?.map((s) => s.class?.name) ?? [],
    isActive: teacher.isActive,
    createdAt: teacher.createdAt,
    updatedAt: teacher.updatedAt,
  };
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

    if (!teacher) {
      throw { status: 404, message: 'Teacher profile not found' };
    }
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
    if (!teacher) {
      console.warn(`Teacher with ID ${id} not found`);
      throw new Error('Teacher not found');
    }

    return prisma.timetable.findMany({
      where: { teacherId: id },
      include: {
        subject: { select: { id: true, name: true } },
        section: { select: { id: true, name: true, classId: true, class: { select: { name: true } } } },
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

    // If no classes assigned, return zero stats
    if (classIds.length === 0) {
      return {
        totalStudents: 0,
        totalClasses: 0,
        totalSubjects: teacher.subjectAssignments.length,
        upcomingExams: 0,
      };
    }

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
            gte: today,
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
