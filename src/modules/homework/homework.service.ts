import prisma from "../../config/db";
import {
  CreateHomeworkDto,
  UpdateHomeworkDto,
  HomeworkQueryDto,
  StudentHomeworkQueryDto,
} from "./howework.dto";




const HOMEWORK_SELECT = {
  id: true,
  title: true,
  description: true,
  dueDate: true,
  isReviewed: true,
  createdAt: true,
  section: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true, code: true } },
  teacher: { select: { id: true, employeeId: true, user: { select: { name: true } } } },
} as const;

// ─── TINY IN-MEMORY CACHE (same pattern as timetable module) 
type CacheEntry<T> = { value: T; expiresAt: number };
const CACHE_TTL_MS = 30_000;
const sectionHomeworkCache = new Map<string, CacheEntry<any[]>>();

function _cacheGet(sectionId: string) {
  const entry = sectionHomeworkCache.get(sectionId);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    sectionHomeworkCache.delete(sectionId);
    return undefined;
  }
  return entry.value;
}
function _cacheSet(sectionId: string, value: any[]) {
  sectionHomeworkCache.set(sectionId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}
function _cacheClear(sectionId: string) {
  sectionHomeworkCache.delete(sectionId);
}

function _isOverdue(dueDate: Date): boolean {
  return dueDate.getTime() < Date.now();
}

function _withComputedStatus<T extends { dueDate: Date; isReviewed: boolean }>(hw: T) {
  return { ...hw, isOverdue: _isOverdue(hw.dueDate) };
}

export class HomeworkService {


  static async create(teacherId: string, dto: CreateHomeworkDto) {
    const [section, subject, teaches] = await Promise.all([
      prisma.section.findUnique({ where: { id: dto.sectionId }, select: { id: true } }),
      prisma.subject.findUnique({ where: { id: dto.subjectId }, select: { id: true } }),
      // WHAT: confirm this teacher is actually assigned to teach this
      //       subject in this section (via the Timetable relation).
      prisma.timetable.findFirst({
        where: { teacherId, sectionId: dto.sectionId, subjectId: dto.subjectId },
        select: { id: true },
      }),
    ]);
    if (!section) throw new Error('Section not found');
    if (!subject) throw new Error('Subject not found');
    if (!teaches) throw new Error('You are not assigned to teach this subject for this section');

    const homework = await prisma.homework.create({
      data: {
        teacherId,
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
      },
      select: HOMEWORK_SELECT,
    });

    _cacheClear(dto.sectionId);
    return _withComputedStatus(homework);
  }

  static async update(teacherId: string, id: string, dto: UpdateHomeworkDto) {
    const existing = await prisma.homework.findUnique({ where: { id }, select: { id: true, teacherId: true, sectionId: true } });
    if (!existing) throw new Error('Homework not found');
    if (existing.teacherId !== teacherId) throw new Error('You can only edit your own homework');

    const homework = await prisma.homework.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
      },
      select: HOMEWORK_SELECT,
    });

    _cacheClear(existing.sectionId);
    return _withComputedStatus(homework);
  }

  // WHAT: marks the whole homework item as reviewed by the teacher
  //       (this schema tracks review at the homework level, not a
  //       per-student submission — there's no separate submission model).
  static async markReviewed(teacherId: string, id: string) {
    const existing = await prisma.homework.findUnique({ where: { id }, select: { teacherId: true, sectionId: true } });
    if (!existing) throw new Error('Homework not found');
    if (existing.teacherId !== teacherId) throw new Error('You can only review your own homework');

    const homework = await prisma.homework.update({ where: { id }, data: { isReviewed: true }, select: HOMEWORK_SELECT });
    _cacheClear(existing.sectionId);
    return _withComputedStatus(homework);
  }

  static async delete(teacherId: string, id: string) {
    const existing = await prisma.homework.findUnique({ where: { id }, select: { teacherId: true, sectionId: true } });
    if (!existing) throw new Error('Homework not found');
    if (existing.teacherId !== teacherId) throw new Error('You can only delete your own homework');

    // WHAT: delete view records first — schema doesn't declare
    //       onDelete: Cascade on HomeworkView -> Homework, so a plain
    //       delete would fail with a foreign-key error once any
    //       student has viewed it.
    await prisma.$transaction([
      prisma.homeworkView.deleteMany({ where: { homeworkId: id } }),
      prisma.homework.delete({ where: { id } }),
    ]);

    _cacheClear(existing.sectionId);
  }

  // WHAT: paginated list of a teacher's own homework, with optional
  //       status filter (PENDING / REVIEWED / OVERDUE) computed in JS
  //       since these aren't stored columns.
  static async listMine(teacherId: string, query: HomeworkQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);

    const where: any = {
      teacherId,
      ...(query.sectionId && { sectionId: query.sectionId }),
      ...(query.subjectId && { subjectId: query.subjectId }),
    };

    const all = await prisma.homework.findMany({
      where,
      select: HOMEWORK_SELECT,
      orderBy: { dueDate: 'desc' },
    });

    let withStatus = all.map(_withComputedStatus);

    if (query.status === 'PENDING') withStatus = withStatus.filter(h => !h.isReviewed && !h.isOverdue);
    if (query.status === 'REVIEWED') withStatus = withStatus.filter(h => h.isReviewed);
    if (query.status === 'OVERDUE') withStatus = withStatus.filter(h => !h.isReviewed && h.isOverdue);

    const total = withStatus.length;
    const data = withStatus.slice((page - 1) * pageSize, page * pageSize);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // WHAT: single homework item with view stats — how many students in
  //       the section have viewed it vs. the section's total headcount.
  static async getById(id: string) {
    const homework = await prisma.homework.findUnique({ where: { id }, select: HOMEWORK_SELECT });
    if (!homework) throw new Error('Homework not found');

    const [viewedCount, totalStudents] = await Promise.all([
      prisma.homeworkView.count({ where: { homeworkId: id } }),
      prisma.student.count({ where: { sectionId: (homework as any).section.id } }),
    ]);

    return { ..._withComputedStatus(homework), viewedCount, totalStudents };
  }

  // ── TEACHER dashboard widget: own overdue-and-unreviewed homework ──
  static async listOverdue(teacherId: string) {
    const homework = await prisma.homework.findMany({
      where: { teacherId, isReviewed: false, dueDate: { lt: new Date() } },
      select: HOMEWORK_SELECT,
      orderBy: { dueDate: 'asc' },
    });
    return homework.map(_withComputedStatus);
  }

  // =====================================================================
  // STUDENT / PARENT (shared internal logic)
  // =====================================================================

  // WHAT: cached list of ALL homework for a section (no per-student data).
  private static async _getSectionHomework(sectionId: string) {
    const cached = _cacheGet(sectionId);
    if (cached) return cached;

    const homework = await prisma.homework.findMany({
      where: { sectionId },
      select: HOMEWORK_SELECT,
      orderBy: { dueDate: 'desc' },
    });

    const withStatus = homework.map(_withComputedStatus);
    _cacheSet(sectionId, withStatus);
    return withStatus;
  }

  // WHAT: merges the shared section-level cached list with THIS
  //       student's own "viewed" flags (one small extra query).
  private static async _getHomeworkForStudent(sectionId: string, studentId: string, query: StudentHomeworkQueryDto) {
    const [sectionHomework, myViews] = await Promise.all([
      this._getSectionHomework(sectionId),
      prisma.homeworkView.findMany({ where: { studentId }, select: { homeworkId: true } }),
    ]);
    const viewedSet = new Set(myViews.map(v => v.homeworkId));

    let list = sectionHomework.map((hw: any) => ({ ...hw, viewed: viewedSet.has(hw.id) }));

    if (query.status === 'UPCOMING') list = list.filter((h: any) => !h.isOverdue);
    if (query.status === 'OVERDUE') list = list.filter((h: any) => h.isOverdue);

    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const total = list.length;
    const data = list.slice((page - 1) * pageSize, page * pageSize);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // ── STUDENT: own homework, classId/sectionId resolved server-side ──
  static async getMyHomework(studentId: string, query: StudentHomeworkQueryDto) {
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { sectionId: true } });
    if (!student) throw new Error('Student not found');

    return this._getHomeworkForStudent(student.sectionId, studentId, query);
  }

  // WHAT: student opens a homework item — records that they've seen it.
  // Uses upsert so calling it twice is harmless (unique constraint on
  // [homeworkId, studentId] would otherwise throw P2002 on a repeat view).
  static async markViewed(studentId: string, homeworkId: string) {
    const [student, homework] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId }, select: { sectionId: true } }),
      prisma.homework.findUnique({ where: { id: homeworkId }, select: { sectionId: true } }),
    ]);
    if (!student) throw new Error('Student not found');
    if (!homework) throw new Error('Homework not found');
    if (homework.sectionId !== student.sectionId) throw new Error('This homework is not assigned to your section');

    return prisma.homeworkView.upsert({
      where: { homeworkId_studentId: { homeworkId, studentId } },
      update: {}, // already viewed — no-op, just confirms it's recorded
      create: { homeworkId, studentId },
    });
  }

  // ── PARENT: a child's homework, ownership verified first ───────────
  static async getChildHomework(parentId: string, studentId: string, query: StudentHomeworkQueryDto) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, parentId },
      select: { sectionId: true },
    });
    if (!student) throw new Error('Child not found for this parent');

    return this._getHomeworkForStudent(student.sectionId, studentId, query);
  }
}