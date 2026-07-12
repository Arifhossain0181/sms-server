import prisma from "../../config/db";

export const getAttendance = async (studentId: string) => {
    const counts = await prisma.studentAttendance.groupBy({
        by: ['status'],
        where: { studentId },
        _count: { _all: true },
    });

    const total = counts.reduce((sum, c) => sum + c._count._all, 0);
    const present = counts.find((c) => c.status === 'PRESENT')?._count._all ?? 0;
    const absent = counts.find((c) => c.status === 'ABSENT')?._count._all ?? 0;
    const late = counts.find((c) => c.status === 'LATE')?._count._all ?? 0;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, percentage };
};