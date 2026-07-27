import { Response } from 'express';
import prisma from "../../config/db";
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

type PDFDoc = InstanceType<typeof PDFDocument>;

function sendPdf(res: Response, filename: string, buildDoc: (doc: PDFDoc) => void) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  buildDoc(doc);

  doc.end();
}

function sendCsv(res: Response, filename: string, fields: string[], data: Record<string, unknown>[]) {
  const parser = new Parser({ fields });
  const csv = parser.parse(data);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(csv);
}

export const exportStudentsPdf = async (res: Response, classId?: string) => {
  const where = classId ? { classId } : {};
  const students = await prisma.student.findMany({
    where,
    include: {
      user: { select: { email: true, isActive: true } },
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
    orderBy: { rollNumber: 'asc' },
  });

  sendPdf(res, 'students.pdf', (doc) => {
    doc.fontSize(20).text('Student List', { align: 'center' });
    doc.moveDown();

    const headers = ['ID', 'Name', 'Class', 'Section', 'Roll', 'Email', 'Status'];
    const rows = students.map((s) => [
      s.studentId,
      s.name,
      s.class?.name ?? '',
      s.section?.name ?? '',
      String(s.rollNumber),
      s.user?.email ?? '',
      s.isActive ? 'Active' : 'Inactive',
    ]);

    drawTable(doc, headers, rows);
  });
};

export const exportStudentsCsv = async (res: Response, classId?: string) => {
  const where = classId ? { classId } : {};
  const students = await prisma.student.findMany({
    where,
    include: {
      user: { select: { email: true, isActive: true } },
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
    orderBy: { rollNumber: 'asc' },
  });

  const data = students.map((s) => ({
    studentId: s.studentId,
    name: s.name,
    class: s.class?.name ?? '',
    section: s.section?.name ?? '',
    rollNumber: s.rollNumber,
    email: s.user?.email ?? '',
    status: s.isActive ? 'Active' : 'Inactive',
  }));

  sendCsv(res, 'students.csv', Object.keys(data[0] ?? {}), data);
};

export const exportAttendancePdf = async (res: Response, classId: string, sectionId: string, date: string) => {
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const records = await prisma.studentAttendance.findMany({
    where: { sectionId, date: attendanceDate },
    include: {
      student: {
        select: {
          studentId: true,
          name: true,
          rollNumber: true,
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      },
      teacher: { select: { name: true } },
    },
    orderBy: { student: { rollNumber: 'asc' } },
  });

  sendPdf(res, 'attendance.pdf', (doc) => {
    doc.fontSize(20).text('Attendance Report', { align: 'center' });
    doc.fontSize(12).text(`Date: ${date}`, { align: 'center' });
    doc.moveDown();

    const headers = ['Roll', 'Student ID', 'Name', 'Status', 'Marked By'];
    const rows = records.map((r) => [
      String(r.student.rollNumber),
      r.student.studentId,
      r.student.name,
      r.status,
      r.teacher?.name ?? '',
    ]);

    drawTable(doc, headers, rows);
  });
};

export const exportAttendanceCsv = async (res: Response, classId: string, sectionId: string, date: string) => {
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const records = await prisma.studentAttendance.findMany({
    where: { sectionId, date: attendanceDate },
    include: {
      student: { select: { studentId: true, name: true, rollNumber: true } },
      teacher: { select: { name: true } },
    },
    orderBy: { student: { rollNumber: 'asc' } },
  });

  const data = records.map((r) => ({
    rollNumber: r.student.rollNumber,
    studentId: r.student.studentId,
    name: r.student.name,
    status: r.status,
    markedBy: r.teacher?.name ?? '',
    date,
  }));

  sendCsv(res, 'attendance.csv', Object.keys(data[0] ?? {}), data);
};

export const exportFeesPdf = async (res: Response) => {
  const fees = await prisma.feeStructure.findMany({
    include: {
      class: { select: { name: true } },
      student: { select: { studentId: true, name: true } },
    },
    orderBy: { dueDate: 'desc' },
  });

  sendPdf(res, 'fees.pdf', (doc) => {
    doc.fontSize(20).text('Fee Collection Report', { align: 'center' });
    doc.moveDown();

    const headers = ['Student', 'Class', 'Type', 'Amount', 'Paid', 'Status', 'Due Date'];
    const rows = fees.map((f) => [
      f.student?.name ?? 'N/A',
      f.class?.name ?? '',
      f.feeType,
      String(f.amount),
      String(f.Paidamount),
      f.status,
      f.dueDate.toISOString().split('T')[0],
    ]);

    drawTable(doc, headers, rows);
  });
};

export const exportFeesCsv = async (res: Response) => {
  const fees = await prisma.feeStructure.findMany({
    include: {
      class: { select: { name: true } },
      student: { select: { studentId: true, name: true } },
    },
    orderBy: { dueDate: 'desc' },
  });

  const data = fees.map((f) => ({
    student: f.student?.name ?? 'N/A',
    class: f.class?.name ?? '',
    feeType: f.feeType,
    amount: f.amount,
    paid: f.Paidamount,
    status: f.status,
    dueDate: f.dueDate.toISOString().split('T')[0],
  }));

  sendCsv(res, 'fees.csv', Object.keys(data[0] ?? {}), data);
};

export const exportResultsPdf = async (res: Response, examId?: string) => {
  const where = examId ? { examId } : {};
  const marks = await prisma.mark.findMany({
    where,
    include: {
      student: { select: { studentId: true, name: true, rollNumber: true, class: { select: { name: true } } } },
      subject: { select: { name: true } },
      exam: { select: { name: true, type: true } },
    },
    orderBy: [{ exam: { name: 'asc' } }, { student: { rollNumber: 'asc' } }],
  });

  sendPdf(res, 'results.pdf', (doc) => {
    doc.fontSize(20).text('Results Report', { align: 'center' });
    doc.moveDown();

    const headers = ['Exam', 'Student', 'Class', 'Subject', 'Marks', 'Grade'];
    const rows = marks.map((m) => [
      m.exam?.name ?? '',
      m.student.name,
      m.student.class?.name ?? '',
      m.subject?.name ?? '',
      String(m.marksObtained),
      m.grade ?? '',
    ]);

    drawTable(doc, headers, rows);
  });
};

export const exportResultsCsv = async (res: Response, examId?: string) => {
  const where = examId ? { examId } : {};
  const marks = await prisma.mark.findMany({
    where,
    include: {
      student: { select: { studentId: true, name: true, rollNumber: true, class: { select: { name: true } } } },
      subject: { select: { name: true } },
      exam: { select: { name: true, type: true } },
    },
    orderBy: [{ exam: { name: 'asc' } }, { student: { rollNumber: 'asc' } }],
  });

  const data = marks.map((m) => ({
    exam: m.exam?.name ?? '',
    studentId: m.student.studentId,
    student: m.student.name,
    class: m.student.class?.name ?? '',
    subject: m.subject?.name ?? '',
      marks: m.marksObtained,
    grade: m.grade ?? '',
  }));

  sendCsv(res, 'results.csv', Object.keys(data[0] ?? {}), data);
};

function drawTable(doc: PDFDoc, headers: string[], rows: string[][]) {
  const colWidth = 80;
  const rowHeight = 25;
  const startX = 50;
  let y = doc.y;

  doc.fontSize(10).font('Helvetica-Bold');
  headers.forEach((h, i) => {
    doc.text(h, startX + i * colWidth, y, { width: colWidth, align: 'left' });
  });
  y += rowHeight;

  doc.font('Helvetica');
  rows.forEach((row) => {
    row.forEach((cell, i) => {
      doc.text(String(cell), startX + i * colWidth, y, { width: colWidth, align: 'left' });
    });
    y += rowHeight;
  });

  doc.y = y;
}
