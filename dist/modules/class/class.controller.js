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
exports.deleteSection = exports.updateSection = exports.getSectionsByClass = exports.createSection = exports.deleteClass = exports.updateClass = exports.getClassById = exports.getAllClasses = exports.createClass = void 0;
const classService = __importStar(require("./class.service"));
const response_util_1 = require("../../utils/response.util");
const asParamString = (value) => {
    if (Array.isArray(value))
        return value[0] ?? '';
    return value ?? '';
};
// ─── Class ───────────────────────────────────────────
const createClass = async (req, res, next) => {
    try {
        const data = await classService.createClass(req.body);
        (0, response_util_1.sendSuccess)(res, data, 'Class created', 201);
    }
    catch (err) {
        next(err);
    }
};
exports.createClass = createClass;
const getAllClasses = async (req, res, next) => {
    try {
        const data = await classService.getAllClasses();
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getAllClasses = getAllClasses;
const getClassById = async (req, res, next) => {
    try {
        const data = await classService.getClassById(asParamString(req.params.id));
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getClassById = getClassById;
const updateClass = async (req, res, next) => {
    try {
        const data = await classService.updateClass(asParamString(req.params.id), req.body);
        (0, response_util_1.sendSuccess)(res, data, 'Class updated');
    }
    catch (err) {
        next(err);
    }
};
exports.updateClass = updateClass;
const deleteClass = async (req, res, next) => {
    try {
        await classService.deleteClass(asParamString(req.params.id));
        (0, response_util_1.sendSuccess)(res, null, 'Class deleted');
    }
    catch (err) {
        next(err);
    }
};
exports.deleteClass = deleteClass;
// ─── Section ─────────────────────────────────────────
const createSection = async (req, res, next) => {
    try {
        const data = await classService.createSection(req.body);
        (0, response_util_1.sendSuccess)(res, data, 'Section created', 201);
    }
    catch (err) {
        next(err);
    }
};
exports.createSection = createSection;
const getSectionsByClass = async (req, res, next) => {
    try {
        const data = await classService.getSectionsByClass(asParamString(req.params.classId));
        (0, response_util_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.getSectionsByClass = getSectionsByClass;
const updateSection = async (req, res, next) => {
    try {
        const data = await classService.updateSection(asParamString(req.params.id), req.body);
        (0, response_util_1.sendSuccess)(res, data, 'Section updated');
    }
    catch (err) {
        next(err);
    }
};
exports.updateSection = updateSection;
const deleteSection = async (req, res, next) => {
    try {
        await classService.deleteSection(asParamString(req.params.id));
        (0, response_util_1.sendSuccess)(res, null, 'Section deleted');
    }
    catch (err) {
        next(err);
    }
};
exports.deleteSection = deleteSection;
