# SMS Backend API

School Management System Backend API — a fully-featured REST API built with TypeScript, Express, Prisma, and PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Actor & Role-Based Access](#actor--role-based-access)
- [Modules](#modules)
- [OTP & Authentication](#otp--authentication)
- [Error Handling](#error-handling)
- [Queue & Workers](#queue--workers)
- [Deployment](#deployment)

---

## Overview

SMS Backend is the core server for a school management system. It provides role-based REST APIs for School Admin, Super Admin, Teachers, Students, Parents, Accountant, Librarian, Exam Controller, HR, and other specialized roles.

The system covers:
- Admission & student lifecycle
- Teacher recruitment & academic assignment
- Subject & class/section configuration
- Attendance, homework, exams & grading
- Fees, payments & invoices
- Notices, notifications & reports (PDF/Excel)
- Transfer Certificates (TC)
- Critical action escalations & approval workflow

---

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5.x
- **ORM:** Prisma (PostgreSQL)
- **Auth:** JWT (access + refresh tokens) + bcrypt + OTP
- **Real-time:** Socket.io
- **Payments:** Stripe
- **Email:** Nodemailer
- **PDF:** PDFKit
- **Reports:** json2csv (Excel export)
- **File Upload:** Cloudinary
- **Security:** Helmet, CORS, rate limiting

---

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

---

## Prerequisites

- Node.js >= 18
- PostgreSQL
- npm or pnpm

---

## Installation

```bash
npm install
```

---

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

---

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

---

## Running the Server

```bash
# Development (auto-reload)
npm run dev

# Production build
npm run build
node dist/index.js
```

Server starts at `http://localhost:5000`.

---

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

---

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

---

## Modules

### Auth (`/api/v1/auth`)
- Register / Login (OTP-based if enabled)
- Refresh token
- Password reset (OTP)
- Logout

### Students (`/api/v1/students`)
- Create, edit, deactivate student profiles
- View student details with class/section
- Generate & download Transfer Certificate (PDF)
- Student-specific attendance/marks/timetable

### Teachers (`/api/v1/teachers`)
- View/edit teacher profile
- Assign subjects and classes
- Teacher attendance

### Class & Section (`/api/v1/classes`)
- Create/manage classes (1–10)
- Create sections with capacity limits
- Assign teachers as class coordinators

### Subjects (`/api/v1/subjects`)
- Create subjects per class
- Mark as compulsory or optional
- Assign teachers to subjects

### Admission (`/api/v1/admission`)
- Submit admission applications
- Review & approve/reject with rejection reason
- On approval: auto-generate student ID, assign class, section, roll number

### Attendance (`/api/v1/attendance`)
- Record daily attendance (PRESENT/ABSENT/LATE)
- Bulk attendance entry
- Student & teacher attendance reports
- Summary for school day

### Exams & Results (`/api/v1/exams`)
- Create exams (CLASS_TEST / MID_TERM / FINAL_EXAM)
- Define subjects per exam
- Submit marks by teachers
- Publish/unpublish results
- Generate Admit Cards (PDF)

### Grading (`/api/v1/grading-rules`)
- Configure grading rules per class
- Auto-calculate grades from marks

### Fees (`/api/v1/fees`)
- Generate invoices (TUITION / ADMISSION / EXAM)
- Process payments (Stripe or Cash)
- Invoice export (PDF/Excel)
- Overdue & partial payment tracking

### Fee Structure (`/api/v1/feestructure`)
- Define fee amounts per class
- Set due dates

### Notices (`/api/v1/notices`)
- Publish school-wide or class/section targeted
- Pin important notices
- Mark as read
- Audience filtering by role

### Timetable (`/api/v1/timetable`)
- Class-specific timetables
- Teacher timetables
- Day-wise schedule

### Homework (`/api/v1/homework`)
- Assign homework per subject/class
- Track submission status

### Reports (`/api/v1/reports`)
- Attendance reports
- Exam/result reports
- Fee collection reports
- Student list export (PDF / Excel)

### Transfer Certificates (`/api/v1/tc`)
- Generate printable TC (PDF)

### Library (`/api/v1/librarian`)
- Manage books (add, update, deactivate)
- Issue / return books
- Track fines & payments

### Notifications (`/api/v1/notifications`)
- Real-time and in-app notifications
- Types: admission, fee, exam, result, attendance, notice, timetable, general, leave, payroll, recruitment

### Dashboard (`/api/v1/dashboard`)
- **Global Dashboard:** Total students, teachers, classes, attendance summary, fee collection, library status, recent admissions, upcoming exams
- **School Admin Dashboard:** Consolidated oversight view

### Teaching Applications (`/api/v1/teaching`)
- Teachers apply for positions
- Review & approval workflow

### HR (`/api/v1/hr`)
- Staff management
- Leave application & balance
- Payroll management
- Performance reviews

### Recruitment (`/api/v1/recruitment`)
- Post job openings
- Shortlist applicants
- Conduct interviews
- Send & track offers

### Critical Actions (`/api/v1/criticalActions?`)
- **Declared by:** ACCOUNTANT, EXAM_CONTROLLER, HR, Librarian, etc.
- **Approved by:** SCHOOL_ADMIN, SUPER_ADMIN
- Triggers: large refunds, mass fine waivers, staff termination, etc.
- Escalation status: PENDING → APPROVED / REJECTED

### Role Management (`/api/v1/roles`)
- Assign specialized roles (Accountant, Librarian, Exam Controller, HR)
- Revoke role assignments
- View role history

---

## OTP & Authentication

- JWT access token with short expiry
- Refresh token stored securely (HTTP-only cookies or client store)
- Optional OTP for password reset
- Password hashing via bcrypt

---

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

---

## Queue & Workers

- Polling-based queues for email (Nodemailer) and notifications
- Socket.io for real-time updates
- Email templates for admissions, fees, notices, password reset

---

## Deployment

```bash
npm run build
node dist/index.js
```

Recommended: use PM2 or Docker. Ensure PostgreSQL is provisioned and migrations are run before first start.

---

## License

ISC
