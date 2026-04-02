import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { ensureAdminSeedUser } from "@/lib/server/auth/admin-seed";
import { connectMongo } from "@/lib/server/db/mongo";
import { AuthUser } from "@/lib/server/db/models/user";
import { credentialsSchema } from "@/lib/server/validation/auth";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      await ensureAdminSeedUser();
      await connectMongo();

      const parsed = credentialsSchema.safeParse(credentials);

      if (!parsed.success) {
        return null;
      }

      const user = await AuthUser.findOne({
        email: parsed.data.email.toLowerCase(),
      });

      if (!user?.hashedPassword) {
        return null;
      }

      const isValid = await compare(parsed.data.password, user.hashedPassword);

      if (!isValid) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.fullName,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      } as {
        id: string;
        email: string;
        name: string;
        role: string;
        onboardingCompleted: boolean;
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        await connectMongo();

        const savedUser = await AuthUser.findOneAndUpdate(
          { email: user.email.toLowerCase() },
          {
            $set: {
              fullName: user.name ?? profile?.name ?? user.email,
              avatarUrl: user.image ?? undefined,
            },
            $setOnInsert: {
              email: user.email.toLowerCase(),
              role: "CLIENT",
              onboardingCompleted: false,
            },
          },
          { upsert: true, new: true },
        );

        user.id = savedUser._id.toString();
        (user as { role?: string }).role = savedUser.role;
        (user as { onboardingCompleted?: boolean }).onboardingCompleted = savedUser.onboardingCompleted;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role?: string }).role;
        token.onboardingCompleted = (user as { onboardingCompleted?: boolean }).onboardingCompleted;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = token.role as string;
      session.user.onboardingCompleted = Boolean(token.onboardingCompleted);
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
};
