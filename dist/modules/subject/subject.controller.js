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
exports.assignTeacher = exports.deleteSubject = exports.updateSubject = exports.getSubjectById = exports.getAllSubjects = exports.createSubject = void 0;
const subjectService = __importStar(require("./subject.service"));
const response_util_1 = require("../../utils/response.util");
const createSubject = async (req, res, next) => {
    try {
        const data = await subjectService.createSubject(req.body);
        (0, response_util_1.sendSuccess)(res, data, 'Subject created', 201);
    }
    catch (err) {
        next(err);
    }
};
exports.createSubject = createSubject;
const getAllSubjects = async (req, res, next) => {
    try {
        const classId = req.query.classId;
        const data = await subjectService.getAllSubjects(classId);
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getAllSubjects = getAllSubjects;
const getSubjectById = async (req, res, next) => {
    try {
        const data = await subjectService.getSubjectById(String(req.params.id));
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getSubjectById = getSubjectById;
const updateSubject = async (req, res, next) => {
    try {
        const data = await subjectService.updateSubject(String(req.params.id), req.body);
        (0, response_util_1.sendSuccess)(res, data, 'Subject updated');
    }
    catch (err) {
        next(err);
    }
};
exports.updateSubject = updateSubject;
const deleteSubject = async (req, res, next) => {
    try {
        await subjectService.deleteSubject(String(req.params.id));
        (0, response_util_1.sendSuccess)(res, null, 'Subject deleted');
    }
    catch (err) {
        next(err);
    }
};
exports.deleteSubject = deleteSubject;
const assignTeacher = async (req, res, next) => {
    try {
        if (!req.body?.teacherId) {
            throw { status: 400, message: 'teacherId is required' };
        }
        const data = await subjectService.assignTeacher(String(req.params.id), String(req.body.teacherId));
        (0, response_util_1.sendSuccess)(res, data, 'Teacher assigned');
    }
    catch (err) {
        next(err);
    }
};
exports.assignTeacher = assignTeacher;
