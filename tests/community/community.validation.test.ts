import { describe, expect, it } from "vitest";
import {
  communityEventCreateSchema,
  communityGuideCreateSchema,
  communityGuideUpdateSchema,
  communitySlugSchema,
  communityThreadCommentSchema,
  communityThreadCreateSchema,
  communityThreadUpdateSchema,
} from "@/lib/server/validation/community";

describe("community validation schemas", () => {
  it("accepts a valid guide payload", () => {
    const result = communityGuideCreateSchema.safeParse({
      title: "Replace a Blunt Blade",
      category: "BIKES",
      difficulty: "BEGINNER",
      readMinutes: 14,
      summary: "Learn how to replace a worn bike blade safely at home.",
      body: "Step through the removal, inspection, and reinstall process with the right torque and tools.",
      featured: true,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a shorter valid guide payload", () => {
    const result = communityGuideCreateSchema.safeParse({
      title: "Guide Title",
      category: "ELECTRONICS",
      difficulty: "BEGINNER",
      readMinutes: 10,
      summary: "Short guide summary",
      body: "This body now meets the relaxed minimum length.",
      featured: false,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid guide payload", () => {
    const result = communityGuideCreateSchema.safeParse({
      title: "No",
      category: "CARS",
      difficulty: "EASY",
      readMinutes: 1,
      summary: "Short",
      body: "Too short",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid forum thread payload", () => {
    const result = communityThreadCreateSchema.safeParse({
      title: "Best glue for chair legs?",
      category: "FURNITURE",
      body: "I need a strong adhesive for a loose chair leg and want a repair that lasts.",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a shorter valid forum thread payload", () => {
    const result = communityThreadCreateSchema.safeParse({
      title: "Quick question",
      category: "GENERAL",
      body: "Need advice on a small repair.",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a valid thread comment payload", () => {
    const result = communityThreadCommentSchema.safeParse({ body: "Try cleaning the joint first." });

    expect(result.success).toBe(true);
  });

  it("accepts a partial guide update payload", () => {
    const result = communityGuideUpdateSchema.safeParse({ title: "Updated title" });

    expect(result.success).toBe(true);
  });

  it("accepts a partial thread update payload", () => {
    const result = communityThreadUpdateSchema.safeParse({ body: "Updated body text for the thread." });

    expect(result.success).toBe(true);
  });

  it("accepts a valid event payload", () => {
    const result = communityEventCreateSchema.safeParse({
      title: "Spring Repair Cafe",
      type: "WORKSHOP",
      category: "ELECTRONICS",
      location: "Canberra City Library",
      suburb: "Canberra City",
      startsAt: "2026-04-21T10:00:00.000Z",
      endLabel: "2pm",
      summary: "Community volunteers will help diagnose broken devices.",
      spotsTotal: 30,
      featured: false,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a valid community slug", () => {
    const result = communitySlugSchema.safeParse("spring-repair-cafe");

    expect(result.success).toBe(true);
  });
});