"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const router = useRouter();
    const googleOauthEnabled = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const callbackUrl =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("callbackUrl") ?? "/dashboard"
                : "/dashboard";

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
        });

        setIsSubmitting(false);

        if (result?.error) {
            setError("Invalid email or password.");
            return;
        }

        router.push(result?.url ?? callbackUrl);
        router.refresh();
    }

    return (
        <main className="app-wrap page active" style={{ maxWidth: 560 }}>
            <h1 className="display" style={{ fontSize: "2rem", marginBottom: 12 }}>Sign In</h1>
            <p className="body-sm" style={{ marginBottom: 24 }}>Access your RepairHub account.</p>

            <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 12 }}>
                <label>
                    <div className="body-xs" style={{ marginBottom: 6 }}>Email</div>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full" />
                </label>
                <label>
                    <div className="body-xs" style={{ marginBottom: 6 }}>Password</div>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required className="w-full" />
                </label>
                {error ? <p style={{ color: "#B35A1E", fontSize: 12 }}>{error}</p> : null}
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
            </form>

            {googleOauthEnabled ? (
                <div className="card" style={{ marginTop: 16, display: "grid", gap: 10 }}>
                    <p className="body-sm">Prefer Google? Use OAuth for a faster sign-in.</p>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                            void signIn("google", { callbackUrl: "/dashboard" });
                        }}
                    >
                        Continue with Google
                    </button>
                </div>
            ) : null}

            <p className="body-sm" style={{ marginTop: 16 }}>
                New here? <Link href="/sign-up">Create an account</Link>
            </p>
        </main>
    );
}
