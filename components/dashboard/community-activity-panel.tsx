"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type DashboardGuide = {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  readMinutes: number;
  summary: string;
  body: string;
  likesCount: number;
  featured: boolean;
  createdByName?: string;
};

type DashboardThreadComment = {
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

type DashboardThread = {
  slug: string;
  title: string;
  category: string;
  body: string;
  authorName: string;
  likesCount: number;
  commentCount: number;
  featured: boolean;
  comments?: DashboardThreadComment[];
};

type DashboardEvent = {
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
  createdByName?: string;
  spotsTotal: number;
  joinedCount: number;
  featured: boolean;
  isExpired: boolean;
};

type DashboardResponse = {
  data: {
    savedGuides: DashboardGuide[];
    joinedEvents: DashboardEvent[];
    createdEvents: DashboardEvent[];
    createdGuides: DashboardGuide[];
    createdThreads: DashboardThread[];
  };
  error?: { message?: string };
};

type EventEditForm = {
  title: string;
  type: string;
  category: string;
  location: string;
  suburb: string;
  startsAt: string;
  endLabel: string;
  summary: string;
  spotsTotal: number;
  featured: boolean;
};

type GuideEditForm = {
  title: string;
  category: string;
  difficulty: string;
  readMinutes: number;
  summary: string;
  body: string;
  featured: boolean;
};

type ThreadEditForm = {
  title: string;
  category: string;
  body: string;
  featured: boolean;
};

const emptyEventForm: EventEditForm = {
  title: "",
  type: "WORKSHOP",
  category: "ELECTRONICS",
  location: "",
  suburb: "",
  startsAt: "",
  endLabel: "4pm",
  summary: "",
  spotsTotal: 20,
  featured: false,
};

const emptyGuideForm: GuideEditForm = {
  title: "",
  category: "ELECTRONICS",
  difficulty: "BEGINNER",
  readMinutes: 10,
  summary: "",
  body: "",
  featured: false,
};

const emptyThreadForm: ThreadEditForm = {
  title: "",
  category: "GENERAL",
  body: "",
  featured: false,
};

function formatEventDate(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    day: "2-digit",
  }).format(date);
}

function splitDashboardEvents(events: DashboardEvent[]) {
  return {
    active: events.filter((event) => !event.isExpired),
    expired: events.filter((event) => event.isExpired),
  };
}

function formatCommentDate(iso: string) {
  return new Intl.DateTimeFormat("en-AU", { month: "short", day: "2-digit" }).format(new Date(iso));
}

