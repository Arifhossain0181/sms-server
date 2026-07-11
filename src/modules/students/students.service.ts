import prisma from '../../config/db';

export const StudentsService = {
  async getStudentIdByUserId(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });
    return student?.id ?? null;
  },
};
