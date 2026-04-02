import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSession = vi.hoisted(() => vi.fn());
const getCommunityDashboard = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/auth/session", () => ({
  getAuthSession,
}));

vi.mock("@/lib/server/community/service", () => ({
  getCommunityDashboard,
}));

import { GET } from "@/app/api/dashboard/community/route";

describe("community dashboard route", () => {
  beforeEach(() => {
    getAuthSession.mockReset();
    getCommunityDashboard.mockReset();
  });

  it("rejects unauthenticated requests", async () => {
    getAuthSession.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/dashboard/community"));
    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe("UNAUTHENTICATED");
    expect(getCommunityDashboard).not.toHaveBeenCalled();
  });

  it("returns saved guides and event lists for the current user", async () => {
    getAuthSession.mockResolvedValue({ user: { id: "user-1", role: "CLIENT", name: "Ari" } });
    getCommunityDashboard.mockResolvedValue({
      savedGuides: [
        {
          slug: "replace-a-phone-battery",
          title: "Replace a Phone Battery",
          category: "ELECTRONICS",
          difficulty: "BEGINNER",
          readMinutes: 12,
          summary: "Safely replace a tired smartphone battery.",
          likesCount: 4,
          featured: true,
        },
      ],
      joinedEvents: [],
      createdEvents: [],
    });

    const response = await GET(new NextRequest("http://localhost/api/dashboard/community"));
    const payload = (await response.json()) as { data: { savedGuides: Array<{ slug: string }> } };

    expect(response.status).toBe(200);
    expect(payload.data.savedGuides).toHaveLength(1);
    expect(payload.data.savedGuides[0].slug).toBe("replace-a-phone-battery");
  });
});