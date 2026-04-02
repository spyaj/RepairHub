import { CommunityActivityPanel } from "@/components/dashboard/community-activity-panel";

export default function AdminDashboardPage() {
    return (
        <main className="app-wrap page active">
            <div className="dash-header">
                <div>
                    <p className="body-sm mb-4">Platform Operations</p>
                    <h1 className="display" style={{ fontSize: "2rem", marginBottom: 10 }}>Admin Dashboard</h1>
                    <p className="body-sm">Moderate trust, resolve disputes, and monitor marketplace health.</p>
                </div>
                <button className="btn btn-primary">System Settings</button>
            </div>

            <section className="grid-4 section">
                <div className="stat-card"><div className="stat-label">New Users</div><div className="stat-value">124</div><div className="stat-delta">This week</div></div>
                <div className="stat-card"><div className="stat-label">Verification Queue</div><div className="stat-value">9</div><div className="stat-delta">3 urgent</div></div>
                <div className="stat-card"><div className="stat-label">Open Disputes</div><div className="stat-value">4</div><div className="stat-delta">Median resolve 18h</div></div>
                <div className="stat-card"><div className="stat-label">Escrow at Risk</div><div className="stat-value">$1.9k</div><div className="stat-delta">Across 7 jobs</div></div>
            </section>

            <section className="grid-dash section">
                <div className="card">
                    <div className="flex-between mb-16">
                        <h2 className="heading" style={{ fontSize: "1.3rem" }}>Repairer Verification Queue</h2>
                        <button className="btn btn-outline btn-sm">Export</button>
                    </div>
                    <div className="flex-col gap-8">
                        <div className="job-row"><p className="fw-600">Canberra Fix Co</p><span className="badge badge-blue">Pending docs</span></div>
                        <div className="job-row"><p className="fw-600">GreenCycle Repairs</p><span className="badge badge-amber">Needs review</span></div>
                        <div className="job-row"><p className="fw-600">Braddon Stitch Studio</p><span className="badge badge-green">Ready to verify</span></div>
                    </div>
                </div>
                <div className="flex-col gap-12">
                    <div className="card card-amber">
                        <p className="overline mb-8">Dispute Watch</p>
                        <p className="heading" style={{ fontSize: "1.2rem", marginBottom: 8 }}>4 Active Cases</p>
                        <p className="body-xs">2 involve warranty scope disagreements. 1 requires payment hold extension.</p>
                    </div>
                    <div className="card card-green">
                        <p className="overline mb-8">Sustainability Snapshot</p>
                        <p className="body-sm">This month: 3.2t estimated CO2 avoided and 1,120kg waste diverted.</p>
                    </div>
                </div>
            </section>

            <CommunityActivityPanel />
        </main>
    );
}
