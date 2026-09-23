import { ArrowRight, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest<{ message: string; masked_email?: string; otp?: string }>('/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (response.otp) {
        localStorage.setItem('datastraw_dev_otp', response.otp);
      } else {
        localStorage.removeItem('datastraw_dev_otp');
      }

      localStorage.setItem('datastraw_login_email', email.trim().toLowerCase());
      localStorage.removeItem('datastraw_session_token');
      localStorage.removeItem('datastraw_user_email');
      navigate('/verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send verification code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fefaf5,_#f1eee8_35%,_#e7e1d7_100%)] px-4 py-10">
      <div className="card-surface w-full max-w-md rounded-3xl p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <Mail className="h-7 w-7" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Datastraw</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-800">Operations</h1>
          <p className="mt-2 text-sm text-slate-600">Secure support access for your team.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Gmail address</label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ajay@gmail.com"
                className="w-full border-0 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending code...' : 'Continue'}
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </form>
      </div>
    </div>
  );
}
