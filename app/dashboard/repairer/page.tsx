import { CommunityActivityPanel } from "@/components/dashboard/community-activity-panel";

export default function RepairerDashboardPage() {
    return (
        <main className="app-wrap page active">
            <div className="dash-header">
                <div>
                    <p className="body-sm mb-4">Good morning</p>
                    <h1 className="display" style={{ fontSize: "2rem", marginBottom: 10 }}>Repairer Dashboard</h1>
                    <p className="body-sm">Manage your queue, quotes, and earnings with real-time demand signals.</p>
                </div>
                <button className="btn btn-primary">Go Online</button>
            </div>

            <section className="grid-4 section">
                <div className="stat-card"><div className="stat-label">This Month</div><div className="stat-value">$1,240</div><div className="stat-delta">+18% vs last month</div></div>
                <div className="stat-card"><div className="stat-label">Jobs Done</div><div className="stat-value">23</div><div className="stat-delta">4 in progress</div></div>
                <div className="stat-card"><div className="stat-label">Avg Rating</div><div className="stat-value">4.9</div><div className="stat-delta">127 reviews</div></div>
                <div className="stat-card"><div className="stat-label">Response SLA</div><div className="stat-value">9m</div><div className="stat-delta">Target under 15m</div></div>
            </section>

            <section className="grid-dash section">
                <div className="card">
                    <div className="flex-between mb-16">
                        <h2 className="heading" style={{ fontSize: "1.3rem" }}>Active Jobs</h2>
                        <button className="btn btn-outline btn-sm">View All</button>
                    </div>
                    <div className="flex-col gap-8">
                        <div className="job-row"><p className="fw-600">James • iPhone 14 screen</p><span className="badge badge-green">Pickup today</span></div>
                        <div className="job-row"><p className="fw-600">Amara • MacBook keyboard</p><span className="badge badge-amber">Waiting parts</span></div>
                        <div className="job-row"><p className="fw-600">Tom • iPad charging port</p><span className="badge badge-blue">Quote sent</span></div>
                    </div>
                </div>
                <div className="flex-col gap-12">
                    <div className="card card-green">
                        <p className="overline mb-8">Demand Signal</p>
                        <p className="heading" style={{ fontSize: "1.2rem", marginBottom: 8 }}>Electronics Demand Up 22%</p>
                        <p className="body-xs">Best time to enable priority pickup windows in Canberra City and Braddon.</p>
                    </div>
                    <div className="card">
                        <p className="overline mb-8">Warranty Snapshot</p>
                        <p className="body-sm">31 jobs currently within warranty period. 2 potential follow-ups flagged.</p>
                    </div>
                </div>
            </section>

            <CommunityActivityPanel />
        </main>
    );
}
