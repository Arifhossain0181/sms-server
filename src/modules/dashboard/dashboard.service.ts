import prisma from "../../config/db";

type ExamSummaryItem = {
    examId: string;
    examName: string;
    examType: string;
    status: "UPCOMING" | "ONGOING" | "COMPLETED";
    admitCardAvailable: boolean;
    resultPublished: boolean;
    nextExamDate: string | null;
    subjectsCount: number;
};

const today = new Date();
today.setHours(0, 0, 0, 0);

const getExamStatus = (nextDate: Date | null): "UPCOMING" | "ONGOING" | "COMPLETED" => {
    if (!nextDate) return "COMPLETED";
    const d = new Date(nextDate);
    d.setHours(0, 0, 0, 0);
    if (d > today) return "UPCOMING";
    if (d.getTime() === today.getTime()) return "ONGOING";
    return "COMPLETED";
};

export const getStudentExamSummary = async (userId: string): Promise<ExamSummaryItem[]> => {
    const student = await prisma.student.findUnique({
        where: { userId },
        select: { id: true, classId: true },
    });
    if (!student) throw { status: 404, message: "Student not found" };

    const exams = await prisma.exam.findMany({
        where: {
            schedules: {
                some: { classId: student.classId },
            },
        },
        include: {
            reportCards: {
                where: {
                    studentId: student.id,
                    status: "PUBLISHED",
                },
                select: { id: true },
            },
            schedules: {
                where: { classId: student.classId },
                select: {
                    examDate: true,
                    subjectId: true,
                },
                orderBy: { examDate: "asc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return exams.map((exam) => {
        const uniqueSubjectIds = new Set(exam.schedules.map((s) => s.subjectId));
        const nextDate = exam.schedules.length
            ? new Date(exam.schedules[0].examDate)
            : null;
        const status = getExamStatus(nextDate);
        const formattedDate = nextDate
            ? nextDate.toISOString().split("T")[0]
            : null;

        return {
            examId: exam.id,
            examName: exam.name,
            examType: exam.type,
            status,
            admitCardAvailable: exam.schedules.length > 0,
            resultPublished: exam.reportCards.length > 0,
            nextExamDate: status === "COMPLETED" && exam.schedules.every(
                (s) => new Date(s.examDate) < today
            )
                ? null
                : formattedDate,
            subjectsCount: uniqueSubjectIds.size,
        };
    });
};

export const getParentDashboard = async (parentUserId: string) => {
    const parent = await prisma.parent.findUnique({
        where: { userId: parentUserId },
        select: { id: true, userId: true },
    });
    if (!parent) throw { status: 404, message: "Parent profile not found" };

    const children = await prisma.student.findMany({
        where: { parentId: parent.id },
        select: {
            id: true,
            name: true,
            class: { select: { name: true } },
        },
    });

    const result = [];
    for (const child of children) {
        const exams = await getStudentExamSummary(child.id);
        result.push({
            childId: child.id,
            childName: child.name,
            className: child.class.name,
            exams,
        });
    }

    return result;
};
