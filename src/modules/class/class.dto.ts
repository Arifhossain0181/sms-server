export interface CreateClassDto {
  name: string;        // "Class 1", "Class 2"
  numericLevel: number;
}

export interface UpdateClassDto {
  name?: string;
  numericLevel?: number;
}

export interface CreateSectionDto {
  name: string;        // "A", "B", "C"
  classId: string;
  classTeacherId?: string;
}

export interface UpdateSectionDto {
  name?: string;
  classTeacherId?: string;
  capacity?: number;
}