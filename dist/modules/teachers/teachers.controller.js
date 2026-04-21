"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
const response_util_1 = require("../../utils/response.util");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const teachers_service_1 = require("./teachers.service");
const teacherService = teachers_service_1.TeachersService;
class TeacherController {
    async create(req, res, next) {
        try {
            const teacher = await teacherService.create(req.body);
            (0, response_util_1.sendSuccess)(res, teacher, 'Teacher created successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
    async findAll(req, res, next) {
        try {
            const data = await teacherService.findAll(req.query);
            (0, response_util_1.sendSuccess)(res, data, 'Teachers fetched');
        }
        catch (err) {
            next(err);
        }
    }
    async findById(req, res, next) {
        try {
            const teacher = await teacherService.findById(String(req.params.id));
            (0, response_util_1.sendSuccess)(res, teacher, 'Teacher fetched');
        }
        catch (err) {
            next(err);
        }
    }
    async getMyProfile(req, res, next) {
        try {
            const teacher = await teacherService.findByUserId(req.user.id);
            (0, response_util_1.sendSuccess)(res, teacher, 'Teacher profile fetched');
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const teacher = await teacherService.update(String(req.params.id), req.body);
            (0, response_util_1.sendSuccess)(res, teacher, 'Teacher updated');
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            await teacherService.delete(String(req.params.id));
            (0, response_util_1.sendSuccess)(res, null, 'Teacher deleted');
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
                const stream = cloudinary_1.default.uploader.upload_stream({ folder: 'teachers/avatars' }, (error, uploadResult) => {
                    if (error || !uploadResult) {
                        return reject(error || new Error('Cloudinary upload failed'));
                    }
                    resolve({ secure_url: uploadResult.secure_url });
                });
                stream.end(req.file.buffer);
            });
            const teacher = await teacherService.uploadAvatar(String(req.params.id), result.secure_url);
            (0, response_util_1.sendSuccess)(res, teacher, 'Avatar uploaded');
        }
        catch (err) {
            next(err);
        }
    }
    async assignSubjects(req, res, next) {
        try {
            const teacher = await teacherService.assignSubjects(String(req.params.id), req.body);
            (0, response_util_1.sendSuccess)(res, teacher, 'Subjects assigned');
        }
        catch (err) {
            next(err);
        }
    }
    async assignClasses(req, res, next) {
        try {
            const teacher = await teacherService.assignClasses(String(req.params.id), req.body);
            (0, response_util_1.sendSuccess)(res, teacher, 'Classes assigned');
        }
        catch (err) {
            next(err);
        }
    }
    async getSchedule(req, res, next) {
        try {
            const data = await teacherService.getTeacherSchedule(String(req.params.id));
            (0, response_util_1.sendSuccess)(res, data, 'Schedule fetched');
        }
        catch (err) {
            next(err);
        }
    }
    async getDashboardStats(req, res, next) {
        try {
            const data = await teacherService.getDashboardStats(String(req.params.id));
            (0, response_util_1.sendSuccess)(res, data, 'Dashboard stats fetched');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.TeacherController = TeacherController;
