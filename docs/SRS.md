# Software Requirements Specification (SRS)

## School Student Management System
Class 1 - 10  
Stack: Next.js · React · Tailwind · Node.js · Express.js · Prisma · TypeScript · JWT · Stripe

## 1. User Roles & Permissions

### Admin
- Full system access and control
- Manage students, teachers, classes, sections
- Approve or reject admissions
- Manage fee structures and view all payments
- Publish notices and announcements
- View all reports and analytics
- Create and manage exam schedules
- Promote students to next class

### Teacher
- Access only assigned classes and subjects
- Take daily attendance
- Enter exam marks
- Assign homework
- View student profiles in assigned class
- View class timetable

### Student
- View own profile and academic history
- Check own attendance and result
- View assigned homework
- View and pay fees via Stripe
- Download report card and admit card
- View school notices

### Parent
- View child's profile, attendance, and results
- Pay fees online via Stripe
- View payment history and receipts
- Receive school notices and alerts
- Support multiple children under one account

## 2. Authentication & Security
- JWT-based login/logout for all roles
- Access Token (short expiry) + Refresh Token (long expiry)
- Role-based access control (RBAC) — each role sees only what they are allowed
- Password hashing with bcrypt
- Password reset via email OTP
- Auto session timeout after inactivity
- Audit log — every critical action recorded with user ID, timestamp, and action type
- HTTPS enforced in production

## 3. Admission Management
- Online admission form with fields: name, date of birth, gender, religion, blood group, address, guardian info
- Document upload: student photo, birth certificate (stored in cloud — Cloudinary or AWS S3)
- Admin reviews applications and approves or rejects
- On approval: auto-generate student ID, assign class and section, assign roll number
- Admission confirmation notification sent to parent via email
- Rejected application notification with reason

## 4. Student Management
- Add, edit, deactivate student profiles
- Fields: name, student ID, DOB, gender, blood group, address, photo, class, section, roll number, parent info
- Unique student ID auto-generated on admission approval
- Class and section assignment
- Student photo upload
- Transfer Certificate (TC) generation with printable PDF
- Year-end bulk or individual class promotion system
- Student search and filter by class, section, roll number, name

## 5. Class & Section Management
- Create and manage classes from Class 1 to Class 10
- Add multiple sections per class (A, B, C, etc.)
- Set maximum student capacity per section
- Assign a class teacher per section
- View class-wise and section-wise student list

## 6. Teacher Management
- Add, edit, deactivate teacher profiles
- Fields: name, employee ID, email, phone, subject specialization, joining date, photo
- Assign subjects and classes to each teacher
- Teacher attendance tracking (separate module from student attendance)
- View teacher's assigned schedule

## 7. Subject Management
- Create and manage subjects per class
- Assign one or more teachers per subject
- Set full marks and pass marks per subject
- Support compulsory and optional subjects
- Class-wise subject list view

## 8. Attendance Management
- Daily class-wise attendance taken by assigned teacher
- Mark each student as: Present, Absent, or Late
- Auto attendance percentage calculation per student per month
- Monthly and yearly attendance report per student
- Attendance summary view on admin and teacher dashboard
- Auto alert notification if a student's attendance falls below 75%
- Attendance cannot be edited after 24 hours (admin override only)

## 9. Timetable Management
- Create weekly class routine per section
- Assign subject, teacher, and time slot per period
- System prevents scheduling conflicts (same teacher assigned two places at same time)
- Students, parents, and teachers can view class timetable

## 10. Exam & Result Management
- Admin creates exam types: Class Test, Mid Term, Final Exam
- Exam schedule setup per class with date and subject
- Teacher inputs marks per student per subject
- Auto GPA calculation based on configurable grading rules
- Result sheet and report card auto-generated (downloadable PDF)
- Admin controls result publish and unpublish
- Failed student list generated per exam
- Admit card generated per student per exam

## 11. Homework & Assignment
- Teacher creates homework with: subject, description, due date, class/section
- Students and parents can view all assigned homework
- Teacher can mark homework as reviewed
- Overdue homework flagged automatically

## 12. Fees Management

### Fee Types
- Tuition Fee — monthly charge per student, amount varies by class
- Admission Fee — one-time fee collected at enrollment
- Exam Fee — charged per exam (Mid Term, Final)

### Fee Structure
- Admin defines fee amount per class for each fee type
- Fee due date configuration per fee type
- Admin can also record offline/cash payments manually

### Stripe Online Payment
- Students and parents pay fees online via Stripe
- Stripe Payment Intents API used for secure transactions
- Supported methods: Credit Card, Debit Card
- Stripe Webhooks used to confirm payment status server-side
- Failed payment handling with retry option
- Only Stripe customer_id and payment_intent_id stored in database — no raw card data stored
- Refund processing via Stripe dashboard by admin

### Invoices & Receipts
- Auto-generated invoice before payment
- Downloadable PDF receipt after successful payment
- Receipt contains: student name, class, fee type, amount, date, Stripe transaction ID

### Tracking & Reports
- Due and overdue payment tracking per student
- Overdue payment reminder notification to parent
- Monthly fee collection report (online vs offline)
- Class-wise fee due report
- Individual student payment history
- Total revenue summary for admin

## 13. Notice & Notification System
- Admin and teachers can publish notices
- Target: school-wide or specific class/section
- Pin important notices to top
- Email notification sent to relevant parents and students
- Notification history log visible to admin
- Notices visible on student and parent dashboard

## 14. Library Management
- Add and manage book inventory (title, author, ISBN, quantity)
- Issue and return book tracking per student
- Due date tracking per issued book
- Auto fine calculation for late returns
- Available and issued book count view

## 15. Dashboard & Reports

### Admin Dashboard
- Total students, teachers, classes
- Today's overall attendance summary
- Fees collected this month vs pending
- Recent admissions
- Upcoming exams

### Teacher Dashboard
- Today's class schedule
- Assigned classes and subjects
- Recent attendance submissions

### Student Dashboard
- Attendance percentage
- Recent exam results
- Pending fee dues
- Upcoming exams
- Recent notices

### Parent Dashboard
- Child's attendance summary
- Recent results
- Fee payment status
- Recent school notices

### Exportable Reports
- Attendance report — PDF and Excel
- Result sheet — PDF
- Fee collection report — PDF and Excel
- Student list — PDF and Excel

## 16. Non-Functional Requirements
- All pages load under 3 seconds
- Responsive design — works on mobile, tablet, and desktop
- All data transmitted over HTTPS/SSL
- Daily automated database backup
- System supports minimum 1000 concurrent users
