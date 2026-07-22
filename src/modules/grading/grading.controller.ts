import { Request, Response, NextFunction } from "express";
import * as gradingService from "./grading.service";
import { sendSuccess, sendError } from "../../utils/response.util";
import { authenticate } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const EXAM_STAFF = ["EXAM_CONTROLLER", "SCHOOL_ADMIN", "SUPER_ADMIN"] as const;

function extractValidationError(field: string, message: string) {
  return `${field}: ${message}`;
}

function validateCreateRule(body: any): string | null {
  if (!body || typeof body !== "object") return "Request body is required";
  if (typeof body.classId !== "string" || !body.classId.trim()) return extractValidationError("classId", "is required");
  if (typeof body.academicYear !== "undefined" && typeof body.academicYear !== "string") return extractValidationError("academicYear", "must be a string");
  if (typeof body.minMark !== "number" || body.minMark < 0 || body.minMark > 100) return extractValidationError("minMark", "must be a number between 0 and 100");
  if (typeof body.maxMark !== "number" || body.maxMark < 0 || body.maxMark > 100) return extractValidationError("maxMark", "must be a number between 0 and 100");
  if (typeof body.grade !== "string" || body.grade.length < 1 || body.grade.length > 10) return extractValidationError("grade", "must be a string between 1 and 10 characters");
  if (typeof body.gpaPoint !== "number" || body.gpaPoint < 0 || body.gpaPoint > 5) return extractValidationError("gpaPoint", "must be a number between 0 and 5");
  if (body.maxMark < body.minMark) return extractValidationError("maxMark", "must be greater than or equal to minMark");
  return null;
}

function validateBulkUpsert(body: any): string | null {
  if (!body || typeof body !== "object") return "Request body is required";
  if (typeof body.classId !== "string" || !body.classId.trim()) return extractValidationError("classId", "is required");
  if (typeof body.academicYear !== "undefined" && typeof body.academicYear !== "string") return extractValidationError("academicYear", "must be a string");
  if (!Array.isArray(body.rows) || body.rows.length === 0) return extractValidationError("rows", "must be a non-empty array");

  for (let i = 0; i < body.rows.length; i++) {
    const row = body.rows[i];
    if (!row || typeof row !== "object") return `Row ${i + 1}: must be an object`;
    if (typeof row.minMark !== "number" || row.minMark < 0 || row.minMark > 100) return `Row ${i + 1}: minMark must be a number between 0 and 100`;
    if (typeof row.maxMark !== "number" || row.maxMark < 0 || row.maxMark > 100) return `Row ${i + 1}: maxMark must be a number between 0 and 100`;
    if (typeof row.grade !== "string" || row.grade.length < 1 || row.grade.length > 10) return `Row ${i + 1}: grade must be a string between 1 and 10 characters`;
    if (typeof row.gpaPoint !== "number" || row.gpaPoint < 0 || row.gpaPoint > 5) return `Row ${i + 1}: gpaPoint must be a number between 0 and 5`;
    if (row.maxMark < row.minMark) return `Row ${i + 1}: maxMark must be greater than or equal to minMark`;
  }
  return null;
}

function validateUpdateRule(params: any, body: any): string | null {
  if (!params || typeof params.id !== "string" || !params.id.trim()) return extractValidationError("id", "is required");
  if (!body || typeof body !== "object") return "Request body is required";
  if (typeof body.minMark !== "undefined" && (typeof body.minMark !== "number" || body.minMark < 0 || body.minMark > 100)) return extractValidationError("minMark", "must be a number between 0 and 100");
  if (typeof body.maxMark !== "undefined" && (typeof body.maxMark !== "number" || body.maxMark < 0 || body.maxMark > 100)) return extractValidationError("maxMark", "must be a number between 0 and 100");
  if (typeof body.grade !== "undefined" && (typeof body.grade !== "string" || body.grade.length < 1 || body.grade.length > 10)) return extractValidationError("grade", "must be a string between 1 and 10 characters");
  if (typeof body.gpaPoint !== "undefined" && (typeof body.gpaPoint !== "number" || body.gpaPoint < 0 || body.gpaPoint > 5)) return extractValidationError("gpaPoint", "must be a number between 0 and 5");
  if (typeof body.isPassing !== "undefined" && typeof body.isPassing !== "boolean") return extractValidationError("isPassing", "must be a boolean");
  if (body.maxMark !== undefined && body.minMark !== undefined && body.maxMark < body.minMark) return extractValidationError("maxMark", "must be greater than or equal to minMark");
  return null;
}

function validateListQuery(query: any): string | null {
  if (!query || typeof query !== "object") return "Query parameters are required";
  if (typeof query.classId !== "string" || !query.classId.trim()) return extractValidationError("classId", "is required");
  if (typeof query.academicYear !== "undefined" && typeof query.academicYear !== "string") return extractValidationError("academicYear", "must be a string");
  return null;
}

export const createGradingRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationError = validateCreateRule(req.body);
    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const rule = await gradingService.createGradingRule(req.body);
    sendSuccess(res, rule, "Grading rule created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const bulkUpsertGradingRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationError = validateBulkUpsert(req.body);
    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const rules = await gradingService.bulkUpsertGradingRules(req.body);
    sendSuccess(res, rules, "Grading scale saved successfully");
  } catch (err) {
    next(err);
  }
};

export const listGradingRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationError = validateListQuery(req.query);
    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const { classId, academicYear } = req.query as { classId: string; academicYear?: string };
    const rules = await gradingService.listGradingRules(classId, academicYear);
    sendSuccess(res, rules, "Grading rules retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const updateGradingRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationError = validateUpdateRule(req.params, req.body);
    if (validationError) {
      return sendError(res, validationError, 400);
    }

    const rule = await gradingService.updateGradingRule(String(req.params.id), req.body);
    sendSuccess(res, rule, "Grading rule updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteGradingRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.params.id || typeof req.params.id !== "string" || !req.params.id.trim()) {
      return sendError(res, "id is required", 400);
    }

    await gradingService.deleteGradingRule(req.params.id);
    sendSuccess(res, null, "Grading rule deleted successfully");
  } catch (err) {
    next(err);
  }
};
