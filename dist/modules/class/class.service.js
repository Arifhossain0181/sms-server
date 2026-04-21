"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSection = exports.updateSection = exports.getSectionsByClass = exports.createSection = exports.deleteClass = exports.updateClass = exports.getClassById = exports.getAllClasses = exports.createClass = void 0;
const db_1 = __importDefault(require("../../config/db"));
const createClass = async (dto) => {
    const existing = await db_1.default.class.findUnique({
        where: {
            name: dto.name
        }
    });
    if (existing) {
        throw new Error("Class with this name already exists");
    }
    return await db_1.default.class.create({
        data: {
            name: dto.name,
            numericLevel: dto.numericLevel
        }
    });
};
exports.createClass = createClass;
const getAllClasses = async () => {
    return await db_1.default.class.findMany({
        include: {
            sections: {
                include: {
                    classTeacher: true
                },
                _count: {
                    select: {
                        students: true
                    },
                    orderBy: {
                        name: 'asc'
                    }
                }
            }
        }
    });
};
exports.getAllClasses = getAllClasses;
const getClassById = async (id) => {
    const cls = await db_1.default.class.findUnique({
        where: {
            id
        },
        include: {
            sections: {
                include: {
                    classTeacher: true
                },
                _count: {
                    select: {
                        students: true
                    },
                    orderBy: {
                        name: 'asc'
                    }
                }
            }
        }
    });
    if (!cls) {
        throw new Error("Class not found");
    }
    return cls;
};
exports.getClassById = getClassById;
const updateClass = async (id, dto) => {
    await (0, exports.getClassById)(id);
    return await db_1.default.class.update({
        where: {
            id
        },
        data: {
            name: dto.name,
            numericLevel: dto.numericLevel
        }
    });
};
exports.updateClass = updateClass;
const deleteClass = async (id) => {
    await (0, exports.getClassById)(id);
    return await db_1.default.class.delete({
        where: {
            id
        }
    });
};
exports.deleteClass = deleteClass;
// create section  
const createSection = async (dto) => {
    const existing = await db_1.default.section.findFirst({
        where: {
            name: dto.name,
            classId: dto.classId
        }
    });
    if (existing) {
        throw new Error("Section with this name already exists in this class");
    }
    return await db_1.default.section.create({
        data: dto,
        include: {
            class: true,
        }
    });
};
exports.createSection = createSection;
const getSectionsByClass = async (classId) => {
    return await db_1.default.section.findMany({
        where: { classId },
        include: {
            classTeacher: true,
            _count: { select: { students: true } },
        },
    });
};
exports.getSectionsByClass = getSectionsByClass;
const updateSection = async (id, dto) => {
    const section = await db_1.default.section.findUnique({ where: { id } });
    if (!section)
        throw { status: 404, message: 'Section not found' };
    return await db_1.default.section.update({ where: { id }, data: dto });
};
exports.updateSection = updateSection;
const deleteSection = async (id) => {
    const section = await db_1.default.section.findUnique({ where: { id } });
    if (!section)
        throw { status: 404, message: 'Section not found' };
    return await db_1.default.section.delete({ where: { id } });
};
exports.deleteSection = deleteSection;
