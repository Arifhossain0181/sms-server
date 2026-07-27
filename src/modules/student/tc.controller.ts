import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../../config/db';

export class TCController {
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

      // Create or update TC record
      await prisma.transferCertificate.upsert({
        where: { studentId },
        update: { reason, issueDate: new Date() },
        create: { studentId, reason, issueDate: new Date() }
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
