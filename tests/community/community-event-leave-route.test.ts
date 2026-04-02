import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSession = vi.hoisted(() => vi.fn());
const joinCommunityEvent = vi.hoisted(() => vi.fn());
const CommunityEventFindOneAndUpdate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/auth/session", () => ({
  getAuthSession,
}));

vi.mock("@/lib/server/community/service", () => ({
  joinCommunityEvent,
}));

vi.mock("@/lib/server/db/models/community-event", () => ({
  CommunityEvent: {
    findOneAndUpdate: CommunityEventFindOneAndUpdate,
  },
}));

import { DELETE } from "@/app/api/community/events/[slug]/join/route";

describe("community event leave route", () => {
  beforeEach(() => {
    getAuthSession.mockReset();
    joinCommunityEvent.mockReset();
    CommunityEventFindOneAndUpdate.mockReset();
  });

  it("allows a joined member to opt out", async () => {
    getAuthSession.mockResolvedValue({ user: { id: "user-1", role: "CLIENT", name: "Ari" } });
    joinCommunityEvent.mockResolvedValue({ alreadyJoined: true, full: false, event: { slug: "spring-repair-cafe" } });
    CommunityEventFindOneAndUpdate.mockReturnValue({ lean: vi.fn().mockResolvedValue({ slug: "spring-repair-cafe" }) });

    const response = await DELETE(
      new NextRequest("http://localhost/api/community/events/spring-repair-cafe/join", { method: "DELETE" }),
      { params: Promise.resolve({ slug: "spring-repair-cafe" }) },
    );

    const payload = (await response.json()) as { data: { left: boolean } };

    expect(response.status).toBe(200);
    expect(payload.data.left).toBe(true);
    expect(CommunityEventFindOneAndUpdate).toHaveBeenCalledWith(
      { slug: "spring-repair-cafe" },
      { $pull: { joinedBy: "user-1" } },
      { new: true },
    );
  });
});
