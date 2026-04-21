"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatefee = exports.findByid = exports.findAll = exports.bulkcreate = exports.createfee = void 0;
const db_1 = __importDefault(require("../../config/db"));
const pagination_util_1 = require("../../utils/pagination.util");
const createfee = async (dto) => {
    const student = await db_1.default.student.findUnique({
        where: { id: dto.studentId },
    });
    if (!student) {
        throw new Error('Student not found');
    }
    return await db_1.default.feeStructure.create({
        data: {
            ...dto,
            dueDate: new Date(dto.dueDate),
            status: 'PENDING',
            Paidamount: 0,
            classId: dto.classId, // Ensure `classId` is provided in `dto`
            feeType: dto.type, // Corrected to use `type` from `CreateFeeDto`
            dueDay: dto.dueDay, // Ensure `dueDay` is provided in `dto`
        },
        include: {
            student: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
};
exports.createfee = createfee;
const bulkcreate = async (dto) => {
    const students = await db_1.default.student.findMany({
        where: { classId: dto.classId },
        select: { id: true },
    });
    const fees = students.map((student) => ({
        title: dto.title,
        feeType: dto.type, // Updated to use `feeType` as required by Prisma
        amount: dto.amount,
        dueDate: dto.dueDate,
        dueDay: new Date(dto.dueDate).getDate(),
        description: dto.description,
        status: 'PENDING',
        paidAmount: 0,
        studentId: student.id,
        classId: dto.classId,
    }));
    await db_1.default.feeStructure.createMany({ data: fees });
    return { created: students.length };
};
exports.bulkcreate = bulkcreate;
const findAll = async (dto) => {
    const { page = '1', limit = '10', studentId, classId, type, status, month } = dto;
    //  base filter
    const where = {
        ...(studentId && { studentId }),
        ...(classId && { classId }),
        ...(type && { feeType: type }),
        ...(status && { status }),
    };
    //  month filter
    if (month) {
        const start = new Date(`${month}-01`);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        where.dueDate = {
            gte: start,
            lt: end,
        };
    }
    //  ALWAYS paginate (important fix)
    const { skip, take, meta } = await (0, pagination_util_1.paginate)(db_1.default.feeStructure, where, parseInt(page), parseInt(limit));
    //  fetch data
    const fees = await db_1.default.feeStructure.findMany({
        where,
        skip,
        take,
        include: {
            student: {
                select: {
                    id: true,
                    rollNumber: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    class: {
                        select: {
                            name: true,
                            sections: true,
                        },
                    },
                },
            },
            payments: true,
        },
        orderBy: { dueDate: "asc" },
    });
    return { data: fees, meta };
};
exports.findAll = findAll;
const findByid = async (id) => {
    const fee = await db_1.default.feeStructure.findUnique({
        where: { id },
        include: {
            student: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    class: {
                        select: {
                            name: true,
                            sections: true,
                        },
                    },
                },
            },
            payments: { orderBy: { createdAt: 'desc' } },
        },
    });
    if (!fee) {
        throw new Error('Fee not found');
    }
    // Ensure payments are safely accessed
    const payments = fee.payments ?? [];
    return { ...fee, payments };
};
exports.findByid = findByid;
const updatefee = async (id, dto) => {
    await this._exists(id);
    return db_1.default.feeStructure.update({
        where: { id },
        data: {
            ...dto,
            ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
        },
        include: { payments: true },
    });
};
exports.updatefee = updatefee;
