import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/auth/options";

export async function getAuthSession() {
  return getServerSession(authOptions);
}
