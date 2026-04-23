import prisma from "../../config/db";
import { BulkCreateFeeDto, CreateFeeDto, FeeQueryDto, RecordPaymentDto, UpdateFeeDto, } from "./fee.dto";
import { paginate } from "../../utils/pagination.util";

export  const createfee = async (dto: CreateFeeDto) => {
    const student = await prisma.student.findUnique({
        where: { id: dto.studentId },
    });
    if (!student) {
        throw new Error('Student not found');
    }
        return await prisma.feeStructure.create({
            data: {
                ...dto,
                dueDate: new Date(dto.dueDate),
                status: 'PENDING',
                Paidamount: 0,
                classId: dto.classId, // Ensure `classId` is provided in `dto`
                feeType: dto.type, // Corrected to use `type` from `CreateFeeDto`
                dueDay: dto.dueDay,   // Ensure `dueDay` is provided in `dto`
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        })
    

}
export const bulkcreate = async (dto: BulkCreateFeeDto) => {
    const students = await prisma.student.findMany({
        where: { classId: dto.classId },
        select: { id: true },
    });

    const fees = students.map((student) => ({
        title: dto.title,
        feeType: dto.type, // Updated to use `feeType` as required by Prisma
        amount: dto.amount,
        dueDate: dto.dueDate,
        dueDay: new Date(dto.dueDate).getDate(),
        description: dto.description,
        status: 'PENDING',
        paidAmount: 0,
        studentId: student.id,
        classId: dto.classId,
    }));

    await prisma.feeStructure.createMany({ data: fees });

    return { created: students.length };
};
export const findAll = async (dto: FeeQueryDto) => {

  const { page = '1', limit = '10', studentId, classId, type, status, month } = dto;

  //  base filter
  const where: any = {
    ...(studentId && { studentId }),
    ...(classId && { classId }),
    ...(type && { feeType: type }),
    ...(status && { status }),
  };

  //  month filter
  if (month) {
    const start = new Date(`${month}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);

    where.dueDate = {
      gte: start,
      lt: end,
    };
  }

  //  ALWAYS paginate (important fix)
  const { skip, take, meta } = await paginate(
    prisma.feeStructure,
    where,
    parseInt(page),
    parseInt(limit)
  );

  //  fetch data
  const fees = await prisma.feeStructure.findMany({
    where,
    skip,
    take,
    include: {
      student: {
        select: {
          id: true,
          rollNumber: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          class: {
            select: {
              name: true,
              sections: true,
            },
          },
        },
      },
      payments: true,
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
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          class: {
            select: {
              name: true,
              sections: true,
            },
          },
        },
      },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!fee) {
    throw new Error('Fee not found');
  }

  // Ensure payments are safely accessed
  const payments = fee.payments ?? [];
  return { ...fee, payments };
};

export const updateFee = async (id: string, dto: UpdateFeeDto) => {

  //  check exists
  const existing = await prisma.feeStructure.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Fee not found");
  }

  //  update
  return await prisma.feeStructure.update({
    where: { id },
    data: {
      ...dto,
      ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
    },
    include: {
      payments: true,
    },
  }); 
  
};
 export const deleteFee = async (id: string) => {
   
  await prisma.feeStructure.delete({ where: { id } });

 }

 // Payment related operations 

 export const recordPayment = async(dto: RecordPaymentDto) => {
  const fee = await prisma.feeStructure.findUnique({
    where: { id: dto.feeId },
  });
  if (!fee) {
    throw new Error("Fee not found");
  }
  if (fee.status === "PAID") {
    throw new Error("Fee is already paid");
  }
  const totalPaid = fee.Paidamount + dto.amountPaid;
  if (totalPaid > fee.amount) {
    throw new Error("Payment exceeds fee amount");
  }

  // Fetch required fields for PaymentUncheckedCreateInput
  const student = await prisma.student.findUnique({
    where: { id: fee.studentId },
  });
  if (!student) {
    throw new Error("Student not found");
  }

  const invoice = await prisma.invoice.findFirst({
    where: { feeStructureId: fee.id },
  });
  if (!invoice) {
    throw new Error("Invoice not found for the fee structure");
  }

  // Determine new status
  const newStatus =
    totalPaid === fee.amount
      ? "PAID"
      : totalPaid > 0
      ? "PARTIAL"
      : fee.status;

  // Create Payment record and update fee atomically
  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        feeStructureId: dto.feeId,
        amount: dto.amountPaid,
        method: dto.method,
        transactionId: dto.transactionId ?? undefined, // Convert null to undefined
        note: dto.note ?? undefined, // Convert null to undefined
        invoiceId: invoice.id, // Required field
        studentId: student.id, // Required field
      },
    }),
    prisma.feeStructure.update({
      where: { id: dto.feeId },
      data: {
        paidAmount: totalPaid,
        status: newStatus,
      },
    }),
  ]);

  return payment;
};