"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CommunityTabs } from "@/components/community/community-tabs";
import { CommunityModal } from "@/components/community/community-modal";

type GuideItem = {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  readMinutes: number;
  summary: string;
  body: string;
  likesCount: number;
  featured: boolean;
  createdById?: string;
  createdByName?: string;
};

type GuideListResponse = {
  data: { guides: GuideItem[] };
  error?: { message?: string };
};

type GuideMutationResponse = {
  data: GuideItem;
  error?: { message?: string };
};

const guideCategories = ["ELECTRONICS", "FURNITURE", "CLOTHING", "BIKES"] as const;
const difficultyLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

function badgeClass(category: string) {
  if (category === "CLOTHING") return "badge-amber";
  if (category === "FURNITURE") return "badge-green";
  return "badge-blue";
}

const emptyForm = {
  title: "",
  category: "ELECTRONICS",
  difficulty: "BEGINNER",
  readMinutes: 10,
  summary: "",
  body: "",
};

export default function CommunityGuidesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadGuides() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/community/guides", { cache: "no-store" });
      const payload = (await response.json()) as GuideListResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to load guides.");
      }

      setGuides(payload.data.guides);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load guides.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadGuides();
  }, []);

  const selectedGuide = guides.find((guide) => guide.slug === selectedSlug) ?? null;
  const isOwner = Boolean(
    selectedGuide &&
    status === "authenticated" &&
    session?.user?.id &&
    selectedGuide.createdById === session.user.id,
  );

  function openCreateModal() {
    setEditingSlug(null);
    setForm(emptyForm);
    setComposeOpen(true);
  }

  function openEditModal(guide: GuideItem) {
    setEditingSlug(guide.slug);
    setForm({
      title: guide.title,
      category: guide.category,
      difficulty: guide.difficulty,
      readMinutes: guide.readMinutes,
      summary: guide.summary,
      body: guide.body,
    });
    setComposeOpen(true);
  }

  async function submitGuide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status !== "authenticated") {
      router.push("/sign-in?callbackUrl=/community/guides");
      return;
    }

    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(editingSlug ? `/api/community/guides/${editingSlug}` : "/api/community/guides", {
        method: editingSlug ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as GuideMutationResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to post guide.");
      }

      setMessage(editingSlug ? "Guide updated." : "Guide posted successfully.");
      setComposeOpen(false);
      setEditingSlug(null);
      setForm(emptyForm);
      await loadGuides();
    } catch (submitError) {
      setMessage(submitError instanceof Error ? submitError.message : "Unable to post guide.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function likeGuide(slug: string) {
    if (status !== "authenticated") {
      router.push("/sign-in?callbackUrl=/community/guides");
      return;
    }

    try {
      const response = await fetch(`/api/community/guides/${slug}/like`, { method: "POST" });
      const payload = (await response.json()) as GuideMutationResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to like guide.");
      }

      setGuides((current) => current.map((guide) => (guide.slug === slug ? payload.data : guide)));
    } catch (likeError) {
      setMessage(likeError instanceof Error ? likeError.message : "Unable to like guide.");
    }
  }

  async function saveGuide(slug: string) {
    if (status !== "authenticated") {
      router.push("/sign-in?callbackUrl=/community/guides");
      return;
    }

    setSavingSlug(slug);
    setMessage(null);

    try {
      const response = await fetch(`/api/community/guides/${slug}/save`, { method: "POST" });
      const payload = (await response.json()) as GuideMutationResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to save guide.");
      }

      setMessage("Guide saved to your dashboard.");
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : "Unable to save guide.");
    } finally {
      setSavingSlug(null);
    }
  }

  async function deleteGuide() {
    if (!selectedGuide) return;

    if (!window.confirm("Delete this guide? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/community/guides/${selectedGuide.slug}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: { message?: string } };

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to delete guide.");
      }

      setMessage("Guide deleted.");
      setSelectedSlug(null);
      await loadGuides();
    } catch (deleteError) {
      setMessage(deleteError instanceof Error ? deleteError.message : "Unable to delete guide.");
    }
  }

  return (
    <main className="app-wrap page active">
      <CommunityTabs />

      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <p className="overline mb-8">DIY Guides</p>
          <h1 className="display" style={{ fontSize: "2rem" }}>Public tutorials and repair techniques</h1>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-sm" type="button" onClick={openCreateModal}>
            Add New
          </button>
          <Link href="/community" className="btn btn-outline btn-sm">
            Back to Overview
          </Link>
        </div>
      </div>

      <div className="grid-dash">
        <section className="card" style={{ display: "grid", gap: 14 }}>
          {error ? <p style={{ color: "#b35a1e" }}>{error}</p> : null}
          {isLoading ? <p className="body-sm">Loading guides...</p> : null}

          <div className="grid-2">
            {guides.map((guide) => (
              <article
                key={guide.slug}
                role="button"
                tabIndex={0}
                className="card card-hover"
                style={{ display: "grid", gap: 12, cursor: "pointer" }}
                onClick={() => setSelectedSlug(guide.slug)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setSelectedSlug(guide.slug);
                  }
                }}
              >
                <div className="flex-between">
                  <span className={`badge ${badgeClass(guide.category)}`}>{guide.category}</span>
                  {guide.featured ? <span className="badge badge-green">Featured</span> : null}
                </div>
                <div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    <span className="chip">{guide.difficulty}</span>
                    <span className="chip">{guide.readMinutes} min</span>
                  </div>
                  <h2 className="heading" style={{ fontSize: "1.15rem", marginBottom: 8 }}>{guide.title}</h2>
                  <p className="body-sm">{guide.summary}</p>
                  <p className="body-xs" style={{ marginTop: 8 }}>Created by {guide.createdByName ?? "Community member"}</p>
                </div>
                <div className="flex-between">
                  <p className="body-xs">{guide.likesCount} likes</p>
                  <button className="btn btn-outline btn-sm" type="button" onClick={(event) => { event.stopPropagation(); void likeGuide(guide.slug); }}>
                    Like
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="flex-col gap-12">
          <div className="card card-green">
            <p className="overline mb-8">Quick actions</p>
            <p className="body-sm" style={{ marginBottom: 14 }}>Use Add New to open a guide modal. Logged in users can publish, edit, save, and delete their own guides.</p>
            {status !== "authenticated" ? (
              <Link href="/sign-up" className="btn btn-primary btn-sm">Create Account</Link>
            ) : null}
          </div>
          {message ? <div className="card"><p className="body-sm">{message}</p></div> : null}
        </aside>
      </div>

      <CommunityModal
        open={Boolean(selectedGuide)}
        title={selectedGuide?.title ?? "Guide details"}
        description={selectedGuide ? `${selectedGuide.category} · ${selectedGuide.difficulty} · ${selectedGuide.readMinutes} min` : undefined}
        onClose={() => setSelectedSlug(null)}
        footer={selectedGuide ? (
          <div className="flex-between" style={{ flexWrap: "wrap", gap: 8 }}>
            <button className="btn btn-outline" type="button" onClick={() => void likeGuide(selectedGuide.slug)}>Like</button>
            <button className="btn btn-primary" type="button" onClick={() => void saveGuide(selectedGuide.slug)}>Save</button>
            {isOwner ? <button className="btn btn-primary" type="button" onClick={() => openEditModal(selectedGuide)}>Edit</button> : null}
            {isOwner ? <button className="btn btn-outline" type="button" onClick={() => void deleteGuide()}>Delete</button> : null}
          </div>
        ) : undefined}
      >
        {selectedGuide ? (
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span className={`badge ${badgeClass(selectedGuide.category)}`}>{selectedGuide.category}</span>
                {selectedGuide.featured ? <span className="badge badge-green">Featured</span> : null}
              </div>
              <p className="body-sm" style={{ marginBottom: 12 }}>{selectedGuide.summary}</p>
              <div className="card" style={{ background: "rgba(255,255,255,0.7)" }}>
                <p className="body-sm">{selectedGuide.body}</p>
              </div>
              <p className="body-xs" style={{ marginTop: 8 }}>Created by {selectedGuide.createdByName ?? "Community member"}</p>
            </div>
          </div>
        ) : null}
      </CommunityModal>

      <CommunityModal
        open={composeOpen}
        title={editingSlug ? "Edit guide" : "Add new guide"}
        description="Create a repair guide for the public community library."
        onClose={() => {
          setComposeOpen(false);
          setEditingSlug(null);
        }}
      >
        {status !== "authenticated" ? (
          <div className="card card-amber">
            <p className="body-sm">Sign in to publish a guide.</p>
          </div>
        ) : (
          <form onSubmit={submitGuide} style={{ display: "grid", gap: 10 }}>
            <label>
              <div className="body-xs" style={{ marginBottom: 4 }}>Title</div>
              <input className="w-full" required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <div className="grid-2">
              <label>
                <div className="body-xs" style={{ marginBottom: 4 }}>Category</div>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                  {guideCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label>
                <div className="body-xs" style={{ marginBottom: 4 }}>Difficulty</div>
                <select value={form.difficulty} onChange={(event) => setForm((current) => ({ ...current, difficulty: event.target.value }))}>
                  {difficultyLevels.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <div className="body-xs" style={{ marginBottom: 4 }}>Read time</div>
              <input type="number" min={3} max={60} className="w-full" value={form.readMinutes} onChange={(event) => setForm((current) => ({ ...current, readMinutes: Number(event.target.value) }))} />
            </label>
            <label>
              <div className="body-xs" style={{ marginBottom: 4 }}>Summary</div>
              <textarea className="field-input" rows={3} required value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} />
            </label>
            <label>
              <div className="body-xs" style={{ marginBottom: 4 }}>Guide body</div>
              <textarea className="field-input" rows={6} required value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} />
            </label>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingSlug ? "Save Changes" : "Publish Guide"}
            </button>
          </form>
        )}
      </CommunityModal>
    </main>
  );
}