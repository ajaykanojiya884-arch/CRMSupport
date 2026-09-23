import { TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

type Overview = {
  total_tickets: number;
  open: number;
  in_progress: number;
  closed: number;
  created_last_7_days: number;
  closed_last_7_days: number;
  status_distribution: Record<string, number>;
};

type TrendPoint = {
  date: string;
  created: number;
  closed: number;
};

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [overviewData, trendsData] = await Promise.all([
          apiRequest<Overview>('/api/analytics/overview'),
          apiRequest<{ daily: TrendPoint[] }>('/api/analytics/trends'),
        ]);
        setOverview(overviewData);
        setTrends(trendsData.daily || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const maxVolume = Math.max(1, ...trends.flatMap((point) => [point.created, point.closed]));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Analytics</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-800">Operational performance</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-surface rounded-2xl p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">Tickets opened</span><Users className="h-4 w-4 text-brand-600" /></div><div className="mt-5 text-3xl font-semibold text-slate-800">{overview?.created_last_7_days ?? 0}</div></div>
        <div className="card-surface rounded-2xl p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">Closed</span><TrendingUp className="h-4 w-4 text-emerald-600" /></div><div className="mt-5 text-3xl font-semibold text-slate-800">{overview?.closed_last_7_days ?? 0}</div></div>
        <div className="card-surface rounded-2xl p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">Open queue</span><span className="text-sm font-semibold text-amber-600">Live</span></div><div className="mt-5 text-3xl font-semibold text-slate-800">{overview?.open ?? 0}</div></div>
      </div>

      <div className="card-surface rounded-2xl p-5">
        <div className="mb-4 text-lg font-semibold text-slate-800">7-day volume</div>
        <div className="flex h-56 items-end gap-3">
          {trends.map((point) => (
            <div key={point.date} className="flex flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-40 w-full items-end justify-center gap-1">
                <div className="w-1/2 rounded-t-xl bg-brand-500" style={{ height: `${(point.created / maxVolume) * 100}%` }} title={`${point.created} created`} />
                <div className="w-1/2 rounded-t-xl bg-emerald-500" style={{ height: `${(point.closed / maxVolume) * 100}%` }} title={`${point.closed} closed`} />
              </div>
              <div className="text-xs text-slate-500">{new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
