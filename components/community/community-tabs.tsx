"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/community", label: "Overview" },
  { href: "/community/guides", label: "DIY Guides" },
  { href: "/community/forum", label: "Forum" },
  { href: "/community/events", label: "Events" },
];

export function CommunityTabs() {
  const pathname = usePathname();

  return (
    <div className="page-nav" style={{ marginBottom: 24 }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link key={tab.href} href={tab.href} className={`page-tab ${isActive ? "active" : ""}`} aria-current={isActive ? "page" : undefined}>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}