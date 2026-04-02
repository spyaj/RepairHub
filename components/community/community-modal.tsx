"use client";

import type { ReactNode } from "react";

type CommunityModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
};

export function CommunityModal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  maxWidth = 760,
}: CommunityModalProps) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(20, 20, 20, 0.72)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(100%, " + maxWidth + "px)",
          maxHeight: "92vh",
          overflow: "auto",
          borderRadius: 24,
          background: "#fffaf2",
          border: "1px solid #e6d8c7",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.25)",
          padding: 20,
        }}
      >
        <div className="flex-between" style={{ gap: 16, alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <p className="overline mb-8">Community dialog</p>
            <h2 className="heading" style={{ fontSize: "1.3rem" }}>{title}</h2>
            {description ? <p className="body-sm" style={{ marginTop: 6 }}>{description}</p> : null}
          </div>
          <button className="btn btn-outline btn-sm" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div>{children}</div>

        {footer ? <div style={{ marginTop: 18 }}>{footer}</div> : null}
      </div>
    </div>
  );
}
