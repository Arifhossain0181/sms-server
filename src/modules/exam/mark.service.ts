import { ResultStatus } from '../../generated/prisma/enums';
import prisma from '../../config/db';
import { getExamById } from './exam.service';
import { SubmitExamMarksDto, ApproveMarksDto, RejectMarksDto } from './exam.dto';

type AuthUser = {
  id: string;
  role: string;
};

const safeAudit = async (userId: string, action: string, targetId: string, meta: object) => {
  try {
    await prisma.auditLog.create({ data: { userId, action, targetId, meta, timestamp: new Date() } });
  } catch (err) {
    console.warn('Audit log failed:', (err as any)?.message);
  }
};

function resolveGrade(
  marksObtained: number,
  fullMarks: number,
  rules: { minMark: number; maxMark: number; grade: string; gpaPoint: number }[],
) {
  const matchedRule = rules.find((rule) => marksObtained >= rule.minMark && marksObtained <= rule.maxMark);
  return { grade: matchedRule?.grade, gpa: matchedRule?.gpaPoint };
}

export const submitExamMarks = async (
  examId: string,
  dto: SubmitExamMarksDto,
  authUser: AuthUser,
) => {
  await getExamById(examId);

  if (!dto.entries?.length) {
    throw { status: 400, message: 'At least one mark entry is required' };
  }

  let teacherIdFromAuth: string | null = null;
  if (authUser.role === 'TEACHER') {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: authUser.id },
      select: { id: true },
    });
    if (!teacher) {
      throw { status: 403, message: 'Teacher profile not found for this user' };
    }
    teacherIdFromAuth = teacher.id;
  }

  const studentIds = [...new Set(dto.entries.map((e) => e.studentId))];
  const subjectIds = [...new Set(dto.entries.map((e) => e.subjectId))];

  const [students, subjects, gradingRules] = await Promise.all([
    prisma.student.findMany({ where: { id: { in: studentIds } }, select: { id: true } }),
    prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, fullMarks: true } }),
    prisma.gradingRule.findMany({
      orderBy: { minMark: 'asc' },
      select: { minMark: true, maxMark: true, grade: true, gpaPoint: true },
    }),
  ]);

  const studentSet = new Set(students.map((s) => s.id));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  for (const entry of dto.entries) {
    if (!studentSet.has(entry.studentId)) {
      throw { status: 404, message: `Student not found: ${entry.studentId}` };
    }
    const subject = subjectMap.get(entry.subjectId);
    if (!subject) {
      throw { status: 404, message: `Subject not found: ${entry.subjectId}` };
    }
    if (entry.marksObtained < 0 || entry.marksObtained > subject.fullMarks) {
      throw {
        status: 400,
        message: `Marks must be between 0 and ${subject.fullMarks} for subject ${entry.subjectId}`,
      };
    }
    const teacherId = teacherIdFromAuth ?? entry.teacherId;
    if (!teacherId) {
      throw {
        status: 400,
        message: `teacherId is required for admin mark entry (student: ${entry.studentId})`,
      };
    }
  }

  const requiredPairs = dto.entries.map((entry) => ({
    subjectId: entry.subjectId,
    teacherId: (teacherIdFromAuth ?? entry.teacherId) as string,
  }));
  const uniquePairs = [...new Map(
    requiredPairs.map((p) => [`${p.subjectId}:${p.teacherId}`, p])
  ).values()];

  const assignments = await prisma.subjectAssignment.findMany({
    where: { OR: uniquePairs.map((p) => ({ subjectId: p.subjectId, teacherId: p.teacherId })) },
    select: { subjectId: true, teacherId: true },
  });
  const assignedSet = new Set(assignments.map((a) => `${a.subjectId}:${a.teacherId}`));

  for (const pair of uniquePairs) {
    if (!assignedSet.has(`${pair.subjectId}:${pair.teacherId}`)) {
      throw {
        status: 403,
        message: `Teacher ${pair.teacherId} is not assigned to subject ${pair.subjectId}`,
      };
    }
  }

  const marks = await prisma.$transaction(
    dto.entries.map((entry) => {
      const subject = subjectMap.get(entry.subjectId)!;
      const teacherId = (teacherIdFromAuth ?? entry.teacherId) as string;
      const { grade, gpa } = resolveGrade(entry.marksObtained, subject.fullMarks, gradingRules);

      return prisma.mark.upsert({
        where: {
          studentId_examId_subjectId: {
            studentId: entry.studentId,
            examId,
            subjectId: entry.subjectId,
          },
        },
        update: {
          marksObtained: entry.marksObtained,
          grade,
          gpa,
          teacherId,
          status: 'SUBMITTED',
          rejectReason: null,
          reviewedById: null,
          reviewedAt: null,
        },
        create: {
          studentId: entry.studentId,
          examId,
          subjectId: entry.subjectId,
          marksObtained: entry.marksObtained,
          grade,
          gpa,
          teacherId,
          status: 'SUBMITTED',
        },
      });
    })
  );

  return { examId, totalProcessed: marks.length, marks };
};

