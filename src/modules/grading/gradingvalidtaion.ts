import { z } from "zod";

// 
// A single grade-band row, e.g. { minMark: 80, maxMark: 100, grade: "A+", gpaPoint: 5.0 }
const gradingRowSchema = z
  .object({
    minMark: z.number().min(0).max(100),
    maxMark: z.number().min(0).max(100),
    grade: z.string().min(1).max(10),
    gpaPoint: z.number().min(0).max(5),
    isPassing: z.boolean().optional().default(true),
  })
  .refine((row :any) => row.maxMark >= row.minMark, {
    message: "maxMark must be greater than or equal to minMark",
    path: ["maxMark"],
  });

// POST /exams/grading-rules  (create a single row)
export const createGradingRuleSchema = z.object({
  body: z
    .object({
      classId: z.string().min(1, "classId is required"),
      academicYear: z.string().optional(),
      minMark: z.number().min(0).max(100),
      maxMark: z.number().min(0).max(100),
      grade: z.string().min(1).max(10),
      gpaPoint: z.number().min(0).max(5),
      isPassing: z.boolean().optional().default(true),
    })
    .refine((data) => data.maxMark >= data.minMark, {
      message: "maxMark must be greater than or equal to minMark",
      path: ["maxMark"],
    }),
});

// POST /exams/grading-rules/bulk  (replace the whole scale for a class in one call)
export const bulkUpsertGradingRulesSchema = z.object({
  body: z.object({
    classId: z.string().min(1, "classId is required"),
    academicYear: z.string().optional(),
    rows: z.array(gradingRowSchema).min(1, "At least one grading row is required"),
  }),
});

// PUT /exams/grading-rules/:id
export const updateGradingRuleSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z
    .object({
      minMark: z.number().min(0).max(100).optional(),
      maxMark: z.number().min(0).max(100).optional(),
      grade: z.string().min(1).max(10).optional(),
      gpaPoint: z.number().min(0).max(5).optional(),
      isPassing: z.boolean().optional(),
    })
    .refine(
      (data) =>
        data.minMark === undefined ||
        data.maxMark === undefined ||
        data.maxMark >= data.minMark,
      { message: "maxMark must be greater than or equal to minMark", path: ["maxMark"] }
    ),
});

// GET /exams/grading-rules?classId=...&academicYear=...
export const listGradingRulesSchema = z.object({
  query: z.object({
    classId: z.string().min(1, "classId is required"),
    academicYear: z.string().optional(),
  }),
});

// DELETE /exams/grading-rules/:id
export const deleteGradingRuleSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});