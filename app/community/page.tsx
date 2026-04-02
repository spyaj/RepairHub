"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CommunityTabs } from "@/components/community/community-tabs";

type OverviewGuide = {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  readMinutes: number;
  summary: string;
  likesCount: number;
  featured: boolean;
};

type OverviewThread = {
  slug: string;
  title: string;
  category: string;
  body: string;
  authorName: string;
  likesCount: number;
  commentCount: number;
  featured: boolean;
};

type OverviewEvent = {
  slug: string;
  title: string;
  type: string;
  category: string;
  location: string;
  suburb: string;
  startsAt: string;
  endLabel: string;
  summary: string;
  hostName: string;
  spotsTotal: number;
  joinedCount: number;
  featured: boolean;
};

type OverviewResponse = {
  data: {
    guides: OverviewGuide[];
    threads: OverviewThread[];
    events: OverviewEvent[];
    stats: { guides: number; threads: number; events: number };
  };
};

function categoryBadgeClass(category: string) {
  if (category === "CLOTHING" || category === "WORKSHOP") return "badge-amber";
  if (category === "FURNITURE") return "badge-green";
  return "badge-blue";
}

function formatEventDate(iso: string) {
  const date = new Date(iso);
  const month = new Intl.DateTimeFormat("en-AU", { month: "short" }).format(date).toUpperCase();
  const day = new Intl.DateTimeFormat("en-AU", { day: "2-digit" }).format(date);
  return { month, day };
}

