export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

// ─── Single slot ────────────────────────────────────────────────────
export interface CreateTimetableSlotDto {
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;   // "08:00"
  endTime: string;     // "09:00"
  roomNumber?: string;
}

export interface UpdateTimetableSlotDto {
  subjectId?: string;
  teacherId?: string;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  roomNumber?: string;
}

// ─── Bulk: replace entire week for a class ──────────────────────────
export interface BulkCreateTimetableDto {
  classId: string;
  slots: Omit<CreateTimetableSlotDto, 'classId'>[];
}

// ─── Query ──────────────────────────────────────────────────────────
export interface TimetableQueryDto {
  classId?: string;
  teacherId?: string;
  dayOfWeek?: DayOfWeek;
}