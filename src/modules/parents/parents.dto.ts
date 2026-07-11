
export interface CreateParentDto {
  userId: string;
  name: string;
  phone: string;
  address?: string;
  occupation?: string;
  relation?: string; // "Father" | "Mother" | "Guardian" | "Uncle" | "Aunt" | ...
}

// ─── ADMIN or PARENT (self): update profile fields ─────────────────
// NOTE: userId is intentionally not editable — a Parent profile stays
// bound to the User it was created with.
export interface UpdateParentDto {
  name?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  relation?: string;
}

// ─── ADMIN: list/filter parents ─────────────────────────────────────
export interface ParentQueryDto {
  search?: string; // matches against name or phone
  page?: number;
  pageSize?: number;
}

// ─── ADMIN: link / unlink a child (Student) to this Parent ─────────
export interface LinkChildDto {
  studentId: string;
}

// ─── PARENT (self): simple pagination for payments/notices lists ───
export interface PaginationDto {
  page?: number;
  pageSize?: number;
}