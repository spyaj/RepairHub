import { connectMongo } from "@/lib/server/db/mongo";
import { CommunityEvent } from "@/lib/server/db/models/community-event";
import { CommunityGuide } from "@/lib/server/db/models/community-guide";
import { CommunityThread } from "@/lib/server/db/models/community-thread";
import { AuthUser } from "@/lib/server/db/models/user";
import {
  communityEventSeeds,
  communityGuideSeeds,
  communityThreadSeeds,
} from "@/lib/server/community/content";

type CommunityAuthor = {
  id: string;
  name?: string | null;
};

type GuideCard = {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  readMinutes: number;
  summary: string;
  body: string;
  likesCount: number;
  featured: boolean;
  createdById?: string;
  createdByName?: string;
};

type ThreadCard = {
  slug: string;
  title: string;
  category: string;
  body: string;
  authorName: string;
  createdById?: string;
  createdByName?: string;
  likesCount: number;
  commentCount: number;
  featured: boolean;
  comments?: Array<{
    authorId: string;
    authorName: string;
    body: string;
    createdAt: string;
  }>;
};

type EventCard = {
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

type DashboardEventCard = EventCard & {
  isExpired: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toGuideCard(doc: {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  readMinutes: number;
  summary: string;
  body: string;
  likesCount: number;
  featured: boolean;
  createdById?: string;
  createdByName?: string;
}): GuideCard {
  return {
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    difficulty: doc.difficulty,
    readMinutes: doc.readMinutes,
    summary: doc.summary,
    body: doc.body,
    likesCount: doc.likesCount,
    featured: doc.featured,
    createdById: doc.createdById,
    createdByName: doc.createdByName,
  };
}

function toThreadCard(doc: {
  slug: string;
  title: string;
  category: string;
  body: string;
  authorName: string;
  authorId?: string;
  likesCount: number;
  comments: Array<unknown>;
  featured: boolean;
}): ThreadCard {
  return {
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    body: doc.body,
    authorName: doc.authorName,
    createdById: doc.authorId,
    createdByName: doc.authorName,
    likesCount: doc.likesCount,
    commentCount: doc.comments.length,
    featured: doc.featured,
    comments: doc.comments as ThreadCard["comments"],
  };
}

function toEventCard(doc: {
  slug: string;
  title: string;
  type: string;
  category: string;
  location: string;
  suburb: string;
  startsAt: Date;
  endLabel: string;
  summary: string;
  hostName: string;
  createdById?: string;
  createdByName?: string;
  spotsTotal: number;
  joinedBy: string[];
  featured: boolean;
}): EventCard {
  return {
    slug: doc.slug,
    title: doc.title,
    type: doc.type,
    category: doc.category,
    location: doc.location,
    suburb: doc.suburb,
    startsAt: doc.startsAt.toISOString(),
    endLabel: doc.endLabel,
    summary: doc.summary,
    hostName: doc.hostName,
    createdById: doc.createdById,
    createdByName: doc.createdByName,
    spotsTotal: doc.spotsTotal,
    joinedCount: doc.joinedBy.length,
    featured: doc.featured,
  };
}

function toDashboardEventCard(doc: {
  slug: string;
  title: string;
  type: string;
  category: string;
  location: string;
  suburb: string;
  startsAt: Date;
  endLabel: string;
  summary: string;
  hostName: string;
  createdById?: string;
  createdByName?: string;
  spotsTotal: number;
  joinedBy: string[];
  featured: boolean;
}): DashboardEventCard {
  const event = toEventCard(doc);

  return {
    ...event,
    isExpired: doc.startsAt.getTime() < Date.now(),
  };
}

export async function ensureCommunitySeedData() {
  await connectMongo();

  const [guideCount, threadCount, eventCount] = await Promise.all([
    CommunityGuide.countDocuments(),
    CommunityThread.countDocuments(),
    CommunityEvent.countDocuments(),
  ]);

  if (guideCount === 0) {
    await CommunityGuide.insertMany(
      communityGuideSeeds.map((guide) => ({
        ...guide,
        likesCount: guide.featured ? 4 : 0,
        likedBy: [],
      })),
    );
  }

  if (threadCount === 0) {
    await CommunityThread.insertMany(
      communityThreadSeeds.map((thread) => ({
        slug: thread.slug,
        title: thread.title,
        category: thread.category,
        body: thread.body,
        authorName: thread.authorName,
        likesCount: thread.likesCount,
        likedBy: [],
        comments: thread.comments.map((comment) => ({
          authorId: "seed",
          authorName: comment.authorName,
          body: comment.body,
          createdAt: new Date(),
        })),
        featured: thread.featured,
      })),
    );
  }

  if (eventCount === 0) {
    await CommunityEvent.insertMany(
      communityEventSeeds.map((event) => ({
        ...event,
        startsAt: new Date(event.startsAt),
        joinedBy: [],
      })),
    );
  }
}

export async function getCommunityOverview() {
  await ensureCommunitySeedData();

  const [guides, threads, events, guideTotal, threadTotal, eventTotal] = await Promise.all([
    CommunityGuide.find().sort({ featured: -1, likesCount: -1, createdAt: -1 }).limit(3).lean(),
    CommunityThread.find().sort({ featured: -1, likesCount: -1, createdAt: -1 }).limit(3).lean(),
    CommunityEvent.find().sort({ featured: -1, startsAt: 1 }).limit(3).lean(),
    CommunityGuide.countDocuments(),
    CommunityThread.countDocuments(),
    CommunityEvent.countDocuments(),
  ]);

  return {
    guides: guides.map(toGuideCard),
    threads: threads.map(toThreadCard),
    events: events.map(toEventCard),
    stats: {
      guides: guideTotal,
      threads: threadTotal,
      events: eventTotal,
    },
  };
}

export async function listCommunityGuides() {
  await ensureCommunitySeedData();

  const guides = await CommunityGuide.find().sort({ featured: -1, likesCount: -1, createdAt: -1 }).lean();
  return guides.map(toGuideCard);
}

export async function listCommunityThreads() {
  await ensureCommunitySeedData();

  const threads = await CommunityThread.find().sort({ featured: -1, likesCount: -1, createdAt: -1 }).lean();
  return threads.map(toThreadCard);
}

export async function listCommunityEvents() {
  await ensureCommunitySeedData();

  const events = await CommunityEvent.find().sort({ startsAt: 1, featured: -1 }).lean();
  return events.map(toEventCard);
}

export async function createCommunityGuide(author: CommunityAuthor, input: {
  title: string;
  category: GuideCard["category"];
  difficulty: GuideCard["difficulty"];
  readMinutes: number;
  summary: string;
  body: string;
  featured: boolean;
}) {
  await ensureCommunitySeedData();

  const baseSlug = slugify(input.title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const guide = await CommunityGuide.create({
    slug,
    title: input.title,
    category: input.category,
    difficulty: input.difficulty,
    readMinutes: input.readMinutes,
    summary: input.summary,
    body: input.body,
    featured: input.featured,
    likesCount: 0,
    likedBy: [],
    createdById: author.id,
    createdByName: author.name ?? "Community member",
  });

  return toGuideCard(guide.toObject());
}

export async function updateCommunityGuide(author: CommunityAuthor, slug: string, input: {
  title?: string;
  category?: GuideCard["category"];
  difficulty?: GuideCard["difficulty"];
  readMinutes?: number;
  summary?: string;
  body?: string;
  featured?: boolean;
}) {
  await ensureCommunitySeedData();

  const existing = await CommunityGuide.findOne({ slug }).lean();
  if (!existing) return { status: "not_found" as const };
  if (existing.createdById !== author.id) return { status: "forbidden" as const };

  const updated = await CommunityGuide.findOneAndUpdate(
    { slug, createdById: author.id },
    {
      $set: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.difficulty ? { difficulty: input.difficulty } : {}),
        ...(typeof input.readMinutes === "number" ? { readMinutes: input.readMinutes } : {}),
        ...(input.summary ? { summary: input.summary } : {}),
        ...(input.body ? { body: input.body } : {}),
        ...(typeof input.featured === "boolean" ? { featured: input.featured } : {}),
      },
    },
    { new: true },
  ).lean();

  if (!updated) return { status: "forbidden" as const };
  return { status: "ok" as const, guide: toGuideCard(updated) };
}

export async function deleteCommunityGuide(author: CommunityAuthor, slug: string) {
  await ensureCommunitySeedData();

  const existing = await CommunityGuide.findOne({ slug }).lean();
  if (!existing) return { status: "not_found" as const };
  if (existing.createdById !== author.id) return { status: "forbidden" as const };

  await CommunityGuide.deleteOne({ slug, createdById: author.id });
  await AuthUser.updateOne({ _id: author.id }, { $pull: { savedGuideSlugs: slug } });

  return { status: "ok" as const };
}

export async function likeCommunityGuide(authorId: string, slug: string) {
  await ensureCommunitySeedData();

  const guide = await CommunityGuide.findOneAndUpdate(
    { slug, likedBy: { $ne: authorId } },
    { $addToSet: { likedBy: authorId }, $inc: { likesCount: 1 } },
    { new: true },
  ).lean();

  if (!guide) {
    const existing = await CommunityGuide.findOne({ slug }).lean();
    if (existing) {
      return { alreadyLiked: true, guide: toGuideCard(existing) };
    }

    return null;
  }

  return { alreadyLiked: false, guide: toGuideCard(guide) };
}

export async function createCommunityThread(author: CommunityAuthor, input: {
  title: string;
  category: ThreadCard["category"];
  body: string;
}) {
  await ensureCommunitySeedData();

  const slug = `${slugify(input.title)}-${Date.now().toString(36)}`;
  const thread = await CommunityThread.create({
    slug,
    title: input.title,
    category: input.category,
    body: input.body,
    authorId: author.id,
    authorName: author.name ?? "Community member",
    likesCount: 0,
    likedBy: [],
    comments: [],
    featured: false,
  });

  return toThreadCard(thread.toObject());
}

export async function updateCommunityThread(author: CommunityAuthor, slug: string, input: {
  title?: string;
  category?: ThreadCard["category"];
  body?: string;
  featured?: boolean;
}) {
  await ensureCommunitySeedData();

  const existing = await CommunityThread.findOne({ slug }).lean();
  if (!existing) return { status: "not_found" as const };
  if (existing.authorId !== author.id) return { status: "forbidden" as const };

  const updated = await CommunityThread.findOneAndUpdate(
    { slug, authorId: author.id },
    {
      $set: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.body ? { body: input.body } : {}),
        ...(typeof input.featured === "boolean" ? { featured: input.featured } : {}),
      },
    },
    { new: true },
  ).lean();

  if (!updated) return { status: "forbidden" as const };
  return { status: "ok" as const, thread: toThreadCard(updated) };
}

