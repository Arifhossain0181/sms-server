export function notFoundError(message: string) {
    return Object.assign(new Error(message), { status: 404 });
}


export async function findAvailableSection(tx: any, classId: string) {
    const sections = await tx.section.findMany({
        where: { classId },
        include: { _count: { select: { students: true } } },
        orderBy: { name: 'asc' },
    });
    const section = sections.find((s: any) => s._count.students < s.maxCapacity);
    if (!section) throw new Error("All sections are full — create a new section or increase the capacity of existing sections");
    return section as { id: string; name: string; maxCapacity: number };
}

/** DB constraint is @@unique([sectionId, rollNumber]) — always check scoped to a section, never classId. */
export async function assertRollNumberAvailable(
    tx: any,
    sectionId: string,
    rollNumber: number,
    excludeStudentId?: string
) {
    const existing = await tx.student.findFirst({
        where: {
            sectionId,
            rollNumber,
            ...(excludeStudentId && { id: { not: excludeStudentId } }),
        },
    });
    if (existing) throw new Error("Roll number already exists in this section");
}