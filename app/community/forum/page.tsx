"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CommunityTabs } from "@/components/community/community-tabs";
import { CommunityModal } from "@/components/community/community-modal";

type ForumComment = {
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

type ForumThread = {
  slug: string;
  title: string;
  category: string;
  body: string;
  authorName: string;
  createdById?: string;
  createdByName?: string;
  likesCount: number;
  commentCount: number;
  featured: boolean;
  comments?: ForumComment[];
};

type ForumListResponse = {
  data: { threads: ForumThread[] };
  error?: { message?: string };
};

type ThreadMutationResponse = {
  data: ForumThread;
  error?: { message?: string };
};

const forumCategories = ["ELECTRONICS", "FURNITURE", "CLOTHING", "BIKES", "GENERAL"] as const;

function badgeClass(category: string) {
  if (category === "CLOTHING") return "badge-amber";
  if (category === "FURNITURE") return "badge-green";
  return "badge-blue";
}

function formatCommentDate(iso: string) {
  return new Intl.DateTimeFormat("en-AU", { month: "short", day: "2-digit" }).format(new Date(iso));
}

const emptyForm = {
  title: "",
  category: "GENERAL",
  body: "",
};

export default function CommunityForumPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [newThread, setNewThread] = useState(emptyForm);

  async function loadThreads() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/community/forum", { cache: "no-store" });
      const payload = (await response.json()) as ForumListResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to load forum.");
      }

      setThreads(payload.data.threads);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load forum.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadThreads();
  }, []);

  const selectedThread = threads.find((thread) => thread.slug === selectedSlug) ?? null;
  const isOwner = Boolean(
    selectedThread &&
    status === "authenticated" &&
    session?.user?.id &&
    selectedThread.createdById === session.user.id,
  );

  useEffect(() => {
    if (selectedThread) {
      setCommentBody("");
    }
  }, [selectedThread?.slug]);

  function openCreateModal() {
    setEditingSlug(null);
    setNewThread(emptyForm);
    setComposeOpen(true);
  }

  function openEditModal(thread: ForumThread) {
    setEditingSlug(thread.slug);
    setNewThread({
      title: thread.title,
      category: thread.category,
      body: thread.body,
    });
    setComposeOpen(true);
  }

  async function submitThread(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status !== "authenticated") {
      router.push("/sign-in?callbackUrl=/community/forum");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(editingSlug ? `/api/community/forum/${editingSlug}` : "/api/community/forum", {
        method: editingSlug ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newThread),
      });
      const payload = (await response.json()) as ThreadMutationResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to post question.");
      }

      setMessage(editingSlug ? "Discussion updated." : "Discussion posted.");
      setComposeOpen(false);
      setEditingSlug(null);
      setNewThread(emptyForm);
      await loadThreads();
    } catch (submitError) {
      setMessage(submitError instanceof Error ? submitError.message : "Unable to post question.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function likeThread(slug: string) {
    if (status !== "authenticated") {
      router.push("/sign-in?callbackUrl=/community/forum");
      return;
    }

    try {
      const response = await fetch(`/api/community/forum/${slug}/like`, { method: "POST" });
      const payload = (await response.json()) as ThreadMutationResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to like thread.");
      }

      setThreads((current) => current.map((thread) => (thread.slug === slug ? payload.data : thread)));
      if (selectedSlug === slug) {
        setSelectedSlug(slug);
      }
    } catch (likeError) {
      setMessage(likeError instanceof Error ? likeError.message : "Unable to like thread.");
    }
  }

  async function commentThread() {
    if (!selectedThread) return;

    if (status !== "authenticated") {
      router.push("/sign-in?callbackUrl=/community/forum");
      return;
    }

    const body = commentBody.trim();
    if (!body) return;

    try {
      const response = await fetch(`/api/community/forum/${selectedThread.slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const payload = (await response.json()) as ThreadMutationResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to comment.");
      }

      setThreads((current) => current.map((thread) => (thread.slug === selectedThread.slug ? payload.data : thread)));
      setCommentBody("");
    } catch (commentError) {
      setMessage(commentError instanceof Error ? commentError.message : "Unable to comment.");
    }
  }

  async function deleteThread() {
    if (!selectedThread) return;

    if (!window.confirm("Delete this discussion? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/community/forum/${selectedThread.slug}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: { message?: string } };

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to delete thread.");
      }

      setMessage("Discussion deleted.");
      setSelectedSlug(null);
      await loadThreads();
    } catch (deleteError) {
      setMessage(deleteError instanceof Error ? deleteError.message : "Unable to delete thread.");
    }
  }

  return (
    <main className="app-wrap page active">
      <CommunityTabs />

      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <p className="overline mb-8">Community Forum</p>
          <h1 className="display" style={{ fontSize: "2rem" }}>Ask, answer, and learn together</h1>
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
        <section className="card" style={{ display: "grid", gap: 0 }}>
          {error ? <p style={{ color: "#b35a1e", marginBottom: 12 }}>{error}</p> : null}
          {isLoading ? <p className="body-sm">Loading discussions...</p> : null}

          {threads.map((thread, index) => (
            <article
              key={thread.slug}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedSlug(thread.slug)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setSelectedSlug(thread.slug);
                }
              }}
              style={{
                padding: "18px 0",
                borderTop: index === 0 ? "none" : "1px solid #ece5db",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span className={`badge ${badgeClass(thread.category)}`}>{thread.category}</span>
                {thread.featured ? <span className="badge badge-green">Popular</span> : null}
              </div>
              <h2 className="heading" style={{ fontSize: "1.2rem", marginBottom: 8 }}>{thread.title}</h2>
              <p className="body-sm" style={{ marginBottom: 12 }}>{thread.body}</p>
              <div className="flex-between" style={{ marginBottom: 14 }}>
                <p className="body-xs">Asked by {thread.authorName} · {thread.commentCount} replies · {thread.likesCount} likes</p>
                <button className="btn btn-outline btn-sm" type="button" onClick={(event) => { event.stopPropagation(); void likeThread(thread.slug); }}>
                  Like
                </button>
              </div>
              <p className="body-xs">Click for details, comments, and creator actions.</p>
            </article>
          ))}
        </section>

        <aside className="flex-col gap-12">
          <div className="card card-green">
            <p className="overline mb-8">Quick actions</p>
            <p className="body-sm" style={{ marginBottom: 14 }}>Use Add New to open a post modal. Logged in users can ask questions, edit their posts, and delete their own discussions.</p>
            {status !== "authenticated" ? (
              <Link href="/sign-up" className="btn btn-primary btn-sm">Create Account</Link>
            ) : null}
          </div>

          {message ? <div className="card"><p className="body-sm">{message}</p></div> : null}
        </aside>
      </div>

      <CommunityModal
        open={Boolean(selectedThread)}
        title={selectedThread?.title ?? "Thread details"}
        description={selectedThread ? `Asked by ${selectedThread.authorName} · ${selectedThread.category}` : undefined}
        onClose={() => setSelectedSlug(null)}
        footer={selectedThread ? (
          <div className="flex-between" style={{ flexWrap: "wrap", gap: 8 }}>
            <button className="btn btn-outline" type="button" onClick={() => void likeThread(selectedThread.slug)}>Like</button>
            {isOwner ? <button className="btn btn-primary" type="button" onClick={() => openEditModal(selectedThread)}>Edit</button> : null}
            {isOwner ? <button className="btn btn-outline" type="button" onClick={() => void deleteThread()}>Delete</button> : null}
          </div>
        ) : undefined}
      >
        {selectedThread ? (
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span className={`badge ${badgeClass(selectedThread.category)}`}>{selectedThread.category}</span>
                {selectedThread.featured ? <span className="badge badge-green">Popular</span> : null}
              </div>
              <p className="body-sm">{selectedThread.body}</p>
              <p className="body-xs" style={{ marginTop: 8 }}>Created by {selectedThread.createdByName ?? selectedThread.authorName}</p>
            </div>

            <div className="card" style={{ background: "rgba(255,255,255,0.7)" }}>
              <p className="overline mb-8">Comments</p>
              <div className="flex-col gap-8">
                {(selectedThread.comments ?? []).length > 0 ? (
                  selectedThread.comments?.map((comment) => (
                    <div key={`${comment.authorId}-${comment.createdAt}`} className="job-row" style={{ alignItems: "start" }}>
                      <div>
                        <p className="fw-600">{comment.authorName}</p>
                        <p className="body-xs">{formatCommentDate(comment.createdAt)}</p>
                        <p className="body-sm">{comment.body}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="body-sm">No comments yet.</p>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label>
                <div className="body-xs" style={{ marginBottom: 4 }}>Add a reply</div>
                <textarea
                  className="field-input"
                  rows={3}
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder={status === "authenticated" ? "Write a helpful reply" : "Sign in to comment"}
                />
              </label>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => void commentThread()}>
                Comment
              </button>
            </div>
          </div>
        ) : null}
      </CommunityModal>

      <CommunityModal
        open={composeOpen}
        title={editingSlug ? "Edit discussion" : "Add new discussion"}
        description="Create a public forum post for the repair community."
        onClose={() => {
          setComposeOpen(false);
          setEditingSlug(null);
        }}
      >
        {status !== "authenticated" ? (
          <div className="card card-amber">
            <p className="body-sm">Sign in to post a discussion.</p>
          </div>
        ) : (
          <form onSubmit={submitThread} style={{ display: "grid", gap: 10 }}>
            <label>
              <div className="body-xs" style={{ marginBottom: 4 }}>Title</div>
              <input className="w-full" required value={newThread.title} onChange={(event) => setNewThread((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <label>
              <div className="body-xs" style={{ marginBottom: 4 }}>Category</div>
              <select value={newThread.category} onChange={(event) => setNewThread((current) => ({ ...current, category: event.target.value }))}>
                {forumCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              <div className="body-xs" style={{ marginBottom: 4 }}>Question</div>
              <textarea className="field-input" rows={6} required value={newThread.body} onChange={(event) => setNewThread((current) => ({ ...current, body: event.target.value }))} />
            </label>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingSlug ? "Save Changes" : "Post Question"}
            </button>
          </form>
        )}
      </CommunityModal>
    </main>
  );
}