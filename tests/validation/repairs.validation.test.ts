import { describe, expect, it } from "vitest";
import { repairJobCreateSchema } from "@/lib/server/validation/repairs";

describe("repair request validation", () => {
  it("accepts a valid repair request payload", () => {
    const result = repairJobCreateSchema.safeParse({
      title: "Broken laptop screen",
      description: "The screen has a crack across the top-right corner and flickers when opened.",
      category: "ELECTRONICS",
      suburb: "Belconnen",
      streetAddress: "10 Lonsdale St",
      urgency: "NORMAL",
      pickupOption: "DROP_OFF",
      imageUrls: ["https://example.com/image.jpg"],
    });

    expect(result.success).toBe(true);
  });

  it("accepts empty street address for optional field", () => {
    const result = repairJobCreateSchema.safeParse({
      title: "Broken laptop screen",
      description: "The screen has a crack across the top-right corner and flickers when opened.",
      category: "ELECTRONICS",
      suburb: "Belconnen",
      streetAddress: "",
      urgency: "NORMAL",
      pickupOption: "DROP_OFF",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid address and category", () => {
    const result = repairJobCreateSchema.safeParse({
      title: "Broken laptop screen",
      description: "The screen has a crack across the top-right corner and flickers when opened.",
      category: "CARS",
      suburb: "Belconnen",
      streetAddress: "x",
      urgency: "NORMAL",
      pickupOption: "DROP_OFF",
    });

    expect(result.success).toBe(false);
  });
});
