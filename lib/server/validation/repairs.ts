import { z } from "zod";

export const repairJobCreateSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(20).max(2000),
  category: z.enum(["ELECTRONICS", "FURNITURE", "CLOTHING", "BIKES"]),
  suburb: z.string().min(2).max(80),
  streetAddress: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(3).max(160).optional(),
  ),
  urgency: z.enum(["NORMAL", "URGENT"]).default("NORMAL"),
  pickupOption: z.enum(["DROP_OFF", "PICKUP_DELIVERY"]).default("DROP_OFF"),
  imageUrls: z.array(z.string().url()).max(6).optional(),
});
