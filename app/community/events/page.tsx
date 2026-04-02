"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CommunityTabs } from "@/components/community/community-tabs";
import { CommunityModal } from "@/components/community/community-modal";

type CommunityEvent = {
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
  createdById?: string;
  createdByName?: string;
  spotsTotal: number;
  joinedCount: number;
  featured: boolean;
};

type EventsResponse = {
  data: { events: CommunityEvent[] };
  error?: { message?: string };
};

type EventMutationResponse = {
  data: CommunityEvent | { deleted?: boolean; left?: boolean };
  error?: { message?: string };
};

const eventTypes = ["REPAIR_CAFE", "WORKSHOP", "MEETUP", "BIKE_DAY"] as const;
const eventCategories = ["ELECTRONICS", "FURNITURE", "CLOTHING", "BIKES"] as const;

function badgeClass(category: string) {
  if (category === "CLOTHING") return "badge-amber";
  if (category === "FURNITURE") return "badge-green";
  return "badge-blue";
}

function formatDateLabel(iso: string) {
  const date = new Date(iso);
  const month = new Intl.DateTimeFormat("en-AU", { month: "short" }).format(date).toUpperCase();
  const day = new Intl.DateTimeFormat("en-AU", { day: "2-digit" }).format(date);
  return { month, day };
}

const emptyForm = {
  title: "",
  type: "WORKSHOP",
  category: "ELECTRONICS",
  location: "",
  suburb: "Canberra City",
  startsAt: "",
  endLabel: "4pm",
  summary: "",
  spotsTotal: 20,
  featured: false,
};

