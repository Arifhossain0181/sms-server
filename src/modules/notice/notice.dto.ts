export type NoticeAudience = 'ALL' | 'STUDENTS' | 'TEACHERS' | 'PARENTS' | 'STAFF';
export type NoticePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

// ─── Create / Update ────────────────────────────────────────────────
export interface CreateNoticeDto {
  title: string;
  content: string;
  audience: NoticeAudience;
  priority?: NoticePriority;     // default: NORMAL
  publishedAt?: string;          // schedule for future, default: now
  expiresAt?: string;            // auto-expire date (optional)
  attachmentUrl?: string;
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

// ─── Query / filter ─────────────────────────────────────────────────
export interface NoticeQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  audience?: NoticeAudience;
  priority?: NoticePriority;
  isActive?: string;             // "true" | "false"
}