import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.email(),
  phone: z.string().min(8).max(20),
  role: z.enum(["CLIENT", "REPAIRER"]),
  suburb: z.string().min(2).max(80),
  streetAddress: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(160).optional(),
  ),
  password: z.string().min(8).max(72),
});

export const onboardingSchema = z.object({
  role: z.enum(["CLIENT", "REPAIRER", "ADMIN"]),
  suburb: z.string().min(2),
  streetAddress: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(3).max(160).optional(),
  ),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
