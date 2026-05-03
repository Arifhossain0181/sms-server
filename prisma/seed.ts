import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getEnv = (key: string, fallback: string) => process.env[key] ?? fallback;

async function main() {
  const email = getEnv("SEED_ADMIN_EMAIL", "admin@school.com");
  const password = getEnv("SEED_ADMIN_PASSWORD", "Admin@1234");
  const name = getEnv("SEED_ADMIN_NAME", "System Admin");
  const phone = getEnv("SEED_ADMIN_PHONE", "");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
      adminProfile: {
        create: {
          name,
          phone: phone || null,
        },
      },
    },
    update: {
      name,
      passwordHash,
      role: "ADMIN",
      isActive: true,
      adminProfile: {
        upsert: {
          create: {
            name,
            phone: phone || null,
          },
          update: {
            name,
            phone: phone || null,
          },
        },
      },
    },
    include: { adminProfile: true },
  });

  console.log("Seeded admin:", {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
