import prisma from "../../config/db";

export const getSchoolAdminDashboard = async () => {
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
    prisma.student.count({ where: { isActive: true } }),
    prisma.teacher.count({ where: { isActive: true } }),
    prisma.class.count(),
    getTodayAttendanceSummary(),
    getFeeSummary(),
    getRecentAdmissions(),
    getUpcomingExams(),
    getLibraryStats(),
  ]);

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

async function getTodayAttendanceSummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const records = await prisma.studentAttendance.findMany({
    where: { date: today },
    select: { status: true },
  });

  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const total = records.length;

  return { present, absent, late, total, date: today.toISOString().split("T")[0] };
}

async function getFeeSummary() {
  const [totalPending, totalPaid, totalCollected] = await Promise.all([
    prisma.feeStructure.count({ where: { status: "PENDING" } }),
    prisma.feeStructure.count({ where: { status: "PAID" } }),
    prisma.feeStructure.aggregate({
      where: { status: "PAID" },
      _sum: { Paidamount: true },
    }),
  ]);

  return {
    totalPending,
    totalPaid,
    totalCollected: totalCollected._sum.Paidamount ?? 0,
  };
}

async function getRecentAdmissions() {
  const admissions = await prisma.admissionApplication.findMany({
    where: { status: "PENDING" },
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

async function getUpcomingExams() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exams = await prisma.exam.findMany({
    where: {
      schedules: {
        some: {
          examDate: { gte: today },
        },
      },
    },
    include: {
      schedules: {
        where: { examDate: { gte: today } },
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

async function getLibraryStats() {
  const [totalBooks, totalIssued, overdueIssues] = await Promise.all([
    prisma.book.count(),
    prisma.bookIssue.count({ where: { returnDate: null } }),
    prisma.bookIssue.count({
      where: {
        returnDate: null,
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  return {
    totalBooks,
    totalIssued,
    overdueIssues,
  };
}
