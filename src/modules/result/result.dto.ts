export interface SubjectMarkDto {
  subjectId: string;
  marksObtained: number;
}

export interface SubmitResultDto {
  examId: string;
  studentId: string;
  marks: SubjectMarkDto[];
}

export interface UpdateMarkDto {
  marksObtained: number;
}