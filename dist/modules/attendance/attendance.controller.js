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
exports.getMonthlyReport = exports.updateAttendance = exports.getStudentAttendance = exports.getAttendanceByDate = exports.takeAttendance = void 0;
const attendanceService = __importStar(require("./attendance.service"));
const response_util_1 = require("../../utils/response.util");
const takeAttendance = async (req, res, next) => {
    try {
        if (!req.user)
            throw { status: 401, message: 'Unauthorized' };
        const data = await attendanceService.takeAttendance(req.body, req.user.id);
        (0, response_util_1.sendSuccess)(res, data, 'Attendance saved', 201);
    }
    catch (err) {
        next(err);
    }
};
exports.takeAttendance = takeAttendance;
const getAttendanceByDate = async (req, res, next) => {
    try {
        const { classId, sectionId, date } = req.query;
        const data = await attendanceService.getAttendanceByDate(classId, sectionId, date);
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getAttendanceByDate = getAttendanceByDate;
const getStudentAttendance = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const studentId = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
        const data = await attendanceService.getStudentAttendance(studentId, month ? Number(month) : undefined, year ? Number(year) : undefined);
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getStudentAttendance = getStudentAttendance;
const updateAttendance = async (req, res, next) => {
    try {
        if (!req.user)
            throw { status: 401, message: 'Unauthorized' };
        const attendanceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await attendanceService.updateAttendance(attendanceId, req.body, req.user.id, req.user.role);
        (0, response_util_1.sendSuccess)(res, data, 'Attendance updated');
    }
    catch (err) {
        next(err);
    }
};
exports.updateAttendance = updateAttendance;
const getMonthlyReport = async (req, res, next) => {
    try {
        const { classId, sectionId, month, year } = req.query;
        const data = await attendanceService.getMonthlyReport(classId, sectionId, Number(month), Number(year));
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getMonthlyReport = getMonthlyReport;
