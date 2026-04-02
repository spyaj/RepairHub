type Role = "CLIENT" | "REPAIRER" | "ADMIN";

export function isValidRole(role: string): role is Role {
  return role === "CLIENT" || role === "REPAIRER" || role === "ADMIN";
}

export function isAllowedOnboardingRole(role: string): boolean {
  return role === "CLIENT" || role === "REPAIRER";
}
