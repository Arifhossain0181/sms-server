import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffQueryDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateAttendanceDto,
  BulkAttendanceDto,
  CreateLeaveDto,
  ApproveLeaveDto,
  UpdateLeaveBalanceDto,
  CreatePayrollDto,
  CreatePerformanceReviewDto,
  CreateCriticalActionDto,
} from './hr.dto';
import prisma from '../../config/db';
import { paginate } from '../../utils/pagination.util';
import { randomBytes } from 'node:crypto';
import PDFDocument from 'pdfkit';

// ─── Department helpers 

export async function createDepartment(dto: CreateDepartmentDto) {
  const existing = await prisma.department.findFirst({
    where: { OR: [{ name: dto.name }, ...(dto.code ? [{ code: dto.code }] : [])] },
  });
  if (existing) {
    throw { status: 409, message: 'Department with this name or code already exists' };
  }

  return prisma.department.create({ data: dto });
}

export async function findAllDepartments() {
  return prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function updateDepartment(id: string, dto: UpdateDepartmentDto) {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw { status: 404, message: 'Department not found' };

  if (dto.name || dto.code) {
    const duplicate = await prisma.department.findFirst({
      where: {
        OR: [
          ...(dto.name ? [{ name: dto.name }] : []),
          ...(dto.code ? [{ code: dto.code }] : []),
        ],
        NOT: { id },
      },
    });
    if (duplicate) throw { status: 409, message: 'Department name or code already in use' };
  }

  return prisma.department.update({ where: { id }, data: dto });
}

export async function deleteDepartment(id: string) {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw { status: 404, message: 'Department not found' };

  return prisma.department.update({ where: { id }, data: { isActive: false } });
}

// ─── Staff helpers 

async function nextAutoStaffId(): Promise<string> {
  const all = await prisma.staff.findMany({ select: { employeeId: true } });
  const maxNumeric = all.reduce((max, s) => {
    const n = Number(s.employeeId);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return String(maxNumeric + 1).padStart(2, '0');
}

export async function createStaff(dto: CreateStaffDto, actorId: string) {
  const emailExists = await prisma.user.findUnique({ where: { email: dto.email } });
  if (emailExists) {
    throw { status: 409, message: 'A user with this email already exists' };
  }

  const emailDuplicate = await prisma.staff.findUnique({ where: { email: dto.email } });
  if (emailDuplicate) {
    throw { status: 409, message: 'A staff record with this email already exists' };
  }

  let employeeId: string;
  const staffCode = dto.employeeId;

  if (staffCode) {
    const exists = await prisma.staff.findUnique({ where: { employeeId: staffCode } });
    if (exists) throw { status: 409, message: 'Staff ID already exists' };
    employeeId = staffCode;
  } else {
    employeeId = await nextAutoStaffId();
  }

  const buildData = (id: string) => ({
    employeeId: id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    designation: dto.designation,
    departmentId: dto.departmentId,
    staffType: dto.staffType ?? 'NON_TEACHING',
    qualification: dto.qualification,
    experience: dto.experience,
    address: dto.address,
    gender: dto.gender,
    dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
    bloodGroup: dto.bloodGroup,
    idProofUrl: dto.idProofUrl,
    certificates: dto.certificates ?? [],
    contractUrl: dto.contractUrl,
    reportingTo: dto.reportingTo,
  });

  let newStaff;
  try {
    newStaff = await prisma.staff.create({ data: buildData(employeeId) });
  } catch (err: any) {
    if (err?.code === 'P2002' && !staffCode) {
      employeeId = await nextAutoStaffId();
      newStaff = await prisma.staff.create({ data: buildData(employeeId) });
    } else {
      throw err;
    }
  }

  // Initialize leave balances for the new staff member
  await initializeDefaultLeaveBalances(newStaff.id, new Date().getFullYear());

  return newStaff;
}

export async function findAllStaff(query: StaffQueryDto) {
  const {
    page = '1',
    limit = '10',
    search,
    departmentId,
    designation,
    staffType,
    isActive,
  } = query;

  const where: any = {
    ...(isActive !== undefined ? { isActive: isActive === 'true' } : {}),
    ...(departmentId && { departmentId }),
    ...(designation && { designation: { contains: designation, mode: 'insensitive' } }),
    ...(staffType && { staffType }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const { skip, take, meta } = await paginate(prisma.staff, where, parseInt(page, 10), parseInt(limit, 10));

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      skip,
      take,
      include: { department: { select: { id: true, name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.staff.count({ where }),
  ]);

  return {
    staff,
    meta: { ...meta, total },
  };
}

export async function findStaffById(id: string) {
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true, code: true } },
    },
  });
  if (!staff) throw { status: 404, message: 'Staff not found' };
  return staff;
}

export async function updateStaff(id: string, dto: UpdateStaffDto) {
  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) throw { status: 404, message: 'Staff not found' };

  if (dto.email && dto.email !== staff.email) {
    const emailExists = await prisma.staff.findFirst({
      where: { email: dto.email, NOT: { id } },
    });
    if (emailExists) throw { status: 409, message: 'Email already in use by another staff member' };
  }

  return prisma.staff.update({
    where: { id },
    data: dto,
    include: { department: { select: { id: true, name: true, code: true } } },
  });
}

