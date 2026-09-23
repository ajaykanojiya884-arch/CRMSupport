import { ArrowLeft, Loader2, MessageSquareText, PencilLine, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../lib/api';

type NoteItem = {
  id: number;
  note_text: string;
  created_at: string;
};

type TicketDetail = {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes: NoteItem[];
};

export default function TicketDetailsPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [status, setStatus] = useState('Open');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!ticketId) return;
      try {
        const data = await apiRequest<TicketDetail>(`/api/tickets/${ticketId}`);
        setTicket(data);
        setStatus(data.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load ticket.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ticketId]);

  async function handleUpdate() {
    if (!ticketId) return;
    setSaving(true);
    setError('');
    try {
      const data = await apiRequest<{ success: boolean; updated_at: string; ticket_id: string }>(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes: notes.trim() ? notes : undefined }),
      });
      if (data.success) {
        const refreshed = await apiRequest<TicketDetail>(`/api/tickets/${ticketId}`);
        setTicket(refreshed);
        setNotes('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600"><Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />Loading ticket...</div>;
  }

  if (!ticket) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error || 'Ticket not found.'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/tickets" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Ticket detail</p>
            <h2 className="mt-1 text-3xl font-semibold text-slate-800">{ticket.ticket_id}</h2>
          </div>
        </div>
        <span className={`status-badge ${ticket.status === 'Open' ? 'status-open' : ticket.status === 'In Progress' ? 'status-progress' : 'status-closed'}`}>{ticket.status}</span>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card-surface rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-slate-800">Customer details</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div><span className="font-medium text-slate-700">Customer:</span> {ticket.customer_name}</div>
            <div><span className="font-medium text-slate-700">Email:</span> {ticket.customer_email}</div>
            <div><span className="font-medium text-slate-700">Subject:</span> {ticket.subject}</div>
            <div><span className="font-medium text-slate-700">Created:</span> {new Date(ticket.created_at).toLocaleString()}</div>
            <div><span className="font-medium text-slate-700">Updated:</span> {new Date(ticket.updated_at).toLocaleString()}</div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><MessageSquareText className="h-4 w-4" /> Description</div>
            <p className="leading-7 text-slate-600">{ticket.description}</p>
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800"><PencilLine className="h-5 w-5 text-brand-600" /> Update ticket</div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-brand-500 focus:bg-white">
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Add note</label>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 focus:border-brand-500 focus:bg-white" placeholder="Add investigation notes or customer update..." />
            </div>
            <button disabled={saving} onClick={handleUpdate} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save update'}
            </button>
          </div>
        </div>
      </div>

      <div className="card-surface rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-slate-800">Notes</h3>
        <div className="mt-4 space-y-3">
          {ticket.notes.length === 0 ? <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No notes yet.</div> : ticket.notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{new Date(note.created_at).toLocaleString()}</div>
              <p className="leading-7 text-slate-600">{note.note_text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