export default function CommunityOverviewPage() {
  const { status } = useSession();
  const [overview, setOverview] = useState<OverviewResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      try {
        const response = await fetch("/api/community/overview", { cache: "no-store" });
        const payload = (await response.json()) as OverviewResponse & { error?: { message?: string } };

        if (!response.ok) {
          throw new Error(payload.error?.message ?? "Unable to load community overview.");
        }

        if (isMounted) {
          setOverview(payload.data);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load community overview.");
        }
      }
    }

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app-wrap page active">
      <CommunityTabs />

      <section className="hero-section" style={{ marginTop: 0 }}>
        <div className="grid-hero">
          <div>
            <div className="hero-label">
              <span className="badge badge-green">Community without login</span>
            </div>
            <h1 className="display hero-headline">Learn. Connect. Repair.</h1>
            <p className="hero-sub">
              Browse DIY guides, ask repair questions, and join local workshops across Canberra. Public content stays open,
              while creation and participation actions require a signed-in account.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
              <Link href="/community/guides" className="btn btn-primary">
                Browse Guides
              </Link>
              <Link href="/community/forum" className="btn btn-outline">
                View Forum
              </Link>
              <Link href="/community/events" className="btn btn-outline">
                See Events
              </Link>
            </div>
          </div>

          <div className="card card-green" style={{ display: "grid", gap: 14 }}>
            <div className="flex-between">
              <div>
                <p className="overline mb-8">Community Score</p>
                <p className="heading" style={{ fontSize: "1.2rem" }}>Repair points and activity</p>
              </div>
              <span className="badge badge-green">2,840 online</span>
            </div>
            <div className="grid-3" style={{ gap: 10 }}>
              <div className="card" style={{ padding: 14 }}>
                <p className="overline mb-8">Guides</p>
                <p className="stat-value" style={{ marginBottom: 6 }}>{overview?.stats.guides ?? "--"}</p>
                <p className="body-xs">DIY tutorials ready to browse</p>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <p className="overline mb-8">Forum</p>
                <p className="stat-value" style={{ marginBottom: 6 }}>{overview?.stats.threads ?? "--"}</p>
                <p className="body-xs">Active repair questions</p>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <p className="overline mb-8">Events</p>
                <p className="stat-value" style={{ marginBottom: 6 }}>{overview?.stats.events ?? "--"}</p>
                <p className="body-xs">Upcoming local sessions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? <p style={{ color: "#b35a1e", marginTop: 16 }}>{error}</p> : null}

      <section style={{ marginTop: 24 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div>
            <p className="overline mb-8">DIY Guides</p>
            <h2 className="heading" style={{ fontSize: "1.8rem" }}>Popular Tutorials</h2>
          </div>
          <Link href="/community/guides" className="btn btn-outline btn-sm">
            Browse All 200+
          </Link>
        </div>

        <div className="grid-3">
          {(overview?.guides ?? []).map((guide) => (
            <article key={guide.slug} className="card card-hover" style={{ display: "grid", gap: 14 }}>
              <div className={`badge ${categoryBadgeClass(guide.category)}`} style={{ width: "fit-content" }}>
                {guide.category}
              </div>
              <div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <span className="chip">{guide.difficulty}</span>
                  {guide.featured ? <span className="badge badge-green">Featured</span> : null}
                </div>
                <h3 className="heading" style={{ fontSize: "1.15rem", marginBottom: 8 }}>{guide.title}</h3>
                <p className="body-sm">{guide.summary}</p>
              </div>
              <div className="flex-between">
                <p className="body-xs">{guide.readMinutes} min read</p>
                <Link href="/community/guides" className="btn btn-outline btn-sm">
                  View All
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div>
            <p className="overline mb-8">Community Forum</p>
            <h2 className="heading" style={{ fontSize: "1.8rem" }}>Recent Discussions</h2>
          </div>
          <Link href="/community/forum" className="btn btn-primary btn-sm">
            Ask a Question
          </Link>
        </div>

        <div className="grid-dash">
          <div className="card" style={{ display: "grid", gap: 0 }}>
            {(overview?.threads ?? []).map((thread, index) => (
              <div key={thread.slug} style={{ padding: "16px 0", borderTop: index === 0 ? "none" : "1px solid #ece5db" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <span className={`badge ${categoryBadgeClass(thread.category)}`}>{thread.category}</span>
                  {thread.featured ? <span className="badge badge-green">Hot</span> : null}
                </div>
                <h3 className="fw-600" style={{ marginBottom: 8, fontSize: 15 }}>{thread.title}</h3>
                <p className="body-sm" style={{ marginBottom: 12 }}>{thread.body}</p>
                <div className="flex-between">
                  <p className="body-xs">{thread.authorName} · {thread.commentCount} replies · {thread.likesCount} likes</p>
                  <Link href="/community/forum" className="btn btn-outline btn-sm">
                    View All
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-col gap-12">
            {status !== "authenticated" ? (
              <div className="card card-amber">
                <p className="overline mb-8">Need an account?</p>
                <p className="body-sm" style={{ marginBottom: 12 }}>Sign up once and keep your dashboard, requests, and community activity in one place.</p>
                <Link href="/sign-up" className="btn btn-primary btn-sm">Create Account</Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div>
            <p className="overline mb-8">Local Events</p>
            <h2 className="heading" style={{ fontSize: "1.8rem" }}>Upcoming Workshops</h2>
          </div>
          <Link href="/community/events" className="btn btn-outline btn-sm">
            All Events
          </Link>
        </div>

        <div className="flex-col gap-8">
          {(overview?.events ?? []).map((eventItem) => (
            <article className="event-row" key={eventItem.slug}>
              <div className="event-date">
                <div className="event-month">{formatEventDate(eventItem.startsAt).month}</div>
                <div className="event-day">{formatEventDate(eventItem.startsAt).day}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                  <span className={`badge ${categoryBadgeClass(eventItem.category)}`}>{eventItem.category}</span>
                  <span className="body-xs">{eventItem.location} · {eventItem.suburb}</span>
                </div>
                <p className="fw-600" style={{ fontSize: 13 }}>{eventItem.title}</p>
                <p className="body-xs">Organized by {eventItem.hostName}</p>
                <p className="body-xs">{eventItem.summary}</p>
              </div>
              <Link href="/community/events" className="btn btn-outline btn-sm">
                RSVP
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}