"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const student_service_1 = require("./student.service");
const response_util_1 = require("../../utils/response.util");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const studentService = new student_service_1.StudentService();
class StudentController {
    async create(req, res, next) {
        try {
            const student = await studentService.createStudent(req.body);
            (0, response_util_1.sendSuccess)(res, student, 'Student created successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
    async findAll(req, res, next) {
        try {
            const data = await studentService.findAllStudents(req.query);
            (0, response_util_1.sendSuccess)(res, data, 'Students fetched');
        }
        catch (err) {
            next(err);
        }
    }
    async findById(req, res, next) {
        try {
            const student = await studentService.findStudentById(String(req.params.id));
            (0, response_util_1.sendSuccess)(res, student, 'Student fetched');
        }
        catch (err) {
            next(err);
        }
    }
    async getMyProfile(req, res, next) {
        try {
            const student = await studentService.findStudentByUserId(req.user.id);
            (0, response_util_1.sendSuccess)(res, student, 'Student profile fetched');
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const student = await studentService.update(String(req.params.id), req.body);
            (0, response_util_1.sendSuccess)(res, student, 'Student updated');
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            await studentService.delete(String(req.params.id));
            (0, response_util_1.sendSuccess)(res, null, 'Student deleted');
        }
        catch (err) {
            next(err);
        }
    }
    async uploadAvatar(req, res, next) {
        try {
            if (!req.file)
                throw new Error('No file uploaded');
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({ folder: 'students/avatars' }, (error, uploadResult) => {
                    if (error || !uploadResult) {
                        return reject(error || new Error('Cloudinary upload failed'));
                    }
                    resolve({ secure_url: uploadResult.secure_url });
                });
                stream.end(req.file.buffer);
            });
            const student = await studentService.uploadAvatar(String(req.params.id), result.secure_url);
            (0, response_util_1.sendSuccess)(res, student, 'Avatar uploaded');
        }
        catch (err) {
            next(err);
        }
    }
    async getAttendanceSummary(req, res, next) {
        try {
            const data = await studentService.getAttendance(String(req.params.id));
            (0, response_util_1.sendSuccess)(res, data, 'Attendance summary fetched');
        }
        catch (err) {
            next(err);
        }
    }
    async getResultSummary(req, res, next) {
        try {
            const data = await studentService.getResults(String(req.params.id));
            (0, response_util_1.sendSuccess)(res, data, 'Result summary fetched');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.StudentController = StudentController;
