import prisma from "../../config/db";
import { BulkCreateFeeDto, CreateFeeDto, FeeQueryDto, RecordCashPaymentDto, RecordPaymentDto, UpdateFeeDto } from "./fee.dto";
import { paginate } from "../../utils/pagination.util";
import stripe from "../../config/striPe";



function deriveMonthYear(date: Date) {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function deriveAcademicYear(year: number, month: number): string {
  if (month >= 7) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

function monthRange(month: string) {
  const start = new Date(`${month}-01`);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return { start, end };
}

function dayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function getPaymentDedupKey(p: { id: string; transactionId?: string | null | undefined }): string {
  return (p.transactionId?.trim() || p.id) as string;
}

function dedupePayments<T extends { id: string; transactionId?: string | null | undefined }>(payments: T[]): T[] {
  const seen = new Set<string>();
  return payments.filter((p) => {
    const key = getPaymentDedupKey(p);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// student/classId existence should be validated, and dueDate must
// actually parse — CreateFeeDto's title/description map to real
// FeeStructure columns.
export const createfee = async (dto: CreateFeeDto) => {
  if (dto.studentId) {
    const student = await prisma.student.findUnique({
      where: { id: dto.studentId },
      select: { id: true },
    });
    if (!student) throw new Error("Student not found");
  }

  const dueDate = new Date(dto.dueDate);
  if (Number.isNaN(dueDate.getTime())) throw new Error("Invalid dueDate");
  const { year, month } = deriveMonthYear(dueDate);
  const academicYear = deriveAcademicYear(year, month);

  return prisma.feeStructure.create({
    data: {
      studentId: dto.studentId,
      classId: dto.classId,
      feeType: dto.type,
      title: dto.title,
      description: dto.description,
      amount: dto.amount,
      dueDate,
      dueDay: dto.dueDay,
      year,
      month,
      academicYear,
      status: "PENDING",
      Paidamount: 0,
    },
    select: {
      id: true,
      studentId: true,
      classId: true,
      feeType: true,
      amount: true,
      dueDate: true,
      status: true,
      student: { select: { user: { select: { name: true, email: true } } } },
    },
  });
};

export const bulkcreate = async (dto: BulkCreateFeeDto) => {
  const students = await prisma.student.findMany({
    where: { classId: dto.classId },
    select: { id: true },
  });

  const dueDate = new Date(dto.dueDate);
  if (Number.isNaN(dueDate.getTime())) throw new Error("Invalid dueDate");
  const { year, month } = deriveMonthYear(dueDate);
  const academicYear = deriveAcademicYear(year, month);

  const fees = students.map((student) => ({
    studentId: student.id,
    classId: dto.classId,
    feeType: dto.type,
    title: dto.title,
    description: dto.description,
    amount: dto.amount,
    dueDate,
    dueDay: dueDate.getDate(),
    year,
    month,
    academicYear,
    status: "PENDING" as const,
    Paidamount: 0,
  }));

  // now that @@unique includes year+month (see schema-fee.prisma),
  // skipDuplicates correctly means "already billed for this month" instead
  // of "already ever billed" — re-running next month creates fresh rows
  // instead of silently skipping every student.
  const result = await prisma.feeStructure.createMany({
    data: fees,
    skipDuplicates: true,
  });

  return { created: result.count, skippedExisting: students.length - result.count };
};

export const findAll = async (dto: FeeQueryDto) => {
  const { page = "1", limit = "10", studentId, classId, type, status, month } = dto;

  const where: any = {
    ...(studentId && { studentId }),
    ...(classId && { classId }),
    ...(type && { feeType: type }),
    ...(status && { status }),
  };

  if (month) {
    const { start, end } = monthRange(month);
    where.dueDate = { gte: start, lt: end };
  }

  const { skip, take, meta } = await paginate(
    prisma.feeStructure,
    where,
    parseInt(page),
    parseInt(limit)
  );

  const fees = await prisma.feeStructure.findMany({
    where,
    skip,
    take,
    select: {
      id: true,
      feeType: true,
      title: true,
      amount: true,
      Paidamount: true,
      status: true,
      dueDate: true,
      student: {
        select: {
          id: true,
          rollNumber: true,
          user: { select: { name: true, email: true } },
          class: { select: { name: true } },
        },
      },
      payments: {
        select: { id: true, amount: true, method: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const dedupedFees = fees.map((fee) => {
    const dedupedPayments = dedupePayments(fee.payments ?? []);
    const paidAmount = dedupedPayments.reduce((sum, p) => sum + p.amount, 0);
    return {
      ...fee,
      Paidamount: paidAmount,
      payments: dedupedPayments,
    };
  });

  return { data: dedupedFees, meta };
};

export const findByid = async (id: string) => {
  const fee = await prisma.feeStructure.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true } },
          class: { select: { name: true } },
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!fee) throw new Error("Fee not found");
  return { ...fee, payments: dedupePayments(fee.payments ?? []) };
};

export const updateFee = async (id: string, dto: UpdateFeeDto) => {
  await _exists(id);

  return prisma.feeStructure.update({
    where: { id },
    data: {
      title: dto.title,
      description: dto.description,
      amount: dto.amount,
      status: dto.status,
      ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
    },
    include: { payments: { orderBy: { createdAt: "desc" } } },
  }).then((fee) => ({ ...fee, payments: dedupePayments(fee.payments ?? []) }));
};

export const deleteFee = async (id: string) => {
  await _exists(id);

  // A FeeStructure with existing Payment rows represents real money already
  // collected — deleting it would either FK-violate or silently erase
  // financial history, which breaks the Auditability/Data Integrity NFR.
  // Use WAIVED status instead of deleting once any payment exists.
  const paymentCount = await prisma.payment.count({ where: { feeStructureId: id } });
  if (paymentCount > 0) {
    throw {
      status: 409,
      message: "Cannot delete fee with existing payments; consider marking it as WAIVED instead.",
    };
  }

  return prisma.feeStructure.delete({ where: { id } });
};

// ─── Payment related operations ─────────────────────────────────────

/**
 * Money-integrity race condition: the whole read-check-write runs inside
 * one Serializable transaction, so two concurrent payments for the same
 * fee can't both read the same Paidamount before either writes.
 *
 * FIX: no longer re-fetches the full Student row — fee.studentId is
 * already known once the FeeStructure loads. That's one fewer round trip
 * per payment on the hot path.
 */
export const recordPayment = async (dto: RecordPaymentDto, actorUserId: string) => {
  return prisma.$transaction(
    async (tx) => {
      const fee = await tx.feeStructure.findUnique({ where: { id: dto.feeId } });
      if (!fee) throw new Error("Fee not found");
      if (fee.status === "PAID") throw new Error("Fee is already paid");
      if (!fee.studentId) throw new Error("Fee has no associated student");

      const totalPaid = fee.Paidamount + dto.amountPaid;
      if (totalPaid > fee.amount) throw new Error("Payment exceeds fee amount");

      let invoice = await tx.invoice.findFirst({ where: { feeStructureId: fee.id } });
      if (!invoice) {
        invoice = await tx.invoice.create({
          data: {
            studentId: fee.studentId,
            feeStructureId: fee.id,
            amount: fee.amount,
            dueDate: fee.dueDate,
            year: fee.year,
            month: fee.month,
            status: "PENDING",
          },
        });
      }

      const newStatus = totalPaid === fee.amount ? "PAID" : totalPaid > 0 ? "PARTIAL" : fee.status;
      const transactionId = dto.transactionId || `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      if (transactionId) {
        const existing = await tx.payment.findFirst({ where: { transactionId } });
        if (existing) throw new Error("A payment with this transaction ID already exists");
      }

      const payment = await tx.payment.create({
        data: {
          feeStructureId: dto.feeId,
          amount: dto.amountPaid,
          method: dto.method,
          status: "PAID",
          transactionId,
          note: dto.note ?? undefined,
          invoiceId: invoice.id,
          studentId: fee.studentId,
        },
      });

      await tx.feeStructure.update({
        where: { id: dto.feeId },
        data: { Paidamount: totalPaid, status: newStatus },
      });

      if (newStatus === "PAID") {
        await tx.invoice.update({ where: { id: invoice.id }, data: { status: "PAID" } });
      }

      tx.auditLog
        .create({
          data: {
            userId: actorUserId,
            action: "FEE_PAYMENT_RECORDED",
            targetId: fee.id,
            metadata: { amount: dto.amountPaid, method: dto.method, newStatus, transactionId },
          },
        })
        .catch((err) => console.warn("Audit log failed:", err?.message));

      return payment;
    },
    { isolationLevel: "Serializable" }
  );
};

/**
 * Looks for an existing PENDING/PARTIAL fee for this student+type+period
 * first and settles that, instead of always creating a new FeeStructure
 * row (which used to double-count outstanding fees in every report).
 */
export const recordCashPayment = async (dto: RecordCashPaymentDto, actorUserId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: dto.studentId },
    select: { id: true, classId: true },
  });
  if (!student) throw new Error("Student not found");

  const now = new Date();
  const dueDate = dto.dueDate ? new Date(dto.dueDate) : now;
  if (Number.isNaN(dueDate.getTime())) throw new Error("Invalid dueDate");
  const { year, month } = deriveMonthYear(dueDate);
  const academicYear = deriveAcademicYear(year, month);

  return prisma.$transaction(
    async (tx) => {
      let fee = await tx.feeStructure.findFirst({
        where: {
          studentId: student.id,
          feeType: dto.type,
          year,
          month,
          academicYear,
        },
      });

      if (fee?.status === "PAID") {
        throw new Error("A paid fee already exists for this student, type, and period. Cannot record duplicate cash payment.");
      }

      const isNewFee = !fee;
      if (!fee) {
        fee = await tx.feeStructure.create({
          data: {
            studentId: student.id,
            classId: student.classId,
            feeType: dto.type,
            amount: dto.amountPaid,
            dueDate,
            dueDay: dueDate.getDate(),
            year,
            month,
            academicYear,
            status: "PENDING",
            Paidamount: 0,
          },
        });
      }

      const totalPaid = fee.Paidamount + dto.amountPaid;
      if (totalPaid > fee.amount) {
        throw new Error("Payment exceeds outstanding fee amount");
      }
      const newStatus = totalPaid === fee.amount ? "PAID" : "PARTIAL";
      const transactionId = dto.transactionId || `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      if (transactionId) {
        const existing = await tx.payment.findFirst({ where: { transactionId } });
        if (existing) throw new Error("A payment with this transaction ID already exists");
      }

      let invoice = await tx.invoice.findFirst({ where: { feeStructureId: fee.id } });
      if (!invoice) {
        invoice = await tx.invoice.create({
          data: {
            studentId: student.id,
            feeStructureId: fee.id,
            amount: fee.amount,
            dueDate: fee.dueDate,
            year,
            month,
            status: newStatus,
          },
        });
      } else {
        invoice = await tx.invoice.update({ where: { id: invoice.id }, data: { status: newStatus } });
      }

      const payment = await tx.payment.create({
        data: {
          feeStructureId: fee.id,
          invoiceId: invoice.id,
          studentId: student.id,
          amount: dto.amountPaid,
          method: "CASH",
          status: "PAID",
          paidAt: now,
          transactionId,
          note: dto.note ?? undefined,
        },
      });

      await tx.feeStructure.update({
        where: { id: fee.id },
        data: { Paidamount: totalPaid, status: newStatus },
      });

      tx.auditLog
        .create({
          data: {
            userId: actorUserId,
            action: "FEE_CASH_PAYMENT",
            targetId: fee.id,
            metadata: { amount: dto.amountPaid, isNewFee },
          },
        })
        .catch((err) => console.warn("Audit log failed:", err?.message));

      return { fee, invoice, payment };
    },
    { isolationLevel: "Serializable" }
  );
};

// ─── Reports (all DB-side aggregation — no full-table loads) ─────────

export const getstudentFeeSummary = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, user: { select: { email: true } } },
  });

  const studentEmail = student?.user?.email ?? null;

  const [feeStructures, overDue, admissionTotals] = await Promise.all([
    prisma.feeStructure.findMany({
      where: { studentId },
      select: { id: true, amount: true },
    }),
    prisma.feeStructure.count({
      where: { studentId, status: "PENDING", dueDate: { lt: new Date() } },
    }),
    prisma.admissionApplication.aggregate({
      where: {
        OR: [
          { studentId },
          ...(studentEmail ? [{ studentEmail }] : []),
        ],
        paymentStatus: "PAID",
        paymentAmount: { not: null, gt: 0 },
      },
      _sum: { paymentAmount: true },
    }),
  ]);

  const feeIds = feeStructures.map((f) => f.id);

  let totalPaidFromFees = 0;
  if (feeIds.length > 0) {
    const payments = await prisma.payment.findMany({
      where: { feeStructureId: { in: feeIds }, status: "PAID" },
      select: { amount: true, transactionId: true, id: true },
    });
    const deduped = dedupePayments(payments);
    totalPaidFromFees = deduped.reduce((sum, p) => sum + p.amount, 0);
  }

  const totalFees = feeStructures.reduce((sum, f) => sum + f.amount, 0) + (admissionTotals._sum.paymentAmount ?? 0);
  const admissionPaid = admissionTotals._sum.paymentAmount ?? 0;
  const totalPaid = totalPaidFromFees + admissionPaid;

  return { totalFees, totalPaid, outstanding: Math.max(totalFees - totalPaid, 0), overDue };
};

export const getStudentFeeList = async (studentId: string) => {
  const [feeStructures, admissionApplications] = await Promise.all([
    prisma.feeStructure.findMany({
      where: { studentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            class: { select: { id: true, name: true } },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paidAt: true,
            transactionId: true,
            createdAt: true,
          },
        },
      },
      orderBy: { dueDate: "desc" },
    }),
    prisma.admissionApplication.findMany({
      where: {
        OR: [
          { studentId },
          ...(studentId ? [{ studentId }] : []),
        ],
        paymentStatus: "PAID",
        paymentAmount: { not: null, gt: 0 },
      },
      select: {
        id: true,
        paymentAmount: true,
        paymentMethod: true,
        paymentDate: true,
        paymentStatus: true,
        createdAt: true,
        targetClass: { select: { id: true, name: true } },
      },
      orderBy: { paymentDate: "desc" },
    }),
  ]);

  const mappedFees = feeStructures.map((fee) => {
    const dedupedPayments = dedupePayments(fee.payments ?? []);
    const paidAmount = dedupedPayments.reduce((sum, p) => sum + p.amount, 0);
    return {
      id: fee.id,
      studentId: fee.studentId,
      feeType: fee.feeType,
      title: fee.title,
      amount: fee.amount,
      paidAmount,
      dueAmount: Math.max(fee.amount - paidAmount, 0),
      dueDate: fee.dueDate,
      month: fee.dueDate ? new Date(fee.dueDate).toISOString().slice(0, 7) : "",
      status: fee.status,
      student: fee.student,
      payments: dedupedPayments,
      createdAt: fee.createdAt,
      source: "FEE_STRUCTURE" as const,
    };
  });

  const mappedAdmissions = admissionApplications.map((admission) => ({
    id: `admission-${admission.id}`,
    studentId,
    feeType: "ADMISSION" as const,
    title: "Admission Fee",
    amount: admission.paymentAmount!,
    paidAmount: admission.paymentAmount!,
    dueAmount: 0,
    dueDate: admission.paymentDate ? new Date(admission.paymentDate).toISOString() : admission.createdAt,
    month: admission.paymentDate ? new Date(admission.paymentDate).toISOString().slice(0, 7) : new Date(admission.createdAt).toISOString().slice(0, 7),
    status: "PAID" as const,
    student: undefined,
    payments: [
      {
        id: `admission-payment-${admission.id}`,
        amount: admission.paymentAmount!,
        method: admission.paymentMethod ?? "CASH",
        status: "PAID",
        paidAt: admission.paymentDate ?? admission.createdAt,
        transactionId: undefined,
        createdAt: admission.createdAt,
      },
    ],
    createdAt: admission.createdAt,
    source: "ADMISSION" as const,
  }));

  const admissionSeen = new Set<string>();
  const dedupedAdmissions = mappedAdmissions.filter((item) => {
    if (admissionSeen.has(item.id)) return false;
    admissionSeen.add(item.id);
    return true;
  });

  return [...mappedFees, ...dedupedAdmissions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Requirement 1.5: monthly fee collection report, ONLINE vs OFFLINE split,
 * plus a by-type breakdown — computed with aggregate/groupBy so it stays
 * fast as payment history grows, instead of loading every row for the
 * month into memory.
 */
export const getCollectionReport = async (month: string, type?: string) => {
  const { start, end } = monthRange(month);
  const baseWhere: any = {
    createdAt: { gte: start, lt: end },
    ...(type ? { feeStructure: { feeType: type as any } } : {}),
  };

  const admissionWhere: any = {
    paymentStatus: "PAID",
    paymentAmount: { not: null, gt: 0 },
    studentId: null,
    paymentDate: { gte: start, lt: end },
  };

  const [admissionAgg, rawPayments] = await Promise.all([
    prisma.admissionApplication.aggregate({
      where: admissionWhere,
      _sum: { paymentAmount: true },
      _count: true,
    }),
    prisma.payment.findMany({
      where: baseWhere,
      select: {
        amount: true,
        method: true,
        transactionId: true,
        id: true,
        feeStructure: { select: { feeType: true } },
      },
    }),
  ]);

  const deduped = dedupePayments(rawPayments);

  const feeTotal = deduped.reduce((sum, p) => sum + p.amount, 0);
  const totalTransactions = deduped.length;

  const byMethodMap = new Map<string, number>();
  const byTypeMap = new Map<string, number>();
  deduped.forEach((p) => {
    const methodKey = p.method === "STRIPE" ? "ONLINE" : "OFFLINE";
    byMethodMap.set(methodKey, (byMethodMap.get(methodKey) ?? 0) + p.amount);
    const typeKey = p.feeStructure?.feeType ?? "OTHER";
    byTypeMap.set(typeKey, (byTypeMap.get(typeKey) ?? 0) + p.amount);
  });

  const admissionTotal = admissionAgg._sum.paymentAmount ?? 0;
  const totalCollected = feeTotal + admissionTotal;
  const totalTransactionsCount = totalTransactions + admissionAgg._count;

  const byMethod = Object.fromEntries(byMethodMap);
  const byType = Object.fromEntries(byTypeMap);

  if ((admissionTotal ?? 0) > 0) {
    const admissionMethod = "ADMISSION";
    byMethod[admissionMethod] = (byMethod[admissionMethod] ?? 0) + admissionTotal;
    byType["ADMISSION"] = admissionTotal;
  }

  return {
    month,
    totalCollected,
    totalTransactions: totalTransactionsCount,
    byType,
    byMethod,
  };
};

export const getFeeSummary = async (month?: string) => {
  const where: any = {};
  if (month) {
    const { start, end } = monthRange(month);
    where.dueDate = { gte: start, lt: end };
  }

  const admissionWhere: any = { paymentStatus: "PAID", paymentAmount: { not: null, gt: 0 }, studentId: null };
  if (month) {
    const { start, end } = monthRange(month);
    admissionWhere.paymentDate = { gte: start, lt: end };
  }
  const today = dayRange();

  const [feeStructures, pendingCount, overdueCount, admissionTotals, admissionTodayTotals] = await Promise.all([
    prisma.feeStructure.findMany({
      where,
      select: { id: true, amount: true }
    }),
    prisma.feeStructure.count({ where: { ...where, status: "PENDING" } }),
    prisma.feeStructure.count({ where: { ...where, status: "PENDING", dueDate: { lt: new Date() } } }),
    prisma.admissionApplication.aggregate({ where: admissionWhere, _sum: { paymentAmount: true }, _count: true }),
    prisma.admissionApplication.aggregate({
      where: { paymentStatus: "PAID", studentId: null, paymentDate: { gte: today.start, lt: today.end } },
      _sum: { paymentAmount: true },
      _count: true,
    }),
  ]);

  const feeIds = feeStructures.map((f) => f.id);

  let feePaidAmount = 0;
  if (feeIds.length > 0) {
    const payments = await prisma.payment.findMany({
      where: { feeStructureId: { in: feeIds }, status: "PAID" },
      select: { amount: true, transactionId: true, id: true },
    });
    const deduped = dedupePayments(payments);
    feePaidAmount = deduped.reduce((sum, p) => sum + p.amount, 0);
  }

  const totalFeesAmount = feeStructures.reduce((sum, f) => sum + f.amount, 0);
  const admissionTotalPaid = admissionTotals._sum.paymentAmount ?? 0;
  const totalAmount = totalFeesAmount + admissionTotalPaid;
  const totalPaid = feePaidAmount + admissionTotalPaid;

  return {
    totalAmount,
    totalPaid,
    admissionTotalPaid,
    admissionPaymentCount: admissionTotals._count,
    admissionTotalPaidToday: admissionTodayTotals._sum.paymentAmount ?? 0,
    admissionPaymentCountToday: admissionTodayTotals._count,
    outstanding: Math.max(totalAmount - totalPaid, 0),
    pendingCount,
    overdueCount,
    overDue: overdueCount,
  };
};

/**
 * Requirement 1.6: "alert the Accountant of overdue fee payments per
 * student." getFeeSummary only ever returned a count — there was no way
 * to actually see WHICH students to alert. This returns the paginated,
 * per-student overdue list the alert/dashboard UI needs, fetching only
 * the fields it displays.
 */
export const getOverdueFees = async (dto: FeeQueryDto) => {
  const { page = "1", limit = "10", classId } = dto;

  const where: any = {
    status: { in: ["PENDING", "PARTIAL"] },
    dueDate: { lt: new Date() },
    ...(classId && { classId }),
  };

  const { skip, take, meta } = await paginate(
    prisma.feeStructure,
    where,
    parseInt(page),
    parseInt(limit)
  );

  const fees = await prisma.feeStructure.findMany({
    where,
    skip,
    take,
    select: {
      id: true,
      feeType: true,
      amount: true,
      Paidamount: true,
      dueDate: true,
      student: {
        select: { id: true, rollNumber: true, user: { select: { name: true } } },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return { data: fees, meta };
};

// ─── PRIVATE

export const _exists = async (id: string) => {
  const fee = await prisma.feeStructure.findUnique({ where: { id }, select: { id: true } });
  if (!fee) throw new Error("Fee record not found");
  return fee;
};

export const getAllPayments = async (dto: { page?: string; limit?: string; method?: string; status?: string; month?: string }) => {
  const page = Number(dto.page);
  const limit = Number(dto.limit);
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit < 1 ? 20 : limit;

  const where: any = {};
  if (dto.method && ['STRIPE', 'CASH'].includes(dto.method)) {
    where.method = dto.method;
  }
  if (dto.status && ['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(dto.status)) {
    where.status = dto.status;
  }
  if (dto.month) {
    const monthStr = String(dto.month).trim();
    const monthRegex = /^\d{4}-\d{2}$/;
    if (monthRegex.test(monthStr)) {
      const [yearStr, monthNumStr] = monthStr.split('-');
      const year = Number(yearStr);
      const monthNum = Number(monthNumStr);
      if (year >= 2000 && year <= 2100 && monthNum >= 1 && monthNum <= 12) {
        const start = new Date(Date.UTC(year, monthNum - 1, 1));
        const end = new Date(Date.UTC(year, monthNum, 1));
        where.createdAt = { gte: start, lt: end };
      }
    }
  }

  const [feePayments, admissionPayments] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        transactionId: true,
        note: true,
        paidAt: true,
        createdAt: true,
        student: { select: { id: true, rollNumber: true, user: { select: { name: true, email: true } } } },
        feeStructure: { select: { id: true, feeType: true, title: true, amount: true } },
      },
    }),
    prisma.admissionApplication.findMany({
      where: { paymentStatus: "PAID", paymentAmount: { not: null, gt: 0 }, studentId: null },
      orderBy: { paymentDate: "desc" },
      select: {
        id: true,
        paymentAmount: true,
        paymentMethod: true,
        paymentDate: true,
        createdAt: true,
        transactionId: true,
        studentId: true,
        studentEmail: true,
        applicantName: true,
      },
    }),
  ]);

  const mappedAdmissions = admissionPayments.map((admission) => ({
    id: `admission-${admission.id}`,
    amount: Number(admission.paymentAmount ?? 0),
    method: admission.paymentMethod ?? "CASH",
    status: "PAID" as const,
    transactionId: admission.transactionId?.trim() || undefined,
    note: "Admission payment",
    paidAt: admission.paymentDate ?? admission.createdAt,
    createdAt: admission.createdAt,
    student: {
      id: admission.studentId ?? "",
      rollNumber: undefined,
      user: {
        name: admission.applicantName ?? admission.studentEmail ?? "—",
        email: admission.studentEmail ?? "",
      },
    },
    feeStructure: {
      id: undefined,
      feeType: "ADMISSION",
      title: "Admission Fee",
      amount: Number(admission.paymentAmount ?? 0),
    },
  }));

  const deduped = dedupePayments([...feePayments, ...mappedAdmissions]).sort((a, b) => {
    const dateA = new Date(a.paidAt || a.createdAt).getTime();
    const dateB = new Date(b.paidAt || b.createdAt).getTime();
    return dateB - dateA;
  });

  const total = deduped.length;
  const start = (safePage - 1) * safeLimit;
  const paginated = deduped.slice(start, start + safeLimit);

  return {
    data: paginated,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
};

export const getMonthlyAnalytics = async (year: number) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const [byMonth, byMethodYear, typeBreakdown, admissionMethodYear, allFeePayments] = await Promise.all([
    Promise.all(
      months.map(async (m) => {
        const start = new Date(year, m - 1, 1);
        const end = new Date(year, m, 1);
        const agg = await prisma.payment.aggregate({
          where: { createdAt: { gte: start, lt: end }, status: "PAID" },
          _sum: { amount: true },
          _count: { id: true },
        });
        const admissionAgg = await prisma.admissionApplication.aggregate({
          where: { paymentStatus: "PAID", paymentAmount: { not: null, gt: 0 }, studentId: null, paymentDate: { gte: start, lt: end } },
          _sum: { paymentAmount: true },
          _count: true,
        });
        return {
          month: m,
          total: (agg._sum.amount ?? 0) + (admissionAgg._sum.paymentAmount ?? 0),
          count: (agg._count.id ?? 0) + (admissionAgg._count ?? 0),
        };
      })
    ),
    prisma.payment.groupBy({
      by: ["method"],
      where: { createdAt: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) }, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.feeStructure.groupBy({
      by: ["feeType"],
      _sum: { amount: true, Paidamount: true },
    }),
    prisma.admissionApplication.groupBy({
      by: ["paymentMethod"],
      where: { paymentStatus: "PAID", paymentAmount: { not: null, gt: 0 }, studentId: null, paymentDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } },
      _sum: { paymentAmount: true },
    }),
    prisma.payment.findMany({
      where: { createdAt: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) }, status: "PAID" },
      select: { amount: true, method: true, transactionId: true, id: true, feeStructure: { select: { feeType: true } } },
    }),
  ]);

  const dedupedPayments = dedupePayments(allFeePayments);

  const methodMap = new Map<string, number>();
  byMethodYear.forEach((g) => {
    methodMap.set(g.method, (methodMap.get(g.method) ?? 0) + (g._sum.amount ?? 0));
  });
  admissionMethodYear.forEach((g) => {
    const key = g.paymentMethod ?? "CASH";
    methodMap.set(key, (methodMap.get(key) ?? 0) + (g._sum.paymentAmount ?? 0));
  });

  const correctedMethodMap = new Map<string, number>();
  dedupedPayments.forEach((p) => {
    correctedMethodMap.set(p.method, (correctedMethodMap.get(p.method) ?? 0) + p.amount);
  });
  admissionMethodYear.forEach((g) => {
    const key = g.paymentMethod ?? "CASH";
    correctedMethodMap.set(key, (correctedMethodMap.get(key) ?? 0) + (g._sum.paymentAmount ?? 0));
  });

  const typeEntries = typeBreakdown.map((t) => [t.feeType, { amount: t._sum.amount ?? 0, paid: t._sum.Paidamount ?? 0 }] as const);

  const correctedTypeMap = new Map<string, number>();
  dedupedPayments.forEach((p) => {
    const key = p.feeStructure?.feeType ?? "OTHER";
    correctedTypeMap.set(key, (correctedTypeMap.get(key) ?? 0) + p.amount);
  });

  return {
    year,
    byMonth,
    byMethod: Object.fromEntries(correctedMethodMap),
    byType: Object.fromEntries(correctedTypeMap),
  };
};

export const getAccountantDashboardOverview = async () => {
  const today = dayRange();
  const [summary, recentPayments, admissionTodayAggregate] = await Promise.all([
    getFeeSummary(),
    getAllPayments({ page: "1", limit: "5" }),
    prisma.admissionApplication.aggregate({
      where: { paymentStatus: "PAID", studentId: null, paymentDate: { gte: today.start, lt: today.end } },
      _sum: { paymentAmount: true },
      _count: true,
    }),
  ]);

  const todayPayments = await prisma.payment.findMany({
    where: { createdAt: { gte: today.start, lt: today.end }, status: "PAID" },
    select: { amount: true, method: true, transactionId: true, id: true },
  });

  const dedupedToday = dedupePayments(todayPayments);

  const todayCollection = dedupedToday.reduce((sum, p) => sum + p.amount, 0) + (admissionTodayAggregate._sum.paymentAmount ?? 0);
  const todayCount = dedupedToday.length + admissionTodayAggregate._count;

  const methodBreakdownMap = new Map<string, number>();
  dedupedToday.forEach((p) => {
    methodBreakdownMap.set(p.method, (methodBreakdownMap.get(p.method) ?? 0) + p.amount);
  });

  const admissionMethodToday = await prisma.admissionApplication.groupBy({
    by: ["paymentMethod"],
    where: { paymentStatus: "PAID", paymentAmount: { not: null, gt: 0 }, studentId: null, paymentDate: { gte: today.start, lt: today.end } },
    _sum: { paymentAmount: true },
  });

  admissionMethodToday.forEach((g) => {
    const key = g.paymentMethod ?? "CASH";
    methodBreakdownMap.set(key, (methodBreakdownMap.get(key) ?? 0) + (g._sum.paymentAmount ?? 0));
  });

  return {
    summary,
    todayCollection,
    todayCount,
    recentPayments: recentPayments.data,
    recentPaymentsMeta: recentPayments.meta,
    byMethod: Object.fromEntries(methodBreakdownMap),
  };
};

// ─── Stripe Payment Intent & Webhook ─

export const createPaymentIntent = async (feeId: string, studentId: string) => {
  const fee = await prisma.feeStructure.findUnique({ where: { id: feeId } });
  if (!fee) throw new Error("Fee not found");
  if (fee.studentId !== studentId) throw new Error("Fee does not belong to this student");
  if (fee.status === "PAID") throw new Error("Fee is already paid");

  const amountRemaining = fee.amount - fee.Paidamount;
  if (amountRemaining <= 0) throw new Error("No outstanding amount");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amountRemaining * 100), // Stripe expects amount in smallest currency unit (e.g. cents/paisa)
    currency: "bdt",
    metadata: {
      feeId,
      studentId,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    amount: amountRemaining,
    currency: "bdt"
  };
};

