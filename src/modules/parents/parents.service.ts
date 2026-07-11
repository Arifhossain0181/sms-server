import prisma from "../../config/db";
import {
  CreateParentDto,
  UpdateParentDto,
  ParentQueryDto,
  PaginationDto,
} from "./parents.dto";




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

// ─── ADMIN: create a Parent profile ───────────────────────────────
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

  // ─── ADMIN: update any parent's profile ─────────────────────────
  static async updateParent(parentId: string, dto: UpdateParentDto) {
    const existing = await prisma.parent.findUnique({ where: { id: parentId }, select: { id: true } });
    if (!existing) throw new Error('Parent not found');

    return prisma.parent.update({ where: { id: parentId }, data: dto, select: PARENT_SELECT });
  }

  // ─── ADMIN: delete a parent profile ──────────────────────────────
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

  // ─── ADMIN: single parent, with children list ────────────────────
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

  // ─── ADMIN: link a student to this parent ────────────────────────
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

  // ─── ADMIN: unlink a student from this parent ────────────────────
  static async unlinkChild(parentId: string, studentId: string) {
    const student = await prisma.student.findFirst({ where: { id: studentId, parentId }, select: { id: true } });
    if (!student) throw new Error('This student is not linked to this parent');

    return prisma.student.update({ where: { id: studentId }, data: { parentId: null } });
  }

  // =====================================================================
  // PARENT SELF-SERVICE
  // =====================================================================

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

    return prisma.payment.findMany({
      where: { parentId: parent.id },
      select: { id: true, amount: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  // WHAT: notices addressed to this parent (school-wide or class-specific
  //       notices get fanned out into NoticeRecipient rows elsewhere).
  static async getMyNotices(userId: string, pagination: PaginationDto = {}) {
    const parent = await prisma.parent.findUnique({ where: { userId }, select: { id: true } });
    if (!parent) throw new Error('Parent profile not found');

    const page = pagination.page ?? 1;
    const pageSize = Math.min(pagination.pageSize ?? 20, 100);

    return prisma.noticeRecipient.findMany({
      where: { parentId: parent.id },
      select: {
        id: true,
        read: true,
        notice: { select: { id: true, title: true, content: true, createdAt: true } },
      },
      orderBy: { notice: { createdAt: 'desc' } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }
}