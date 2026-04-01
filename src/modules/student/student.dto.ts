
export interface CreateStudentDto {
    name: string;
    email: string;
     password: string;

     //student specific fields
     rollNumber: string;
     classId: string;
     dateOfBirth: Date;
     gender:"Male" | "Female" | "Other"
     bloodGroup:"A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
     address: string;
     phoneNumber: string;
     avatarUrl?: string;
     //guardian details
        guardianName: string;
        guardianEmail: string;
        guardianPhone: string;
        guradianRelation: string;
    
   
}
export interface UpdateStudentDto {
  name?: string;
  phone?: string;
  address?: string;
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
 
