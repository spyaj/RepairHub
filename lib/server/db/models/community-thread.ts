import { Schema, model, models, type Model } from "mongoose";

type CommunityThreadCommentRecord = {
  authorId: string;
  authorName: string;
  body: string;
  createdAt: Date;
};

type CommunityThreadRecord = {
  slug: string;
  title: string;
  category: "ELECTRONICS" | "FURNITURE" | "CLOTHING" | "BIKES" | "GENERAL";
  body: string;
  authorId?: string;
  authorName: string;
  likesCount: number;
  likedBy: string[];
  comments: CommunityThreadCommentRecord[];
  featured: boolean;
};

const communityThreadCommentSchema = new Schema<CommunityThreadCommentRecord>(
  {
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const communityThreadSchema = new Schema<CommunityThreadRecord>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true, enum: ["ELECTRONICS", "FURNITURE", "CLOTHING", "BIKES", "GENERAL"] },
    body: { type: String, required: true },
    authorId: { type: String },
    authorName: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    comments: { type: [communityThreadCommentSchema], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const CommunityThread =
  (models.CommunityThread as Model<CommunityThreadRecord> | undefined) ??
  model<CommunityThreadRecord>("CommunityThread", communityThreadSchema, "communityThreads");