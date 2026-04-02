import { describe, expect, it } from "vitest";
import { credentialsSchema, onboardingSchema, signupSchema } from "@/lib/server/validation/auth";

describe("auth validation schemas", () => {
  it("accepts valid signup payload", () => {
    const result = signupSchema.safeParse({
      fullName: "Ayesha Khan",
      email: "ayesha@example.com",
      phone: "0400000000",
      role: "CLIENT",
      suburb: "Belconnen",
      streetAddress: "12 Main St",
      password: "securePass123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid signup payload", () => {
    const result = signupSchema.safeParse({
      fullName: "A",
      email: "invalid-email",
      password: "123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid onboarding address", () => {
    const result = onboardingSchema.safeParse({
      role: "CLIENT",
      suburb: "Belconnen",
      streetAddress: "A",
    });

    expect(result.success).toBe(false);
  });

  it("requires minimum credentials for sign-in", () => {
    const result = credentialsSchema.safeParse({
      email: "a@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});
