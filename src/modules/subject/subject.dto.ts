export interface CreateSubjectDto {
  name: string;
  code: string;
  classId: string;
  teacherId?: string;
  fullMarks: number;
  passMarks: number;
  isOptional?: boolean;
}

export interface UpdateSubjectDto {
  name?: string;
  code?: string;
  teacherId?: string;
  fullMarks?: number;
  passMarks?: number;
  isOptional?: boolean;
}