export async function archiveStaff(id: string) {
  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) throw { status: 404, message: 'Staff not found' };
  return prisma.staff.update({ where: { id }, data: { isActive: false } });
}

export async function restoreStaff(id: string) {
  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) throw { status: 404, message: 'Staff not found' };
  return prisma.staff.update({ where: { id }, data: { isActive: true } });
}

export async function getStaffDirectory() {
  const staff = await prisma.staff.findMany({
    where: { isActive: true },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      phone: true,
      designation: true,
      staffType: true,
      department: { select: { id: true, name: true, code: true } },
      joiningDate: true,
    },
    orderBy: { name: 'asc' },
  });
  return staff;
}

// ─── Attendance helpers 

export async function recordAttendance(dto: CreateAttendanceDto, actorId: string) {
  const staff = await prisma.staff.findUnique({ where: { id: dto.staffId } });
  if (!staff) throw { status: 404, message: 'Staff member not found' };

  const date = new Date(dto.date);
  date.setHours(0, 0, 0, 0);

  return prisma.staffAttendance.upsert({
    where: {
      staffId_date: { staffId: dto.staffId, date },
    },
    create: {
      staffId: dto.staffId,
      date,
      status: dto.status ?? 'PRESENT',
      note: dto.note,
    },
    update: {
      status: dto.status ?? 'PRESENT',
      note: dto.note,
    },
  });
}

export async function recordBulkAttendance(dto: BulkAttendanceDto, actorId: string) {
  const date = new Date(dto.date);
  date.setHours(0, 0, 0, 0);

  const results = [];
  for (const entry of dto.attendances) {
    const staff = await prisma.staff.findUnique({ where: { id: entry.staffId } });
    if (!staff) continue;

    const record = await prisma.staffAttendance.upsert({
      where: {
        staffId_date: { staffId: entry.staffId, date },
      },
      create: {
        staffId: entry.staffId,
        date,
        status: entry.status,
        note: entry.note,
      },
      update: {
        status: entry.status,
        note: entry.note,
      },
    });
    results.push(record);
  }

  return { date: dto.date, count: results.length, records: results };
}

export async function getStaffAttendance(staffId: string, from?: string, to?: string) {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) throw { status: 404, message: 'Staff member not found' };

  const where: any = { staffId };
  if (from) where.date = { gte: new Date(from) };
  if (to) where.date = { ...where.date, lte: new Date(to) };

  return prisma.staffAttendance.findMany({
    where,
    orderBy: { date: 'desc' },
  });
}

export async function getDailyAttendance(date: string) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const records = await prisma.staffAttendance.findMany({
    where: { date: targetDate },
    include: { staff: { select: { id: true, name: true, employeeId: true, designation: true, staffType: true, department: { select: { name: true } } } } },
    orderBy: { staff: { name: 'asc' } },
  });

  return {
    date,
    total: records.length,
    present: records.filter((r) => r.status === 'PRESENT').length,
    absent: records.filter((r) => r.status === 'ABSENT').length,
    late: records.filter((r) => r.status === 'LATE').length,
    records: records.map((r) => ({
      id: r.id,
      staffId: r.staffId,
      staffName: r.staff.name,
      employeeId: r.staff.employeeId,
      designation: r.staff.designation,
      staffType: r.staff.staffType,
      department: r.staff.department?.name,
      status: r.status,
      note: r.note,
    })),
  };
}

