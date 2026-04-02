import { hash } from "bcryptjs";
import { connectMongo } from "@/lib/server/db/mongo";
import { AuthUser } from "@/lib/server/db/models/user";

let ensured = false;

export async function ensureAdminSeedUser() {
  if (ensured) {
    return;
  }

  await connectMongo();

  const adminEmail = process.env.ADMIN_SEED_EMAIL?.toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminEmail || !adminPassword) {
    ensured = true;
    return;
  }

  const existing = await AuthUser.findOne({ email: adminEmail }).select("_id").lean();

  if (!existing) {
    const hashedPassword = await hash(adminPassword, 12);
    await AuthUser.create({
      email: adminEmail,
      fullName: "Admin",
      hashedPassword,
      role: "ADMIN",
      onboardingCompleted: true,
    });
  }

  ensured = true;
}
