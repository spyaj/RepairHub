import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSession = vi.hoisted(() => vi.fn());
const updateCommunityGuide = vi.hoisted(() => vi.fn());
const deleteCommunityGuide = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/auth/session", () => ({
  getAuthSession,
}));

vi.mock("@/lib/server/community/service", () => ({
  updateCommunityGuide,
  deleteCommunityGuide,
}));

import { DELETE, PATCH } from "@/app/api/community/guides/[slug]/route";

describe("community guide management route", () => {
  beforeEach(() => {
    getAuthSession.mockReset();
    updateCommunityGuide.mockReset();
    deleteCommunityGuide.mockReset();
  });

  it("allows the creator to update a guide", async () => {
    getAuthSession.mockResolvedValue({ user: { id: "user-1", role: "CLIENT", name: "Ari" } });
    updateCommunityGuide.mockResolvedValue({
      status: "ok",
      guide: {
        slug: "replace-a-phone-battery",
        title: "Updated guide title",
        category: "ELECTRONICS",
        difficulty: "BEGINNER",
        readMinutes: 12,
        summary: "Updated summary",
        body: "Updated guide body with enough detail.",
        likesCount: 0,
        featured: false,
      },
    });

    const response = await PATCH(
      new NextRequest("http://localhost/api/community/guides/replace-a-phone-battery", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Updated guide title" }),
      }),
      { params: Promise.resolve({ slug: "replace-a-phone-battery" }) },
    );

    const payload = (await response.json()) as { data: { title: string } };

    expect(response.status).toBe(200);
    expect(payload.data.title).toBe("Updated guide title");
    expect(updateCommunityGuide).toHaveBeenCalledWith(
      { id: "user-1", name: "Ari" },
      "replace-a-phone-battery",
      expect.objectContaining({ title: "Updated guide title" }),
    );
  });

  it("allows the creator to delete a guide", async () => {
    getAuthSession.mockResolvedValue({ user: { id: "user-1", role: "CLIENT", name: "Ari" } });
    deleteCommunityGuide.mockResolvedValue({ status: "ok" });

    const response = await DELETE(
      new NextRequest("http://localhost/api/community/guides/replace-a-phone-battery", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ slug: "replace-a-phone-battery" }) },
    );

    const payload = (await response.json()) as { data: { deleted: boolean } };

    expect(response.status).toBe(200);
    expect(payload.data.deleted).toBe(true);
    expect(deleteCommunityGuide).toHaveBeenCalledWith(
      { id: "user-1", name: "Ari" },
      "replace-a-phone-battery",
    );
  });
});
