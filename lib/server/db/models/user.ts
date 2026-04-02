import { Schema, model, models, type Model } from "mongoose";

const userProfileSchema = new Schema(
  {
    suburb: { type: String, required: true },
    streetAddress: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false },
);

type AuthUserRecord = {
  email: string;
  fullName: string;
  phone?: string;
  hashedPassword?: string;
  role: "CLIENT" | "REPAIRER" | "ADMIN";
  onboardingCompleted: boolean;
  avatarUrl?: string;
  savedGuideSlugs?: string[];
  profile?: {
    suburb: string;
    streetAddress?: string;
    latitude?: number;
    longitude?: number;
  };
  repairerProfile?: {
    verificationStatus?: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  };
};

const userSchema = new Schema<AuthUserRecord>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true },
    phone: { type: String },
    hashedPassword: { type: String },
    role: {
      type: String,
      enum: ["CLIENT", "REPAIRER", "ADMIN"],
      default: "CLIENT",
      required: true,
    },
    onboardingCompleted: { type: Boolean, default: false, required: true },
    avatarUrl: { type: String },
    savedGuideSlugs: { type: [String], default: [] },
    profile: userProfileSchema,
    repairerProfile: {
      verificationStatus: {
        type: String,
        enum: ["NOT_SUBMITTED", "PENDING", "VERIFIED", "REJECTED"],
      },
    },
  },
  { timestamps: true },
);

export const AuthUser =
  (models.AuthUser as Model<AuthUserRecord> | undefined) ??
  model<AuthUserRecord>("AuthUser", userSchema, "users");
