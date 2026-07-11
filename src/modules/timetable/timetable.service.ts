import prisma from "../../config/db";
import {
  BulkCreateTimetableDto,
  CreateTimetableSlotDto,
  DayOfWeek,
  TimetableQueryDto,
  UpdateTimetableSlotDto,
} from "./timetable.dto";


const SLOT_SELECT = {
  id: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  roomNumber: true,
  class: { select: { id: true, name: true } },
  section: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true, code: true } },
  teacher: {
    select: {
      id: true,
      employeeId: true,
      user: { select: { name: true } },
    },
  },
} as const;

// WHAT: caches the weekly view responses for a few seconds.
// WHY: with 3000 students, the same class's timetable can be requested
//      hundreds of times a minute. A weekly timetable barely changes
//      (maybe a few times a term), so re-hitting Postgres on every
//      single page load is wasted work. TTL is short (30s) so any
//      admin edit is visible almost immediately, and we also force-clear
//      the relevant cache entry the moment a write happens.
// NOTE: this is process-local. If you run multiple server instances
//      behind a load balancer later, swap this for Redis with the same
//      get/set/del interface — nothing else in this file needs to change.
type CacheEntry<T> = { value: T; expiresAt: number };
const CACHE_TTL_MS = 30_000;
const weeklyViewCache = new Map<string, CacheEntry<any>>();

function cacheGet<T>(key: string): T | undefined {
  const entry = weeklyViewCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    weeklyViewCache.delete(key);
    return undefined;
  }
  return entry.value as T;
}
function cacheSet(key: string, value: any) {
  weeklyViewCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}
function cacheClearForClass(classId: string) {
  weeklyViewCache.delete(`class:${classId}`);
}
function cacheClearForTeacher(teacherId: string) {
  weeklyViewCache.delete(`teacher:${teacherId}`);
}
// A single write can affect a class view AND a teacher view at once
// (e.g. moving a slot to a new teacher), so writes clear both broadly.
function cacheClearAll() {
  weeklyViewCache.clear();
}

// ─── CREATE ONE SLOT ──────────────────────────────────────────────────
export const createSlot = async (dto: CreateTimetableSlotDto) => {
  const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, roomNumber } = dto;

  
  const [cls, subject, teacher, section] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId }, select: { id: true } }),
    prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true } }),
    prisma.teacher.findUnique({ where: { id: teacherId }, select: { id: true } }),
    prisma.section.findFirst({ where: { classId }, orderBy: { name: 'asc' }, select: { id: true } }),
  ]);
  if (!cls) throw new Error('Class not found');
  if (!subject) throw new Error('Subject not found');
  if (!teacher) throw new Error('Teacher not found');
  if (!section) throw new Error('No section found for this class');

  // WHAT: overlap check (class OR teacher already busy in this time range).
  // WHY:  this was completely missing before — this is the fix for the
  //       "teacher double-booked" bug.
  await _checkConflicts({ classId, teacherId, dayOfWeek, startTime, endTime });

  try {
    const slot = await prisma.timetable.create({
      data: { classId, sectionId: section.id, subjectId, teacherId, dayOfWeek, startTime, endTime, roomNumber },
      select: SLOT_SELECT,
    });

    // WHAT: drop cached weekly views so the next read is fresh.
    cacheClearForClass(classId);
    cacheClearForTeacher(teacherId);

    return slot;
  } catch (err: any) {
    
    if (err?.code === 'P2002') {
      throw new Error('Schedule conflict: the class or teacher already has a slot during this time');
    }
    throw err;
  }
};