export async function deleteCommunityThread(author: CommunityAuthor, slug: string) {
  await ensureCommunitySeedData();

  const existing = await CommunityThread.findOne({ slug }).lean();
  if (!existing) return { status: "not_found" as const };
  if (existing.authorId !== author.id) return { status: "forbidden" as const };

  await CommunityThread.deleteOne({ slug, authorId: author.id });
  return { status: "ok" as const };
}

export async function commentOnThread(author: CommunityAuthor, slug: string, body: string) {
  await ensureCommunitySeedData();

  const thread = await CommunityThread.findOneAndUpdate(
    { slug },
    {
      $push: {
        comments: {
          authorId: author.id,
          authorName: author.name ?? "Community member",
          body,
          createdAt: new Date(),
        },
      },
    },
    { new: true },
  ).lean();

  if (!thread) {
    return null;
  }

  return toThreadCard(thread);
}

export async function likeCommunityThread(authorId: string, slug: string) {
  await ensureCommunitySeedData();

  const thread = await CommunityThread.findOneAndUpdate(
    { slug, likedBy: { $ne: authorId } },
    { $addToSet: { likedBy: authorId }, $inc: { likesCount: 1 } },
    { new: true },
  ).lean();

  if (!thread) {
    const existing = await CommunityThread.findOne({ slug }).lean();
    if (existing) {
      return { alreadyLiked: true, thread: toThreadCard(existing) };
    }

    return null;
  }

  return { alreadyLiked: false, thread: toThreadCard(thread) };
}

