"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignTeacher = exports.deleteSubject = exports.updateSubject = exports.getSubjectById = exports.getAllSubjects = exports.createSubject = void 0;
const db_1 = __importDefault(require("../../config/db"));
const createSubject = async (dto) => {
    const existing = await db_1.default.subject.findFirst({
        where: {
            name: dto.name,
            classId: dto.classId
        }
    });
    if (existing) {
        throw new Error("Subject with this name already exists in this class");
    }
    const { teacherId, code: _code, isOptional, classId, ...rest } = dto;
    return await db_1.default.subject.create({
        data: {
            ...rest,
            isCompulsory: typeof isOptional === "boolean" ? !isOptional : true,
            class: { connect: { id: classId } },
            assignments: teacherId
                ? {
                    create: {
                        teacher: { connect: { id: teacherId } },
                    },
                }
                : undefined,
        },
        include: {
            class: true,
            assignments: {
                include: {
                    teacher: true,
                },
            },
        }
    });
};
exports.createSubject = createSubject;
const getAllSubjects = async (classId) => {
    return await db_1.default.subject.findMany({
        where: classId ? { classId } : {},
        include: {
            class: true,
            assignments: {
                include: {
                    teacher: true,
                },
            },
        },
        orderBy: {
            name: 'asc'
        }
    });
};
exports.getAllSubjects = getAllSubjects;
const getSubjectById = async (id) => {
    const subject = await db_1.default.subject.findUnique({
        where: { id },
        include: {
            class: true,
            assignments: {
                include: {
                    teacher: true,
                },
            },
        },
    });
    if (!subject)
        throw { status: 404, message: 'Subject not found' };
    return subject;
};
exports.getSubjectById = getSubjectById;
const updateSubject = async (id, dto) => {
    await (0, exports.getSubjectById)(id);
    const { teacherId, code: _code, isOptional, ...rest } = dto;
    return await db_1.default.subject.update({
        where: { id },
        data: {
            ...rest,
            isCompulsory: typeof isOptional === 'boolean' ? !isOptional : undefined,
            assignments: teacherId
                ? {
                    upsert: {
                        where: { subjectId_teacherId: { subjectId: id, teacherId } },
                        update: {},
                        create: {
                            teacher: { connect: { id: teacherId } },
                        },
                    },
                }
                : undefined,
        },
        include: {
            class: true,
            assignments: {
                include: {
                    teacher: true,
                },
            },
        },
    });
};
exports.updateSubject = updateSubject;
const deleteSubject = async (id) => {
    await (0, exports.getSubjectById)(id);
    return await db_1.default.subject.delete({ where: { id } });
};
exports.deleteSubject = deleteSubject;
const assignTeacher = async (subjectId, teacherId) => {
    await (0, exports.getSubjectById)(subjectId);
    await db_1.default.subjectAssignment.upsert({
        where: { subjectId_teacherId: { subjectId, teacherId } },
        update: {},
        create: {
            subject: { connect: { id: subjectId } },
            teacher: { connect: { id: teacherId } },
        },
    });
    return await (0, exports.getSubjectById)(subjectId);
};
exports.assignTeacher = assignTeacher;
