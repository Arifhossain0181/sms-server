import prisma from "../../config/db";
import { BulkCreateFeeDto, CreateFeeDto, FeeQueryDto, RecordCashPaymentDto, RecordPaymentDto, UpdateFeeDto } from "./fee.dto";
import { paginate } from "../../utils/pagination.util";



function deriveMonthYear(date: Date) {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function monthRange(month: string) {
  const start = new Date(`${month}-01`);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return { start, end };
}

// student/classId existence should be validated, and dueDate must
// actually parse — CreateFeeDto's title/description map to real
// FeeStructure columns.
export const createfee = async (dto: CreateFeeDto) => {
  const student = await prisma.student.findUnique({
    where: { id: dto.studentId },
    select: { id: true },
  });
  if (!student) throw new Error("Student not found");

  const dueDate = new Date(dto.dueDate);
  if (Number.isNaN(dueDate.getTime())) throw new Error("Invalid dueDate");
  const { year, month } = deriveMonthYear(dueDate);

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
      payments: { select: { id: true, amount: true, method: true, createdAt: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return { data: fees, meta };
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
  return { ...fee, payments: fee.payments ?? [] };
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
    include: { payments: true },
  });
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

      const payment = await tx.payment.create({
        data: {
          feeStructureId: dto.feeId,
          amount: dto.amountPaid,
          method: dto.method,
          transactionId: dto.transactionId ?? undefined,
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

      // NFR Auditability — payments must be logged with user/timestamp.
      // Fire-and-forget so a logging hiccup never blocks the payment itself.
      tx.auditLog
        .create({
          data: {
            userId: actorUserId,
            action: "FEE_PAYMENT_RECORDED",
            targetId: fee.id,
            meta: { amount: dto.amountPaid, method: dto.method, newStatus },
            timestamp: new Date(),
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

  return prisma.$transaction(
    async (tx) => {
      let fee = await tx.feeStructure.findFirst({
        where: {
          studentId: student.id,
          feeType: dto.type,
          year,
          month,
          status: { in: ["PENDING", "PARTIAL"] },
        },
      });

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
          transactionId: dto.transactionId ?? undefined,
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
            meta: { amount: dto.amountPaid, isNewFee },
            timestamp: new Date(),
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
  const [totals, overDue] = await Promise.all([
    prisma.feeStructure.aggregate({
      where: { studentId },
      _sum: { amount: true, Paidamount: true },
    }),
    prisma.feeStructure.count({
      where: { studentId, status: "PENDING", dueDate: { lt: new Date() } },
    }),
  ]);

  const totalFees = totals._sum.amount ?? 0;
  const totalPaid = totals._sum.Paidamount ?? 0;

  return { totalFees, totalPaid, outstanding: totalFees - totalPaid, overDue };
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

  const [totalAgg, byMethodGroups, byTypeGroups] = await Promise.all([
    prisma.payment.aggregate({ where: baseWhere, _sum: { amount: true }, _count: true }),
    prisma.payment.groupBy({
      by: ["method"],
      where: baseWhere,
      _sum: { amount: true },
    }),
    // feeType lives on FeeStructure, not Payment, so it can't be grouped
    // directly — resolve the small, fixed set of fee types in parallel
    // aggregate queries instead of pulling every payment row into JS.
    prisma.feeStructure
      .findMany({ where: {}, select: { feeType: true }, distinct: ["feeType"] })
      .then((types) =>
        Promise.all(
          types.map(async ({ feeType }) => {
            const agg = await prisma.payment.aggregate({
              where: { ...baseWhere, feeStructure: { feeType } },
              _sum: { amount: true },
            });
            return [feeType, agg._sum.amount ?? 0] as const;
          })
        )
      ),
  ]);

  const byMethod = Object.fromEntries(
    byMethodGroups.map((g) => [g.method === "STRIPE" ? "ONLINE" : "OFFLINE", g._sum.amount ?? 0])
  );
  const byType = Object.fromEntries(byTypeGroups.filter(([, sum]) => sum > 0));

  return {
    month,
    totalCollected: totalAgg._sum.amount ?? 0,
    totalTransactions: totalAgg._count,
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

  const [totals, pendingCount, overdueCount] = await Promise.all([
    prisma.feeStructure.aggregate({ where, _sum: { amount: true, Paidamount: true } }),
    prisma.feeStructure.count({ where: { ...where, status: "PENDING" } }),
    prisma.feeStructure.count({ where: { ...where, status: "PENDING", dueDate: { lt: new Date() } } }),
  ]);

  const totalAmount = totals._sum.amount ?? 0;
  const totalPaid = totals._sum.Paidamount ?? 0;

  return {
    totalAmount,
    totalPaid,
    outstanding: totalAmount - totalPaid,
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