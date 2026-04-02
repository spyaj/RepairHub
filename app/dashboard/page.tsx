import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/server/auth/session";

export default async function DashboardRouterPage() {
    const session = await getAuthSession();

    if (!session?.user?.id) {
        redirect("/sign-in?callbackUrl=/dashboard");
    }

    if (!session.user.onboardingCompleted) {
        redirect("/onboarding");
    }

    if (session.user.role === "REPAIRER") {
        redirect("/dashboard/repairer");
    }

    if (session.user.role === "ADMIN") {
        redirect("/dashboard/admin");
    }

    redirect("/dashboard/client");
}
