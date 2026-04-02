import { CommunityActivityPanel } from "@/components/dashboard/community-activity-panel";

export default function ClientDashboardPage() {
    return (
        <main className="app-wrap page active">
            <div className="dash-header">
                <div>
                    <p className="body-sm mb-4">Welcome back</p>
                    <h1 className="display" style={{ fontSize: "2rem", marginBottom: 10 }}>Client Dashboard</h1>
                    <p className="body-sm">Track repair progress, savings, and community impact.</p>
                </div>
                <a className="btn btn-primary" href="/dashboard/client/repairs/new">Create Repair Request</a>
            </div>

            <section className="grid-4 section">
                <div className="stat-card">
                    <div className="stat-label">Active Jobs</div>
                    <div className="stat-value">3</div>
                    <div className="stat-delta">+1 this week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Saved</div>
                    <div className="stat-value">$740</div>
                    <div className="stat-delta">vs replacement cost</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">CO2 Avoided</div>
                    <div className="stat-value">14kg</div>
                    <div className="stat-delta">from 9 completed repairs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Reward Points</div>
                    <div className="stat-value">840</div>
                    <div className="stat-delta">160 to Silver tier</div>
                </div>
            </section>

            <section className="grid-dash section">
                <div className="card">
                    <div className="flex-between mb-16">
                        <h2 className="heading" style={{ fontSize: "1.3rem" }}>Recent Requests</h2>
                        <span className="badge badge-blue">Live</span>
                    </div>
                    <div className="flex-col gap-8">
                        <div className="job-row">
                            <div>
                                <p className="fw-600">iPhone 14 screen replacement</p>
                                <p className="body-xs">Matched • Belconnen</p>
                            </div>
                            <span className="badge badge-amber">Quote pending</span>
                        </div>
                        <div className="job-row">
                            <div>
                                <p className="fw-600">Dining chair leg reinforcement</p>
                                <p className="body-xs">In progress • Kingston</p>
                            </div>
                            <span className="badge badge-green">On track</span>
                        </div>
                        <div className="job-row">
                            <div>
                                <p className="fw-600">Winter jacket zip repair</p>
                                <p className="body-xs">Completed • Braddon</p>
                            </div>
                            <span className="badge badge-blue">Review due</span>
                        </div>
                    </div>
                </div>

                <div className="flex-col gap-12">
                    <div className="ai-card">
                        <div className="ai-badge">AI Insight</div>
                        <p className="body-sm text-green">Your recent repair patterns suggest bundles in electronics and bike maintenance could cut costs by another 12% this season.</p>
                    </div>
                    <div className="card card-amber">
                        <p className="overline mb-8">Next Reward</p>
                        <p className="heading" style={{ fontSize: "1.2rem", marginBottom: 8 }}>10% Discount Voucher</p>
                        <p className="body-xs">Complete two more repairs or one community workshop to unlock.</p>
                    </div>
                </div>
            </section>

            <section className="card">
                <div className="flex-between mb-12">
                    <h2 className="heading" style={{ fontSize: "1.2rem" }}>Suggested Local Workshops</h2>
                    <button className="btn btn-outline btn-sm">View Calendar</button>
                </div>
                <div className="grid-3">
                    <div className="event-row"><div className="event-date"><div className="event-month">Apr</div><div className="event-day">06</div></div><p className="body-sm">Fix Cafe: Small electronics diagnostics</p></div>
                    <div className="event-row"><div className="event-date"><div className="event-month">Apr</div><div className="event-day">12</div></div><p className="body-sm">Bike chain and brake tune-up clinic</p></div>
                    <div className="event-row"><div className="event-date"><div className="event-month">Apr</div><div className="event-day">18</div></div><p className="body-sm">Furniture polishing and restoration basics</p></div>
                </div>
            </section>
            <div style={{ marginTop: 20 }}>
                <a className="btn btn-primary" href="/dashboard/client/repairs/new">Create Another Request</a>
            </div>

            <CommunityActivityPanel />
        </main>
    );
}
