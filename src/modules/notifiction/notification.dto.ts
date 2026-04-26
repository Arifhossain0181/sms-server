export type NotificationType =
  | 'ADMISSION'
  | 'FEE'
  | 'EXAM'
  | 'RESULT'
  | 'ATTENDANCE'
  | 'NOTICE'
  | 'TIMETABLE'
  | 'GENERAL';

// ─── Internal: used by other services to fire a notification ────────
export interface SendNotificationDto {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  referenceId?: string;   // e.g. feeId, admissionId, examId
}

// ─── Broadcast to all users with a specific role ────────────────────
export interface BroadcastNotificationDto {
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ALL';
  title: string;
  body: string;
  type: NotificationType;
  referenceId?: string;
}

// ─── Query ──────────────────────────────────────────────────────────
export interface NotificationQueryDto {
  page?: string;
  limit?: string;
  isRead?: string;      // "true" | "false"
  type?: NotificationType;
}