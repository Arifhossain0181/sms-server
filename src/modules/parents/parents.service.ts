import prisma from "../../config/db";
import {
  CreateParentDto,
  UpdateParentDto,
  ParentQueryDto,
  PaginationDto,
} from "./parents.dto";
import { getAttendance } from "../student/student.attendence";
import { getResults } from "../student/student.result";
import { getClassHighestMarks } from "../result/result.service";
import { createPaymentIntent as createFeePaymentIntent } from "../fee/fee.service";
import { mailService } from "../../config/mail";



const PARENT_SELECT = {
  id: true,
  name: true,
  phone: true,
  address: true,
  occupation: true,
  relation: true,
  createdAt: true,
  user: { select: { id: true, email: true } },
} as const;

// ─── ADMIN: create a Parent profile 
export class ParentsService {
  static async createParent(dto: CreateParentDto) {
    // WHAT: confirm the linked User exists AND isn't already a Parent.
    // WHY: userId is @unique on Parent — inserting a duplicate would
    //      throw a raw Prisma P2002 error; catching it here first gives
    //      a clean, specific error message instead.
    const [user, existingParent] = await Promise.all([
      prisma.user.findUnique({ where: { id: dto.userId }, select: { id: true } }),
      prisma.parent.findUnique({ where: { userId: dto.userId }, select: { id: true } }),
    ]);
    if (!user) throw new Error('User not found');
    if (existingParent) throw new Error('A parent profile already exists for this user');

    return prisma.parent.create({
      data: {
        userId: dto.userId,
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        occupation: dto.occupation,
        relation: dto.relation,
      },
      select: PARENT_SELECT,
    });
  }

  // ─── ADMIN: update any parent's profile 
  static async updateParent(parentId: string, dto: UpdateParentDto) {
    const existing = await prisma.parent.findUnique({ where: { id: parentId }, select: { id: true } });
    if (!existing) throw new Error('Parent not found');

    return prisma.parent.update({ where: { id: parentId }, data: dto, select: PARENT_SELECT });
  }

  // ─── ADMIN: delete a parent profile 
  static async deleteParent(parentId: string) {
    const existing = await prisma.parent.findUnique({
      where: { id: parentId },
      select: { id: true, children: { select: { id: true } } },
    });
    if (!existing) throw new Error('Parent not found');

    // WHAT: block deletion while children are still linked.
    // WHY: deleting a parent out from under a linked student would
    //      silently orphan that student's fee/notice/contact chain —
    //      force an explicit unlink first so it's a deliberate action.
    if (existing.children.length > 0) {
      throw new Error('Unlink all children from this parent before deleting the profile');
    }

    return prisma.parent.delete({ where: { id: parentId } });
  }

  // ─── ADMIN: paginated list, optional search by name/phone ───────
  static async getAllParents(query: ParentQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);

