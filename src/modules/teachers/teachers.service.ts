import { AssignClassDto, AssignSubjectDto, CreateTeacherDto, TeacherQueryDto, UpdateTeacherDto } from './teachers.dto';
import prisma from '../../config/db';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { paginate } from "../../utils/pagination.util";

// the old logic picked the most-recently-created teacher and did

async function nextAutoEmployeeId(): Promise<string> {
  const all = await prisma.teacher.findMany({ select: { employeeId: true } });
  const maxNumeric = all.reduce((max, t) => {
    const n = Number(t.employeeId);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return String(maxNumeric + 1).padStart(2, "0");
}

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
    const emailExists = await prisma.user.findUnique({ where: { email: dto.email } });
    if (emailExists) {
      throw { status: 409, message: "Email already exists" };
    }

    // 2. Decide teacher ID (manual OR auto)
    let employeeId: string;

    if (dto.TeachersId) {
      employeeId = dto.TeachersId;
      const exists = await prisma.teacher.findUnique({ where: { employeeId } });
      if (exists) {
        throw { status: 409, message: "Teacher ID already exists" };
      }
    } else {
      employeeId = await nextAutoEmployeeId();
    }

    // 3. Password
    const wasPasswordGenerated = !dto.password;
    const rawPassword = dto.password ?? randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 4. Create — with one retry if a concurrent request grabbed the same
    // auto-generated employeeId between our check and this write (the
    // findFirst-then-create window is a real race at this table size).
    const buildData = (id: string) => ({
      name: dto.name,
      email: dto.email,
      passwordHash: hashedPassword,
      role: "TEACHER" as const,
      teacherProfile: {
        create: {
          employeeId: id,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          gender: dto.gender,
          designation: dto.designation,
          department: dto.department,
          qualification: dto.qualification,
          experience: dto.experience,
          address: dto.address,
          dateOfBirth: new Date(dto.dateOfBirth),
          joiningDate: new Date(dto.dateOfJoining),
          bloodGroup: dto.bloodGroup,
          salary: dto.salary,
          photo: dto.avatarUrl,
        },
      },
    });

    const selectShape = {
      id: true,
      name: true,
      email: true,
      role: true,
      teacherProfile: {
        include: { subjectAssignments: { include: { subject: true } } },
      },
    } as const;

    let newTeacher;
    try {
      newTeacher = await prisma.user.create({ data: buildData(employeeId), select: selectShape });
    } catch (err: any) {
      if (err?.code === "P2002" && !dto.TeachersId) {
        // Auto-generated ID collided with a concurrent create — recompute
        // once and retry. A manual ID collision was already caught above,
        // so this only fires for the auto-generate race.
        employeeId = await nextAutoEmployeeId();
        newTeacher = await prisma.user.create({ data: buildData(employeeId), select: selectShape });
      } else {
        throw err;
      }
    }

    // 5. Assign subject if provided
    let subjectAssignmentWarning: string | undefined;
    if (dto.subjectId && newTeacher.teacherProfile?.id) {
      const subjectExists = await prisma.subject.findUnique({ where: { id: dto.subjectId } });
      if (!subjectExists) {
        // FIX: this used to be silently swallowed by a catch that logged
        // a console.warn and nothing else — the API returned 201 success
        // while quietly failing to do something the caller explicitly
        // asked for. Now it's surfaced in the response instead.
        subjectAssignmentWarning = `Subject with ID ${dto.subjectId} not found — teacher created without a subject assignment.`;
      } else {
        try {
          await prisma.subjectAssignment.create({
            data: { subjectId: dto.subjectId, teacherId: newTeacher.teacherProfile.id },
          });
        } catch (err: any) {
          subjectAssignmentWarning = `Subject assignment failed: ${err?.message ?? 'unknown error'}`;
        }
      }
    }

    return {
      ...newTeacher,
      //  an auto-generated password was previously created and then
      // never surfaced anywhere — the account existed but nobody had the
      // credential to log into it. Only present when we generated it, so
      // an admin who supplied their own password never sees this key.
      ...(wasPasswordGenerated && { temporaryPassword: rawPassword }),
      ...(subjectAssignmentWarning && { warning: subjectAssignmentWarning }),
    };
  },

  async findAll(query: TeacherQueryDto) {
    const { page = '1', limit = '10', search, department, designation } = query;

    const where: any = {
      //  department/designation were accepted in TeacherQueryDto but
      // never actually applied to the query — filtering by either did
      // nothing before.
      ...(department && { department }),
      ...(designation && { designation }),
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

    const transformedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      gender: teacher.gender ?? '—',
      createdAt: teacher.createdAt,
      subject: teacher.subjectAssignments?.[0]?.subject?.name ?? teacher.subjectSpecialization ?? '—',
      subjectId: teacher.subjectAssignments?.[0]?.subjectId,
      // FIX: was `teacher.joiningDate` mislabeled as dateOfBirth — now
      // that the column actually exists, use the real value.
      dateOfBirth: teacher.dateOfBirth,
      joiningDate: teacher.joiningDate,
    }));

    return { teachers: transformedTeachers, meta };
  },

  async findById(id: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjectAssignments: { include: { subject: { select: { id: true, name: true } } } },
        sectionTeacher: { include: { class: { select: { id: true, name: true } } } },
      },
    });

    if (!teacher) throw { status: 404, message: "Teacher not found" };

    return {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone ?? "—",
      gender: teacher.gender ?? "—",
      //  these six were all hardcoded placeholders before because
      // the columns didn't exist. Now they return what was actually
      // stored.
      dateOfBirth: teacher.dateOfBirth,
      employeeId: teacher.employeeId,
      designation: teacher.designation ?? "—",
      department: teacher.department ?? "—",
      qualification: teacher.qualification ?? "—",
      experience: teacher.experience ?? 0,
      address: teacher.address ?? "—",
      bloodGroup: teacher.bloodGroup ?? "—",
      joiningDate: teacher.joiningDate,
      salary: teacher.salary ?? 0,

      subject: teacher.subjectAssignments?.[0]?.subject?.name ?? "—",
      subjectId: teacher.subjectAssignments?.[0]?.subjectId ?? null,
      subjectAssignments: teacher.subjectAssignments?.map(sa => ({
        id: sa.id,
        subjectId: sa.subject.id,
        subjectName: sa.subject.name
      })) ?? [],

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
    if (!teacher) throw { status: 404, message: 'Teacher not found' };

    //  previously spread `...teacherFields` (everything except
    // name/avatarUrl) straight into prisma.teacher.update — that used to
    // crash on the six unknown fields. Now that the schema has them, this
    // works as originally intended, and dateOfBirth needs its own
    // string→Date conversion like joiningDate gets elsewhere.
    const { name, avatarUrl, dateOfBirth, ...teacherFields } = dto;

    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...teacherFields,
        ...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
        ...(avatarUrl !== undefined && { photo: avatarUrl }),
        ...(name && {
          name,
          user: { update: { name } },
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

  //  this hard-deleted the User row (cascading onto Teacher) even
  // though the schema has an `isActive` flag clearly meant for this. A
  // teacher with any Marks, TeacherAttendance, Homework, or Timetable
  // rows (none of which cascade-delete from Teacher) would hit a raw FK
  // violation the moment they'd ever taught a class — deleting a
  // teacher's account also isn't supposed to erase the historical
  // academic records tied to them (grades they entered, attendance they
  // took), same reasoning as fee records with payment history. This now
  // deactivates instead, matching the WAIVED-instead-of-delete pattern.
  async delete(id: string) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw { status: 404, message: 'Teacher not found' };

    return prisma.teacher.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async uploadAvatar(id: string, avatarUrl: string) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw { status: 404, message: 'Teacher not found' };

    return prisma.teacher.update({ where: { id }, data: { photo: avatarUrl } });
  },

  async assignSubjects(id: string, dto: AssignSubjectDto) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw { status: 404, message: 'Teacher not found' };

    const validSubjects = await prisma.subject.findMany({ where: { id: { in: dto.subjectIds } }, select: { id: true } });
    if (validSubjects.length !== dto.subjectIds.length) {
      throw { status: 400, message: 'One or more subject IDs are invalid' };
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
    if (!teacher) throw { status: 404, message: 'Teacher not found' };

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
      throw { status: 404, message: 'Teacher not found' };
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

    if (!teacher) throw { status: 404, message: 'Teacher not found' };

    const classIds = Array.from(new Set(teacher.sectionTeacher.map((s) => s.classId)));

    if (classIds.length === 0) {
      return {
        totalStudents: 0,
        totalClasses: 0,
        totalSubjects: teacher.subjectAssignments.length,
        upcomingExams: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalStudents, totalClasses, totalSubjects, upcomingExams] = await Promise.all([
      prisma.student.count({
        where: { section: { classId: { in: classIds } } },
      }),
      Promise.resolve(classIds.length),
      Promise.resolve(teacher.subjectAssignments.length),
      prisma.examSchedule.count({
        where: { classId: { in: classIds }, examDate: { gte: today } },
      }),
    ]);

    return { totalStudents, totalClasses, totalSubjects, upcomingExams };
  },
};