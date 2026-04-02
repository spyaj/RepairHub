import { z } from "zod";
import {
  communityDifficultyLevels,
  communityEventTypes,
  communityForumCategories,
  communityGuideCategories,
} from "@/lib/server/community/content";

const trimOptionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(160).optional(),
);

export const communityGuideCreateSchema = z.object({
  title: z.string().min(4).max(120),
  category: z.enum(communityGuideCategories),
  difficulty: z.enum(communityDifficultyLevels),
  readMinutes: z.coerce.number().int().min(3).max(60),
  summary: z.string().min(10).max(220),
  body: z.string().min(20).max(4000),
  featured: z.coerce.boolean().optional().default(false),
});

export const communityGuideUpdateSchema = z
  .object({
    title: z.string().min(4).max(120).optional(),
    category: z.enum(communityGuideCategories).optional(),
    difficulty: z.enum(communityDifficultyLevels).optional(),
    readMinutes: z.coerce.number().int().min(3).max(60).optional(),
    summary: z.string().min(10).max(220).optional(),
    body: z.string().min(20).max(4000).optional(),
    featured: z.coerce.boolean().optional(),
  })
  .refine((input) => Object.values(input).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export const communityThreadCreateSchema = z.object({
  title: z.string().min(2).max(120),
  category: z.enum(communityForumCategories),
  body: z.string().min(2).max(4000),
});

export const communityThreadUpdateSchema = z
  .object({
    title: z.string().min(2).max(120).optional(),
    category: z.enum(communityForumCategories).optional(),
    body: z.string().min(2).max(4000).optional(),
    featured: z.coerce.boolean().optional(),
  })
  .refine((input) => Object.values(input).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export const communityThreadCommentSchema = z.object({
  body: z.string().min(2).max(1000),
});

export const communityEventCreateSchema = z.object({
  title: z.string().min(4).max(120),
  type: z.enum(communityEventTypes),
  category: z.enum(communityGuideCategories),
  location: z.string().min(2).max(120),
  suburb: z.string().min(2).max(80),
  startsAt: z.string().datetime(),
  endLabel: z.string().min(1).max(20),
  summary: z.string().min(10).max(240),
  spotsTotal: z.coerce.number().int().min(1).max(500),
  featured: z.coerce.boolean().optional().default(false),
});

export const communityEventUpdateSchema = z
  .object({
    title: z.string().min(4).max(120).optional(),
    type: z.enum(communityEventTypes).optional(),
    category: z.enum(communityGuideCategories).optional(),
    location: z.string().min(2).max(120).optional(),
    suburb: z.string().min(2).max(80).optional(),
    startsAt: z.string().datetime().optional(),
    endLabel: z.string().min(1).max(20).optional(),
    summary: z.string().min(10).max(240).optional(),
    spotsTotal: z.coerce.number().int().min(1).max(500).optional(),
    featured: z.coerce.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "At least one field is required",
  });

export const communitySlugSchema = z
  .string()
  .trim()
  .min(2)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const communityOptionalNoteSchema = trimOptionalText;