export const listPendingMarks = async (examId: string, classId?: string, subjectId?: string) => {
  await getExamById(examId);

  return prisma.mark.findMany({
    where: {
      examId,
      status: 'SUBMITTED',
      ...(subjectId && { subjectId }),
      ...(classId && { student: { section: { classId } } }),
    },
    include: {
      student: {
        select: {
          id: true,
          studentId: true,
          name: true,
          section: { select: { name: true, class: { select: { name: true } } } },
        },
      },
      subject: { select: { id: true, name: true, fullMarks: true, passMarks: true } },
      teacher: { select: { id: true, name: true } },
    },
    orderBy: [{ subjectId: 'asc' }, { student: { name: 'asc' } }],
  });
};

export const approveMarks = async (
  examId: string,
  dto: ApproveMarksDto,
  actorUserId: string,
) => {
  await getExamById(examId);

  const where: any = dto.entries?.length
    ? {
        examId,
        status: 'SUBMITTED',
        OR: dto.entries.map((e) => ({ studentId: e.studentId, subjectId: e.subjectId })),
      }
    : { examId, status: 'SUBMITTED' };

  const target = await prisma.mark.findMany({ where, select: { id: true, studentId: true } });
  if (!target.length) {
    throw { status: 400, message: 'No pending marks found matching the given criteria' };
  }

  await prisma.mark.updateMany({
    where: { id: { in: target.map((t) => t.id) } },
    data: { status: 'APPROVED', reviewedById: actorUserId, reviewedAt: new Date() },
  });

  await safeAudit(actorUserId, 'EXAM_MARKS_APPROVE', examId, { count: target.length });

  const affectedStudentIds = [...new Set(target.map((t) => t.studentId))];
  const reportCards = await generateReportCards(examId, affectedStudentIds);

  return { examId, approvedCount: target.length, reportCardsUpdated: reportCards.length };
};

export const rejectMarks = async (
  examId: string,
  dto: RejectMarksDto,
  actorUserId: string,
) => {
  await getExamById(examId);

  if (!dto.entries?.length) {
    throw { status: 400, message: 'entries[] is required to reject specific marks' };
  }
  if (!dto.reason?.trim()) {
    throw { status: 400, message: 'A reason is required to reject marks' };
  }

  const target = await prisma.mark.findMany({
    where: {
      examId,
      status: 'SUBMITTED',
      OR: dto.entries.map((e) => ({ studentId: e.studentId, subjectId: e.subjectId })),
    },
    select: { id: true },
  });

  if (!target.length) {
    throw { status: 400, message: 'No pending marks found matching the given criteria' };
  }

  await prisma.mark.updateMany({
    where: { id: { in: target.map((t) => t.id) } },
    data: {
      status: 'REJECTED',
      rejectReason: dto.reason,
      reviewedById: actorUserId,
      reviewedAt: new Date(),
    },
  });

  await safeAudit(actorUserId, 'EXAM_MARKS_REJECT', examId, {
    count: target.length,
    reason: dto.reason,
  });

  return { examId, rejectedCount: target.length };
};

