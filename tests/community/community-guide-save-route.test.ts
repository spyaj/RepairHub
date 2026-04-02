import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSession = vi.hoisted(() => vi.fn());
const saveCommunityGuide = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/auth/session", () => ({
  getAuthSession,
}));

vi.mock("@/lib/server/community/service", () => ({
  saveCommunityGuide,
}));

import { POST } from "@/app/api/community/guides/[slug]/save/route";

describe("community guide save route", () => {
  beforeEach(() => {
    getAuthSession.mockReset();
    saveCommunityGuide.mockReset();
  });

  it("rejects unauthenticated saves", async () => {
    getAuthSession.mockResolvedValue(null);

    const response = await POST(
      new NextRequest("http://localhost/api/community/guides/replace-a-phone-battery/save", {
        method: "POST",
      }),
      { params: Promise.resolve({ slug: "replace-a-phone-battery" }) },
    );

    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe("UNAUTHENTICATED");
    expect(saveCommunityGuide).not.toHaveBeenCalled();
  });

  it("saves a guide for the current user", async () => {
    getAuthSession.mockResolvedValue({ user: { id: "user-1", role: "CLIENT", name: "Ari" } });
    saveCommunityGuide.mockResolvedValue({
      alreadySaved: false,
      guide: {
        slug: "replace-a-phone-battery",
        title: "Replace a Phone Battery",
        category: "ELECTRONICS",
        difficulty: "BEGINNER",
        readMinutes: 12,
        summary: "Safely replace a tired smartphone battery.",
        likesCount: 4,
        featured: true,
      },
    });

    const response = await POST(
      new NextRequest("http://localhost/api/community/guides/replace-a-phone-battery/save", {
        method: "POST",
      }),
      { params: Promise.resolve({ slug: "replace-a-phone-battery" }) },
    );

    const payload = (await response.json()) as { data: { slug: string } };

    expect(response.status).toBe(200);
    expect(payload.data.slug).toBe("replace-a-phone-battery");
    expect(saveCommunityGuide).toHaveBeenCalledWith("user-1", "replace-a-phone-battery");
  });
});