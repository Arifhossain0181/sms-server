import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface AdmitCardData {
    exam: { id: string; name: string; type: string };
    student: {
        studentId: string;
        name: string;
        rollNumber: string | number;
        className: string;
        sectionName: string;
    };
    schedules: {
        subjectName: string;
        fullMarks: number;
        examDate: Date;
        startTime: string;
        endTime: string;
    }[];
}

const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const streamAdmitCardPdf = (data: AdmitCardData, res: Response, schoolName = 'School Name') => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="admit-card-${data.student.studentId}-${data.exam.id}.pdf"`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(16).font('Helvetica-Bold').text(schoolName, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Admit Card', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Exam: ${data.exam.name} (${data.exam.type})`, { align: 'center' });
    doc.moveDown(1);

    // Student info box
    doc.rect(40, doc.y, 515, 90).stroke();
    const boxTop = doc.y + 10;
    doc.fontSize(10);
    doc.text(`Student Name: ${data.student.name}`, 55, boxTop);
    doc.text(`Student ID: ${data.student.studentId}`, 55, boxTop + 18);
    doc.text(`Roll Number: ${data.student.rollNumber}`, 55, boxTop + 36);
    doc.text(`Class: ${data.student.className}`, 300, boxTop);
    doc.text(`Section: ${data.student.sectionName}`, 300, boxTop + 18);
    doc.y = boxTop + 90;
    doc.moveDown(2);

    // Schedule table
    doc.fontSize(11).font('Helvetica-Bold').text('Exam Schedule', 40, doc.y);
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const colX = { subject: 40, date: 220, time: 340, marks: 470 };

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Subject', colX.subject, tableTop);
    doc.text('Date', colX.date, tableTop);
    doc.text('Time', colX.time, tableTop);
    doc.text('Full Marks', colX.marks, tableTop);
    doc.moveTo(40, tableTop + 15).lineTo(555, tableTop + 15).stroke();

    let rowY = tableTop + 22;
    doc.font('Helvetica');
    for (const s of data.schedules) {
        doc.text(s.subjectName, colX.subject, rowY, { width: 170 });
        doc.text(formatDate(s.examDate), colX.date, rowY);
        doc.text(`${s.startTime} - ${s.endTime}`, colX.time, rowY);
        doc.text(String(s.fullMarks), colX.marks, rowY);
        rowY += 20;
    }

    doc.moveTo(40, rowY + 5).lineTo(555, rowY + 5).stroke();

    // Footer
    doc.moveDown(4);
    doc.fontSize(9).text('This admit card must be produced at the examination hall.', 40, rowY + 40);
    doc.text('_____________________', 380, rowY + 60);
    doc.text('Exam Controller Signature', 380, rowY + 75);

    doc.end();
};