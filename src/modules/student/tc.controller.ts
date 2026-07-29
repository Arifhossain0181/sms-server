import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../../config/db';
import { sendSuccess } from '../../utils/response.util';

export class TCController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tcs = await prisma.transferCertificate.findMany({
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
              class: { select: { id: true, name: true } },
              section: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      const data = tcs.map((tc) => ({
        id: tc.id,
        studentId: tc.studentId,
        studentName: tc.student?.user?.name ?? 'Unknown',
        studentEmail: tc.student?.user?.email ?? '',
        className: tc.student?.class?.name ?? '—',
        sectionName: tc.student?.section?.name ?? '—',
        rollNumber: tc.student?.rollNumber ?? null,
        issueDate: tc.issueDate?.toISOString() ?? null,
        reason: tc.reason,
        createdAt: tc.createdAt.toISOString(),
      }));

      sendSuccess(res, data, 'TC records fetched');
    } catch (err) {
      next(err);
    }
  }

  async downloadTC(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;

      const tc = await prisma.transferCertificate.findUnique({
        where: { studentId },
        include: { student: { include: { class: true, section: true } } },
      });

      if (!tc) {
        res.status(404).json({ success: false, message: 'TC not found for this student' });
        return;
      }

      const student = tc.student;

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=TC_${student.studentId}.pdf`);
      doc.pipe(res);

      doc.fontSize(25).text('Transfer Certificate', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`This is to certify that ${student.name} (ID: ${student.studentId}) was a student of this school.`);
      doc.moveDown();
      doc.text(`Class: ${student.class.name}`);
      doc.text(`Section: ${student.section.name}`);
      doc.text(`Roll Number: ${student.rollNumber}`);
      doc.moveDown();
      doc.text(`Reason for leaving: ${tc.reason || 'Not specified'}`);
      doc.moveDown();
      doc.text(`Date of Issue: ${tc.issueDate ? new Date(tc.issueDate).toLocaleDateString() : new Date().toLocaleDateString()}`);
      doc.moveDown(4);
      doc.text('Principal Signature: _________________', { align: 'right' });
      doc.end();

    } catch (error) {
      next(error);
    }
  }

  async generateTC(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, reason } = req.body;

      if (!studentId) {
        res.status(400).json({ success: false, message: 'studentId is required' });
        return;
      }

      // Check if student exists
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { class: true, section: true }
      });

      if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' });
        return;
      }

      // Check if TC already exists for this student
      const existingTC = await prisma.transferCertificate.findUnique({
        where: { studentId },
        select: { id: true }
      });

      if (existingTC) {
        res.status(409).json({ success: false, message: 'TC already generated for this student' });
        return;
      }

      await prisma.transferCertificate.create({
        data: { studentId, reason, issueDate: new Date() }
      });

      // Mark student as inactive
      await prisma.student.update({
        where: { id: studentId },
        data: { isActive: false },
      });

      // Generate PDF
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=TC_${student.studentId}.pdf`);

      doc.pipe(res);

      doc.fontSize(25).text('Transfer Certificate', { align: 'center' });
      doc.moveDown();

      doc.fontSize(14).text(`This is to certify that ${student.name} (ID: ${student.studentId}) was a student of this school.`);
      doc.moveDown();
      doc.text(`Class: ${student.class.name}`);
      doc.text(`Section: ${student.section.name}`);
      doc.text(`Roll Number: ${student.rollNumber}`);
      doc.moveDown();
      doc.text(`Reason for leaving: ${reason || 'Not specified'}`);
      doc.moveDown();
      doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`);

      doc.moveDown(4);
      doc.text('Principal Signature: _________________', { align: 'right' });

      doc.end();

    } catch (error) {
      next(error);
    }
  }
}
