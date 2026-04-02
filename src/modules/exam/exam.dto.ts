export interface CreateExamDto {
  name: string;           // "Mid Term 2025", "Final Exam 2025"
  type: 'CLASS_TEST' | 'MID_TERM' | 'FINAL';
  classId: string;
  startDate: string;
  endDate: string;
}

export interface UpdateExamDto {
  name?: string;
  type?: 'CLASS_TEST' | 'MID_TERM' | 'FINAL';
  startDate?: string;
  endDate?: string;
  isPublished?: boolean;
}

export interface CreateExamScheduleDto {
  examId: string;
  classId: string;
  subjectId: string;
  date: string;
  startTime: string;     // "09:00"
  endTime: string;       // "12:00"
  room?: string;
}

export interface SubmitMarkEntryDto {
  studentId: string;
  subjectId: string;
  marksObtained: number;
  teacherId?: string;
}

export interface SubmitExamMarksDto {
  entries: SubmitMarkEntryDto[];
}

export interface GetFailedStudentsQueryDto {
  classId?: string;
}