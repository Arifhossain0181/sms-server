import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/response.util";
import bcrypt from "bcryptjs";

// ─── DTOs ──────────────────────────────────────────────────────────

export interface CreateSchoolAdminDto {
  name: string;
  email: string;
  password: string;
  schoolId: string;
  phone?: string;
}

export interface CreateSchoolDto {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  principalName?: string;
  principalEmail?: string;
  academicYear?: string;
  gradingScale?: string;
}

export interface UpdateSchoolDto {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  principalName?: string;
  principalEmail?: string;
  isActive?: boolean;
  academicYear?: string;
  gradingScale?: string;
}

export interface CreateSubscriptionDto {
  schoolId: string;
  plan: string;
  startDate: string;
  endDate: string;
  amount?: number;
  stripeCustomerId?: string;
  stripeSubId?: string;
}

export interface SystemSettingDto {
  key: string;
  value: string;
  description?: string;
}

// ─── SCHOOL MANAGEMENT ─────────────────────────────────────────────

export const getAllSchools = async () => {
  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          students: true,
          teachers: true,
          staff: true,
          classes: true,
          adminUsers: true,
        },
      },
    },
  });

  const enriched = await Promise.all(
    schools.map(async (school) => {
      const subscription = await prisma.subscription.findFirst({
        where: { schoolId: school.id },
        orderBy: { createdAt: "desc" },
      });

      return {
        id: school.id,
        name: school.name,
        code: school.code,
        address: school.address,
        phone: school.phone,
        email: school.email,
        principalName: school.principalName,
        principalEmail: school.principalEmail,
        isActive: school.isActive,
        academicYear: school.academicYear,
        gradingScale: school.gradingScale,
        createdAt: school.createdAt,
        stats: {
          students: school._count.students,
          teachers: school._count.teachers,
          staff: school._count.staff,
          classes: school._count.classes,
          admins: school._count.adminUsers,
        },
        subscription: subscription
          ? {
              plan: subscription.plan,
              status: subscription.status,
              startDate: subscription.startDate,
              endDate: subscription.endDate,
              amount: subscription.amount,
            }
          : null,
      };
    })
  );

  return enriched;
};

export const getSchoolById = async (schoolId: string) => {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      adminUsers: {
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      },
      _count: {
        select: { students: true, teachers: true, staff: true, classes: true },
      },
    },
  });

  if (!school) return null;

  const subscription = await prisma.subscription.findFirst({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
  });

  return {
    ...school,
    subscription,
  };
};

export const createSchool = async (dto: CreateSchoolDto) => {
  const existing = await prisma.school.findUnique({ where: { code: dto.code } });
  if (existing) {
    const err = new Error("School with this code already exists");
    (err as any).status = 409;
    throw err;
  }

  const school = await prisma.school.create({
    data: {
      name: dto.name,
      code: dto.code,
      address: dto.address,
      phone: dto.phone,
      email: dto.email,
      principalName: dto.principalName,
      principalEmail: dto.principalEmail,
      academicYear: dto.academicYear,
      gradingScale: dto.gradingScale,
    },
  });

  return school;
};

export const updateSchool = async (schoolId: string, dto: UpdateSchoolDto) => {
  if (dto.code) {
    const existing = await prisma.school.findFirst({
      where: { code: dto.code, id: { not: schoolId } },
    });
    if (existing) {
      const err = new Error("School with this code already exists");
      (err as any).status = 409;
      throw err;
    }
  }

  const school = await prisma.school.update({
    where: { id: schoolId },
    data: dto,
  });

  return school;
};

export const suspendSchool = async (schoolId: string) => {
  const school = await prisma.school.update({
    where: { id: schoolId },
    data: { isActive: false },
  });

  await prisma.user.updateMany({
    where: { schoolId },
    data: { isActive: false },
  });

  return school;
};

export const reactivateSchool = async (schoolId: string) => {
  const school = await prisma.school.update({
    where: { id: schoolId },
    data: { isActive: true },
  });

  await prisma.user.updateMany({
    where: { schoolId },
    data: { isActive: true },
  });

  return school;
};

export const deleteSchool = async (schoolId: string) => {
  await prisma.school.delete({ where: { id: schoolId } });
};

// ─── SCHOOL ADMIN MANAGEMENT ───────────────────────────────────────

export const createSchoolAdmin = async (dto: CreateSchoolAdminDto) => {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) {
    const err = new Error("User with this email already exists");
    (err as any).status = 409;
    throw err;
  }

  const school = await prisma.school.findUnique({ where: { id: dto.schoolId } });
  if (!school) {
    const err = new Error("School not found");
    (err as any).status = 404;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = await prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      passwordHash: hashedPassword,
      role: "SCHOOL_ADMIN",
      schoolId: dto.schoolId,
      adminProfile: {
        create: {
          name: dto.name,
          phone: dto.phone,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      schoolId: true,
    },
  });

  return user;
};

export const updateSchoolAdmin = async (userId: string, data: { name?: string; email?: string; phone?: string; isActive?: boolean }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "SCHOOL_ADMIN") {
    const err = new Error("School Admin not found");
    (err as any).status = 404;
    throw err;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      isActive: data.isActive,
      adminProfile: data.phone ? { update: { phone: data.phone } } : undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      schoolId: true,
      adminProfile: { select: { phone: true } },
    },
  });

  return updated;
};