export default function CommunityEventsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadEvents() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/community/events", { cache: "no-store" });
      const payload = (await response.json()) as EventsResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to load events.");
      }

      setEvents(payload.data.events);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load events.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  const selectedEvent = events.find((event) => event.slug === selectedSlug) ?? null;
  const isOwner = Boolean(
    selectedEvent &&
    status === "authenticated" &&
    session?.user?.id &&
    selectedEvent.createdById === session.user.id,
  );

  function openCreateModal() {
    setEditingSlug(null);
    setForm(emptyForm);
    setComposeOpen(true);
  }

  function openEditModal(eventItem: CommunityEvent) {
    setEditingSlug(eventItem.slug);
    setForm({
      title: eventItem.title,
      type: eventItem.type,
      category: eventItem.category,
      location: eventItem.location,
      suburb: eventItem.suburb,
      startsAt: eventItem.startsAt.slice(0, 16),
      endLabel: eventItem.endLabel,
      summary: eventItem.summary,
      spotsTotal: eventItem.spotsTotal,
      featured: eventItem.featured,
    });
    setComposeOpen(true);
  }

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status !== "authenticated") {
      router.push("/sign-in?callbackUrl=/community/events");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(editingSlug ? `/api/community/events/${editingSlug}` : "/api/community/events", {
        method: editingSlug ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startsAt: new Date(form.startsAt).toISOString(),
        }),
      });
      const payload = (await response.json()) as EventMutationResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to submit event.");
      }

      setMessage(editingSlug ? "Event updated." : "Event submitted successfully.");
      setComposeOpen(false);
      setEditingSlug(null);
      setForm(emptyForm);
      await loadEvents();
    } catch (submitError) {
      setMessage(submitError instanceof Error ? submitError.message : "Unable to submit event.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function joinEvent() {
    if (!selectedEvent) return;

    if (status !== "authenticated") {
      router.push("/sign-in?callbackUrl=/community/events");
      return;
    }

    if (!window.confirm("Join this event? This will add it to your dashboard.")) {
      return;
    }

    try {
      const response = await fetch(`/api/community/events/${selectedEvent.slug}/join`, { method: "POST" });
      const payload = (await response.json()) as EventMutationResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to join event.");
      }

      setMessage("Joined event. It now appears in your dashboard.");
      await loadEvents();
    } catch (joinError) {
      setMessage(joinError instanceof Error ? joinError.message : "Unable to join event.");
    }
  }

  async function leaveEvent() {
    if (!selectedEvent) return;

    if (!window.confirm("Leave this event? You will be removed from the attendee list.")) {
      return;
    }

    try {
      const response = await fetch(`/api/community/events/${selectedEvent.slug}/join`, { method: "DELETE" });
      const payload = (await response.json()) as EventMutationResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to leave event.");
      }

      setMessage("Left event.");
      await loadEvents();
    } catch (leaveError) {
      setMessage(leaveError instanceof Error ? leaveError.message : "Unable to leave event.");
    }
  }

  async function deleteEvent() {
    if (!selectedEvent) return;

    if (!window.confirm("Delete this event? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/community/events/${selectedEvent.slug}`, { method: "DELETE" });
      const payload = (await response.json()) as EventMutationResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to delete event.");
      }

      setMessage("Event deleted.");
      setSelectedSlug(null);
      await loadEvents();
    } catch (deleteError) {
      setMessage(deleteError instanceof Error ? deleteError.message : "Unable to delete event.");
    }
  }

  return (
    <main className="app-wrap page active">
      <CommunityTabs />

      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <p className="overline mb-8">Local Events</p>
          <h1 className="display" style={{ fontSize: "2rem" }}>Upcoming workshops and repair meetups</h1>
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
        <section className="card" style={{ display: "grid", gap: 12 }}>
          {error ? <p style={{ color: "#b35a1e" }}>{error}</p> : null}
          {isLoading ? <p className="body-sm">Loading events...</p> : null}

          <div className="flex-col gap-8">
            {events.map((eventItem) => {
              const dateLabel = formatDateLabel(eventItem.startsAt);
              const remainingSpots = Math.max(eventItem.spotsTotal - eventItem.joinedCount, 0);

              return (
                <article
                  className="event-row"
                  key={eventItem.slug}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedSlug(eventItem.slug)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setSelectedSlug(eventItem.slug);
                    }
                  }}
                  style={{ alignItems: "flex-start", cursor: "pointer" }}
                >
                  <div className="event-date">
                    <div className="event-month">{dateLabel.month}</div>
                    <div className="event-day">{dateLabel.day}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <span className={`badge ${badgeClass(eventItem.category)}`}>{eventItem.category}</span>
                      {eventItem.featured ? <span className="badge badge-green">Featured</span> : null}
                    </div>
                    <h2 className="heading" style={{ fontSize: "1.1rem", marginBottom: 6 }}>{eventItem.title}</h2>
                    <p className="body-xs">Organized by {eventItem.hostName}</p>
                    <p className="body-sm" style={{ marginBottom: 8 }}>{eventItem.summary}</p>
                    <p className="body-xs">{eventItem.location} · {eventItem.suburb} · {eventItem.endLabel} · {remainingSpots} spots left</p>
                  </div>
                  <button className="btn btn-primary btn-sm" type="button" onClick={(event) => { event.stopPropagation(); setSelectedSlug(eventItem.slug); }}>
                    Open
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="flex-col gap-12">
          <div className="card card-green">
            <p className="overline mb-8">Quick actions</p>
            <p className="body-sm" style={{ marginBottom: 14 }}>Use Add New to open an event modal. Signed-in members can publish events, edit their own events, and join workshops with confirmation.</p>
            {status !== "authenticated" ? (
              <Link href="/sign-up" className="btn btn-primary btn-sm">Create Account</Link>
            ) : null}
          </div>

          {message ? <div className="card"><p className="body-sm">{message}</p></div> : null}
        </aside>
      </div>

      <CommunityModal
        open={Boolean(selectedEvent)}
        title={selectedEvent?.title ?? "Event details"}
        description={selectedEvent ? `${selectedEvent.category} · ${selectedEvent.type}` : undefined}
        onClose={() => setSelectedSlug(null)}
        footer={selectedEvent ? (
          <div className="flex-between" style={{ flexWrap: "wrap", gap: 8 }}>
            <button className="btn btn-primary" type="button" onClick={() => void joinEvent()}>Join</button>
            {isOwner ? <button className="btn btn-primary" type="button" onClick={() => openEditModal(selectedEvent)}>Edit</button> : null}
            {isOwner ? <button className="btn btn-outline" type="button" onClick={() => void deleteEvent()}>Delete</button> : null}
            {status === "authenticated" ? <button className="btn btn-outline" type="button" onClick={() => void leaveEvent()}>Leave</button> : null}
          </div>
        ) : undefined}
      >
        {selectedEvent ? (
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span className={`badge ${badgeClass(selectedEvent.category)}`}>{selectedEvent.category}</span>
                {selectedEvent.featured ? <span className="badge badge-green">Featured</span> : null}
              </div>
              <p className="body-sm" style={{ marginBottom: 12 }}>{selectedEvent.summary}</p>
              <div className="card" style={{ background: "rgba(255,255,255,0.7)" }}>
                <p className="body-sm">{selectedEvent.location} · {selectedEvent.suburb}</p>
                <p className="body-sm">Starts at {new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(selectedEvent.startsAt))}</p>
                <p className="body-sm">Ends label: {selectedEvent.endLabel}</p>
                <p className="body-sm">Organized by {selectedEvent.createdByName ?? selectedEvent.hostName}</p>
                <p className="body-sm">{selectedEvent.joinedCount} joined · {Math.max(selectedEvent.spotsTotal - selectedEvent.joinedCount, 0)} spots left</p>
              </div>
            </div>
          </div>
        ) : null}
      </CommunityModal>

      <CommunityModal
        open={composeOpen}
        title={editingSlug ? "Edit event" : "Add new event"}
        description="Create a public workshop or meetup for the community calendar."
        onClose={() => {
          setComposeOpen(false);
          setEditingSlug(null);
        }}
      >
        {status !== "authenticated" ? (
          <div className="card card-amber">
            <p className="body-sm">Sign in to publish an event.</p>
          </div>
        ) : (
          <form onSubmit={submitEvent} style={{ display: "grid", gap: 10 }}>
            <label>
              <div className="body-xs" style={{ marginBottom: 4 }}>Title</div>
              <input className="w-full" required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <div className="grid-2">
              <label>
                <div className="body-xs" style={{ marginBottom: 4 }}>Type</div>
                <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                <div className="body-xs" style={{ marginBottom: 4 }}>Category</div>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                  {eventCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <div className="body-xs" style={{ marginBottom: 4 }}>Location</div>
              <input className="w-full" required value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
            </label>
            <div className="grid-2">
              <label>
                <div className="body-xs" style={{ marginBottom: 4 }}>Suburb</div>
                <input className="w-full" required value={form.suburb} onChange={(event) => setForm((current) => ({ ...current, suburb: event.target.value }))} />
              </label>
              <label>
                <div className="body-xs" style={{ marginBottom: 4 }}>Starts at</div>
                <input className="w-full" type="datetime-local" required value={form.startsAt} onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))} />
              </label>
            </div>
            <div className="grid-2">
              <label>
                <div className="body-xs" style={{ marginBottom: 4 }}>Ends label</div>
                <input className="w-full" required value={form.endLabel} onChange={(event) => setForm((current) => ({ ...current, endLabel: event.target.value }))} />
              </label>
              <label>
                <div className="body-xs" style={{ marginBottom: 4 }}>Spots</div>
                <input className="w-full" type="number" min={1} max={500} required value={form.spotsTotal} onChange={(event) => setForm((current) => ({ ...current, spotsTotal: Number(event.target.value) }))} />
              </label>
            </div>
            <label>
              <div className="body-xs" style={{ marginBottom: 4 }}>Summary</div>
              <textarea className="field-input" rows={4} required value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} />
            </label>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingSlug ? "Save Changes" : "Submit Event"}
            </button>
          </form>
        )}
      </CommunityModal>
    </main>
  );
}