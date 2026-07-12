import prisma from "../../config/db";

/** Publish-gated — only counts marks belonging to a PUBLISHED ReportCard for this student. */
export const getResults = async (studentId: string) => {
    const publishedExamIds = await prisma.reportCard.findMany({
        where: { studentId, status: 'PUBLISHED' },
        select: { examId: true },
    }).then((rows) => rows.map((r) => r.examId));

    if (!publishedExamIds.length) {
        return { results: [], totalObtained: 0, totalPossible: 0, percentage: 0 };
    }

    const results = await prisma.mark.findMany({
        where: { studentId, examId: { in: publishedExamIds } },
        include: {
            exam: { select: { name: true } },
            subject: { select: { name: true, fullMarks: true } },
        },
    });

    const totalObtained = results.reduce((sum, r) => sum + r.marksObtained, 0);
    const totalPossible = results.reduce((sum, r) => sum + r.subject.fullMarks, 0);
    const percentage = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0;

    return { results, totalObtained, totalPossible, percentage };
};