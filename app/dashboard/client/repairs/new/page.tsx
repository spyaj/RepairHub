"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CreateRepairResponse = {
    data?: { id: string };
    error?: { message?: string };
};

export default function NewRepairRequestPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("ELECTRONICS");
    const [suburb, setSuburb] = useState("Belconnen");
    const [streetAddress, setStreetAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const response = await fetch("/api/repairs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                description,
                category,
                suburb,
                streetAddress: streetAddress.trim() ? streetAddress.trim() : undefined,
                urgency: "NORMAL",
                pickupOption: "DROP_OFF",
            }),
        });

        const payload = (await response.json()) as CreateRepairResponse;

        if (!response.ok) {
            setError(payload.error?.message ?? "Unable to create repair request.");
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);
        router.push("/dashboard/client");
        router.refresh();
    }

    return (
        <main className="app-wrap page active" style={{ maxWidth: 760 }}>
            <div className="section-header" style={{ marginBottom: 20 }}>
                <div>
                    <p className="overline mb-8">New Repair Request</p>
                    <h1 className="display" style={{ fontSize: "2rem", marginBottom: 10 }}>Create Repair Request</h1>
                    <p className="body-sm">Describe the item and publish to matched repairers near your suburb.</p>
                </div>
            </div>

            <div className="grid-dash" style={{ alignItems: "start" }}>
                <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 12 }}>
                    <label>
                        <div className="body-xs" style={{ marginBottom: 6 }}>Title</div>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={4} maxLength={120} className="w-full" />
                    </label>

                    <label>
                        <div className="body-xs" style={{ marginBottom: 6 }}>Description</div>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={20} maxLength={2000} rows={5} className="w-full" />
                    </label>

                    <div className="grid-2">
                        <label>
                            <div className="body-xs" style={{ marginBottom: 6 }}>Category</div>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="ELECTRONICS">Electronics</option>
                                <option value="FURNITURE">Furniture</option>
                                <option value="CLOTHING">Clothing</option>
                                <option value="BIKES">Bikes</option>
                            </select>
                        </label>
                        <label>
                            <div className="body-xs" style={{ marginBottom: 6 }}>Suburb</div>
                            <input value={suburb} onChange={(e) => setSuburb(e.target.value)} required className="w-full" />
                        </label>
                    </div>

                    <label>
                        <div className="body-xs" style={{ marginBottom: 6 }}>Street address (optional)</div>
                        <input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className="w-full" />
                    </label>

                    <p className="body-xs">Cloudinary image upload will be wired into this form in the next step.</p>

                    {error ? <p style={{ color: "#B35A1E", fontSize: 12 }}>{error}</p> : null}

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? "Publishing..." : "Publish request"}
                    </button>
                </form>

                <div className="flex-col gap-12">
                    <div className="ai-card">
                        <div className="ai-badge">AI Assist</div>
                        <p className="body-sm text-green">When image upload is enabled, AI will estimate damage severity and expected repair range before matching.</p>
                    </div>
                    <div className="card card-amber">
                        <p className="overline mb-8">Typical Response</p>
                        <p className="heading" style={{ fontSize: "1.2rem", marginBottom: 8 }}>Within 2 Hours</p>
                        <p className="body-xs">Most Canberra repairers reply to first quote requests in under 120 minutes.</p>
                    </div>
                    <div className="card">
                        <p className="overline mb-8">Preview Categories</p>
                        <div className="flex gap-6" style={{ flexWrap: "wrap" }}>
                            <span className="chip">Electronics</span>
                            <span className="chip">Furniture</span>
                            <span className="chip">Clothing</span>
                            <span className="chip">Bikes</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