// ─── BULK REPLACE A CLASS'S WEEKLY TIMETABLE ─────────────────────────
export const bulkCreate = async (dto: BulkCreateTimetableDto) => {
  const classExists = await prisma.class.findUnique({ where: { id: dto.classId }, select: { id: true } });
  if (!classExists) throw new Error('Class not found');

  const section = await prisma.section.findFirst({
    where: { classId: dto.classId },
    orderBy: { name: 'asc' },
    select: { id: true },
  });
  if (!section) throw new Error('No section found for this class');

  const subjectIds = [...new Set(dto.slots.map(s => s.subjectId))];
  const teacherIds = [...new Set(dto.slots.map(s => s.teacherId))];

  
  const [subjects, teachers, otherClassSlots] = await Promise.all([
    prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true } }),
    prisma.teacher.findMany({ where: { id: { in: teacherIds } }, select: { id: true } }),
   
    //       never checked if a teacher was already teaching another class
    //       at the same time — a teacher could end up double-booked.
    prisma.timetable.findMany({
      where: { teacherId: { in: teacherIds }, classId: { not: dto.classId } },
      select: { teacherId: true, dayOfWeek: true, startTime: true, endTime: true },
    }),
  ]);

  const missingSubject = subjectIds.find(id => !subjects.some(s => s.id === id));
  if (missingSubject) throw new Error(`Subject not found: ${missingSubject}`);
  const missingTeacher = teacherIds.find(id => !teachers.some(t => t.id === id));
  if (missingTeacher) throw new Error(`Teacher not found: ${missingTeacher}`);

  
  _checkBatchConflicts(dto.slots, otherClassSlots);

  const result = await prisma.$transaction(async (tx) => {
    await tx.timetable.deleteMany({ where: { classId: dto.classId } });

    
    await tx.timetable.createMany({
      data: dto.slots.map(slot => ({ ...slot, classId: dto.classId, sectionId: section.id })),
    });

    
    return tx.timetable.findMany({
      where: { classId: dto.classId },
      select: SLOT_SELECT,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  });

  cacheClearForClass(dto.classId);
  teacherIds.forEach(cacheClearForTeacher);

  return result;
};

// ─── LIST / FILTER (admin views, paginated) ──────────────────────────
export const finAll = async (
  query: TimetableQueryDto,
  pagination: { page?: number; pageSize?: number } = {}
) => {
  const { classId, teacherId, dayOfWeek } = query;
  const page = pagination.page ?? 1;
  const pageSize = Math.min(pagination.pageSize ?? 50, 100); // hard cap, avoid accidental huge pulls

  const where: any = {
    ...(classId && { classId }),
    ...(teacherId && { teacherId }),
    ...(dayOfWeek && { dayOfWeek }),
  };

  // WHAT: pagination added (skip/take).
  // WHY:  old query had no limit at all — fine today, but as more
  //       classes/teachers are added this list only grows. Capping it
  //       keeps response time flat regardless of table size.
  return prisma.timetable.findMany({
    where,
    select: SLOT_SELECT,
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
};

// ─── STUDENT-FACING: CLASS WEEKLY VIEW (hottest read path) ───────────
export const getClassWeeklyView = async (classId: string) => {
  
  const cached = cacheGet<Record<string, any[]>>(`class:${classId}`);
  if (cached) return cached;

  const classExists = await prisma.class.findUnique({ where: { id: classId }, select: { id: true } });
  if (!classExists) throw new Error('Class not found');

  const slots = await prisma.timetable.findMany({
    where: { classId },
    select: SLOT_SELECT,
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });

  const week = _groupByDay(slots);
  cacheSet(`class:${classId}`, week);
  return week;
};

// ─── TEACHER-FACING: TEACHER WEEKLY VIEW ─────────────────────────────
export const getTeacherWeeklyView = async (teacherId: string) => {
  const cached = cacheGet<Record<string, any[]>>(`teacher:${teacherId}`);
  if (cached) return cached;

  const teacherExists = await prisma.teacher.findUnique({ where: { id: teacherId }, select: { id: true } });
  if (!teacherExists) throw new Error('Teacher not found');

  const slots = await prisma.timetable.findMany({
    where: { teacherId },
    select: SLOT_SELECT,
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });

  const week = _groupByDay(slots);
  cacheSet(`teacher:${teacherId}`, week);
  return week;
};

// ─── SINGLE SLOT ──────────────────────────────────────────────────────
export const findById = async (id: string) => {
  const slot = await prisma.timetable.findUnique({ where: { id }, select: SLOT_SELECT });
  if (!slot) throw new Error('Slot not found');
  return slot;
};

// ─── UPDATE ───────────────────────────────────────────────────────────
export const update = async (id: string, dto: UpdateTimetableSlotDto) => {
  const existing = await prisma.timetable.findUnique({ where: { id } });
  if (!existing) throw new Error('Slot not found');

  const merged = {
    classId: existing.classId,
    subjectId: dto.subjectId || existing.subjectId,
    teacherId: dto.teacherId || existing.teacherId,
    dayOfWeek: dto.dayOfWeek || existing.dayOfWeek,
    startTime: dto.startTime || existing.startTime,
    endTime: dto.endTime || existing.endTime,
  };
  await _checkConflicts(merged, id);

  try {
    const updated = await prisma.timetable.update({ where: { id }, data: dto, select: SLOT_SELECT });
    cacheClearForClass(existing.classId);
    cacheClearForTeacher(existing.teacherId);
    if (dto.teacherId) cacheClearForTeacher(dto.teacherId);
    return updated;
  } catch (err: any) {
    if (err?.code === 'P2002') {
      throw new Error('Schedule conflict: the class or teacher already has a slot during this time');
    }
    throw err;
  }
};

// ─── DELETE ONE SLOT ──────────────────────────────────────────────────
export const deleteSlot = async (id: string) => {
  const existing = await prisma.timetable.findUnique({ where: { id }, select: { classId: true, teacherId: true } });
  const result = await prisma.timetable.delete({ where: { id } });
  if (existing) {
    cacheClearForClass(existing.classId);
    cacheClearForTeacher(existing.teacherId);
  }
  return result;
};

// ─── DELETE ENTIRE CLASS SCHEDULE ─────────────────────────────────────
export const deleteClassSchefule = async (classId: string) => {
  const classexits = await prisma.class.findUnique({ where: { id: classId }, select: { id: true } });
  if (!classexits) throw new Error('Class not found');

  const { count } = await prisma.timetable.deleteMany({ where: { classId } });
  cacheClearForClass(classId);
  cacheClearAll(); // multiple teachers were affected, cheaper to just clear everything here
  return { deletedSlots: count };
};

// ─── STUDENT-FACING: "MY ROUTINE" (resolves classId from logged-in student) ──
// WHAT: student never passes classId manually — we look it up from their
//       own student record, then reuse getClassWeeklyView() (cache included).
// ASSUMPTION: Student model has a `classId` field. Adjust the select below
//             if your schema names it differently (e.g. currentClassId).
export const getMyClassTimetable = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { classId: true },
  });
  if (!student) throw new Error('Student not found');

  return getClassWeeklyView(student.classId);
};

