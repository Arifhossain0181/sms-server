export type NotificationType =
  | 'ADMISSION'
  | 'FEE'
  | 'EXAM'
  | 'RESULT'
  | 'ATTENDANCE'
  | 'NOTICE'
  | 'TIMETABLE'
  | 'GENERAL'
  | 'LEAVE'
  | 'PAYROLL'
  | 'RECRUITMENT';

// ─── Internal: used by other services to fire a notification ────────
export interface SendNotificationDto {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  referenceId?: string;   // e.g. feeId, admissionId, examId
}

// FIX: was only ADMIN | TEACHER | STUDENT | PARENT | ALL — same gap as
// the notice module had. Extended to every actor from the Requirement
// Analysis doc so e.g. HR or the Accountant can actually be targeted by
// a role broadcast instead of only being reachable via ALL.
export type BroadcastRole =
  | 'ALL'
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'ACCOUNTANT'
  | 'LIBRARIAN'
  | 'RECEPTIONIST'
  | 'EXAM_CONTROLLER'
  | 'HR'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT';

// ─── Broadcast to all users with a specific role ────────────────────
export interface BroadcastNotificationDto {
  role: BroadcastRole;
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