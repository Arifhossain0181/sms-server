import prisma from "../../config/db";
import { CreateClassDto, CreateSectionDto, UpdateClassDto, UpdateSectionDto } from "./class.dto";

const MIN_CLASS_LEVEL = 1;
const MAX_CLASS_LEVEL = 10;

function assertValidLevel(level: number) {
    if (level < MIN_CLASS_LEVEL || level > MAX_CLASS_LEVEL) {
        throw new Error(`Class level must be between ${MIN_CLASS_LEVEL} and ${MAX_CLASS_LEVEL}`);
    }
}

export const createClass = async (dto: CreateClassDto) => {
    // FIX: doc requires classes 1-10 — nothing previously enforced that range.
    assertValidLevel(dto.numericLevel);

    const existing = await prisma.class.findUnique({ where: { name: dto.name } });
    if (existing) {
        throw new Error("Class with this name already exists");
    }
    return prisma.class.create({
        data: {
            name: dto.name,
            numericLevel: dto.numericLevel,
        },
    });
};

export const getAllClasses = async () => {
    // FIX: dropped the `students: { select: { id, name } }` include.
    // studentCount already comes from `_count` below — fetching every
    // student row here was pure over-fetch. With 3000+ students this
    // was the slowest part of a page that's supposed to load fast.
    const classes = await prisma.class.findMany({
        include: {
            sections: {
                include: { classTeacher: true },
                orderBy: { name: 'asc' },
            },
            _count: { select: { students: true } },
        },
    });

    return classes.map((cls) => ({
        ...cls,
        studentCount: cls._count?.students ?? 0,
    }));
};

export const getClassById = async (id: string) => {
    // Same fix as getAllClasses — students list dropped in favor of _count.
    // If a UI screen genuinely needs the roster, fetch it from a dedicated
    // paginated `/students?classId=` endpoint instead of inlining it here.
    const cls = await prisma.class.findUnique({
        where: { id },
        include: {
            sections: {
                include: { classTeacher: true },
                orderBy: { name: 'asc' },
            },
            _count: { select: { students: true } },
        },
    });
    if (!cls) {
        throw new Error("Class not found");
    }
    return {
        ...cls,
        studentCount: cls._count?.students ?? 0,
    };
};

export const updateClass = async (id: string, dto: UpdateClassDto) => {
    await getClassById(id);
    if (dto.numericLevel !== undefined) {
        assertValidLevel(dto.numericLevel);
    }
    return prisma.class.update({
        where: { id },
        data: {
            name: dto.name,
            numericLevel: dto.numericLevel,
        },
    });
};

export const deleteClass = async (id: string) => {
    await getClassById(id);

    // FIX: Student.classId/sectionId are required (non-nullable) FKs.
    // Deleting a class/section that still has students previously fell
    // through to Postgres and threw a raw foreign-key-violation error.
    // This makes the same protection explicit and user-friendly, and
    // prevents accidentally orphaning student records either way.
    const studentCount = await prisma.student.count({ where: { classId: id } });
    if (studentCount > 0) {
        throw {
            status: 409,
            message: `${studentCount} students are currently enrolled in this class. Please move them to another class before deleting.`,
        };
    }

    await prisma.section.deleteMany({ where: { classId: id } });
    return prisma.class.delete({ where: { id } });
};

// create section

export const createSection = async (dto: CreateSectionDto) => {
    // FIX: capacity must be a sane positive number — admission.service.ts's
    // section-picking logic (`students < maxCapacity`) silently breaks if
    // this is 0, negative, or missing.
    if (!dto.maxCapacity || dto.maxCapacity <= 0) {
        throw new Error("maxCapacity must be a positive number");
    }

    const existing = await prisma.section.findFirst({
        where: { name: dto.name, classId: dto.classId },
    });
    if (existing) {
        throw new Error("Section with this name already exists in this class");
    }

    try {
        return await prisma.section.create({
            data: {
                name: dto.name,
                classId: dto.classId,
                classTeacherId: dto.classTeacherId,
                maxCapacity: dto.maxCapacity,
            },
            include: { class: true },
        });
    } catch (err: any) {
        // FIX: the findFirst check above has a race window — two concurrent
        // requests can both pass it before either writes. Once the DB has a
        // @@unique([classId, name]) constraint (see class-schema-update.prisma),
        // the loser hits P2002 here instead of creating a silent duplicate.
        if (err?.code === 'P2002') {
            throw new Error("Section with this name already exists in this class");
        }
        throw err;
    }
};

export const getSectionsByClass = async (classId: string) => {
    return prisma.section.findMany({
        where: { classId },
        include: { classTeacher: true },
        orderBy: { name: 'asc' },
    });
};

export const updateSection = async (id: string, dto: UpdateSectionDto) => {
    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) throw { status: 404, message: 'Section not found' };

    if (dto.maxCapacity !== undefined && dto.maxCapacity <= 0) {
        throw new Error("maxCapacity must be a positive number");
    }

    // FIX: shrinking capacity below the current enrolled count would silently
    // desync admission logic (it would just never pick this section again,
    // with no explanation). Warn explicitly instead.
    if (dto.maxCapacity !== undefined) {
        const currentCount = await prisma.student.count({ where: { sectionId: id } });
        if (dto.maxCapacity < currentCount) {
            throw new Error(
                `${currentCount} students are enrolled in this section — capacity cannot be reduced below this number`
            );
        }
    }

    return prisma.section.update({
        where: { id },
        data: {
            name: dto.name,
            classTeacherId: dto.classTeacherId,
            maxCapacity: dto.maxCapacity,
        },
    });
};

export const deleteSection = async (id: string) => {
    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) throw { status: 404, message: 'Section not found' };

    // same missing guard as deleteClass — Student.sectionId is required,
    
    const studentCount = await prisma.student.count({ where: { sectionId: id } });
    if (studentCount > 0) {
        throw {
            status: 409,
            message: `${studentCount} students are currently enrolled in this section. Please move them to another section before deleting.`,
        };
    }

    return prisma.section.delete({ where: { id } });
};