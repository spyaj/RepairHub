"use client";

import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type ModalMode = "signin" | "signup";

type SignupPayload = {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: "CLIENT" | "REPAIRER";
    suburb: string;
    streetAddress?: string;
};

const coreFeatures = [
    "AI damage detection from uploaded photos",
    "Repair cost range estimation",
    "Repair vs replace recommendation",
    "Smart repairer matching by distance and rating",
    "Secure escrow simulation in Stripe test mode",
    "Warranty options and dispute resolution",
    "Sustainability impact tracking and rewards",
    "Community tutorials, Q&A, and workshops",
];

const featuredRepairers = [
    { name: "Marcus Rivera", area: "Canberra City", rating: "4.9", jobs: "127", price: "$45" },
    { name: "Sofia Lee", area: "Braddon", rating: "4.8", jobs: "94", price: "$25" },
    { name: "Aiden Kumar", area: "Belconnen", rating: "4.7", jobs: "68", price: "$60" },
];

const eventRows = [
    { day: "05", month: "Apr", title: "Community Repair Cafe", place: "Canberra City Library" },
    { day: "12", month: "Apr", title: "Bike Fix Day", place: "Kingston Foreshore" },
    { day: "19", month: "Apr", title: "Electronics Workshop", place: "Gungahlin Hub" },
];

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