export const deactivateSchoolAdmin = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "SCHOOL_ADMIN") {
    const err = new Error("School Admin not found");
    (err as any).status = 404;
    throw err;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return updated;
};

// ─── ALL USERS ─────────────────────────────────────────────────────

export const getAllUsers = async (filters?: { role?: string; schoolId?: string; isActive?: boolean }) => {
  const where: any = {};
  if (filters?.role) where.role = filters.role;
  if (filters?.schoolId) where.schoolId = filters.schoolId;
  if (typeof filters?.isActive === "boolean") where.isActive = filters.isActive;

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      schoolId: true,
      school: { select: { id: true, name: true, code: true } },
      adminProfile: { select: { phone: true } },
      teacherProfile: { select: { employeeId: true, designation: true } },
      studentProfile: { select: { studentId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
};

// ─── AUDIT LOGS ────────────────────────────────────────────────────

export const getAuditLogs = async (filters?: { userId?: string; action?: string; page?: number; limit?: number }) => {
  const where: any = {};
  if (filters?.userId) where.userId = filters.userId;
  if (filters?.action) where.action = { contains: filters.action };

  const page = Math.max(1, filters?.page ?? 1);
  const take = filters?.limit ?? 20;
  const skip = (page - 1) * take;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, totalPages: Math.max(1, Math.ceil(total / take)) };
};

// ─── RBAC ──────────────────────────────────────────────────────────

export const updateRolePermissions = async (role: string, permissions: string[]) => {
  // This is currently handled client-side in roles.ts
  // In a full implementation, permissions would be stored in DB
  return { role, permissions };
};

// ─── BACKUP ────────────────────────────────────────────────────────

export const triggerBackup = async (requestedBy: string) => {
  const log = await prisma.auditLog.create({
    data: {
      userId: requestedBy,
      action: "TRIGGER_BACKUP",
      metadata: { timestamp: new Date().toISOString() },
    },
  });

  return {
    success: true,
    message: "Backup triggered successfully",
    backupId: log.id,
    timestamp: log.createdAt,
  };
};

// ─── SYSTEM SETTINGS ───────────────────────────────────────────────

export const getSystemSettings = async () => {
  const settings = await prisma.systemSettings.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return map;
};

export const updateSystemSetting = async (key: string, value: string, updatedBy: string, description?: string) => {
  const setting = await prisma.systemSettings.upsert({
    where: { key },
    update: { value, description, updatedBy },
    create: { key, value, description, updatedBy },
  });
  return setting;
};

// ─── SUBSCRIPTION ──────────────────────────────────────────────────

export const createSubscription = async (dto: CreateSubscriptionDto) => {
  const school = await prisma.school.findUnique({ where: { id: dto.schoolId } });
  if (!school) {
    const err = new Error("School not found");
    (err as any).status = 404;
    throw err;
  }

  const subscription = await prisma.subscription.create({
    data: {
      schoolId: dto.schoolId,
      plan: dto.plan,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      amount: dto.amount,
      stripeCustomerId: dto.stripeCustomerId,
      stripeSubId: dto.stripeSubId,
    },
  });

  return subscription;
};

export const updateSubscription = async (subscriptionId: string, data: { plan?: string; status?: string; endDate?: string; amount?: number }) => {
  const subscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      ...data,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });
  return subscription;
};

// ─── PLATFORM ANALYTICS ────────────────────────────────────────────

export const getPlatformAnalytics = async () => {
  const [
    totalSchools,
    activeSchools,
    totalStudents,
    totalTeachers,
    totalStaff,
    totalClasses,
    totalUsers,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.school.count(),
    prisma.school.count({ where: { isActive: true } }),
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.staff.count(),
    prisma.class.count(),
    prisma.user.count(),
    prisma.auditLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const schoolBreakdown = await prisma.school.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,
      _count: { select: { students: true, teachers: true, classes: true } },
    },
  });

  return {
    totalSchools,
    activeSchools,
    inactiveSchools: totalSchools - activeSchools,
    totalStudents,
    totalTeachers,
    totalStaff,
    totalClasses,
    totalUsers,
    recentAuditLogs,
    schoolBreakdown,
  };
};

// ─── REVENUE REPORT ────────────────────────────────────────────────

export const getRevenueReport = async () => {
  const allPayments = await prisma.payment.findMany({
    select: {
      id: true,
      amount: true,
      status: true,
      method: true,
      paidAt: true,
      student: {
        select: {
          schoolId: true,
          school: { select: { id: true, name: true, code: true } },
        },
      },
    },
    orderBy: { paidAt: "desc" },
  });

  const totalRevenue = allPayments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const bySchool: Record<string, { name: string; code: string; revenue: number; count: number }> = {};
  for (const p of allPayments) {
    if (p.status !== "PAID") continue;
    const sid = p.student?.schoolId ?? "unknown";
    const s = p.student?.school;
    const key = s?.id ?? sid;
    if (!bySchool[key]) {
      bySchool[key] = { name: s?.name ?? "Unknown", code: s?.code ?? "N/A", revenue: 0, count: 0 };
    }
    bySchool[key].revenue += p.amount ?? 0;
    bySchool[key].count += 1;
  }

  return {
    totalRevenue,
    totalTransactions: allPayments.filter((p) => p.status === "PAID").length,
    bySchool: Object.values(bySchool),
  };
};
