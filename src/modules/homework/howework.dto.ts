export type HomeworkStatusFilter = 'ALL' | 'PENDING' | 'REVIEWED' | 'OVERDUE';

// ─── TEACHER: create homework for a section/subject they teach 
export interface CreateHomeworkDto {
  sectionId: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
}

export interface UpdateHomeworkDto {
  title?: string;
  description?: string;
  dueDate?: string;
}

// ─── TEACHER: list/filter own homework 
export interface HomeworkQueryDto {
  sectionId?: string;
  subjectId?: string;
  status?: HomeworkStatusFilter; // PENDING = not reviewed & not overdue
  page?: number;
  pageSize?: number;
}

// ─── STUDENT / PARENT: list homework for 
export interface StudentHomeworkQueryDto {
  status?: 'ALL' | 'UPCOMING' | 'OVERDUE';
  page?: number;
  pageSize?: number;
}