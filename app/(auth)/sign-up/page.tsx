"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type SignUpResponse = {
    error?: {
        code: string;
        message: string;
    };
};

const canberraSuburbs = [
    "Belconnen",
    "Braddon",
    "Canberra City",
    "Dickson",
    "Gungahlin",
    "Kingston",
    "Manuka",
    "Tuggeranong",
    "Woden",
];

export default function SignUpPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"CLIENT" | "REPAIRER">("CLIENT");
    const [suburb, setSuburb] = useState(canberraSuburbs[0]);
    const [streetAddress, setStreetAddress] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName,
                email,
                phone,
                password,
                role,
                suburb,
                streetAddress,
            }),
        });

        if (!response.ok) {
            const payload = (await response.json()) as SignUpResponse;
            setIsSubmitting(false);
            setError(payload.error?.message ?? "Unable to create account.");
            return;
        }

        await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setIsSubmitting(false);
        router.push("/dashboard");
        router.refresh();
    }

    return (
        <main className="app-wrap page active" style={{ maxWidth: 560 }}>
            <h1 className="display" style={{ fontSize: "2rem", marginBottom: 12 }}>Create Account</h1>
            <p className="body-sm" style={{ marginBottom: 24 }}>Start your RepairHub journey in Canberra.</p>

            <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 12 }}>
                <div className="grid-2">
                    <label>
                        <div className="body-xs" style={{ marginBottom: 6 }}>Full name</div>
                        <input value={fullName} onChange={(e) => setFullName(e.target.value)} minLength={2} maxLength={100} required className="w-full" />
                    </label>
                    <label>
                        <div className="body-xs" style={{ marginBottom: 6 }}>Phone</div>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} minLength={8} maxLength={20} required className="w-full" />
                    </label>
                </div>
                <div className="grid-2">
                    <label>
                        <div className="body-xs" style={{ marginBottom: 6 }}>Email</div>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full" />
                    </label>
                    <label>
                        <div className="body-xs" style={{ marginBottom: 6 }}>Password</div>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required className="w-full" />
                    </label>
                </div>
                <div className="grid-2">
                    <label>
                        <div className="body-xs" style={{ marginBottom: 6 }}>Role</div>
                        <select value={role} onChange={(e) => setRole(e.target.value as "CLIENT" | "REPAIRER")}>
                            <option value="CLIENT">Client</option>
                            <option value="REPAIRER">Repairer</option>
                        </select>
                    </label>
                    <label>
                        <div className="body-xs" style={{ marginBottom: 6 }}>Suburb</div>
                        <select value={suburb} onChange={(e) => setSuburb(e.target.value)}>
                            {canberraSuburbs.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <label>
                    <div className="body-xs" style={{ marginBottom: 6 }}>Street address (optional)</div>
                    <input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className="w-full" />
                </label>
                {error ? <p style={{ color: "#B35A1E", fontSize: 12 }}>{error}</p> : null}
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create account"}
                </button>
            </form>

            <p className="body-sm" style={{ marginTop: 16 }}>
                Already have an account? <Link href="/sign-in">Sign in</Link>
            </p>
        </main>
    );
}