export async function createCommunityEvent(author: CommunityAuthor, input: {
  title: string;
  type: EventCard["type"];
  category: EventCard["category"];
  location: string;
  suburb: string;
  startsAt: string;
  endLabel: string;
  summary: string;
  spotsTotal: number;
  featured: boolean;
}) {
  await ensureCommunitySeedData();

  const slug = `${slugify(input.title)}-${Date.now().toString(36)}`;
  const event = await CommunityEvent.create({
    slug,
    title: input.title,
    type: input.type,
    category: input.category,
    location: input.location,
    suburb: input.suburb,
    startsAt: new Date(input.startsAt),
    endLabel: input.endLabel,
    summary: input.summary,
    hostName: author.name ?? "Community member",
    createdById: author.id,
    createdByName: author.name ?? "Community member",
    spotsTotal: input.spotsTotal,
    joinedBy: [],
    featured: input.featured,
  });

  return toEventCard(event.toObject());
}

export async function deleteCommunityEvent(author: CommunityAuthor, slug: string) {
  await ensureCommunitySeedData();

  const existing = await CommunityEvent.findOne({ slug }).lean();
  if (!existing) return { status: "not_found" as const };
  if (existing.createdById !== author.id) return { status: "forbidden" as const };

  await CommunityEvent.deleteOne({ slug, createdById: author.id });
  return { status: "ok" as const };
}

