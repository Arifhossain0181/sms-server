export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
}
 
export interface LoginDto {
  email: string;
  password: string;
}
 
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}
 
export interface ForgotPasswordDto {
  email: string;
}
 
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}
 
export interface RefreshTokenDto {
  refreshToken: string;
}