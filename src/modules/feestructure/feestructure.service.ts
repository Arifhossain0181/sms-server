import prisma from "../../config/db";
import {
  CreateFeeStructureDto,
  UpdateFeeStructureDto,
  FeeStructureQueryDto,
} from "./feestructure.dto";


const FEE_STRUCTURE_SELECT = {
  id: true,
  classId: true,
  feeType: true,
  amount: true,
  dueDay: true,
  month: true,
  year: true,
  createdAt: true,
  class: { select: { id: true, name: true } },
} as const;

function _assertValidDto(dto: { amount?: number; dueDay?: number; month?: number; year?: number }) {
  if (dto.amount !== undefined && dto.amount <= 0) throw new Error('Amount must be greater than zero');
  if (dto.dueDay !== undefined && (dto.dueDay < 1 || dto.dueDay > 31)) throw new Error('dueDay must be between 1 and 31');
  if (dto.month !== undefined && (dto.month < 1 || dto.month > 12)) throw new Error('month must be between 1 and 12');
}

export class FeeStructureService {
  // ─── ACCOUNTANT / SCHOOL_ADMIN: create a fee template ────────────
  static async create(dto: CreateFeeStructureDto) {
    const classExists = await prisma.class.findUnique({ where: { id: dto.classId }, select: { id: true } });
    if (!classExists) throw new Error('Class not found');

    _assertValidDto(dto);

    try {
      return await prisma.feeStructure.create({
        data: {
          classId: dto.classId,
          feeType: dto.feeType,
          amount: dto.amount,
          dueDay: dto.dueDay,
          month: dto.month,
          year: dto.year,
          dueDate: dto.dueDate,
          academicYear: dto.academicYear,
        },
        select: FEE_STRUCTURE_SELECT,
      });
    } catch (err: any) {
      // WHAT: unique constraint on (classId, feeType, month, year).
      // WHY: prevents two conflicting fee templates for the same class
      //      + fee type + month/year — turns the raw P2002 into a clear message.
      if (err?.code === 'P2002') {
        throw new Error('A fee structure for this class, fee type, and month/year already exists — edit it instead');
      }
      throw err;
    }
  }

  // ─── ACCOUNTANT / SCHOOL_ADMIN: update amount/due day ────────────
  // NOTE: classId, feeType, month, year are NOT editable — that would
  // change which (class, type, month, year) this template represents.
  // Delete and recreate if the combination itself needs to change.
  static async update(id: string, dto: UpdateFeeStructureDto) {
    const existing = await prisma.feeStructure.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new Error('Fee structure not found');

    _assertValidDto(dto);

    return prisma.feeStructure.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.dueDay !== undefined && { dueDay: dto.dueDay }),
      },
      select: FEE_STRUCTURE_SELECT,
    });
  }

  //  ACCOUNTANT / SCHOOL_ADMIN: delete a template 
  static async delete(id: string) {
    const existing = await prisma.feeStructure.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new Error('Fee structure not found');

    
    const paymentCount = await prisma.payment.count({ where: { feeStructureId: id } });
    if (paymentCount > 0) {
      throw new Error('Cannot delete — payments have already been recorded against this fee structure');
    }

    return prisma.feeStructure.delete({ where: { id } });
  }

  // ─── list / filter, paginated 
  static async findAll(query: FeeStructureQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);

    const where: any = {
      ...(query.classId && { classId: query.classId }),
      ...(query.feeType && { feeType: query.feeType }),
      ...(query.month !== undefined && { month: query.month }),
      ...(query.year !== undefined && { year: query.year }),
      ...(query.academicYear && { academicYear: query.academicYear }),
    };

    const [total, data] = await Promise.all([
      prisma.feeStructure.count({ where }),
      prisma.feeStructure.findMany({
        where,
        select: FEE_STRUCTURE_SELECT,
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { classId: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async findById(id: string) {
    const structure = await prisma.feeStructure.findUnique({ where: { id }, select: FEE_STRUCTURE_SELECT });
    if (!structure) throw new Error('Fee structure not found');
    return structure;
  }

  // ─── STUDENT / PARENT-facing: all fee templates for one class ───
  // WHAT: used by the /fees collection module & student/parent views
  //       to know what's due, without exposing create/edit/delete.
  // Optionally scoped to a specific month/year (defaults to all).
  static async findByClass(classId: string, month?: number, year?: number) {
    return prisma.feeStructure.findMany({
      where: {
        classId,
        ...(month !== undefined && { month }),
        ...(year !== undefined && { year }),
      },
      select: FEE_STRUCTURE_SELECT,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }
}