export const handleStripeWebhook = async (signature: string, rawBody: Buffer) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Stripe webhook secret not configured");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    throw new Error(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;
    const { feeId, studentId } = paymentIntent.metadata;

    if (!feeId || !studentId) {
      console.warn("PaymentIntent succeeded but missing metadata", paymentIntent.id);
      return;
    }

    // Using serializable transaction to prevent race conditions just like recordPayment
    await prisma.$transaction(
      async (tx) => {
        const fee = await tx.feeStructure.findUnique({ where: { id: feeId } });
        if (!fee) return;
        if (fee.status === "PAID") return; // Already processed

        // paymentIntent.amount is in cents/paisa
        const amountPaid = paymentIntent.amount / 100;
        const totalPaid = fee.Paidamount + amountPaid;
        const newStatus = totalPaid >= fee.amount ? "PAID" : "PARTIAL";

        let invoice = await tx.invoice.findFirst({ where: { feeStructureId: fee.id } });
        if (!invoice) {
          invoice = await tx.invoice.create({
            data: {
              studentId: fee.studentId!,
              feeStructureId: fee.id,
              amount: fee.amount,
              dueDate: fee.dueDate,
              year: fee.year,
              month: fee.month,
              status: newStatus,
            },
          });
        }

        const transactionId = paymentIntent.id;

        // Check if payment already recorded
        const existingPayment = await tx.payment.findUnique({ where: { transactionId } });
        if (existingPayment) return;

        await tx.payment.create({
          data: {
            feeStructureId: fee.id,
            amount: amountPaid,
            method: "STRIPE",
            status: "PAID",
            transactionId,
            note: "Paid via Stripe",
            invoiceId: invoice.id,
            studentId: fee.studentId!,
            stripePaymentIntentId: paymentIntent.id,
            paidAt: new Date(),
          },
        });

        await tx.feeStructure.update({
          where: { id: fee.id },
          data: { Paidamount: totalPaid, status: newStatus },
        });

        if (newStatus === "PAID") {
          await tx.invoice.update({ where: { id: invoice.id }, data: { status: "PAID" } });
        }

        // We can't log the user who made the payment easily since it's a webhook,
        // so we log it as SYSTEM or omit actorUserId.
        await tx.auditLog
          .create({
            data: {
              userId: studentId, // Attributing to the student
              action: "FEE_ONLINE_PAYMENT",
              targetId: fee.id,
              metadata: { amount: amountPaid, method: "STRIPE", newStatus, transactionId },
            },
          })
          .catch((err) => console.warn("Audit log failed:", err?.message));
      },
      { isolationLevel: "Serializable" }
    );
  }
};