export function CommunityActivityPanel() {
  const [dashboard, setDashboard] = useState<DashboardResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [guideMessage, setGuideMessage] = useState<string | null>(null);
  const [threadMessage, setThreadMessage] = useState<string | null>(null);

  const [savingEvent, setSavingEvent] = useState(false);
  const [savingGuide, setSavingGuide] = useState(false);
  const [savingThread, setSavingThread] = useState(false);
  const [deletingEventSlug, setDeletingEventSlug] = useState<string | null>(null);
  const [deletingGuideSlug, setDeletingGuideSlug] = useState<string | null>(null);
  const [deletingThreadSlug, setDeletingThreadSlug] = useState<string | null>(null);
  const [leavingEventSlug, setLeavingEventSlug] = useState<string | null>(null);

  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(null);
  const [selectedGuideSlug, setSelectedGuideSlug] = useState<string | null>(null);
  const [selectedThreadSlug, setSelectedThreadSlug] = useState<string | null>(null);

  const [eventForm, setEventForm] = useState<EventEditForm>(emptyEventForm);
  const [guideForm, setGuideForm] = useState<GuideEditForm>(emptyGuideForm);
  const [threadForm, setThreadForm] = useState<ThreadEditForm>(emptyThreadForm);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard/community", { cache: "no-store" });
      const payload = (await response.json()) as DashboardResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to load dashboard data.");
      }

      setDashboard(payload.data);

      if (!selectedEventSlug && payload.data.createdEvents.length > 0) {
        setSelectedEventSlug(payload.data.createdEvents[0].slug);
      }

      if (!selectedGuideSlug && payload.data.createdGuides.length > 0) {
        setSelectedGuideSlug(payload.data.createdGuides[0].slug);
      }

      if (!selectedThreadSlug && payload.data.createdThreads.length > 0) {
        setSelectedThreadSlug(payload.data.createdThreads[0].slug);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!dashboard || dashboard.createdEvents.length === 0) {
      setEventForm(emptyEventForm);
    } else {
      const selectedEvent = dashboard.createdEvents.find((event) => event.slug === selectedEventSlug) ?? dashboard.createdEvents[0];
      setSelectedEventSlug(selectedEvent.slug);
      setEventForm({
        title: selectedEvent.title,
        type: selectedEvent.type,
        category: selectedEvent.category,
        location: selectedEvent.location,
        suburb: selectedEvent.suburb,
        startsAt: selectedEvent.startsAt.slice(0, 16),
        endLabel: selectedEvent.endLabel,
        summary: selectedEvent.summary,
        spotsTotal: selectedEvent.spotsTotal,
        featured: selectedEvent.featured,
      });
    }

    if (!dashboard || dashboard.createdGuides.length === 0) {
      setGuideForm(emptyGuideForm);
    } else {
      const selectedGuide = dashboard.createdGuides.find((guide) => guide.slug === selectedGuideSlug) ?? dashboard.createdGuides[0];
      setSelectedGuideSlug(selectedGuide.slug);
      setGuideForm({
        title: selectedGuide.title,
        category: selectedGuide.category,
        difficulty: selectedGuide.difficulty,
        readMinutes: selectedGuide.readMinutes,
        summary: selectedGuide.summary,
        body: selectedGuide.body,
        featured: selectedGuide.featured,
      });
    }

    if (!dashboard || dashboard.createdThreads.length === 0) {
      setThreadForm(emptyThreadForm);
    } else {
      const selectedThread = dashboard.createdThreads.find((thread) => thread.slug === selectedThreadSlug) ?? dashboard.createdThreads[0];
      setSelectedThreadSlug(selectedThread.slug);
      setThreadForm({
        title: selectedThread.title,
        category: selectedThread.category,
        body: selectedThread.body,
        featured: selectedThread.featured,
      });
    }
  }, [dashboard, selectedEventSlug, selectedGuideSlug, selectedThreadSlug]);

  const selectedEvent = dashboard?.createdEvents.find((event) => event.slug === selectedEventSlug) ?? null;
  const selectedGuide = dashboard?.createdGuides.find((guide) => guide.slug === selectedGuideSlug) ?? null;
  const selectedThread = dashboard?.createdThreads.find((thread) => thread.slug === selectedThreadSlug) ?? null;
  const splitCreatedEvents = splitDashboardEvents(dashboard?.createdEvents ?? []);

  async function updateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEventSlug) return;

    setSavingEvent(true);
    setEventMessage(null);

    try {
      const response = await fetch(`/api/community/events/${selectedEventSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...eventForm,
          startsAt: new Date(eventForm.startsAt).toISOString(),
        }),
      });
      const payload = (await response.json()) as DashboardResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to update event.");
      }

      setEventMessage("Event updated.");
      await loadDashboard();
    } catch (saveError) {
      setEventMessage(saveError instanceof Error ? saveError.message : "Unable to update event.");
    } finally {
      setSavingEvent(false);
    }
  }

  async function deleteEvent(slug: string) {
    setDeletingEventSlug(slug);
    setEventMessage(null);

    try {
      const response = await fetch(`/api/community/events/${slug}`, { method: "DELETE" });
      const payload = (await response.json()) as DashboardResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to delete event.");
      }

      setEventMessage("Event deleted.");
      if (selectedEventSlug === slug) {
        setSelectedEventSlug(null);
      }
      await loadDashboard();
    } catch (deleteError) {
      setEventMessage(deleteError instanceof Error ? deleteError.message : "Unable to delete event.");
    } finally {
      setDeletingEventSlug(null);
    }
  }

  async function updateGuide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedGuideSlug) return;

    setSavingGuide(true);
    setGuideMessage(null);

    try {
      const response = await fetch(`/api/community/guides/${selectedGuideSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guideForm),
      });
      const payload = (await response.json()) as DashboardResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to update guide.");
      }

      setGuideMessage("Guide updated.");
      await loadDashboard();
    } catch (saveError) {
      setGuideMessage(saveError instanceof Error ? saveError.message : "Unable to update guide.");
    } finally {
      setSavingGuide(false);
    }
  }

  async function deleteGuide(slug: string) {
    setDeletingGuideSlug(slug);
    setGuideMessage(null);

    try {
      const response = await fetch(`/api/community/guides/${slug}`, { method: "DELETE" });
      const payload = (await response.json()) as DashboardResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to delete guide.");
      }

      setGuideMessage("Guide deleted.");
      if (selectedGuideSlug === slug) {
        setSelectedGuideSlug(null);
      }
      await loadDashboard();
    } catch (deleteError) {
      setGuideMessage(deleteError instanceof Error ? deleteError.message : "Unable to delete guide.");
    } finally {
      setDeletingGuideSlug(null);
    }
  }

  async function updateThread(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedThreadSlug) return;

    setSavingThread(true);
    setThreadMessage(null);

    try {
      const response = await fetch(`/api/community/forum/${selectedThreadSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(threadForm),
      });
      const payload = (await response.json()) as DashboardResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to update thread.");
      }

      setThreadMessage("Thread updated.");
      await loadDashboard();
    } catch (saveError) {
      setThreadMessage(saveError instanceof Error ? saveError.message : "Unable to update thread.");
    } finally {
      setSavingThread(false);
    }
  }

  async function deleteThread(slug: string) {
    setDeletingThreadSlug(slug);
    setThreadMessage(null);

    try {
      const response = await fetch(`/api/community/forum/${slug}`, { method: "DELETE" });
      const payload = (await response.json()) as DashboardResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to delete thread.");
      }

      setThreadMessage("Thread deleted.");
      if (selectedThreadSlug === slug) {
        setSelectedThreadSlug(null);
      }
      await loadDashboard();
    } catch (deleteError) {
      setThreadMessage(deleteError instanceof Error ? deleteError.message : "Unable to delete thread.");
    } finally {
      setDeletingThreadSlug(null);
    }
  }

  async function leaveJoinedEvent(slug: string) {
    if (!window.confirm("Leave this event? You will be removed from the attendee list.")) {
      return;
    }

    setLeavingEventSlug(slug);
    setEventMessage(null);

    try {
      const response = await fetch(`/api/community/events/${slug}/join`, { method: "DELETE" });
      const payload = (await response.json()) as DashboardResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to leave event.");
      }

      setEventMessage("Left event.");
      await loadDashboard();
    } catch (leaveError) {
      setEventMessage(leaveError instanceof Error ? leaveError.message : "Unable to leave event.");
    } finally {
      setLeavingEventSlug(null);
    }
  }

  if (loading) {
    return (
      <section className="card" style={{ marginTop: 24 }}>
        <p className="body-sm">Loading your community dashboard...</p>
      </section>
    );
  }

  return (
    <section style={{ marginTop: 24, display: "grid", gap: 16 }}>
      {error ? <p style={{ color: "#b35a1e" }}>{error}</p> : null}

      <div className="grid-dash">
        <div className="card">
          <div className="flex-between mb-16">
            <div>
              <p className="overline mb-8">Saved DIY Guides</p>
              <h2 className="heading" style={{ fontSize: "1.3rem" }}>Your guide library</h2>
            </div>
            <Link href="/community/guides" className="btn btn-outline btn-sm">Browse Guides</Link>
          </div>
          <div className="flex-col gap-8">
            {(dashboard?.savedGuides ?? []).length > 0 ? (
              dashboard?.savedGuides.map((guide) => (
                <div key={guide.slug} className="job-row">
                  <div>
                    <p className="fw-600">{guide.title}</p>
                    <p className="body-xs">{guide.category} · {guide.difficulty} · {guide.readMinutes} min</p>
                  </div>
                  <span className="badge badge-green">Saved</span>
                </div>
              ))
            ) : (
              <p className="body-sm">No saved guides yet. Save one from the community guides page.</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex-between mb-16">
            <div>
              <p className="overline mb-8">Joined Events</p>
              <h2 className="heading" style={{ fontSize: "1.3rem" }}>Your RSVP list</h2>
            </div>
            <Link href="/community/events" className="btn btn-outline btn-sm">Browse Events</Link>
          </div>
          <div className="flex-col gap-8">
            {(dashboard?.joinedEvents ?? []).length > 0 ? (
              dashboard?.joinedEvents.map((eventItem) => (
                <div key={eventItem.slug} className="job-row">
                  <div>
                    <p className="fw-600">{eventItem.title}</p>
                    <p className="body-xs">{formatEventDate(eventItem.startsAt)} · {eventItem.location} · {eventItem.suburb}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <span className="badge badge-blue">{Math.max(eventItem.spotsTotal - eventItem.joinedCount, 0)} spots left</span>
                    <button className="btn btn-outline btn-sm" type="button" disabled={leavingEventSlug === eventItem.slug} onClick={() => void leaveJoinedEvent(eventItem.slug)}>
                      {leavingEventSlug === eventItem.slug ? "Leaving..." : "Leave"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="body-sm">No joined events yet. Join a workshop to see it here.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid-dash">
        <div className="card">
          <div className="flex-between mb-16">
            <div>
              <p className="overline mb-8">Created Guides</p>
              <h2 className="heading" style={{ fontSize: "1.3rem" }}>Edit and delete your guides</h2>
            </div>
            <Link href="/community/guides" className="btn btn-outline btn-sm">Open Guides</Link>
          </div>

          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div>
              <p className="overline mb-8">Your guides</p>
              <div className="flex-col gap-8">
                {(dashboard?.createdGuides ?? []).length > 0 ? (
                  dashboard?.createdGuides.map((guide) => (
                    <button
                      key={guide.slug}
                      type="button"
                      className={`card ${selectedGuideSlug === guide.slug ? "card-green" : ""}`}
                      style={{ textAlign: "left" }}
                      onClick={() => setSelectedGuideSlug(guide.slug)}
                    >
                      <p className="fw-600">{guide.title}</p>
                      <p className="body-xs">{guide.category} · {guide.difficulty} · {guide.readMinutes} min</p>
                      <p className="body-xs">Created by {guide.createdByName ?? "you"}</p>
                    </button>
                  ))
                ) : (
                  <p className="body-sm">You have not created any guides yet.</p>
                )}
              </div>
            </div>
            <div>
              <p className="overline mb-8">Selected guide</p>
              {selectedGuide ? (
                <form className="card card-green" onSubmit={updateGuide} style={{ display: "grid", gap: 10 }}>
                  <div className="grid-2">
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Title</div>
                      <input className="w-full" value={guideForm.title} onChange={(event) => setGuideForm((current) => ({ ...current, title: event.target.value }))} />
                    </label>
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Category</div>
                      <select value={guideForm.category} onChange={(event) => setGuideForm((current) => ({ ...current, category: event.target.value }))}>
                        <option value="ELECTRONICS">ELECTRONICS</option>
                        <option value="FURNITURE">FURNITURE</option>
                        <option value="CLOTHING">CLOTHING</option>
                        <option value="BIKES">BIKES</option>
                      </select>
                    </label>
                  </div>
                  <div className="grid-2">
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Difficulty</div>
                      <select value={guideForm.difficulty} onChange={(event) => setGuideForm((current) => ({ ...current, difficulty: event.target.value }))}>
                        <option value="BEGINNER">BEGINNER</option>
                        <option value="INTERMEDIATE">INTERMEDIATE</option>
                        <option value="ADVANCED">ADVANCED</option>
                      </select>
                    </label>
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Read minutes</div>
                      <input className="w-full" type="number" min={3} value={guideForm.readMinutes} onChange={(event) => setGuideForm((current) => ({ ...current, readMinutes: Number(event.target.value) }))} />
                    </label>
                  </div>
                  <label>
                    <div className="body-xs" style={{ marginBottom: 4 }}>Summary</div>
                    <textarea className="field-input" rows={3} value={guideForm.summary} onChange={(event) => setGuideForm((current) => ({ ...current, summary: event.target.value }))} />
                  </label>
                  <label>
                    <div className="body-xs" style={{ marginBottom: 4 }}>Body</div>
                    <textarea className="field-input" rows={5} value={guideForm.body} onChange={(event) => setGuideForm((current) => ({ ...current, body: event.target.value }))} />
                  </label>
                  <label>
                    <div className="body-xs" style={{ marginBottom: 4 }}>Featured</div>
                    <select value={guideForm.featured ? "yes" : "no"} onChange={(event) => setGuideForm((current) => ({ ...current, featured: event.target.value === "yes" }))}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>
                  {guideMessage ? <p style={{ color: "#1d4b20", fontSize: 12 }}>{guideMessage}</p> : null}
                  <div className="flex-between">
                    <button className="btn btn-primary" type="submit" disabled={savingGuide}>
                      {savingGuide ? "Saving..." : "Save Guide Changes"}
                    </button>
                    <button
                      className="btn btn-outline"
                      type="button"
                      disabled={deletingGuideSlug === selectedGuide.slug}
                      onClick={() => void deleteGuide(selectedGuide.slug)}
                    >
                      {deletingGuideSlug === selectedGuide.slug ? "Deleting..." : "Delete Guide"}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="body-sm">Select one of your guides to edit it.</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex-between mb-16">
            <div>
              <p className="overline mb-8">Created Forum Posts</p>
              <h2 className="heading" style={{ fontSize: "1.3rem" }}>Edit posts and review comments</h2>
            </div>
            <Link href="/community/forum" className="btn btn-outline btn-sm">Open Forum</Link>
          </div>

          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div>
              <p className="overline mb-8">Your posts</p>
              <div className="flex-col gap-8">
                {(dashboard?.createdThreads ?? []).length > 0 ? (
                  dashboard?.createdThreads.map((thread) => (
                    <button
                      key={thread.slug}
                      type="button"
                      className={`card ${selectedThreadSlug === thread.slug ? "card-green" : ""}`}
                      style={{ textAlign: "left" }}
                      onClick={() => setSelectedThreadSlug(thread.slug)}
                    >
                      <p className="fw-600">{thread.title}</p>
                      <p className="body-xs">{thread.category} · {thread.commentCount} comments · {thread.likesCount} likes</p>
                      <p className="body-xs">Posted by {thread.authorName}</p>
                    </button>
                  ))
                ) : (
                  <p className="body-sm">You have not created any forum posts yet.</p>
                )}
              </div>
            </div>
            <div>
              <p className="overline mb-8">Selected post</p>
              {selectedThread ? (
                <form className="card card-green" onSubmit={updateThread} style={{ display: "grid", gap: 10 }}>
                  <div className="grid-2">
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Title</div>
                      <input className="w-full" value={threadForm.title} onChange={(event) => setThreadForm((current) => ({ ...current, title: event.target.value }))} />
                    </label>
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Category</div>
                      <select value={threadForm.category} onChange={(event) => setThreadForm((current) => ({ ...current, category: event.target.value }))}>
                        <option value="GENERAL">GENERAL</option>
                        <option value="ELECTRONICS">ELECTRONICS</option>
                        <option value="FURNITURE">FURNITURE</option>
                        <option value="CLOTHING">CLOTHING</option>
                        <option value="BIKES">BIKES</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    <div className="body-xs" style={{ marginBottom: 4 }}>Body</div>
                    <textarea className="field-input" rows={5} value={threadForm.body} onChange={(event) => setThreadForm((current) => ({ ...current, body: event.target.value }))} />
                  </label>
                  <label>
                    <div className="body-xs" style={{ marginBottom: 4 }}>Featured</div>
                    <select value={threadForm.featured ? "yes" : "no"} onChange={(event) => setThreadForm((current) => ({ ...current, featured: event.target.value === "yes" }))}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>
                  {threadMessage ? <p style={{ color: "#1d4b20", fontSize: 12 }}>{threadMessage}</p> : null}
                  <div className="flex-between">
                    <button className="btn btn-primary" type="submit" disabled={savingThread}>
                      {savingThread ? "Saving..." : "Save Post Changes"}
                    </button>
                    <button
                      className="btn btn-outline"
                      type="button"
                      disabled={deletingThreadSlug === selectedThread.slug}
                      onClick={() => void deleteThread(selectedThread.slug)}
                    >
                      {deletingThreadSlug === selectedThread.slug ? "Deleting..." : "Delete Post"}
                    </button>
                  </div>

                  <div className="card" style={{ background: "rgba(255,255,255,0.5)" }}>
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
                        <p className="body-sm">No comments yet on this post.</p>
                      )}
                    </div>
                  </div>
                </form>
              ) : (
                <p className="body-sm">Select one of your forum posts to edit it.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-dash">
        <div className="card">
          <div className="flex-between mb-16">
            <div>
              <p className="overline mb-8">Created Events</p>
              <h2 className="heading" style={{ fontSize: "1.3rem" }}>Manage your events</h2>
            </div>
            <Link href="/community/events" className="btn btn-outline btn-sm">Open Calendar</Link>
          </div>

          {(dashboard?.createdEvents ?? []).length > 0 ? (
            <>
              <div className="grid-2" style={{ marginBottom: 16 }}>
                <div>
                  <p className="overline mb-8">Active</p>
                  <div className="flex-col gap-8">
                    {splitCreatedEvents.active.length > 0 ? (
                      splitCreatedEvents.active.map((eventItem) => (
                        <button
                          key={eventItem.slug}
                          type="button"
                          className={`card ${selectedEventSlug === eventItem.slug ? "card-green" : ""}`}
                          style={{ textAlign: "left" }}
                          onClick={() => setSelectedEventSlug(eventItem.slug)}
                        >
                          <p className="fw-600">{eventItem.title}</p>
                          <p className="body-xs">{formatEventDate(eventItem.startsAt)} · {eventItem.joinedCount} joined · {Math.max(eventItem.spotsTotal - eventItem.joinedCount, 0)} spots left</p>
                        </button>
                      ))
                    ) : (
                      <p className="body-sm">No active events right now.</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="overline mb-8">Expired</p>
                  <div className="flex-col gap-8">
                    {splitCreatedEvents.expired.length > 0 ? (
                      splitCreatedEvents.expired.map((eventItem) => (
                        <button
                          key={eventItem.slug}
                          type="button"
                          className={`card ${selectedEventSlug === eventItem.slug ? "card-amber" : ""}`}
                          style={{ textAlign: "left" }}
                          onClick={() => setSelectedEventSlug(eventItem.slug)}
                        >
                          <p className="fw-600">{eventItem.title}</p>
                          <p className="body-xs">Expired · {eventItem.joinedCount} joined</p>
                        </button>
                      ))
                    ) : (
                      <p className="body-sm">No expired events yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedEvent ? (
                <form className="card card-green" onSubmit={updateEvent} style={{ display: "grid", gap: 10 }}>
                  <div className="flex-between">
                    <div>
                      <p className="overline mb-8">Selected Event</p>
                      <h3 className="heading" style={{ fontSize: "1.2rem" }}>{selectedEvent.title}</h3>
                    </div>
                    <span className="badge badge-green">{selectedEvent.joinedCount} joined</span>
                  </div>
                  <div className="grid-2">
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Title</div>
                      <input className="w-full" value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} />
                    </label>
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Type</div>
                      <select value={eventForm.type} onChange={(event) => setEventForm((current) => ({ ...current, type: event.target.value }))}>
                        <option value="REPAIR_CAFE">REPAIR_CAFE</option>
                        <option value="WORKSHOP">WORKSHOP</option>
                        <option value="MEETUP">MEETUP</option>
                        <option value="BIKE_DAY">BIKE_DAY</option>
                      </select>
                    </label>
                  </div>
                  <div className="grid-2">
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Category</div>
                      <select value={eventForm.category} onChange={(event) => setEventForm((current) => ({ ...current, category: event.target.value }))}>
                        <option value="ELECTRONICS">ELECTRONICS</option>
                        <option value="FURNITURE">FURNITURE</option>
                        <option value="CLOTHING">CLOTHING</option>
                        <option value="BIKES">BIKES</option>
                      </select>
                    </label>
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Suburb</div>
                      <input className="w-full" value={eventForm.suburb} onChange={(event) => setEventForm((current) => ({ ...current, suburb: event.target.value }))} />
                    </label>
                  </div>
                  <label>
                    <div className="body-xs" style={{ marginBottom: 4 }}>Location</div>
                    <input className="w-full" value={eventForm.location} onChange={(event) => setEventForm((current) => ({ ...current, location: event.target.value }))} />
                  </label>
                  <div className="grid-2">
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Starts at</div>
                      <input className="w-full" type="datetime-local" value={eventForm.startsAt} onChange={(event) => setEventForm((current) => ({ ...current, startsAt: event.target.value }))} />
                    </label>
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Ends label</div>
                      <input className="w-full" value={eventForm.endLabel} onChange={(event) => setEventForm((current) => ({ ...current, endLabel: event.target.value }))} />
                    </label>
                  </div>
                  <label>
                    <div className="body-xs" style={{ marginBottom: 4 }}>Summary</div>
                    <textarea className="field-input" rows={3} value={eventForm.summary} onChange={(event) => setEventForm((current) => ({ ...current, summary: event.target.value }))} />
                  </label>
                  <div className="grid-2">
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Spots total</div>
                      <input className="w-full" type="number" min={1} value={eventForm.spotsTotal} onChange={(event) => setEventForm((current) => ({ ...current, spotsTotal: Number(event.target.value) }))} />
                    </label>
                    <label>
                      <div className="body-xs" style={{ marginBottom: 4 }}>Featured</div>
                      <select value={eventForm.featured ? "yes" : "no"} onChange={(event) => setEventForm((current) => ({ ...current, featured: event.target.value === "yes" }))}>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </label>
                  </div>
                  {eventMessage ? <p style={{ color: "#1d4b20", fontSize: 12 }}>{eventMessage}</p> : null}
                  <div className="flex-between">
                    <button className="btn btn-primary" type="submit" disabled={savingEvent}>
                      {savingEvent ? "Saving..." : "Save Event Changes"}
                    </button>
                    <button
                      className="btn btn-outline"
                      type="button"
                      disabled={deletingEventSlug === selectedEvent.slug}
                      onClick={() => void deleteEvent(selectedEvent.slug)}
                    >
                      {deletingEventSlug === selectedEvent.slug ? "Deleting..." : "Delete Event"}
                    </button>
                  </div>
                  <p className="body-xs">Visible only to you as the creator. Edit details, track joined people, and manage active vs expired events.</p>
                </form>
              ) : null}
            </>
          ) : (
            <p className="body-sm">You have not created any events yet.</p>
          )}
        </div>

        <div className="flex-col gap-12">
          <div className="card card-amber">
            <p className="overline mb-8">Creator visibility</p>
            <p className="body-sm">Only items you created appear here. Other users cannot see this management section.</p>
          </div>
          <div className="card">
            <p className="overline mb-8">Selected event summary</p>
            {selectedEvent ? (
              <div className="body-sm">
                <p>{selectedEvent.hostName}</p>
                <p>{selectedEvent.joinedCount} joined</p>
                <p>{Math.max(selectedEvent.spotsTotal - selectedEvent.joinedCount, 0)} spots left</p>
              </div>
            ) : (
              <p className="body-sm">Select one of your created events to edit it.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}