// ─── PARENT-FACING: routine for ONE of their children 
export const getChildClassTimetable = async (parentId: string, studentId: string) => {
  const student = await prisma.student.findFirst({
    where: { id: studentId, parentId },
    select: { classId: true },
  });
  if (!student) throw new Error('Child not found for this parent');

  return getClassWeeklyView(student.classId);
};

// ─── TEACHER/CLASS ownership check (used by controller for TEACHER scoping) ──
export const teacherTeachesClass = async (teacherId: string | null, classId: string) => {
  if (!teacherId) return false;
  const slot = await prisma.timetable.findFirst({
    where: { teacherId, classId },
    select: { id: true },
  });
  return Boolean(slot);
};

// ─── STUDENT-FACING: today's classes for a student ────────────────────────
function _todayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[new Date().getDay()];
}

export const getTodaysClassesForStudent = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { classId: true, sectionId: true },
  });
  if (!student) throw new Error('Student not found');

  return prisma.timetable.findMany({
    where: { classId: student.classId, sectionId: student.sectionId, dayOfWeek: _todayDayOfWeek() },
    select: SLOT_SELECT,
    orderBy: { startTime: 'asc' },
  });
};

// ─── PARENT-FACING: today's classes for one of their children ────────────
export const getTodaysClassesForChild = async (parentId: string, studentId: string) => {
  const student = await prisma.student.findFirst({
    where: { id: studentId, parentId },
    select: { classId: true, sectionId: true },
  });
  if (!student) throw new Error('Child not found for this parent');

  return prisma.timetable.findMany({
    where: { classId: student.classId, sectionId: student.sectionId, dayOfWeek: _todayDayOfWeek() },
    select: SLOT_SELECT,
    orderBy: { startTime: 'asc' },
  });
};

// ─── PRIVATE HELPERS 
function _groupByDay<T extends { dayOfWeek: string }>(slots: T[]) {
  const week: Record<string, T[]> = {};
  for (const slot of slots) {
    (week[slot.dayOfWeek] ??= []).push(slot);
  }
  return week;
}

function _overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && aEnd > bStart;
}

// WHAT: single DB query that checks if the class OR the teacher already

async function _checkConflicts(
  dto: { classId: string; teacherId: string; dayOfWeek: string; startTime: string; endTime: string },
  excludeId?: string
) {
  const overlap = await prisma.timetable.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      dayOfWeek: dto.dayOfWeek as any,
      OR: [{ classId: dto.classId }, { teacherId: dto.teacherId }],
      AND: [{ startTime: { lt: dto.endTime } }, { endTime: { gt: dto.startTime } }],
    },
    select: { id: true },
  });
  if (overlap) {
    throw new Error('Schedule conflict: the class or teacher already has a slot during this time');
  }
}

// WHAT: in-memory conflict check for a whole batch of new slots.
// WHY: avoids running _checkConflicts() N times (N queries) during a
//      bulk upload — checks are done in plain JS against data already
//      fetched, so this is essentially free (microseconds, not ms).
function _checkBatchConflicts(
  newSlots: { teacherId: string; dayOfWeek: string; startTime: string; endTime: string }[],
  existingOtherClassSlots: { teacherId: string; dayOfWeek: string; startTime: string; endTime: string }[]
) {
  for (let i = 0; i < newSlots.length; i++) {
    const a = newSlots[i];

    for (const b of existingOtherClassSlots) {
      if (a.teacherId === b.teacherId && a.dayOfWeek === b.dayOfWeek && _overlaps(a.startTime, a.endTime, b.startTime, b.endTime)) {
        throw new Error(`Schedule conflict: teacher already booked elsewhere on ${a.dayOfWeek} at ${a.startTime}`);
      }
    }

    for (let j = i + 1; j < newSlots.length; j++) {
      const b = newSlots[j];
      if (a.teacherId === b.teacherId && a.dayOfWeek === b.dayOfWeek && _overlaps(a.startTime, a.endTime, b.startTime, b.endTime)) {
        throw new Error(`Schedule conflict within submitted batch: ${a.dayOfWeek} ${a.startTime}-${a.endTime}`);
      }
    }
  }
}