    const where: any = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search } },
          ],
        }
      : {};

    // PERF: count + page fetched in parallel instead of sequentially
    const [total, data] = await Promise.all([
      prisma.parent.count({ where }),
      prisma.parent.findMany({
        where,
        select: { ...PARENT_SELECT, children: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // ─── ADMIN: single parent, with children list
  static async getParentById(parentId: string) {
    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      select: {
        ...PARENT_SELECT,
        children: { select: { id: true, name: true, classId: true, sectionId: true } },
      },
    });
    if (!parent) throw new Error('Parent not found');
    return parent;
  }

  // ─── ADMIN: link a student to this parent 
  static async linkChild(parentId: string, studentId: string) {
    const [parent, student] = await Promise.all([
      prisma.parent.findUnique({ where: { id: parentId }, select: { id: true } }),
      prisma.student.findUnique({ where: { id: studentId }, select: { id: true, parentId: true } }),
    ]);
    if (!parent) throw new Error('Parent not found');
    if (!student) throw new Error('Student not found');
    if (student.parentId === parentId) throw new Error('This student is already linked to this parent');

    return prisma.student.update({ where: { id: studentId }, data: { parentId } });
  }

  // ─── ADMIN: unlink a student from this parent 
  static async unlinkChild(parentId: string, studentId: string) {
    const student = await prisma.student.findFirst({ where: { id: studentId, parentId }, select: { id: true } });
    if (!student) throw new Error('This student is not linked to this parent');

    return prisma.student.update({ where: { id: studentId }, data: { parentId: null } });
  }


  // PARENT SELF-SERVICE
  

  // WHAT: resolves the logged-in User's own Parent id.
  // WHY: used by the timetable module and every method below — since
  //      Parent.userId is @unique, this is a single indexed lookup.
  static async getParentIdByUserId(userId: string): Promise<string | null> {
    const parent = await prisma.parent.findUnique({ where: { userId }, select: { id: true } });
    return parent?.id ?? null;
  }

  static async getMyProfile(userId: string) {
    const parent = await prisma.parent.findUnique({ where: { userId }, select: PARENT_SELECT });
    if (!parent) throw new Error('Parent profile not found');
    return parent;
  }

  static async updateMyProfile(userId: string, dto: UpdateParentDto) {
    const parent = await prisma.parent.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) throw new Error('Parent profile not found');

    return prisma.parent.update({ where: { id: parent.id }, data: dto, select: PARENT_SELECT });
  }

  // WHAT: list of this parent's own children (basic info only —
  //       full academic detail comes from the students/timetable
  //       modules, this just confirms who the children are).
  static async getMyChildren(userId: string) {
    const parent = await prisma.parent.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) throw new Error('Parent profile not found');

    return prisma.student.findMany({
      where: { parentId: parent.id },
      select: { id: true, name: true, classId: true, sectionId: true, rollNumber: true },
      orderBy: { name: 'asc' },
    });
  }

  // WHAT: this parent's own payment history (Stripe + offline records).
  static async getMyPayments(userId: string, pagination: PaginationDto = {}) {
    const parent = await prisma.parent.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) throw new Error('Parent profile not found');

    const page = pagination.page ?? 1;
    const pageSize = Math.min(pagination.pageSize ?? 20, 100);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { parentId: parent.id },
        select: {
          id: true,
          amount: true,
          status: true,
          method: true,
          paidAt: true,
          transactionId: true,
          pdfReceiptUrl: true,
          note: true,
          createdAt: true,
          student: { select: { id: true, name: true, rollNumber: true } },
          feeStructure: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.payment.count({ where: { parentId: parent.id } }),
    ]);

    return {
      data: payments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // WHAT: notices addressed to this parent (school-wide or class-specific
  //       notices get fanned out into NoticeRecipient rows elsewhere).
  static async getMyNotices(userId: string, pagination: PaginationDto = {}) {
    const parent = await prisma.parent.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) throw new Error('Parent profile not found');

    const page = pagination.page ?? 1;
    const pageSize = Math.min(pagination.pageSize ?? 20, 100);

    const recipients = await prisma.noticeRecipient.findMany({
      where: { parentId: parent.id },
      select: {
        id: true,
        isRead: true,
        notice: { select: { id: true, title: true, content: true, createdAt: true } },
      },
      orderBy: { notice: { createdAt: 'desc' } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return recipients.map((r) => ({
      id: r.id,
      read: r.isRead,
      noticeId: r.notice.id,
      title: r.notice.title,
      content: r.notice.content,
      createdAt: r.notice.createdAt,
    }));
  }

  // PARENT SELF-SERVICE: CHILD ACADEMIC DATA
  // 

  static async assertParentOwnsChild(parentId: string, childId: string) {
    const child = await prisma.student.findFirst({
      where: { id: childId, parentId },
      select: { id: true },
    });
    if (!child) throw new Error('Child not found or not linked to your account');
    return child;
  }

  static async getChildProfile(parentId: string, childId: string) {
    await this.assertParentOwnsChild(parentId, childId);

    return prisma.student.findUnique({
      where: { id: childId },
      select: {
        id: true,
        studentId: true,
        name: true,
        rollNumber: true,
        dob: true,
        gender: true,
        bloodGroup: true,
        address: true,
        photo: true,
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        user: { select: { email: true } },
        createdAt: true,
      },
    });
  }

  static async getChildAttendance(parentId: string, childId: string, month?: number, year?: number) {
    await this.assertParentOwnsChild(parentId, childId);

    const where: any = { studentId: childId };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      where.date = { gte: start, lt: end };
    }

    const [records, summary] = await Promise.all([
      prisma.studentAttendance.findMany({
        where,
        select: { id: true, date: true, status: true },
        orderBy: { date: 'desc' },
      }),
      prisma.studentAttendance.groupBy({
        by: ['status'],
        where: { studentId: childId },
        _count: { _all: true },
      }),
    ]);

    const total = summary.reduce((sum, c) => sum + c._count._all, 0);
    const present = summary.find((c) => c.status === 'PRESENT')?._count._all ?? 0;
    const absent = summary.find((c) => c.status === 'ABSENT')?._count._all ?? 0;
    const late = summary.find((c) => c.status === 'LATE')?._count._all ?? 0;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      records: records.map((r) => ({ ...r, date: r.date.toISOString() })),
      summary: { total, present, absent, late, percentage },
    };
  }

  static async getChildResults(parentId: string, childId: string) {
    await this.assertParentOwnsChild(parentId, childId);

    const publishedExamIds = await prisma.reportCard.findMany({
      where: { studentId: childId, status: 'PUBLISHED' },
      select: { examId: true },
    }).then((rows) => rows.map((r) => r.examId));

    if (!publishedExamIds.length) {
      return {
        studentId: childId,
        examId: null,
        totalObtained: 0,
        totalFull: 0,
        percentage: 0,
        marks: [],
      };
    }

    const marks = await prisma.mark.findMany({
      where: { studentId: childId, examId: { in: publishedExamIds } },
      select: {
        id: true,
        marksObtained: true,
        grade: true,
        exam: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, fullMarks: true } },
      },
    });

    const totalObtained = marks.reduce((sum, r) => sum + r.marksObtained, 0);
    const totalFull = marks.reduce((sum, r) => sum + r.subject.fullMarks, 0);
    const percentage = totalFull > 0 ? Math.round((totalObtained / totalFull) * 100) : 0;

    return {
      studentId: childId,
      examId: null,
      totalObtained,
      totalFull,
      percentage,
      marks: marks.map((m) => ({
        id: m.id,
        exam: { id: m.exam.id, name: m.exam.name },
        subject: { id: m.subject.id, name: m.subject.name, fullMarks: m.subject.fullMarks },
        marksObtained: m.marksObtained,
        grade: m.grade,
      })),
    };
  }

  static async getChildClassHighestMarks(parentId: string, childId: string) {
    await this.assertParentOwnsChild(parentId, childId);
    return getClassHighestMarks(childId);
  }

  static async getChildHomework(parentId: string, childId: string) {
    await this.assertParentOwnsChild(parentId, childId);

    const student = await prisma.student.findUnique({
      where: { id: childId },
      select: { sectionId: true },
    });
    if (!student || !student.sectionId) throw new Error('Student section not assigned');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const homeworks = await prisma.homework.findMany({
      where: {
        sectionId: student.sectionId,
      },
      include: {
        subject: { select: { id: true, name: true } },
        teacher: { select: { user: { select: { name: true } } } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return homeworks.map((hw) => ({
      ...hw,
      isOverdue: hw.dueDate < today,
    }));
  }

  static async getChildTimetable(parentId: string, childId: string) {
    await this.assertParentOwnsChild(parentId, childId);

    const student = await prisma.student.findUnique({
      where: { id: childId },
      select: { classId: true },
    });
    if (!student || !student.classId) throw new Error('Student class not assigned');

    const timetable = await prisma.timetable.findMany({
      where: { classId: student.classId },
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        roomNumber: true,
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        teacher: { select: { user: { select: { name: true } } } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return timetable;
  }

  static async getChildReportCards(parentId: string, childId: string) {
    await this.assertParentOwnsChild(parentId, childId);

    const reportCards = await prisma.reportCard.findMany({
      where: { studentId: childId, status: 'PUBLISHED' },
      include: {
        exam: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const examIds = reportCards.map((rc) => rc.examId);
    const marks = examIds.length > 0 ? await prisma.mark.findMany({
      where: { studentId: childId, examId: { in: examIds } },
      include: { subject: { select: { name: true, fullMarks: true } } },
    }) : [];

    const marksByExam = new Map<string, typeof marks>();
    for (const mark of marks) {
      const list = marksByExam.get(mark.examId) ?? [];
      list.push(mark);
      marksByExam.set(mark.examId, list);
    }

    return reportCards.map((rc) => ({
      id: rc.id,
      examId: rc.exam.id,
      examName: rc.exam.name,
      examType: rc.exam.type,
      status: rc.status,
      createdAt: rc.createdAt,
      marks: (marksByExam.get(rc.examId) ?? []).map((m) => ({
        subjectName: m.subject.name,
        fullMarks: m.subject.fullMarks,
        marksObtained: m.marksObtained,
        grade: m.grade,
      })),
    }));
  }

  static async getChildAdmitCards(parentId: string, childId: string) {
    await this.assertParentOwnsChild(parentId, childId);

    const exams = await prisma.exam.findMany({
      where: {
        reportCards: {
          some: { studentId: childId, status: 'PUBLISHED' },
        },
      },
      select: { id: true, name: true, type: true },
    });

    return exams.map((e) => ({
      examId: e.id,
      examName: e.name,
      examType: e.type,
      url: `/api/v1/exams/${e.id}/students/${childId}/admit-card`,
    }));
  }

  static async createParentPaymentIntent(parentId: string, feeId: string) {
    const parent = await prisma.parent.findUnique({ where: { userId: parentId }, select: { id: true } });
    if (!parent) throw new Error('Parent profile not found');

    const fee = await prisma.feeStructure.findFirst({
      where: { id: feeId, student: { parentId: parent.id } },
      select: { id: true, studentId: true, amount: true, Paidamount: true },
    });
    if (!fee) throw new Error('Fee not found or not linked to your children');
    if (!fee.studentId) throw new Error('Fee student not found');

    const dueAmount = Math.max((fee.amount ?? 0) - (fee.Paidamount ?? 0), 0);
    if (dueAmount <= 0) throw new Error('Fee already paid');

    return createFeePaymentIntent(fee.id, fee.studentId);
  }

  static async getLowAttendanceAlerts(parentId: string) {
    const parent = await prisma.parent.findUnique({ where: { id: parentId }, select: { id: true } });
    if (!parent) throw new Error('Parent profile not found');

    const children = await prisma.student.findMany({
      where: { parentId: parent.id },
      select: { id: true, name: true, classId: true, sectionId: true },
    });

    const alerts = [];
    for (const child of children) {
      try {
        const attendance = await getAttendance(child.id);
        if (attendance.percentage < 75 && attendance.total > 0) {
          alerts.push({
            childId: child.id,
            childName: child.name,
            className: child.classId,
            sectionId: child.sectionId,
            attendancePercentage: attendance.percentage,
            totalDays: attendance.total,
            absentDays: attendance.absent,
          });
        }
      } catch {}
    }

    return alerts;
  }

  static async contactSchool(userId: string, dto: { subject: string; message: string; childName?: string }) {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      select: { id: true, name: true, phone: true, user: { select: { email: true } } },
    });
    if (!parent) throw new Error('Parent profile not found');

    const schoolEmail = process.env.SCHOOL_ADMIN_EMAIL || process.env.SMTP_FROM || "school@example.com";

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">New Parent Contact Message</h2>
        <p><strong>From:</strong> ${parent.name} (${parent.user?.email ?? "no email"})</p>
        <p><strong>Phone:</strong> ${parent.phone ?? "N/A"}</p>
        ${dto.childName ? `<p><strong>Child:</strong> ${dto.childName}</p>` : ""}
        <p><strong>Subject:</strong> ${dto.subject}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <p style="white-space: pre-wrap;">${dto.message}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">Sent from School Management System</p>
      </div>
    `;

    const result = await mailService.send({
      to: schoolEmail,
      subject: `Parent Contact: ${dto.subject}`,
      html,
    });

    return result;
  }
}