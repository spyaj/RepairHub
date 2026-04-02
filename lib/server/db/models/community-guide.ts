import { Schema, model, models, type Model } from "mongoose";

type CommunityGuideRecord = {
  slug: string;
  title: string;
  category: "ELECTRONICS" | "FURNITURE" | "CLOTHING" | "BIKES";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  readMinutes: number;
  summary: string;
  body: string;
  featured: boolean;
  likesCount: number;
  likedBy: string[];
  createdById?: string;
  createdByName?: string;
};

const communityGuideSchema = new Schema<CommunityGuideRecord>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true, enum: ["ELECTRONICS", "FURNITURE", "CLOTHING", "BIKES"] },
    difficulty: { type: String, required: true, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
    readMinutes: { type: Number, required: true },
    summary: { type: String, required: true },
    body: { type: String, required: true },
    featured: { type: Boolean, default: false },
    likesCount: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    createdById: { type: String },
    createdByName: { type: String },
  },
  { timestamps: true },
);

export const CommunityGuide =
  (models.CommunityGuide as Model<CommunityGuideRecord> | undefined) ??
  model<CommunityGuideRecord>("CommunityGuide", communityGuideSchema, "communityGuides");