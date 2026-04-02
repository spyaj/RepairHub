import { describe, expect, it } from "vitest";
import { isAllowedOnboardingRole, isValidRole } from "@/lib/server/auth/roles";

describe("auth roles", () => {
  it("accepts valid roles", () => {
    expect(isValidRole("CLIENT")).toBe(true);
    expect(isValidRole("REPAIRER")).toBe(true);
    expect(isValidRole("ADMIN")).toBe(true);
  });

  it("rejects invalid roles", () => {
    expect(isValidRole("GUEST")).toBe(false);
  });

  it("enforces onboarding role rules", () => {
    expect(isAllowedOnboardingRole("CLIENT")).toBe(true);
    expect(isAllowedOnboardingRole("REPAIRER")).toBe(true);
    expect(isAllowedOnboardingRole("ADMIN")).toBe(false);
  });
});
