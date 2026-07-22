import type * as GradingTypes from "../../generated/prisma/models/GradingRule";
import prisma from "../../config/db";

type GradingRowInput = {
  minMark: number;
  maxMark: number;
  grade: string;
  gpaPoint: number;
  isPassing?: boolean;
};

async function assertNoOverlap(
  classId: string,
  academicYear: string | undefined,
  minMark: number,
  maxMark: number,
  excludeId?: string
) {
  const overlapping = await prisma.gradingRule.findFirst({
    where: {
      classId,
      academicYear: academicYear ?? null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      minMark: { lte: maxMark },
      maxMark: { gte: minMark },
    },
  });

  if (overlapping) {
    const err = new Error(
      `Mark range ${minMark}-${maxMark} overlaps with existing grade "${overlapping.grade}" (${overlapping.minMark}-${overlapping.maxMark}) for this class.`
    );
    (err as any).status = 400;
    throw err;
  }
}

export const createGradingRule = async (data: {
  classId: string;
  academicYear?: string;
  minMark: number;
  maxMark: number;
  grade: string;
  gpaPoint: number;
  isPassing?: boolean;
}): Promise<GradingTypes.GradingRuleModel> => {
  await assertNoOverlap(data.classId, data.academicYear, data.minMark, data.maxMark);
  return prisma.gradingRule.create({
    data: {
      classId: data.classId,
      academicYear: data.academicYear,
      minMark: data.minMark,
      maxMark: data.maxMark,
      grade: data.grade,
      gpaPoint: data.gpaPoint,
      isPassing: data.isPassing ?? true,
    },
  });
};

export const bulkUpsertGradingRules = async (data: {
  classId: string;
  academicYear?: string;
  rows: GradingRowInput[];
}): Promise<GradingTypes.GradingRuleModel[]> => {
  const sorted = [...data.rows].sort((a, b) => a.minMark - b.maxMark);

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].minMark <= sorted[i - 1].maxMark) {
      const err = new Error(
        `Overlapping rows in submitted grading scale: "${sorted[i - 1].grade}" (${sorted[i - 1].minMark}-${sorted[i - 1].maxMark}) and "${sorted[i].grade}" (${sorted[i].minMark}-${sorted[i].maxMark})`
      );
      (err as any).status = 400;
      throw err;
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.gradingRule.deleteMany({
      where: {
        classId: data.classId,
        academicYear: data.academicYear ?? null,
      },
    });

    await tx.gradingRule.createMany({
      data: data.rows.map((row) => ({
        classId: data.classId,
        academicYear: data.academicYear,
        minMark: row.minMark,
        maxMark: row.maxMark,
        grade: row.grade,
        gpaPoint: row.gpaPoint,
        isPassing: row.isPassing ?? true,
      })),
    });

    return tx.gradingRule.findMany({
      where: { classId: data.classId, academicYear: data.academicYear ?? null },
      orderBy: { minMark: "asc" },
    });
  });
};

export const listGradingRules = async (
  classId: string,
  academicYear?: string
): Promise<GradingTypes.GradingRuleModel[]> =>{
  return prisma.gradingRule.findMany({
    where: { classId, academicYear: academicYear ?? null },
    orderBy: { minMark: "asc" },
  });
};

export const updateGradingRule = async (
  id: string,
  data: Partial<GradingRowInput>
): Promise<GradingTypes.GradingRuleModel> => {
  const existing = await prisma.gradingRule.findUnique({ where: { id } });

  if (!existing) {
    const err = new Error("Grading rule not found");
    (err as any).status = 404;
    throw err;
  }

  const nextMin = data.minMark ?? existing.minMark;
  const nextMax = data.maxMark ?? existing.maxMark;

  if (nextMax < nextMin) {
    const err = new Error("maxMark must be greater than or equal to minMark");
    (err as any).status = 400;
    throw err;
  }

  return prisma.gradingRule.update({
    where: { id },
    data,
  });
};

export const deleteGradingRule = async (id: string): Promise<void> => {
  await prisma.gradingRule.delete({ where: { id } });
};
