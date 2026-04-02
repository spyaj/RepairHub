import { Schema, model, models, type Model } from "mongoose";

type CommunityEventRecord = {
  slug: string;
  title: string;
  type: "REPAIR_CAFE" | "WORKSHOP" | "MEETUP" | "BIKE_DAY";
  category: "ELECTRONICS" | "FURNITURE" | "CLOTHING" | "BIKES";
  location: string;
  suburb: string;
  startsAt: Date;
  endLabel: string;
  summary: string;
  hostName: string;
  createdById?: string;
  createdByName?: string;
  spotsTotal: number;
  joinedBy: string[];
  featured: boolean;
};

const communityEventSchema = new Schema<CommunityEventRecord>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    type: { type: String, required: true, enum: ["REPAIR_CAFE", "WORKSHOP", "MEETUP", "BIKE_DAY"] },
    category: { type: String, required: true, enum: ["ELECTRONICS", "FURNITURE", "CLOTHING", "BIKES"] },
    location: { type: String, required: true },
    suburb: { type: String, required: true },
    startsAt: { type: Date, required: true },
    endLabel: { type: String, required: true },
    summary: { type: String, required: true },
    hostName: { type: String, required: true },
    createdById: { type: String, index: true },
    createdByName: { type: String },
    spotsTotal: { type: Number, required: true },
    joinedBy: [{ type: String }],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const CommunityEvent =
  (models.CommunityEvent as Model<CommunityEventRecord> | undefined) ??
  model<CommunityEventRecord>("CommunityEvent", communityEventSchema, "communityEvents");