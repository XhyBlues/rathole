import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = "admin";
  const adminEmail = "admin@rathole.local";
  const adminPassword = "admin123";

  const admin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (admin) {
    console.log("ℹ️ Admin user already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const created = await prisma.user.create({
    data: {
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Admin user created:", created.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
