import { Loader2, Search, RefreshCw, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';

type TicketRow = {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 10;

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search.trim()) params.set('search', search.trim());
    if (status !== 'All') params.set('status', status);
    return params.toString();
  }, [page, search, status]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await apiRequest<{ items: TicketRow[]; total: number }>(`/api/tickets?${queryString}`);
        setTickets(response.items || []);
        setTotal(response.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load tickets.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [queryString]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Support tickets</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-800">Ticket operations</h2>
        </div>
        <Link to="/tickets/new" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Create ticket
        </Link>
      </div>

      <div className="card-surface rounded-2xl p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 text-sm text-slate-700 outline-none focus:border-brand-500 focus:bg-white"
              placeholder="Search tickets, customers, or subject"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-brand-500"
            >
              <option>All</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Closed</option>
            </select>
            <button onClick={() => setPage(1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="card-surface overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Ticket ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading tickets...</div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">No tickets match your search.</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-semibold text-slate-800">{ticket.ticket_id}</td>
                    <td className="px-4 py-3">{ticket.customer_name}</td>
                    <td className="px-4 py-3 text-slate-600">{ticket.customer_email}</td>
                    <td className="px-4 py-3 text-slate-700">{ticket.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${ticket.status === 'Open' ? 'status-open' : ticket.status === 'In Progress' ? 'status-progress' : 'status-closed'}`}>{ticket.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{new Date(ticket.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(ticket.updated_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Link to={`/tickets/${ticket.ticket_id}`} className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-200">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500">{total} results</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 disabled:opacity-40" onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 disabled:opacity-40" onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