export default function HomePage() {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>("signin");

    const [signInEmail, setSignInEmail] = useState("");
    const [signInPassword, setSignInPassword] = useState("");

    const [signup, setSignup] = useState<SignupPayload>({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "CLIENT",
        suburb: canberraSuburbs[0],
        streetAddress: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const googleOauthEnabled = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";

    const roleLabel = useMemo(() => {
        if (signup.role === "REPAIRER") {
            return "Repairer account (verification can be completed later)";
        }
        return "Client account";
    }, [signup.role]);

    function openModal(mode: ModalMode) {
        setError(null);
        setModalMode(mode);
        setModalOpen(true);
    }

    async function handleSignIn(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const result = await signIn("credentials", {
            email: signInEmail,
            password: signInPassword,
            redirect: false,
            callbackUrl: "/dashboard",
        });

        setIsSubmitting(false);

        if (result?.error) {
            setError("Invalid email or password.");
            return;
        }

        setModalOpen(false);
        router.push(result?.url ?? "/dashboard");
        router.refresh();
    }

    async function handleSignUp(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(signup),
        });

        const payload = (await response.json()) as { error?: { message?: string } };

        if (!response.ok) {
            setError(payload.error?.message ?? "Unable to create account.");
            setIsSubmitting(false);
            return;
        }

        await signIn("credentials", {
            email: signup.email,
            password: signup.password,
            redirect: false,
            callbackUrl: "/dashboard",
        });

        setIsSubmitting(false);
        setModalOpen(false);
        router.push("/dashboard");
        router.refresh();
    }

    return (
        <main>
            <div className="app-wrap" style={{ paddingTop: 28 }}>
                <section className="hero-section">
                    <div className="grid-hero">
                        <div>
                            <div className="hero-label">
                                <span className="badge badge-green">Sustainable • Community-driven</span>
                            </div>
                            <h1 className="display hero-headline">Repair. Reuse. Reconnect.</h1>
                            <p className="hero-sub">
                                Find trusted repairers across Canberra for electronics, furniture, clothing, and bikes.
                                Save money, keep products alive longer, and cut waste.
                            </p>
                            <div className="hero-search">
                                <div>
                                    <div className="hero-search-label">Category</div>
                                    <select>
                                        <option>Electronics</option>
                                        <option>Furniture</option>
                                        <option>Clothing</option>
                                        <option>Bikes</option>
                                    </select>
                                </div>
                                <div className="hero-search-divider" />
                                <div>
                                    <div className="hero-search-label">Location</div>
                                    <input type="text" placeholder="Suburb or postcode" />
                                </div>
                                <button className="btn btn-primary" onClick={() => openModal("signup")}>Post a Repair</button>
                            </div>
                            <div className="hero-stats">
                                <div>
                                    <div className="hero-stat-num">48,291</div>
                                    <div className="hero-stat-lbl">Items repaired</div>
                                </div>
                                <div className="hero-stat-divider" />
                                <div>
                                    <div className="hero-stat-num">86t</div>
                                    <div className="hero-stat-lbl">CO2 avoided</div>
                                </div>
                                <div className="hero-stat-divider" />
                                <div>
                                    <div className="hero-stat-num">12,400+</div>
                                    <div className="hero-stat-lbl">Local repairers</div>
                                </div>
                            </div>
                        </div>

                        <div className="card card-green" style={{ display: "grid", gap: 12 }}>
                            <p className="overline">Repair Categories</p>
                            <div className="grid-2">
                                <div className="category-tile"><strong>Electronics</strong><p className="body-xs">2,840 repairers</p></div>
                                <div className="category-tile"><strong>Clothing</strong><p className="body-xs">1,920 repairers</p></div>
                                <div className="category-tile"><strong>Furniture</strong><p className="body-xs">1,560 repairers</p></div>
                                <div className="category-tile"><strong>Bikes</strong><p className="body-xs">980 repairers</p></div>
                            </div>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button className="btn btn-primary" onClick={() => openModal("signup")}>Get Started</button>
                                <button className="btn btn-outline" onClick={() => openModal("signin")}>Sign In</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section style={{ marginTop: 24 }}>
                    <div className="section-header" style={{ marginBottom: 16 }}>
                        <div>
                            <p className="overline mb-8">Features</p>
                            <h2 className="heading" style={{ fontSize: "1.8rem" }}>What this platform includes</h2>
                        </div>
                    </div>
                    <div className="grid-2">
                        {coreFeatures.map((feature) => (
                            <div key={feature} className="card card-hover">
                                <p className="body-sm">{feature}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ marginTop: 24 }}>
                    <div className="section-header" style={{ marginBottom: 16 }}>
                        <div>
                            <p className="overline mb-8">Top Rated</p>
                            <h2 className="heading" style={{ fontSize: "1.8rem" }}>Featured Repairers</h2>
                        </div>
                    </div>
                    <div className="grid-3">
                        {featuredRepairers.map((repairer) => (
                            <div key={repairer.name} className="repairer-card card-hover">
                                <div className="flex-between mb-16">
                                    <div>
                                        <h3 className="heading" style={{ fontSize: "1.2rem" }}>{repairer.name}</h3>
                                        <p className="body-xs">{repairer.area}</p>
                                    </div>
                                    <span className="badge badge-amber">{repairer.rating} ★</span>
                                </div>
                                <p className="body-sm mb-12">{repairer.jobs} completed repair reviews</p>
                                <div className="flex-between">
                                    <p className="body-xs">Starting from {repairer.price}</p>
                                    <button className="btn btn-primary btn-sm" onClick={() => openModal("signup")}>Book</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ marginTop: 24 }}>
                    <div className="impact-banner">
                        <p className="overline mb-8" style={{ color: "rgba(255,255,255,.7)" }}>Impact</p>
                        <h2 className="heading" style={{ color: "#fff", fontSize: "1.9rem", marginBottom: 20 }}>Together We Keep More Items in Use</h2>
                        <div className="grid-4">
                            <div><div className="stat-value" style={{ color: "#fff" }}>48,291</div><p className="body-xs" style={{ color: "rgba(255,255,255,.75)" }}>Items saved</p></div>
                            <div><div className="stat-value" style={{ color: "#fff" }}>86t</div><p className="body-xs" style={{ color: "rgba(255,255,255,.75)" }}>CO2 avoided</p></div>
                            <div><div className="stat-value" style={{ color: "#fff" }}>$1.2M</div><p className="body-xs" style={{ color: "rgba(255,255,255,.75)" }}>Saved vs replace</p></div>
                            <div><div className="stat-value" style={{ color: "#fff" }}>12,400</div><p className="body-xs" style={{ color: "rgba(255,255,255,.75)" }}>Local jobs supported</p></div>
                        </div>
                    </div>
                </section>

                <section style={{ marginTop: 24 }}>
                    <div className="section-header" style={{ marginBottom: 16 }}>
                        <div>
                            <p className="overline mb-8">Community</p>
                            <h2 className="heading" style={{ fontSize: "1.8rem" }}>Upcoming Events</h2>
                        </div>
                    </div>
                    <div className="flex-col gap-8">
                        {eventRows.map((eventItem) => (
                            <div className="event-row" key={eventItem.title}>
                                <div className="event-date">
                                    <div className="event-month">{eventItem.month}</div>
                                    <div className="event-day">{eventItem.day}</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p className="fw-600" style={{ fontSize: 13 }}>{eventItem.title}</p>
                                    <p className="body-xs">{eventItem.place}</p>
                                </div>
                                <button className="btn btn-outline btn-sm" onClick={() => openModal("signup")}>RSVP</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {modalOpen ? (
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(26,25,22,0.45)",
                        display: "grid",
                        placeItems: "center",
                        zIndex: 200,
                        padding: 16,
                    }}
                    onClick={() => {
                        if (!isSubmitting) setModalOpen(false);
                    }}
                >
                    <div
                        className="card"
                        style={{ width: "min(760px, 100%)", padding: 20, display: "grid", gap: 12 }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex-between">
                            <h2 className="heading" style={{ fontSize: "1.45rem" }}>
                                {modalMode === "signin" ? "Sign In" : "Create Account"}
                            </h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)} disabled={isSubmitting}>
                                Close
                            </button>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button className={`btn btn-sm ${modalMode === "signin" ? "btn-primary" : "btn-outline"}`} onClick={() => setModalMode("signin")}>Sign In</button>
                            <button className={`btn btn-sm ${modalMode === "signup" ? "btn-primary" : "btn-outline"}`} onClick={() => setModalMode("signup")}>Sign Up</button>
                        </div>

                        {modalMode === "signin" ? (
                            <form onSubmit={handleSignIn} style={{ display: "grid", gap: 10 }}>
                                <label>
                                    <div className="body-xs" style={{ marginBottom: 4 }}>Email</div>
                                    <input className="w-full" type="email" required value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} />
                                </label>
                                <label>
                                    <div className="body-xs" style={{ marginBottom: 4 }}>Password</div>
                                    <input className="w-full" type="password" minLength={8} required value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} />
                                </label>
                                {googleOauthEnabled ? (
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => {
                                            void signIn("google", { callbackUrl: "/dashboard" });
                                        }}
                                    >
                                        Continue with Google
                                    </button>
                                ) : null}
                                {error ? <p style={{ color: "#b35a1e", fontSize: 12 }}>{error}</p> : null}
                                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Signing in..." : "Sign In"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSignUp} style={{ display: "grid", gap: 10 }}>
                                <div className="grid-2">
                                    <label>
                                        <div className="body-xs" style={{ marginBottom: 4 }}>Full name</div>
                                        <input className="w-full" required minLength={2} maxLength={100} value={signup.fullName} onChange={(e) => setSignup((prev) => ({ ...prev, fullName: e.target.value }))} />
                                    </label>
                                    <label>
                                        <div className="body-xs" style={{ marginBottom: 4 }}>Phone</div>
                                        <input className="w-full" required minLength={8} maxLength={20} value={signup.phone} onChange={(e) => setSignup((prev) => ({ ...prev, phone: e.target.value }))} />
                                    </label>
                                </div>

                                <div className="grid-2">
                                    <label>
                                        <div className="body-xs" style={{ marginBottom: 4 }}>Email</div>
                                        <input className="w-full" type="email" required value={signup.email} onChange={(e) => setSignup((prev) => ({ ...prev, email: e.target.value }))} />
                                    </label>
                                    <label>
                                        <div className="body-xs" style={{ marginBottom: 4 }}>Password</div>
                                        <input className="w-full" type="password" minLength={8} required value={signup.password} onChange={(e) => setSignup((prev) => ({ ...prev, password: e.target.value }))} />
                                    </label>
                                </div>

                                <div className="grid-2">
                                    <label>
                                        <div className="body-xs" style={{ marginBottom: 4 }}>Role</div>
                                        <select value={signup.role} onChange={(e) => setSignup((prev) => ({ ...prev, role: e.target.value as "CLIENT" | "REPAIRER" }))}>
                                            <option value="CLIENT">Client</option>
                                            <option value="REPAIRER">Repairer</option>
                                        </select>
                                    </label>
                                    <label>
                                        <div className="body-xs" style={{ marginBottom: 4 }}>Suburb</div>
                                        <select value={signup.suburb} onChange={(e) => setSignup((prev) => ({ ...prev, suburb: e.target.value }))}>
                                            {canberraSuburbs.map((suburb) => (
                                                <option key={suburb} value={suburb}>{suburb}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <label>
                                    <div className="body-xs" style={{ marginBottom: 4 }}>Street address (optional)</div>
                                    <input className="w-full" value={signup.streetAddress} onChange={(e) => setSignup((prev) => ({ ...prev, streetAddress: e.target.value }))} />
                                </label>

                                <p className="body-xs">{roleLabel}</p>
                                {error ? <p style={{ color: "#b35a1e", fontSize: 12 }}>{error}</p> : null}
                                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create account"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            ) : null}
        </main>
    );
}
