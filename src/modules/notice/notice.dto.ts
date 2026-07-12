// Mirrors the prisma NoticeAudience enum — one value per actor/role
// plus ALL. A notice created for a given role surfaces only on that
// role's dashboard (ALL reaches every role).
export type NoticeAudience =
  | 'ALL'
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'ACCOUNTANT'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  | 'EXAM_CONTROLLER'
  | 'HR'
  | 'LIBRARIAN'
  | 'RECEPTIONIST';
export type NoticePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

// ─── Create / Update 
export interface CreateNoticeDto {
  title: string;
  content: string;
  audience: NoticeAudience;
  priority?: NoticePriority;     // default: NORMAL
  publishedAt?: string;          // schedule for future, default: now
  expiresAt?: string;            // auto-expire date (optional)
  attachmentUrl?: string;

  sectionIds?: string[];
}

export interface UpdateNoticeDto {
  title?: string;
  content?: string;
  audience?: NoticeAudience;
  priority?: NoticePriority;
  publishedAt?: string;
  expiresAt?: string;
  attachmentUrl?: string;
  isActive?: boolean;
}

// ─── Query / filter 
export interface NoticeQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  audience?: NoticeAudience;
  priority?: NoticePriority;
  isActive?: string;             // "true" | "false"
}