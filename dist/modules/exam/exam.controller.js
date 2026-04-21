"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFailedStudents = exports.submitExamMarks = exports.deleteSchedule = exports.getScheduleByExam = exports.createSchedule = exports.unpublishExam = exports.publishExam = exports.deleteExam = exports.updateExam = exports.getExamById = exports.getAllExams = exports.createExam = void 0;
const examService = __importStar(require("./exam.service"));
const response_util_1 = require("../../utils/response.util");
const asParamString = (value) => {
    if (Array.isArray(value))
        return value[0] ?? '';
    return value ?? '';
};
const asOptionalQueryString = (value) => {
    if (typeof value === 'string')
        return value;
    if (Array.isArray(value))
        return typeof value[0] === 'string' ? value[0] : undefined;
    return undefined;
};
const createExam = async (req, res, next) => {
    try {
        const data = await examService.createExam(req.body);
        (0, response_util_1.sendSuccess)(res, data, 'Exam created', 201);
    }
    catch (err) {
        next(err);
    }
};
exports.createExam = createExam;
const getAllExams = async (req, res, next) => {
    try {
        const classId = asOptionalQueryString(req.query.classId);
        const data = await examService.getAllExams(classId);
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getAllExams = getAllExams;
const getExamById = async (req, res, next) => {
    try {
        const data = await examService.getExamById(asParamString(req.params.id));
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getExamById = getExamById;
const updateExam = async (req, res, next) => {
    try {
        const data = await examService.updateExam(asParamString(req.params.id), req.body);
        (0, response_util_1.sendSuccess)(res, data, 'Exam updated');
    }
    catch (err) {
        next(err);
    }
};
exports.updateExam = updateExam;
const deleteExam = async (req, res, next) => {
    try {
        await examService.deleteExam(asParamString(req.params.id));
        (0, response_util_1.sendSuccess)(res, null, 'Exam deleted');
    }
    catch (err) {
        next(err);
    }
};
exports.deleteExam = deleteExam;
const publishExam = async (req, res, next) => {
    try {
        const data = await examService.publishExam(asParamString(req.params.id));
        (0, response_util_1.sendSuccess)(res, data, 'Exam published');
    }
    catch (err) {
        next(err);
    }
};
exports.publishExam = publishExam;
const unpublishExam = async (req, res, next) => {
    try {
        const data = await examService.unpublishExam(asParamString(req.params.id));
        (0, response_util_1.sendSuccess)(res, data, 'Exam unpublished');
    }
    catch (err) {
        next(err);
    }
};
exports.unpublishExam = unpublishExam;
const createSchedule = async (req, res, next) => {
    try {
        const data = await examService.createExamSchedule(req.body);
        (0, response_util_1.sendSuccess)(res, data, 'Schedule created', 201);
    }
    catch (err) {
        next(err);
    }
};
exports.createSchedule = createSchedule;
const getScheduleByExam = async (req, res, next) => {
    try {
        const data = await examService.getScheduleByExam(asParamString(req.params.examId));
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getScheduleByExam = getScheduleByExam;
const deleteSchedule = async (req, res, next) => {
    try {
        await examService.deleteSchedule(asParamString(req.params.id));
        (0, response_util_1.sendSuccess)(res, null, 'Schedule deleted');
    }
    catch (err) {
        next(err);
    }
};
exports.deleteSchedule = deleteSchedule;
const submitExamMarks = async (req, res, next) => {
    try {
        const authUser = req.user;
        if (!authUser) {
            throw { status: 401, message: 'Unauthorized' };
        }
        const data = await examService.submitExamMarks(asParamString(req.params.examId), req.body, authUser);
        (0, response_util_1.sendSuccess)(res, data, 'Marks submitted');
    }
    catch (err) {
        next(err);
    }
};
exports.submitExamMarks = submitExamMarks;
const getFailedStudents = async (req, res, next) => {
    try {
        const data = await examService.getFailedStudents(asParamString(req.params.examId), asOptionalQueryString(req.query.classId));
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getFailedStudents = getFailedStudents;
