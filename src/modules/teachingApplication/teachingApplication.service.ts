import prisma from "../../config/db";
import { CreateTeachingApplicationDto, UpdateTeachingApplicationStatusDto } from "./teachingApplication.dto";

export const applyForTeaching = async (dto: CreateTeachingApplicationDto) => {
  const existing = await prisma.teachingApplication.findFirst({
    where: {
      email: dto.email,
      status: "PENDING",
    },
  });

  if (existing) {
    throw new Error("An application with this email is already pending");
  }

  return prisma.teachingApplication.create({
    data: {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      gender: dto.gender,
      dob: new Date(dto.dob),
      address: dto.address,
      designation: dto.designation,
      department: dto.department,
      qualification: dto.qualification,
      experience: dto.experience,
      subjectSpecialization: dto.subjectSpecialization,
      expectedSalary: dto.expectedSalary,
      resumeUrl: dto.resumeUrl,
      coverLetter: dto.coverLetter,
    },
  });
};

export const listTeachingApplications = async () => {
  return prisma.teachingApplication.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getTeachingApplicationById = async (id: string) => {
  const application = await prisma.teachingApplication.findUnique({
    where: { id },
  });
  if (!application) throw { status: 404, message: "Application not found" };
  return application;
};

export const updateTeachingApplicationStatus = async (
  id: string,
  dto: UpdateTeachingApplicationStatusDto
) => {
  await getTeachingApplicationById(id);
  return prisma.teachingApplication.update({
    where: { id },
    data: {
      status: dto.status,
      rejectionReason: dto.rejectionReason,
      reviewedAt: new Date(),
    },
  });
};
