import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSession = vi.hoisted(() => vi.fn());
const deleteCommunityEvent = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/auth/session", () => ({
  getAuthSession,
}));

vi.mock("@/lib/server/community/service", () => ({
  deleteCommunityEvent,
}));

import { DELETE } from "@/app/api/community/events/[slug]/route";

describe("community event delete route", () => {
  beforeEach(() => {
    getAuthSession.mockReset();
    deleteCommunityEvent.mockReset();
  });

  it("allows the creator to delete an event", async () => {
    getAuthSession.mockResolvedValue({ user: { id: "user-1", role: "CLIENT", name: "Ari" } });
    deleteCommunityEvent.mockResolvedValue({ status: "ok" });

    const response = await DELETE(
      new NextRequest("http://localhost/api/community/events/spring-repair-cafe", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ slug: "spring-repair-cafe" }) },
    );

    const payload = (await response.json()) as { data: { deleted: boolean } };

    expect(response.status).toBe(200);
    expect(payload.data.deleted).toBe(true);
    expect(deleteCommunityEvent).toHaveBeenCalledWith(
      { id: "user-1", name: "Ari" },
      "spring-repair-cafe",
    );
  });
});