export async function getAttendanceMonthlySummary(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const allStaff = await prisma.staff.findMany({
    where: { isActive: true },
    select: { id: true, name: true, employeeId: true, designation: true },
  });

  const summaries = [];
  for (const staff of allStaff) {
    const attendances = await prisma.staffAttendance.findMany({
      where: { staffId: staff.id, date: { gte: start, lte: end } },
    });

    const totalDays = attendances.length;
    const present = attendances.filter((a) => a.status === 'PRESENT').length;
    const absent = attendances.filter((a) => a.status === 'ABSENT').length;
    const late = attendances.filter((a) => a.status === 'LATE').length;

    const leaves = await prisma.leave.findMany({
      where: {
        staffId: staff.id,
        status: 'APPROVED',
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    summaries.push({
      staffId: staff.id,
      employeeId: staff.employeeId,
      name: staff.name,
      designation: staff.designation,
      totalWorkingDays: totalDays,
      present,
      absent,
      late,
      leaveDays: leaves.length,
      attendancePercent: totalDays > 0 ? Math.round((present / totalDays) * 100) : 0,
    });
  }

  return { month, year, summaries };
}

// ─── Leave helpers ────────────────────────────────────────────────

export async function createLeaveRequest(dto: CreateLeaveDto, staffId: string) {
  const staff = await prisma.staff.findUnique({ where: { id: dto.staffId || staffId } });
  if (!staff) throw { status: 404, message: 'Staff member not found' };

  const leave = await prisma.leave.create({
    data: {
      staffId: dto.staffId || staffId,
      leaveType: dto.leaveType,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      reason: dto.reason,
    },
  });

  return leave;
}

export async function findAllLeaveRequests(query: any) {
  const { page = '1', limit = '10', status, staffId, leaveType } = query;

  const where: any = {};
  if (status) where.status = status;
  if (staffId) where.staffId = staffId;
  if (leaveType) where.leaveType = leaveType;

  const { skip, take, meta } = await paginate(
    prisma.leave,
    where,
    parseInt(page, 10),
    parseInt(limit, 10)
  );

  const [leaves, total] = await Promise.all([
    prisma.leave.findMany({
      where,
      skip,
      take,
      include: { staff: { select: { id: true, name: true, employeeId: true, designation: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.leave.count({ where }),
  ]);

  return {
    leaves,
    meta: { ...meta, total },
  };
}

export async function approveLeaveRequest(id: string, dto: ApproveLeaveDto, actorId: string) {
  const leave = await prisma.leave.findUnique({ where: { id } });
  if (!leave) throw { status: 404, message: 'Leave request not found' };
  if (leave.status !== 'PENDING') throw { status: 400, message: 'Leave request is not pending' };

  const approved = dto.approved;

  const updatedLeave = await prisma.leave.update({
    where: { id },
    data: {
      status: approved ? 'APPROVED' : 'REJECTED',
      approvedBy: actorId,
      rejectionReason: approved ? null : dto.rejectionReason,
    },
    include: { staff: true },
  });

  if (approved) {
    const leaveDays = Math.ceil(
      (new Date(updatedLeave.endDate).getTime() - new Date(updatedLeave.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

    const year = new Date(updatedLeave.startDate).getFullYear();
    const balance = await prisma.leaveBalance.findFirst({
      where: { staffId: leave.staffId, leaveType: updatedLeave.leaveType, year },
    });

    if (balance) {
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: { usedDays: balance.usedDays + leaveDays },
      });
    }

    const isTeacher = await prisma.teacher.findUnique({ where: { id: leave.staffId } });
    if (isTeacher) {
      try {
        const { broadcast } = await import('../../modules/notifiction/notification.service');
        await broadcast({
          role: 'EXAM_CONTROLLER',
          title: 'Teacher Leave Approved - Reschedule Needed',
          body: `${isTeacher.name} (${isTeacher.designation ?? 'Teacher'}) has been approved for leave from ${new Date(updatedLeave.startDate).toLocaleDateString()} to ${new Date(updatedLeave.endDate).toLocaleDateString()}. Please check affected timetable slots.`,
          type: 'LEAVE',
          referenceId: leave.id,
        });
      } catch (notifErr) {
        console.error('Failed to broadcast leave notification:', notifErr);
      }
    }
  }

  return updatedLeave;
}

export async function getLeaveBalance(staffId: string, year?: number) {
  const targetYear = year ?? new Date().getFullYear();
  return prisma.leaveBalance.findMany({
    where: { staffId, year: targetYear },
    orderBy: { leaveType: 'asc' },
  });
}

export async function initializeDefaultLeaveBalances(staffId: string, year: number) {
  const leaveTypes: any[] = ['CASUAL', 'SICK', 'EARNED'];
  const defaults: Record<string, number> = {
    CASUAL: 10,
    SICK: 14,
    EARNED: 20,
  };

  await prisma.leaveBalance.createMany({
    data: leaveTypes.map((lt) => ({
      staffId,
      leaveType: lt,
      totalDays: defaults[lt],
      year,
    })),
    skipDuplicates: true,
  });
}

// ─── Payroll helpers 

async function calculateLeaveDaysInMonth(staffId: string, month: number, year: number): Promise<number> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  return prisma.leave.count({
    where: {
      staffId,
      status: 'APPROVED',
      startDate: { lte: end },
      endDate: { gte: start },
    },
  });
}

function calculateAttendanceDays(staffId: string, month: number, year: number): Promise<number> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  return prisma.staffAttendance.count({
    where: {
      staffId,
      date: { gte: start, lte: end },
      status: { in: ['PRESENT', 'LATE'] },
    },
  });
}

export async function generatePayroll(dto: CreatePayrollDto, actorId: string) {
  const staff = await prisma.staff.findUnique({ where: { id: dto.staffId } });
  if (!staff) throw { status: 404, message: 'Staff not found' };

  const existing = await prisma.payroll.findFirst({
    where: { staffId: dto.staffId, month: dto.month, year: dto.year },
  });
  if (existing) {
    throw { status: 409, message: 'Payroll for this period already exists' };
  }

  const [attendanceDays, leaveDays] = await Promise.all([
    calculateAttendanceDays(dto.staffId, dto.month, dto.year),
    calculateLeaveDaysInMonth(dto.staffId, dto.month, dto.year),
  ]);

  const dailyRate = dto.basicPay / 26;
  const leaveDeduction = dailyRate * leaveDays;
  const netSalary = dto.basicPay + (dto.allowances ?? 0) - (dto.deductions ?? 0) - leaveDeduction;

  return prisma.payroll.create({
    data: {
      staffId: dto.staffId,
      month: dto.month,
      year: dto.year,
      basicPay: dto.basicPay,
      allowances: dto.allowances ?? 0,
      deductions: dto.deductions ?? 0,
      netSalary: Math.max(netSalary, 0),
      attendanceDays,
      leaveDays,
      generatedBy: actorId,
    },
    include: { staff: { select: { id: true, name: true, employeeId: true } } },
  });
}

export async function findAllPayrolls(query: any) {
  const { page = '1', limit = '10', month, year, staffId, status } = query;

  const where: any = {};
  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);
  if (staffId) where.staffId = staffId;
  if (status) where.status = status;

  const { skip, take, meta } = await paginate(
    prisma.payroll,
    where,
    parseInt(page, 10),
    parseInt(limit, 10)
  );

  const [payrolls, total] = await Promise.all([
    prisma.payroll.findMany({
      where,
      skip,
      take,
      include: { staff: { select: { id: true, name: true, employeeId: true, designation: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
    prisma.payroll.count({ where }),
  ]);

  return {
    payrolls,
    meta: { ...meta, total },
  };
}

export async function getPayrollHistory(staffId: string) {
  return prisma.payroll.findMany({
    where: { staffId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
}

export async function markPayrollPaid(id: string) {
  const payroll = await prisma.payroll.findUnique({ where: { id } });
  if (!payroll) throw { status: 404, message: 'Payroll not found' };
  if (payroll.status === 'PAID') throw { status: 400, message: 'Payroll already marked as paid' };

  return prisma.payroll.update({
    where: { id },
    data: { status: 'PAID', paidAt: new Date() },
  });
}

export async function getPendingPayrolls() {
  return prisma.payroll.findMany({
    where: { status: 'PENDING' },
    include: { staff: { select: { id: true, name: true, employeeId: true, designation: true } } },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });
}

// ─── Performance Review helpers ───────────────────────────────────

export async function createPerformanceReview(dto: CreatePerformanceReviewDto, reviewerId: string) {
  const staff = await prisma.staff.findUnique({ where: { id: dto.staffId } });
  if (!staff) throw { status: 404, message: 'Staff not found' };

  return prisma.performanceReview.create({
    data: {
      staffId: dto.staffId,
      reviewDate: new Date(dto.reviewDate),
      rating: dto.rating,
      strengths: dto.strengths,
      areasToImprove: dto.areasToImprove,
      comments: dto.comments,
      reviewedBy: reviewerId,
    },
    include: { staff: { select: { id: true, name: true, employeeId: true } } },
  });
}

export async function findPerformanceReviews(staffId: string) {
  return prisma.performanceReview.findMany({
    where: { staffId },
    orderBy: { reviewDate: 'desc' },
    include: { staff: { select: { id: true, name: true, employeeId: true } } },
  });
}

// ─── Critical Action helpers 

export async function requestCriticalAction(dto: CreateCriticalActionDto, actorId: string) {
  return prisma.criticalAction.create({
    data: {
      actionType: dto.actionType,
      staffId: dto.staffId,
      staffName: dto.staffName,
      reason: dto.reason,
      details: dto.details ?? {},
      requestedBy: actorId,
    },
  });
}

export async function findPendingCriticalActions() {
  return prisma.criticalAction.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  });
}

export async function findCriticalActionById(id: string) {
  const action = await prisma.criticalAction.findUnique({ where: { id } });
  if (!action) throw { status: 404, message: 'Critical action not found' };
  return action;
}

export async function approveCriticalAction(id: string, reviewerId: string, reviewComment?: string) {
  const action = await prisma.criticalAction.findUnique({ where: { id } });
  if (!action) throw { status: 404, message: 'Critical action not found' };
  if (action.status !== 'PENDING') throw { status: 400, message: 'Action is not pending' };

  const updated = await prisma.criticalAction.update({
    where: { id },
    data: {
      status: 'APPROVED',
      reviewedBy: reviewerId,
      reviewComment,
    },
  });

  if (action.actionType === 'TERMINATION') {
    await prisma.staff.update({ where: { id: action.staffId }, data: { isActive: false } });
  }

  return updated;
}

export async function rejectCriticalAction(id: string, reviewerId: string, reviewComment: string) {
  const action = await prisma.criticalAction.findUnique({ where: { id } });
  if (!action) throw { status: 404, message: 'Critical action not found' };
  if (action.status !== 'PENDING') throw { status: 400, message: 'Action is not pending' };

  return prisma.criticalAction.update({
    where: { id },
    data: {
      status: 'REJECTED',
      reviewedBy: reviewerId,
      reviewComment,
    },
  });
}

// ─── Dashboard 

export async function getHRDashboardStats() {
  const [totalStaff, activeStaff, pendingLeaves, pendingPayrolls, pendingCriticalActions] =
    await Promise.all([
      prisma.staff.count(),
      prisma.staff.count({ where: { isActive: true } }),
      prisma.leave.count({ where: { status: 'PENDING' } }),
      prisma.payroll.count({ where: { status: 'PENDING' } }),
      prisma.criticalAction.count({ where: { status: 'PENDING' } }),
    ]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [attendanceStats] = await Promise.all([
    getAttendanceMonthlySummary(currentYear, currentMonth),
  ]);

  const avgAttendance =
    attendanceStats.summaries.length > 0
      ? Math.round(
          attendanceStats.summaries.reduce((sum, s) => sum + s.attendancePercent, 0) /
            attendanceStats.summaries.length
        )
      : 0;

  return {
    totalStaff,
    activeStaff,
    inactiveStaff: totalStaff - activeStaff,
    pendingLeaves,
    pendingPayrolls,
    pendingCriticalActions,
    avgAttendance,
    currentMonth,
    currentYear,
  };
}

// ─── PDF Payslip Generation ──────────────────────────────────────

export async function generatePayslipPdf(payrollId: string): Promise<Buffer> {
  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
    include: { staff: { select: { id: true, name: true, employeeId: true, designation: true, department: { select: { name: true } } } } },
  });

  if (!payroll) throw { status: 404, message: 'Payroll not found' };

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Header
    doc.fontSize(20).text('PAYSLIP', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Period: ${monthNames[payroll.month - 1]} ${payroll.year}`, { align: 'center' });
    doc.moveDown(1);

    // Company info
    doc.fontSize(14).text('Greenwood School', { align: 'center' });
    doc.fontSize(10).text('123 Education Lane, City', { align: 'center' });
    doc.moveDown(1);

    // Staff info
    doc.fontSize(12).text('Employee Details', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text(`Name: ${payroll.staff.name}`);
    doc.text(`Employee ID: ${payroll.staff.employeeId}`);
    doc.text(`Designation: ${payroll.staff.designation ?? '—'}`);
    doc.text(`Department: ${payroll.staff.department?.name ?? '—'}`);
    doc.moveDown(1);

    // Salary breakdown
    doc.fontSize(12).text('Salary Breakdown', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);

    const rows = [
      ['Basic Pay', `৳${payroll.basicPay.toLocaleString()}`],
      ['Allowances', `৳${payroll.allowances.toLocaleString()}`],
      ['Deductions', `-৳${payroll.deductions.toLocaleString()}`],
      ['Attendance Days', String(payroll.attendanceDays)],
      ['Leave Days', String(payroll.leaveDays)],
      ['Net Salary', `৳${payroll.netSalary.toLocaleString()}`],
    ];

    rows.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`);
    });

    doc.moveDown(1);
    doc.text(`Status: ${payroll.status}`);
    doc.text(`Generated: ${new Date(payroll.createdAt).toLocaleDateString()}`);

    doc.end();
  });
}