export const generateReportCards = async (examId: string, studentIds?: string[]) => {
  const approvedMarks = await prisma.mark.findMany({
    where: {
      examId,
      status: 'APPROVED',
      ...(studentIds?.length && { studentId: { in: studentIds } }),
    },
    include: { subject: { select: { fullMarks: true } } },
  });

  if (!approvedMarks.length) return [];

  const byStudent = new Map<string, typeof approvedMarks>();
  for (const m of approvedMarks) {
    const list = byStudent.get(m.studentId) ?? [];
    list.push(m);
    byStudent.set(m.studentId, list);
  }

  const results = [];
  for (const [studentId, marks] of byStudent.entries()) {
    const gpas = marks.filter((m) => m.gpa != null).map((m) => m.gpa as number);
    const avgGpa = gpas.length ? gpas.reduce((a, b) => a + b, 0) / gpas.length : null;

    const reportCard = await prisma.reportCard.upsert({
      where: { studentId_examId: { studentId, examId } },
      update: {
        gpa: avgGpa,
      },
      create: {
        studentId,
        examId,
        gpa: avgGpa,
        status: 'UNPUBLISHED',
      },
    });
    results.push(reportCard);
  }

  return results;
};

export const getPublishedResultsForStudent = async (studentId: string, examId?: string) => {
  const publishedReportCards = await prisma.reportCard.findMany({
    where: {
      studentId,
      status: ResultStatus.PUBLISHED,
      ...(examId && { examId }),
    },
    include: { exam: { select: { id: true, name: true, type: true } } },
  });

  if (!publishedReportCards.length) return [];

  const publishedExamIds = publishedReportCards.map((rc) => rc.examId);

  const marks = await prisma.mark.findMany({
    where: { studentId, examId: { in: publishedExamIds } },
    include: { subject: { select: { name: true, fullMarks: true, passMarks: true } } },
  });

  return publishedReportCards.map((rc) => ({
    ...rc,
    subjects: marks.filter((m) => m.examId === rc.examId),
  }));
};

export const getTeacherMarksForExam = async (examId: string, teacherId: string) => {
  const marks = await prisma.mark.findMany({
    where: { examId, teacherId },
    include: {
      student: {
        select: {
          id: true,
          studentId: true,
          name: true,
          rollNumber: true,
          section: {
            select: {
              id: true,
              name: true,
              class: { select: { id: true, name: true } },
            },
          },
        },
      },
      subject: {
        select: { id: true, name: true, fullMarks: true, passMarks: true },
      },
    },
    orderBy: [
      { subjectId: 'asc' },
      { student: { name: 'asc' } },
    ],
  });

  const grouped = new Map<string, {
    student: typeof marks[number]['student'];
    subjectMarks: Array<{
      subjectId: string;
      subjectName: string;
      marksObtained: number;
      fullMarks: number;
      passMarks: number;
      grade: string | null;
      gpa: number | null;
      status: string;
    }>;
  }>();

  for (const mark of marks) {
    const existing = grouped.get(mark.studentId);
    if (existing) {
      existing.subjectMarks.push({
        subjectId: mark.subjectId,
        subjectName: mark.subject.name,
        marksObtained: mark.marksObtained,
        fullMarks: mark.subject.fullMarks,
        passMarks: mark.subject.passMarks,
        grade: mark.grade,
        gpa: mark.gpa,
        status: mark.status,
      });
    } else {
      grouped.set(mark.studentId, {
        student: mark.student,
        subjectMarks: [{
          subjectId: mark.subjectId,
          subjectName: mark.subject.name,
          marksObtained: mark.marksObtained,
          fullMarks: mark.subject.fullMarks,
          passMarks: mark.subject.passMarks,
          grade: mark.grade,
          gpa: mark.gpa,
          status: mark.status,
        }],
      });
    }
  }

  return {
    examId,
    teacherId,
    totalStudents: grouped.size,
    totalEntries: marks.length,
    students: Array.from(grouped.values()),
  };
};

