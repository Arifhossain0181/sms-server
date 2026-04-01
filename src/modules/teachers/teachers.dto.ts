export interface CreateTeacherDto {
  // User info
  name: string;
  email: string;
  password: string;
 
  // Teacher profile
  TeachersId: string;
  designation: string;
  department?: string;
  qualification: string;
  experience: number;        // years
  phone: string;
  address?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;       // ISO date string
  dateOfJoining: string;     // ISO date string
  bloodGroup?: string;
  salary?: number;
  avatarUrl?: string;
}
 
export interface UpdateTeacherDto {
  name?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  experience?: number;
  phone?: string;
  address?: string;
  bloodGroup?: string;
  salary?: number;
  avatarUrl?: string;
}
 
export interface AssignSubjectDto {
  subjectIds: string[];
}
 
export interface AssignClassDto {
  classIds: string[];
}
 
export interface TeacherQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  department?: string;
  designation?: string;
}
 