export async function joinCommunityEvent(authorId: string, slug: string) {
  await ensureCommunitySeedData();

  const event = await CommunityEvent.findOneAndUpdate(
    { slug, joinedBy: { $ne: authorId }, $expr: { $lt: [{ $size: "$joinedBy" }, "$spotsTotal"] } },
    { $addToSet: { joinedBy: authorId } },
    { new: true },
  ).lean();

  if (!event) {
    const existing = await CommunityEvent.findOne({ slug }).lean();
    if (existing) {
      const isAlreadyJoined = existing.joinedBy.includes(authorId);
      return { alreadyJoined: isAlreadyJoined, full: existing.joinedBy.length >= existing.spotsTotal, event: toEventCard(existing) };
    }

    return null;
  }

  return { alreadyJoined: false, full: false, event: toEventCard(event) };
}

export async function saveCommunityGuide(authorId: string, slug: string) {
  await ensureCommunitySeedData();

  const user = await AuthUser.findByIdAndUpdate(
    authorId,
    { $addToSet: { savedGuideSlugs: slug } },
    { new: true },
  ).lean();

  if (!user) {
    return null;
  }

  const guide = await CommunityGuide.findOne({ slug }).lean();

  if (!guide) {
    return { alreadySaved: false, guide: null };
  }

  return { alreadySaved: false, guide: toGuideCard(guide) };
}

export async function getCommunityDashboard(authorId: string) {
  await ensureCommunitySeedData();

  const user = await AuthUser.findById(authorId).lean();

  if (!user) {
    return null;
  }

  const [savedGuides, joinedEvents, createdEvents, createdGuides, createdThreads] = await Promise.all([
    user.savedGuideSlugs && user.savedGuideSlugs.length > 0
      ? CommunityGuide.find({ slug: { $in: user.savedGuideSlugs } }).lean()
      : Promise.resolve([]),
    CommunityEvent.find({ joinedBy: authorId }).sort({ startsAt: 1 }).lean(),
    CommunityEvent.find({ createdById: authorId }).sort({ startsAt: 1 }).lean(),
    CommunityGuide.find({ createdById: authorId }).sort({ createdAt: -1 }).lean(),
    CommunityThread.find({ authorId }).sort({ createdAt: -1 }).lean(),
  ]);

  const guideMap = new Map(savedGuides.map((guide) => [guide.slug, toGuideCard(guide)]));
  const orderedGuides = (user.savedGuideSlugs ?? [])
    .map((slug) => guideMap.get(slug))
    .filter((guide): guide is GuideCard => Boolean(guide));

  return {
    savedGuides: orderedGuides,
    joinedEvents: joinedEvents.map(toDashboardEventCard),
    createdEvents: createdEvents.map(toDashboardEventCard),
    createdGuides: createdGuides.map(toGuideCard),
    createdThreads: createdThreads.map((thread) => ({
      ...toThreadCard(thread),
      comments: thread.comments.map((comment: { authorId: string; authorName: string; body: string; createdAt: Date | string }) => ({
        authorId: comment.authorId,
        authorName: comment.authorName,
        body: comment.body,
        createdAt: new Date(comment.createdAt).toISOString(),
      })),
    })),
  };
}

export async function updateCommunityEvent(author: CommunityAuthor, slug: string, input: {
  title?: string;
  type?: EventCard["type"];
  category?: EventCard["category"];
  location?: string;
  suburb?: string;
  startsAt?: string;
  endLabel?: string;
  summary?: string;
  spotsTotal?: number;
  featured?: boolean;
}) {
  await ensureCommunitySeedData();

  const existing = await CommunityEvent.findOne({ slug }).lean();

  if (!existing) {
    return { status: "not_found" as const };
  }

  if (existing.createdById !== author.id) {
    return { status: "forbidden" as const };
  }

  if (typeof input.spotsTotal === "number" && input.spotsTotal < existing.joinedBy.length) {
    return { status: "capacity" as const, joinedCount: existing.joinedBy.length };
  }

  const updated = await CommunityEvent.findOneAndUpdate(
    { slug, createdById: author.id },
    {
      $set: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.type ? { type: input.type } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.location ? { location: input.location } : {}),
        ...(input.suburb ? { suburb: input.suburb } : {}),
        ...(input.startsAt ? { startsAt: new Date(input.startsAt) } : {}),
        ...(input.endLabel ? { endLabel: input.endLabel } : {}),
        ...(input.summary ? { summary: input.summary } : {}),
        ...(typeof input.spotsTotal === "number" ? { spotsTotal: input.spotsTotal } : {}),
        ...(typeof input.featured === "boolean" ? { featured: input.featured } : {}),
      },
    },
    { new: true },
  ).lean();

  if (!updated) {
    return { status: "forbidden" as const };
  }

  return { status: "ok" as const, event: toDashboardEventCard(updated) };
}