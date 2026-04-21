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
exports.getFailedStudents = exports.updateMark = exports.getResultByExam = exports.getResultByStudent = exports.submitResult = void 0;
const resultService = __importStar(require("./result.service.js"));
const response_util_1 = require("../../utils/response.util");
const toSingleString = (value) => {
    if (Array.isArray(value))
        return value[0] ? String(value[0]) : undefined;
    if (value === undefined || value === null)
        return undefined;
    return String(value);
};
const submitResult = async (req, res, next) => {
    try {
        const data = await resultService.submitResult(req.body);
        (0, response_util_1.sendSuccess)(res, data, 'Result submitted', 201);
    }
    catch (err) {
        next(err);
    }
};
exports.submitResult = submitResult;
const getResultByStudent = async (req, res, next) => {
    try {
        const examId = toSingleString(req.query.examId);
        const studentId = toSingleString(req.params.studentId);
        if (!studentId)
            throw { status: 400, message: 'studentId is required' };
        const data = await resultService.getResultByStudent(studentId, examId);
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getResultByStudent = getResultByStudent;
const getResultByExam = async (req, res, next) => {
    try {
        const examId = toSingleString(req.params.examId);
        if (!examId)
            throw { status: 400, message: 'examId is required' };
        const data = await resultService.getResultByExam(examId);
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getResultByExam = getResultByExam;
const updateMark = async (req, res, next) => {
    try {
        const id = toSingleString(req.params.id);
        if (!id)
            throw { status: 400, message: 'id is required' };
        const data = await resultService.updateMark(id, req.body);
        (0, response_util_1.sendSuccess)(res, data, 'Mark updated');
    }
    catch (err) {
        next(err);
    }
};
exports.updateMark = updateMark;
const getFailedStudents = async (req, res, next) => {
    try {
        const examId = toSingleString(req.params.examId);
        if (!examId)
            throw { status: 400, message: 'examId is required' };
        const data = await resultService.getFailedStudents(examId);
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getFailedStudents = getFailedStudents;
