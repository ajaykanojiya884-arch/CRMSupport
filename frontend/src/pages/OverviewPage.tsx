import { Activity, ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, PlusCircle, ShieldCheck, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';

type OverviewData = {
  total_tickets: number;
  open: number;
  in_progress: number;
  closed: number;
  status_distribution: Record<string, number>;
  created_last_7_days: number;
  closed_last_7_days: number;
};

type TicketSummary = {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: string;
  updated_at: string;
};

export default function OverviewPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [overviewData, listData] = await Promise.all([
          apiRequest<OverviewData>('/api/analytics/overview'),
          apiRequest<{ items: TicketSummary[] }>('/api/tickets?page=1&page_size=5'),
        ]);
        setOverview(overviewData);
        setTickets(listData.items || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading overview...</div>;
  }

  const total = overview?.total_tickets ?? 0;
  const open = overview?.open ?? 0;
  const progress = overview?.in_progress ?? 0;
  const closed = overview?.closed ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Operations overview</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-800">Monitor ticket health and workload</h2>
        </div>
        <div className="flex gap-3">
          <Link to="/tickets/new" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            <PlusCircle className="h-4 w-4" /> Create ticket
          </Link>
          <Link to="/tickets" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            View all tickets
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[{ label: 'Total Tickets', value: total, icon: BriefcaseBusiness }, { label: 'Open', value: open, icon: Clock3 }, { label: 'In Progress', value: progress, icon: Activity }, { label: 'Closed', value: closed, icon: CheckCircle2 }].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <div className="rounded-xl bg-brand-50 p-2 text-brand-700"><Icon className="h-4 w-4" /></div>
            </div>
            <div className="mt-5 text-3xl font-semibold text-slate-800">{value}</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              Live from backend
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="card-surface rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Ticket status overview</h3>
            <span className="text-sm text-slate-500">Updated live</span>
          </div>
          <div className="space-y-4">
            {Object.entries(overview?.status_distribution || {}).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{status}</span>
                  <span className="text-slate-500">{count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${status === 'Open' ? 'bg-emerald-500' : status === 'In Progress' ? 'bg-amber-500' : 'bg-brand-600'}`}
                    style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Needs attention</h3>
            <ShieldCheck className="h-5 w-5 text-amber-600" />
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-xl bg-slate-50 p-3">{open} open tickets need a response.</li>
            <li className="rounded-xl bg-slate-50 p-3">{progress} tickets are actively being investigated.</li>
            <li className="rounded-xl bg-slate-50 p-3">{overview?.created_last_7_days ?? 0} tickets created in the last 7 days.</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card-surface rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Recent tickets</h3>
            <Link to="/tickets" className="text-sm font-medium text-brand-700">View all</Link>
          </div>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.ticket_id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <div className="font-semibold text-slate-800">{ticket.ticket_id}</div>
                  <div className="text-sm text-slate-600">{ticket.customer_name} · {ticket.subject}</div>
                </div>
                <div className="text-right">
                  <span className={`status-badge ${ticket.status === 'Open' ? 'status-open' : ticket.status === 'In Progress' ? 'status-progress' : 'status-closed'}`}>{ticket.status}</span>
                  <div className="mt-1 text-xs text-slate-500">{new Date(ticket.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Trending & activity</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3">{overview?.created_last_7_days ?? 0} created in the last 7 days.</div>
            <div className="rounded-xl bg-slate-50 p-3">{overview?.closed_last_7_days ?? 0} tickets resolved in the last 7 days.</div>
            <div className="rounded-xl bg-slate-50 p-3">Operational volume is stable with a healthy resolution pace.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
