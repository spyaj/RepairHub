import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSession = vi.hoisted(() => vi.fn());
const updateCommunityEvent = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/auth/session", () => ({
  getAuthSession,
}));

vi.mock("@/lib/server/community/service", () => ({
  updateCommunityEvent,
}));

import { PATCH } from "@/app/api/community/events/[slug]/route";

describe("community event update route", () => {
  beforeEach(() => {
    getAuthSession.mockReset();
    updateCommunityEvent.mockReset();
  });

  it("rejects unauthorized updates", async () => {
    getAuthSession.mockResolvedValue(null);

    const response = await PATCH(
      new NextRequest("http://localhost/api/community/events/spring-repair-cafe", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Updated title" }),
      }),
      { params: Promise.resolve({ slug: "spring-repair-cafe" }) },
    );

    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe("UNAUTHENTICATED");
    expect(updateCommunityEvent).not.toHaveBeenCalled();
  });

  it("allows the creator to update the event", async () => {
    getAuthSession.mockResolvedValue({ user: { id: "user-1", role: "CLIENT", name: "Ari" } });
    updateCommunityEvent.mockResolvedValue({
      status: "ok",
      event: {
        slug: "spring-repair-cafe",
        title: "Updated title",
        category: "ELECTRONICS",
        type: "WORKSHOP",
        location: "Library",
        suburb: "Canberra City",
        startsAt: "2026-04-21T10:00:00.000Z",
        endLabel: "2pm",
        summary: "Updated community workshop.",
        hostName: "Ari",
        spotsTotal: 20,
        joinedCount: 5,
        featured: false,
        isExpired: false,
      },
    });

    const response = await PATCH(
      new NextRequest("http://localhost/api/community/events/spring-repair-cafe", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Updated title" }),
      }),
      { params: Promise.resolve({ slug: "spring-repair-cafe" }) },
    );

    const payload = (await response.json()) as { data: { title: string } };

    expect(response.status).toBe(200);
    expect(payload.data.title).toBe("Updated title");
    expect(updateCommunityEvent).toHaveBeenCalledWith(
      { id: "user-1", name: "Ari" },
      "spring-repair-cafe",
      expect.objectContaining({ title: "Updated title" }),
    );
  });
});