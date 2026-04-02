"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

function getDashboardLink(role?: string) {
    if (role === "REPAIRER") return "/dashboard/repairer";
    if (role === "ADMIN") return "/dashboard/admin";
    return "/dashboard/client";
}

export function SiteShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const isSignedIn = status === "authenticated";
    const dashboardLink = getDashboardLink(session?.user?.role);
    const isCommunityPage = pathname?.startsWith("/community");
    const isRepairRequestPage = pathname === "/dashboard/client/repairs/new";

    return (
        <>
            <header className="app-wrap" style={{ paddingBottom: 0 }}>
                <nav className="site-nav" aria-label="Main navigation">
                    <div className="site-logo">
                        <div className="logo-mark" aria-hidden>
                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                                <path
                                    d="M8.5 3C6 3 4 5.2 4 8c0 2.2 1.2 4.1 3 5.1C9.5 14.3 13 12.2 13 8.5c0-1.6-.7-3-1.8-3.8C10.5 3.6 9.5 3 8.5 3z"
                                    fill="rgba(255,255,255,.85)"
                                />
                            </svg>
                        </div>
                        <Link href="/" className="logo-wordmark">RepairHub</Link>
                        <span className="badge badge-green">Canberra</span>
                    </div>

                    <ul className="site-links">
                        <li>
                            <Link href="/" style={{ color: pathname === "/" ? "#1d4b20" : undefined }}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dashboard/client/repairs/new"
                                style={{ color: isRepairRequestPage ? "#1d4b20" : undefined }}
                            >
                                Repair Request
                            </Link>
                        </li>
                        <li>
                            <Link href="/community" style={{ color: isCommunityPage ? "#1d4b20" : undefined }}>
                                Community
                            </Link>
                        </li>
                    </ul>

                    <div className="nav-actions">
                        {isSignedIn ? (
                            <>
                                <Link
                                    href={dashboardLink}
                                    className={`btn btn-outline btn-sm ${pathname?.startsWith("/dashboard") ? "active" : ""}`}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        void signOut({ callbackUrl: "/" });
                                    }}
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/sign-in" className="btn btn-outline btn-sm">Sign In</Link>
                                <Link href="/sign-up" className="btn btn-primary btn-sm">Sign Up</Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {children}

            <footer
                style={{
                    marginTop: 24,
                    borderTop: "1.5px solid #e3ddd2",
                    background: "#f6f3ee",
                }}
            >
                <div className="app-wrap" style={{ paddingTop: 18, paddingBottom: 24 }}>
                    <div className="grid-3" style={{ gap: 20 }}>
                        <div>
                            <p className="overline mb-8">RepairHub</p>
                            <p className="body-sm">Repair over replace. Community-first sustainability platform for Canberra.</p>
                        </div>
                        <div>
                            <p className="overline mb-8">Quick Links</p>
                            <div className="flex-col gap-6 body-sm">
                                <Link href="/">Home</Link>
                                <Link href="/community">Community</Link>
                                <Link href="/dashboard/client/repairs/new">Post Repair Request</Link>
                                <Link href="/sign-up">Become a Repairer</Link>
                            </div>
                        </div>
                        <div>
                            <p className="overline mb-8">Admin</p>
                            <Link
                                href="/sign-in?callbackUrl=/dashboard/admin"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-sm"
                            >
                                Admin Login (new tab)
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
