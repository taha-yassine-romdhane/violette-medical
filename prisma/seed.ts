import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  try {
    // Credentials come from the environment so no real password lives in git.
    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@violette-medical.tn";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error(
        "SEED_ADMIN_PASSWORD is not set. Add it to .env before running the seed."
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { isActive: true },
      create: {
        email: adminEmail,
        password: hashedPassword,
        name: "Administrateur",
        role: "ADMIN",
        companyName: "Violette Medical Distribution",
        isActive: true,
      },
    });

    console.log(`Admin account created/verified: ${admin.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
