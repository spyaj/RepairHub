"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const canberraSuburbs = [
    "Belconnen",
    "Civic",
    "Gungahlin",
    "Kingston",
    "Manuka",
    "Tuggeranong",
    "Woden",
];

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [role, setRole] = useState("CLIENT");
    const [suburb, setSuburb] = useState(canberraSuburbs[0]);
    const [streetAddress, setStreetAddress] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/sign-in?callbackUrl=/onboarding");
        }
    }, [router, status]);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const response = await fetch("/api/auth/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, suburb, streetAddress }),
        });

        setIsSubmitting(false);

        if (!response.ok) {
            const payload = (await response.json()) as { error?: { message?: string } };
            setError(payload.error?.message ?? "Unable to complete onboarding.");
            return;
        }

        if (role === "REPAIRER") {
            router.push("/dashboard/repairer");
        } else {
            router.push("/dashboard/client");
        }
        router.refresh();
    }

    if (status === "loading") {
        return <main className="app-wrap page active">Loading...</main>;
    }

    return (
        <main className="app-wrap page active" style={{ maxWidth: 640 }}>
            <h1 className="display" style={{ fontSize: "2rem", marginBottom: 12 }}>Onboarding</h1>
            <p className="body-sm" style={{ marginBottom: 24 }}>
                Welcome {session?.user?.name ?? ""}. Set your role and location to personalize RepairHub.
            </p>

            {role === "REPAIRER" ? (
                <p className="body-sm" style={{ marginBottom: 16 }}>
                    Repairer verification can be completed later from your dashboard.
                </p>
            ) : null}

            <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 12 }}>
                <label>
                    <div className="body-xs" style={{ marginBottom: 6 }}>Role</div>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="CLIENT">Client</option>
                        <option value="REPAIRER">Repairer</option>
                    </select>
                </label>

                <label>
                    <div className="body-xs" style={{ marginBottom: 6 }}>Suburb</div>
                    <select value={suburb} onChange={(e) => setSuburb(e.target.value)}>
                        {canberraSuburbs.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    <div className="body-xs" style={{ marginBottom: 6 }}>Street address (optional)</div>
                    <input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
                </label>

                {error ? <p style={{ color: "#B35A1E", fontSize: 12 }}>{error}</p> : null}

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Complete onboarding"}
                </button>
            </form>
        </main>
    );
}
