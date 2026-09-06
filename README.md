# SMS Backend API

School Management System Backend API — a fully-featured REST API built with TypeScript, Express, Prisma, and PostgreSQL.

## Table of Contents



## Overview

SMS Backend is the core server for a school management system. It provides role-based REST APIs for School Admin, Super Admin, Teachers, Students, Parents, Accountant, Librarian, Exam Controller, HR, and other specialized roles.

The system covers:


## Tech Stack



## Project Structure

```
sms-backend/
├── prisma/
│   ├── schema.prisma          # Main schema
│   ├── user&auth.prisma
│   ├── students.prisma
│   ├── teachers.prisma
│   ├── staff.prisma
│   ├── class.prisma
│   ├── section.prisma
│   ├── subject.prisma
│   ├── admission.prisma
│   ├── attendance.prisma
│   ├── exam.prisma
│   ├── mark.prisma
│   ├── gradingRule.prisma
│   ├── fees.prisma
│   ├── Payment.prisma
│   ├── invoice.prisma
│   ├── library.prisma
│   ├── notice.prisma
│   ├── notification.prisma
│   ├── timetable.prisma
│   ├── homework.prisma
│   ├── reportcard.prisma
│   ├── admitcard.prisma
│   ├── transferCertificate.prisma
│   ├── recruitment.prisma
│   ├── jobPosting.prisma
│   ├── applicant.prisma
│   ├── interview.prisma
│   ├── offer.prisma
│   ├── payroll.prisma
│   ├── leave.prisma
│   ├── leaveBalance.prisma
│   ├── performanceReview.prisma
│   ├── criticalAction.prisma
│   ├── enums.prisma
│   └── migrations/
├── src/
│   ├── index.ts                       # App entry point
│   ├── config/                        # DB, Socket, Mail, Stripe, Cloudinary
│   ├── middleware/                     # auth, roles, error handling
│   ├── routes/
│   │   └── index.ts                   # Route registry
│   ├── modules/
│   │   ├── auth/                      # Login, register, OTP, refresh token
│   │   ├── student/                   # Student CRUD, TC, dashboards
│   │   ├── teacher/                   # Teacher profiles, assignments
│   │   ├── class/                     # Class & section management
│   │   ├── subject/                   # Per-class subject config
│   │   ├── admission/                 # Admission applications
│   │   ├── attendance/                # Student/teacher attendance
│   │   ├── exam/                      # Exam scheduling
│   │   ├── result/                    # Marks & grading
│   │   ├── grading/                   # Grading rules
│   │   ├── fee/                       # Fee invoices & payments
│   │   ├── feestructure/              # Fee structure config
│   │   ├── librarian/                 # Library management
│   │   ├── notice/                    # Notices
│   │   ├── notifiction/               # Notifications
│   │   ├── timetable/                 # Class timetables
│   │   ├── homework/                  # Homework assign & track
│   │   ├── parents/                   # Parent portal
│   │   ├── hr/                        # HR operations
│   │   ├── recruitment/               # Job postings & applicants
│   │   ├── dashboard/                 # Global + school dashboards
│   │   ├── report/                    # PDF & Excel reports
│   │   ├── escalation/                # Critical action workflow
│   │   └── role/                      # Role assignments
│   ├── utils/                         # JWT, logger, upload, response, pagination
│   └── generated/prisma/              # Generated Prisma client
├── tsconfig.json
├── prisma.config.ts
├── package.json
└── dist/                              # Build output
```


## Prerequisites



## Installation

```bash
npm install
```


## Environment Variables

Create a `.env` file at the root. See `.env.example` for available variables. Minimum required:

```
DATABASE_URL=postgres://user:password@localhost:5432/sms_db
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
STRIPE_SECRET_KEY=
```


## Database Setup

```bash
# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Seed (optional)
npm run seed
```

Open Prisma Studio:
```bash
npm run studio
```


## Running the Server

```bash
# Development (auto-reload)
npm run dev

# Production build
npm run build
node dist/index.js
```

Server starts at `http://localhost:5000`.


## API Documentation

Base URL: `/api/v1`

**Health Check:**
```
GET /api/v1/health
```

### Example Responses

```json
{
  "success": true,
  "message": "SMS Backend API is running",
  "health": "/api/v1/health"
}
```


## Actor & Role-Based Access

| Role | Description |
|---|---|
| `SUPER_ADMIN` | System-wide admin, manages schools |
| `SCHOOL_ADMIN` | Principal, manages admissions, staff, notices, reports |
| `ACCOUNTANT` | Manages fees, invoices, payments |
| `TEACHER` | Manages classes, attendance, marks, homework |
| `STUDENT` | Views grades, attendance, notices, homework |
| `PARENT` | Views child's academic info |
| `EXAM_CONTROLLER` | Exam scheduling, admit cards, result publishing |
| `HR` | Staff recruitment, payroll, leave management |

```ts
// Role-based route protection
router.get('/admissions', authenticate, authorizeRoles('SCHOOL_ADMIN'), controller.listAdmissions);
```


## Modules

### Auth (`/api/v1/auth`)

### Students (`/api/v1/students`)

### Teachers (`/api/v1/teachers`)

### Class & Section (`/api/v1/classes`)

### Subjects (`/api/v1/subjects`)

### Admission (`/api/v1/admission`)

### Attendance (`/api/v1/attendance`)

### Exams & Results (`/api/v1/exams`)

### Grading (`/api/v1/grading-rules`)

### Fees (`/api/v1/fees`)

### Fee Structure (`/api/v1/feestructure`)

### Notices (`/api/v1/notices`)

### Timetable (`/api/v1/timetable`)

### Homework (`/api/v1/homework`)

### Reports (`/api/v1/reports`)

### Transfer Certificates (`/api/v1/tc`)

### Library (`/api/v1/librarian`)

### Notifications (`/api/v1/notifications`)

### Dashboard (`/api/v1/dashboard`)

### Teaching Applications (`/api/v1/teaching`)

### HR (`/api/v1/hr`)

### Recruitment (`/api/v1/recruitment`)

### Critical Actions (`/api/v1/criticalActions?`)

### Role Management (`/api/v1/roles`)


## OTP & Authentication



## Error Handling

Standard response format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Error codes: `400`, `401`, `403`, `404`, `409`, `500`

Middleware: `src/middleware/error.middle.ts`


## Queue & Workers



## Deployment

```bash
npm run build
node dist/index.js
```

Recommended: use PM2 or Docker. Ensure PostgreSQL is provisioned and migrations are run before first start.


## License

ISC
