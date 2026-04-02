export interface AttendanceEntryDto {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface TakeAttendanceDto {
  classId: string;
  sectionId: string;
  date: string;           // "2025-01-15"
  entries: AttendanceEntryDto[];
}

export interface UpdateAttendanceDto {
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}