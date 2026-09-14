import prisma from "../../config/db";

export const getSchoolAdminDashboard = async (schoolId?: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    todayAttendance,
    feeSummary,
    recentAdmissions,
    upcomingExams,
    libraryStats,
  ] = await Promise.all([
    prisma.student.count({ where: { isActive: true, ...(schoolId ? { schoolId } : {}) } }),
    prisma.teacher.count({ where: { isActive: true, ...(schoolId ? { schoolId } : {}) } }),
    prisma.class.count({ where: schoolId ? { schoolId } : undefined }),
    getTodayAttendanceSummary(schoolId),
    getFeeSummary(schoolId),
    getRecentAdmissions(schoolId),
    getUpcomingExams(schoolId),
    getLibraryStats(schoolId),
  ]).catch((err) => {
    console.error('[DASHBOARD] Promise.all failed:', err);
    throw err;
  });

  return {
    totalStudents,
    totalTeachers,
    totalClasses,
    attendance: todayAttendance,
    fees: feeSummary,
    library: libraryStats,
    recentAdmissions,
    upcomingExams,
  };
};

async function getTodayAttendanceSummary(schoolId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const records = await prisma.studentAttendance.findMany({
    where: { date: today, ...(schoolId ? { student: { schoolId } } : {}) },
    select: { status: true },
  });

  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const total = records.length;

  return { present, absent, late, total, date: today.toISOString().split("T")[0] };
}

async function getFeeSummary(schoolId?: string) {
  const feeScope = schoolId ? { class: { schoolId } } : undefined;
  const paymentScope = schoolId ? { student: { schoolId } } : undefined;
  const admissionScope = schoolId ? { targetClass: { schoolId } } : undefined;
  const [totalPending, totalPaid, totalCollected, paymentMethods, paymentStatuses, admissionPayments] = await Promise.all([
    prisma.feeStructure.count({ where: { status: "PENDING", ...feeScope } }),
    prisma.feeStructure.count({ where: { status: "PAID", ...feeScope } }),
    prisma.payment.aggregate({
      where: { status: "PAID", ...paymentScope },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["method"],
      where: { status: "PAID", ...paymentScope },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      where: paymentScope,
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.admissionApplication.aggregate({
      where: { paymentStatus: "PAID", paymentAmount: { not: null }, ...admissionScope },
      _sum: { paymentAmount: true },
      _count: { id: true },
    }),
  ]);

  const admissionMethodGroups = await prisma.admissionApplication.groupBy({
    by: ["paymentMethod"],
    where: { paymentStatus: "PAID", paymentAmount: { not: null }, ...admissionScope },
    _sum: { paymentAmount: true },
    _count: { id: true },
  });

  const byMethod = Object.fromEntries(
    paymentMethods.map((item) => [item.method, { amount: item._sum.amount ?? 0, count: item._count.id }])
  );
  const byStatus = Object.fromEntries(
    paymentStatuses.map((item) => [item.status, { amount: item._sum.amount ?? 0, count: item._count.id }])
  );

  return {
    totalPending,
    totalPaid,
    totalCollected: (totalCollected._sum.amount ?? 0) + (admissionPayments._sum.paymentAmount ?? 0),
    totalPayments: paymentStatuses.reduce((sum, item) => sum + item._count.id, 0) + admissionPayments._count.id,
    cashCollected:
      (byMethod.CASH?.amount ?? 0) +
      (admissionMethodGroups.find((item) => item.paymentMethod === "CASH")?._sum.paymentAmount ?? 0),
    cashPayments:
      (byMethod.CASH?.count ?? 0) +
      (admissionMethodGroups.find((item) => item.paymentMethod === "CASH")?._count.id ?? 0),
    stripeCollected:
      (byMethod.STRIPE?.amount ?? 0) +
      (admissionMethodGroups.find((item) => item.paymentMethod === "STRIPE")?._sum.paymentAmount ?? 0),
    stripePayments:
      (byMethod.STRIPE?.count ?? 0) +
      (admissionMethodGroups.find((item) => item.paymentMethod === "STRIPE")?._count.id ?? 0),
    paymentStatuses: byStatus,
  };
}

async function getRecentAdmissions(schoolId?: string) {
  const admissions = await prisma.admissionApplication.findMany({
    where: { status: "PENDING", ...(schoolId ? { targetClass: { schoolId } } : {}) },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      applicantName: true,
      targetClass: { select: { name: true } },
      createdAt: true,
      status: true,
    },
  });

  return admissions;
}

async function getUpcomingExams(schoolId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exams = await prisma.exam.findMany({
    where: {
      schedules: {
        some: {
          examDate: { gte: today },
          ...(schoolId ? { class: { schoolId } } : {}),
        },
      },
    },
    include: {
      schedules: {
        where: { examDate: { gte: today }, ...(schoolId ? { class: { schoolId } } : {}) },
        select: { examDate: true },
        orderBy: { examDate: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return exams.map((exam) => ({
    id: exam.id,
    name: exam.name,
    type: exam.type,
    nextExamDate: exam.schedules[0]?.examDate ?? null,
  }));
}

async function getLibraryStats(schoolId?: string) {
  const issueScope = schoolId ? { student: { schoolId } } : undefined;
  const [totalBooks, totalIssued, overdueIssues] = await Promise.all([
    prisma.book.count({ where: schoolId ? { issues: { some: issueScope } } : undefined }),
    prisma.bookIssue.count({ where: { returnDate: null, ...issueScope } }),
    prisma.bookIssue.count({
      where: {
        returnDate: null,
        dueDate: { lt: new Date() },
        ...issueScope,
      },
    }),
  ]);

  return {
    totalBooks,
    totalIssued,
    overdueIssues,
  };
}
