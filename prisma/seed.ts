import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const clientPassword = await hash("ClientPass123", 12);
  const repairerPassword = await hash("RepairerPass123", 12);
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@repairhub.local";
  const adminPasswordPlain = process.env.ADMIN_SEED_PASSWORD ?? "AdminPass123";
  const adminPassword = await hash(adminPasswordPlain, 12);

  await prisma.user.upsert({
    where: { email: "client@repairhub.local" },
    update: {},
    create: {
      email: "client@repairhub.local",
      fullName: "Demo Client",
      hashedPassword: clientPassword,
      role: "CLIENT",
      onboardingCompleted: true,
      profile: {
        create: {
          suburb: "Belconnen",
          postcode: "2617",
        },
      },
      rewardWallet: {
        create: {
          points: 120,
          tier: "BRONZE",
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "repairer@repairhub.local" },
    update: {},
    create: {
      email: "repairer@repairhub.local",
      fullName: "Demo Repairer",
      hashedPassword: repairerPassword,
      role: "REPAIRER",
      onboardingCompleted: true,
      profile: {
        create: {
          suburb: "Kingston",
          postcode: "2604",
        },
      },
      repairerProfile: {
        create: {
          businessName: "Canberra Fix Co",
          verificationStatus: "VERIFIED",
          categories: {
            create: [
              { category: "ELECTRONICS", expertiseLevel: 4 },
              { category: "BIKES", expertiseLevel: 3 },
            ],
          },
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: "Demo Admin",
      hashedPassword: adminPassword,
      role: "ADMIN",
      onboardingCompleted: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
