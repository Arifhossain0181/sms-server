import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface ReportCardPdfData {
    exam: { id: string; name: string; type: string };
    student: {
        studentId: string;
        name: string;
        rollNumber: string | number;
        className: string;
        sectionName: string;
    };
    subjects: {
        name: string;
        fullMarks: number;
        marksObtained: number;
        grade?: string;
    }[];
    percentage?: number;
    result?: string;
}

const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const streamReportCardPdf = (data: ReportCardPdfData, res: Response, schoolName = 'School Name') => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="report-card-${data.student.studentId}-${data.exam.id}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(16).font('Helvetica-Bold').text(schoolName, { align: 'center' });
    doc.fontSize(14).font('Helvetica-Bold').text('Report Card', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').text(`Exam: ${data.exam.name} (${data.exam.type})`, { align: 'center' });
    doc.moveDown(1);

    doc.rect(40, doc.y, 515, 85).stroke();
    const boxTop = doc.y + 10;
    doc.fontSize(10).font('Helvetica');
    doc.text(`Student Name: ${data.student.name}`, 55, boxTop);
    doc.text(`Student ID: ${data.student.studentId}`, 55, boxTop + 18);
    doc.text(`Roll Number: ${data.student.rollNumber}`, 55, boxTop + 36);
    doc.text(`Class: ${data.student.className}`, 300, boxTop);
    doc.text(`Section: ${data.student.sectionName}`, 300, boxTop + 18);
    doc.text(`Generated: ${formatDate(new Date())}`, 300, boxTop + 36);
    doc.y = boxTop + 95;
    doc.moveDown(2);

    doc.fontSize(11).font('Helvetica-Bold').text('Subject-wise Marks', 40, doc.y);
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const colX = { subject: 40, fullMarks: 220, obtained: 320, grade: 420 };

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Subject', colX.subject, tableTop);
    doc.text('Full Marks', colX.fullMarks, tableTop);
    doc.text('Obtained', colX.obtained, tableTop);
    doc.text('Grade', colX.grade, tableTop);
    doc.moveTo(40, tableTop + 15).lineTo(555, tableTop + 15).stroke();

    let rowY = tableTop + 22;
    doc.font('Helvetica');
    for (const s of data.subjects) {
        doc.text(s.name, colX.subject, rowY, { width: 170 });
        doc.text(String(s.fullMarks), colX.fullMarks, rowY);
        doc.text(String(s.marksObtained), colX.obtained, rowY);
        doc.text(s.grade ?? '-', colX.grade, rowY);
        rowY += 20;
    }

    doc.moveTo(40, rowY + 5).lineTo(555, rowY + 5).stroke();
    doc.moveDown(1);

    if (data.percentage !== undefined) {
        doc.font('Helvetica-Bold').text(`Percentage: ${data.percentage}%`, 40, rowY + 25);
    }
    if (data.result) {
        doc.text(`Result: ${data.result}`, 40, rowY + 42);
    }

    doc.moveDown(4);
    doc.font('Helvetica').fontSize(9).text('This is a digitally generated report card.', 40, rowY + 80);
    doc.text('___________________________', 350, rowY + 100);
    doc.text('Class Teacher Signature', 350, rowY + 115);

    doc.end();
};
