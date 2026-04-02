import { Schema, model, models, type Model } from "mongoose";

type RepairCategory = "ELECTRONICS" | "FURNITURE" | "CLOTHING" | "BIKES";
type UrgencyLevel = "NORMAL" | "URGENT";
type PickupOption = "DROP_OFF" | "PICKUP_DELIVERY";
type JobStatus = "PUBLISHED";

type RepairJobRecord = {
  clientId: string;
  title: string;
  description: string;
  category: RepairCategory;
  suburb: string;
  streetAddress?: string;
  urgency: UrgencyLevel;
  pickupOption: PickupOption;
  status: JobStatus;
  imageUrls?: string[];
  createdAt?: Date;
};

const repairJobSchema = new Schema<RepairJobRecord>(
  {
    clientId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["ELECTRONICS", "FURNITURE", "CLOTHING", "BIKES"],
      required: true,
    },
    suburb: { type: String, required: true },
    streetAddress: { type: String },
    urgency: {
      type: String,
      enum: ["NORMAL", "URGENT"],
      required: true,
    },
    pickupOption: {
      type: String,
      enum: ["DROP_OFF", "PICKUP_DELIVERY"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PUBLISHED"],
      required: true,
      default: "PUBLISHED",
    },
    imageUrls: [{ type: String }],
  },
  { timestamps: true },
);

export const RepairJob =
  (models.RepairJob as Model<RepairJobRecord> | undefined) ??
  model<RepairJobRecord>("RepairJob", repairJobSchema, "repairJobs");
