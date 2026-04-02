import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSession = vi.hoisted(() => vi.fn());
const createCommunityGuide = vi.hoisted(() => vi.fn());
const listCommunityGuides = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/auth/session", () => ({
  getAuthSession,
}));

vi.mock("@/lib/server/community/service", () => ({
  createCommunityGuide,
  listCommunityGuides,
}));

import { GET, POST } from "@/app/api/community/guides/route";

describe("community guides route", () => {
  beforeEach(() => {
    getAuthSession.mockReset();
    createCommunityGuide.mockReset();
    listCommunityGuides.mockReset();
  });

  it("returns public guide listings", async () => {
    listCommunityGuides.mockResolvedValue([
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
    ]);

    const response = await GET(new NextRequest("http://localhost/api/community/guides"));
    const payload = (await response.json()) as { data: { guides: Array<{ slug: string }> } };

    expect(response.status).toBe(200);
    expect(payload.data.guides).toHaveLength(1);
    expect(payload.data.guides[0].slug).toBe("replace-a-phone-battery");
  });

  it("rejects unauthenticated guide creation", async () => {
    getAuthSession.mockResolvedValue(null);

    const response = await POST(
      new NextRequest("http://localhost/api/community/guides", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "New Repair Note",
          category: "ELECTRONICS",
          difficulty: "BEGINNER",
          readMinutes: 10,
          summary: "A useful repair note.",
          body: "Detailed repair steps for the community.",
        }),
      }),
    );

    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe("UNAUTHENTICATED");
    expect(createCommunityGuide).not.toHaveBeenCalled();
  });

  it("creates a guide for authenticated users", async () => {
    getAuthSession.mockResolvedValue({
      user: { id: "user-1", role: "CLIENT", name: "Ari User" },
    });
    createCommunityGuide.mockResolvedValue({
      slug: "new-guide-1",
      title: "New Repair Note",
      category: "ELECTRONICS",
      difficulty: "BEGINNER",
      readMinutes: 10,
      summary: "A useful repair note.",
      likesCount: 0,
      featured: false,
    });

    const response = await POST(
      new NextRequest("http://localhost/api/community/guides", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "New Repair Note",
          category: "ELECTRONICS",
          difficulty: "BEGINNER",
          readMinutes: 10,
          summary: "A useful repair note.",
          body: "Detailed repair steps for the community.",
        }),
      }),
    );

    const payload = (await response.json()) as { data: { slug: string } };

    expect(response.status).toBe(201);
    expect(payload.data.slug).toBe("new-guide-1");
    expect(createCommunityGuide).toHaveBeenCalledWith(
      { id: "user-1", name: "Ari User" },
      expect.objectContaining({ title: "New Repair Note" }),
    );
  });
});