export const communityGuideCategories = ["ELECTRONICS", "FURNITURE", "CLOTHING", "BIKES"] as const;
export type CommunityGuideCategory = (typeof communityGuideCategories)[number];

export const communityDifficultyLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type CommunityDifficultyLevel = (typeof communityDifficultyLevels)[number];

export const communityForumCategories = ["ELECTRONICS", "FURNITURE", "CLOTHING", "BIKES", "GENERAL"] as const;
export type CommunityForumCategory = (typeof communityForumCategories)[number];

export const communityEventTypes = ["REPAIR_CAFE", "WORKSHOP", "MEETUP", "BIKE_DAY"] as const;
export type CommunityEventType = (typeof communityEventTypes)[number];

export const communityGuideSeeds = [
  {
    slug: "replace-a-phone-battery",
    title: "Replace a Phone Battery",
    category: "ELECTRONICS" as const,
    difficulty: "BEGINNER" as const,
    readMinutes: 12,
    summary: "Safely replace a tired smartphone battery with basic tools and a steady hand.",
    body: "Follow a step-by-step teardown, disconnect the battery, and reinstall the replacement with adhesive strips.",
    featured: true,
  },
  {
    slug: "mend-a-torn-seam",
    title: "Mend a Torn Seam",
    category: "CLOTHING" as const,
    difficulty: "BEGINNER" as const,
    readMinutes: 8,
    summary: "Use simple hand stitching to extend the life of everyday clothing.",
    body: "Match the thread weight, backstitch the tear, and reinforce the seam edge to prevent re-tearing.",
    featured: true,
  },
  {
    slug: "fix-a-wobbly-chair-leg",
    title: "Fix a Wobbly Chair Leg",
    category: "FURNITURE" as const,
    difficulty: "INTERMEDIATE" as const,
    readMinutes: 15,
    summary: "Diagnose loose joints and rebuild chair stability with glue, clamps, and screws.",
    body: "Inspect the joinery, remove damaged adhesive, and reassemble while keeping the frame square.",
    featured: true,
  },
  {
    slug: "rescue-a-squeaky-bike-chain",
    title: "Rescue a Squeaky Bike Chain",
    category: "BIKES" as const,
    difficulty: "BEGINNER" as const,
    readMinutes: 10,
    summary: "Clean, lubricate, and tune a noisy drivetrain so it runs quietly again.",
    body: "Degrease the chain, inspect the cassette, and apply lubricant sparingly for smooth pedaling.",
    featured: false,
  },
  {
    slug: "revive-a-slow-charging-laptop",
    title: "Revive a Slow Charging Laptop",
    category: "ELECTRONICS" as const,
    difficulty: "INTERMEDIATE" as const,
    readMinutes: 18,
    summary: "Work through charger, port, and battery checks before replacing parts.",
    body: "Test the power adapter, clean the charging port, and verify battery health before ordering replacements.",
    featured: false,
  },
  {
    slug: "patch-denim-with-visible-mending",
    title: "Patch Denim with Visible Mending",
    category: "CLOTHING" as const,
    difficulty: "ADVANCED" as const,
    readMinutes: 20,
    summary: "Repair jeans while turning the patch into a design feature.",
    body: "Use contrasting fabric, sashiko-style stitches, and a stabilizer to reinforce stress points.",
    featured: false,
  },
] as const;

export const communityThreadSeeds = [
  {
    slug: "laptop-wont-charge-with-new-cable",
    title: "Laptop won't charge even with a new cable - any ideas?",
    category: "ELECTRONICS" as const,
    body: "I swapped the charger and the battery still does not charge. What should I check next?",
    authorName: "Elena K.",
    likesCount: 6,
    comments: [
      {
        authorName: "Mason T.",
        body: "Start by cleaning the charging port and checking for bent pins. If that fails, inspect the battery connector.",
      },
    ],
    featured: true,
  },
  {
    slug: "best-thread-for-denim-repair",
    title: "Best thread type for repairing denim jeans?",
    category: "CLOTHING" as const,
    body: "I want something that survives regular wear but still looks neat. What works best?",
    authorName: "Pierre W.",
    likesCount: 3,
    comments: [
      {
        authorName: "Sophie L.",
        body: "Use polyester core-spun thread. It holds up well and blends nicely with denim topstitching.",
      },
    ],
    featured: true,
  },
  {
    slug: "remove-water-stain-from-hardwood",
    title: "How to remove a water stain from a hardwood table?",
    category: "FURNITURE" as const,
    body: "There is a pale ring on the tabletop after a glass sat there overnight. What should I try first?",
    authorName: "Mia O.",
    likesCount: 2,
    comments: [
      {
        authorName: "Renee H.",
        body: "Try a gentle heat pass with a cloth first. If the stain stays, move to a light finish restoration.",
      },
    ],
    featured: true,
  },
  {
    slug: "bike-brake-rub-after-wheel-alignment",
    title: "Brake rub after wheel alignment - normal?",
    category: "BIKES" as const,
    body: "My wheel is straight again but now the front brake touches the rim on one side.",
    authorName: "Noah P.",
    likesCount: 4,
    comments: [
      {
        authorName: "Aria F.",
        body: "Re-center the caliper and check the wheel dish. That usually solves it.",
      },
    ],
    featured: false,
  },
] as const;

export const communityEventSeeds = [
  {
    slug: "electronics-repair-cafe-apr-05",
    title: "Electronics Repair Cafe",
    type: "REPAIR_CAFE" as const,
    category: "ELECTRONICS" as const,
    location: "Canberra City Library",
    suburb: "Canberra City",
    startsAt: "2026-04-05T10:00:00.000Z",
    endLabel: "2pm",
    summary: "Bring broken gadgets and volunteers will help you diagnose and repair them.",
    hostName: "RepairHub Canberra",
    spotsTotal: 36,
    featured: true,
  },
  {
    slug: "bike-fix-day-apr-12",
    title: "Fix Your Bike Day",
    type: "BIKE_DAY" as const,
    category: "BIKES" as const,
    location: "Riverside Park",
    suburb: "Kingston",
    startsAt: "2026-04-12T09:00:00.000Z",
    endLabel: "1pm",
    summary: "Free bike maintenance workshop for riders of every skill level.",
    hostName: "Canberra Cycling Collective",
    spotsTotal: 24,
    featured: true,
  },
  {
    slug: "clothing-upcycling-workshop-apr-19",
    title: "Clothing Upcycling Workshop",
    type: "WORKSHOP" as const,
    category: "CLOTHING" as const,
    location: "Maker Space",
    suburb: "Braddon",
    startsAt: "2026-04-19T14:00:00.000Z",
    endLabel: "5pm",
    summary: "Transform old clothing into new fashion pieces with pattern hacks and visible mending.",
    hostName: "ACT Textile Collective",
    spotsTotal: 18,
    featured: true,
  },
  {
    slug: "furniture-restoration-night",
    title: "Furniture Restoration Night",
    type: "MEETUP" as const,
    category: "FURNITURE" as const,
    location: "Belconnen Community Shed",
    suburb: "Belconnen",
    startsAt: "2026-04-23T18:00:00.000Z",
    endLabel: "8pm",
    summary: "Bring a small wooden item and learn sanding, finishing, and repair basics.",
    hostName: "Northside Makers",
    spotsTotal: 20,
    featured: false,
  },
] as const;