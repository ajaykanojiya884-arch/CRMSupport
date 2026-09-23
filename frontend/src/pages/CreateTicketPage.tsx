import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';

export default function CreateTicketPage() {
  const [form, setForm] = useState({ customer_name: '', customer_email: '', subject: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest<{ ticket_id: string; created_at: string }>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSuccessTicket(response.ticket_id);
      setForm({ customer_name: '', customer_email: '', subject: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create the ticket.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Create ticket</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-800">New support case</h2>
      </div>

      {successTicket ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
          <p className="text-lg font-semibold">Ticket created successfully.</p>
          <p className="mt-1">Generated ID: <span className="font-bold">{successTicket}</span></p>
          <div className="mt-4 flex gap-3">
            <button onClick={() => navigate(`/tickets/${successTicket}`)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Open details</button>
            <button onClick={() => navigate('/tickets')} className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">View all tickets</button>
          </div>
        </div>
      ) : null}

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">Customer Name</label>
            <input required value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-800 outline-none focus:border-brand-500" />
          </div>
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">Customer Email</label>
            <input type="email" required value={form.customer_email} onChange={(event) => setForm({ ...form, customer_email: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-800 outline-none focus:border-brand-500" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
            <input required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-800 outline-none focus:border-brand-500" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <textarea required rows={6} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-800 outline-none focus:border-brand-500" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button disabled={loading} type="submit" className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">{loading ? 'Creating...' : 'Create Ticket'}</button>
        </div>
      </form>
    </div>
  );
}
