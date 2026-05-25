
export interface CreateStudentDto {
    name: string;
    email?: string;  // Optional for admin mode
    password?: string;  // Optional for admin mode

    //student specific fields
    rollNumber: string;
    classId: string;
    dateOfBirth: Date;
    gender:"Male" | "Female" | "Other"
    bloodGroup:"A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
    address: string;
    phoneNumber?: string;  // Optional
    avatarUrl?: string;
    //guardian details
    guardianName?: string;  // Optional
    guardianEmail?: string;  // Optional
    guardianPhone?: string;  // Optional
    guradianRelation?: string;  // Optional
    
   
}
export interface UpdateStudentDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  avatarUrl?: string;
  classId?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: string;
}
 
export interface StudentQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  classId?: string;
  gender?: string;
}
 
