import { Bot, Send, Sparkles, Wand2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { apiRequest } from '../lib/api';

type AIResult = {
  summary?: string;
  category?: string;
  urgency?: string;
  next_action?: string;
  suggested_response?: string;
  message?: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AIPage() {
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Ask me anything about support operations, ticket triage, or customer communication.' },
  ]);

  async function runAction(action: string) {
    if (!ticketId.trim()) {
      setError('Enter a ticket ID to generate support guidance.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await apiRequest<AIResult>(`/api/ai/tickets/${ticketId.trim()}/${action}`, { method: 'POST' });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI support request failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setChat((current) => [...current, { role: 'user', content: trimmed }]);
    setMessage('');

    try {
      const data = await apiRequest<{ reply: string }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: trimmed }),
      });
      setChat((current) => [...current, { role: 'assistant', content: data.reply || 'No response was returned.' }]);
    } catch (err) {
      const messageError = err instanceof Error ? err.message : 'AI support request failed.';
      setError(messageError);
      setChat((current) => [...current, { role: 'assistant', content: 'I ran into a connection issue. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">AI copilot</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-800">Support guidance workspace</h2>
      </div>

      <div className="card-surface rounded-2xl p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">Ticket ID</label>
            <input value={ticketId} onChange={(event) => setTicketId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-800 outline-none focus:border-brand-500 focus:bg-white" placeholder="TKT-001" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => runAction('summarize')} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Summarize</button>
            <button onClick={() => runAction('classify')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Classify</button>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card-surface rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800"><Bot className="h-5 w-5 text-brand-600" />AI actions</div>
          <div className="space-y-3 text-sm text-slate-600">
            <button onClick={() => runAction('suggest-response')} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 hover:bg-slate-100"><span>Suggested response</span><Wand2 className="h-4 w-4" /></button>
            <button onClick={() => runAction('next-action')} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 hover:bg-slate-100"><span>Next action</span><Sparkles className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5">
          <div className="mb-4 text-lg font-semibold text-slate-800">Output</div>
          {loading ? <div className="text-slate-500">Generating insight...</div> : result ? (
            <div className="space-y-3 text-sm text-slate-600">
              {result.summary ? <div className="rounded-xl bg-slate-50 p-3"><span className="font-semibold text-slate-700">Summary:</span> {result.summary}</div> : null}
              {result.category ? <div className="rounded-xl bg-slate-50 p-3"><span className="font-semibold text-slate-700">Category:</span> {result.category}</div> : null}
              {result.urgency ? <div className="rounded-xl bg-slate-50 p-3"><span className="font-semibold text-slate-700">Urgency:</span> {result.urgency}</div> : null}
              {result.next_action ? <div className="rounded-xl bg-slate-50 p-3"><span className="font-semibold text-slate-700">Next action:</span> {result.next_action}</div> : null}
              {result.suggested_response ? <div className="rounded-xl bg-slate-50 p-3"><span className="font-semibold text-slate-700">Suggested response:</span> {result.suggested_response}</div> : null}
              {result.message ? <div className="rounded-xl bg-slate-50 p-3"><span className="font-semibold text-slate-700">Status:</span> {result.message}</div> : null}
            </div>
          ) : <div className="text-slate-500">No output yet.</div>}
        </div>
      </div>

      <div className="card-surface rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800"><Bot className="h-5 w-5 text-brand-600" />Live assistant</div>
        <div className="space-y-3">
          {chat.map((entry, index) => (
            <div key={`${entry.role}-${index}`} className={`rounded-xl p-3 text-sm ${entry.role === 'user' ? 'bg-brand-50 text-slate-700' : 'bg-slate-50 text-slate-600'}`}>
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{entry.role === 'user' ? 'You' : 'Assistant'}</span>
              <div>{entry.content}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 flex gap-3">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask for a summary, next step, or response draft..."
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-800 outline-none focus:border-brand-500 focus:bg-white"
          />
          <button type="submit" disabled={loading || !message.trim()} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
