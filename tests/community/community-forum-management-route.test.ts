import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSession = vi.hoisted(() => vi.fn());
const updateCommunityThread = vi.hoisted(() => vi.fn());
const deleteCommunityThread = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/auth/session", () => ({
  getAuthSession,
}));

vi.mock("@/lib/server/community/service", () => ({
  updateCommunityThread,
  deleteCommunityThread,
}));

import { DELETE, PATCH } from "@/app/api/community/forum/[slug]/route";

describe("community forum management route", () => {
  beforeEach(() => {
    getAuthSession.mockReset();
    updateCommunityThread.mockReset();
    deleteCommunityThread.mockReset();
  });

  it("allows the creator to update a thread", async () => {
    getAuthSession.mockResolvedValue({ user: { id: "user-1", role: "CLIENT", name: "Ari" } });
    updateCommunityThread.mockResolvedValue({
      status: "ok",
      thread: {
        slug: "best-glue-for-chair-legs",
        title: "Updated title",
        category: "FURNITURE",
        body: "Updated thread body.",
        authorName: "Ari",
        likesCount: 0,
        commentCount: 0,
        featured: false,
      },
    });

    const response = await PATCH(
      new NextRequest("http://localhost/api/community/forum/best-glue-for-chair-legs", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Updated title" }),
      }),
      { params: Promise.resolve({ slug: "best-glue-for-chair-legs" }) },
    );

    const payload = (await response.json()) as { data: { title: string } };

    expect(response.status).toBe(200);
    expect(payload.data.title).toBe("Updated title");
    expect(updateCommunityThread).toHaveBeenCalledWith(
      { id: "user-1", name: "Ari" },
      "best-glue-for-chair-legs",
      expect.objectContaining({ title: "Updated title" }),
    );
  });

  it("allows the creator to delete a thread", async () => {
    getAuthSession.mockResolvedValue({ user: { id: "user-1", role: "CLIENT", name: "Ari" } });
    deleteCommunityThread.mockResolvedValue({ status: "ok" });

    const response = await DELETE(
      new NextRequest("http://localhost/api/community/forum/best-glue-for-chair-legs", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ slug: "best-glue-for-chair-legs" }) },
    );

    const payload = (await response.json()) as { data: { deleted: boolean } };

    expect(response.status).toBe(200);
    expect(payload.data.deleted).toBe(true);
    expect(deleteCommunityThread).toHaveBeenCalledWith(
      { id: "user-1", name: "Ari" },
      "best-glue-for-chair-legs",
    );
  });
});