export const getStudentsForExam = async (examId: string, teacherId: string) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      schedules: {
        include: {
          class: {
            include: {
              sections: {
                include: {
                  students: {
                    select: {
                      id: true,
                      studentId: true,
                      name: true,
                      rollNumber: true,
                      sectionId: true,
                    },
                  },
                },
              },
            },
          },
          subject: {
            select: { id: true, name: true, fullMarks: true, passMarks: true },
          },
        },
      },
    },
  });

  if (!exam) {
    throw { status: 404, message: 'Exam not found' };
  }

  const teacherAssignments = await prisma.subjectAssignment.findMany({
    where: { teacherId },
    select: { subjectId: true, classId: true },
  });
  const assignmentSet = new Set(teacherAssignments.map((a) => `${a.classId}:${a.subjectId}`));

  const studentsMap = new Map<string, {
    id: string;
    studentId: string | undefined;
    name: string;
    rollNumber: string | number;
    section: {
      id: string;
      name: string;
      class: { id: string; name: string };
    };
  }>();

  for (const schedule of exam.schedules) {
    const key = `${schedule.classId}:${schedule.subjectId}`;
    if (!assignmentSet.has(key)) continue;

    const classData = schedule.class;
    if (!classData?.sections) continue;

    for (const section of classData.sections) {
      for (const student of section.students) {
        if (!studentsMap.has(student.id)) {
          studentsMap.set(student.id, {
            id: student.id,
            studentId: student.studentId,
            name: student.name,
            rollNumber: student.rollNumber,
            section: {
              id: section.id,
              name: section.name,
              class: { id: classData.id, name: classData.name },
            },
          });
        }
      }
    }
  }

  const studentIds = Array.from(studentsMap.keys());
  const existingMarks = studentIds.length > 0 ? await prisma.mark.findMany({
    where: { examId, studentId: { in: studentIds }, teacherId },
    include: {
      subject: {
        select: { id: true, name: true, fullMarks: true, passMarks: true },
      },
    },
  }) : [];

  const marksByStudent = new Map<string, Array<{
    subjectId: string;
    subjectName: string;
    marksObtained: number;
    fullMarks: number;
    passMarks: number;
    grade: string | null;
    gpa: number | null;
    status: string;
  }>>();

  for (const mark of existingMarks) {
    const list = marksByStudent.get(mark.studentId) ?? [];
    list.push({
      subjectId: mark.subjectId,
      subjectName: mark.subject.name,
      marksObtained: mark.marksObtained,
      fullMarks: mark.subject.fullMarks,
      passMarks: mark.subject.passMarks,
      grade: mark.grade,
      gpa: mark.gpa,
      status: mark.status,
    });
    marksByStudent.set(mark.studentId, list);
  }

  const students = Array.from(studentsMap.values()).map((student) => ({
    student,
    subjectMarks: marksByStudent.get(student.id) ?? [],
  }));

  return {
    examId,
    teacherId,
    totalStudents: students.length,
    totalEntries: existingMarks.length,
    students,
  };
};

export const getFailedStudents = async (examId: string, classId?: string) => {
  await getExamById(examId);

  const allMarks = await prisma.mark.findMany({
    where: {
      examId,
      student: classId ? { section: { classId } } : undefined,
    },
    include: {
      student: {
        select: {
          id: true,
          studentId: true,
          name: true,
          section: {
            select: { id: true, name: true, classId: true, class: { select: { name: true } } },
          },
        },
      },
      subject: { select: { id: true, name: true, passMarks: true } },
    },
  });

  const failedMarks = allMarks.filter((mark) => mark.marksObtained < mark.subject.passMarks);

  const grouped = new Map<string, {
    student: (typeof failedMarks)[number]['student'];
    failedSubjects: Array<{ subjectId: string; subjectName: string; marksObtained: number; passMarks: number }>;
  }>();

  for (const mark of failedMarks) {
    const existing = grouped.get(mark.student.id);
    const failedSubject = {
      subjectId: mark.subject.id,
      subjectName: mark.subject.name,
      marksObtained: mark.marksObtained,
      passMarks: mark.subject.passMarks,
    };
    if (existing) {
      existing.failedSubjects.push(failedSubject);
      continue;
    }
    grouped.set(mark.student.id, { student: mark.student, failedSubjects: [failedSubject] });
  }

  return {
    examId,
    classId: classId ?? null,
    totalFailedStudents: grouped.size,
    students: Array.from(grouped.values()),
  };
};
