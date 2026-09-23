import { ArrowRight, RefreshCw } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';

const OTP_LENGTH = 6;

export default function VerifyPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem('datastraw_login_email') || '');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const devOtp = localStorage.getItem('datastraw_dev_otp');

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  function handleOtpChange(index: number, value: string) {
    const next = [...otp];
    const digit = value.replace(/\D/g, '').slice(0, 1);
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  }

  async function requestCode() {
    setError('');
    setCountdown(30);
    try {
      await apiRequest('/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend verification code.');
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest<{ token: string; expires_at: string }>('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      if (!response.token) {
        throw new Error('Verification succeeded, but no login session was returned. Please try again.');
      }

      localStorage.setItem('datastraw_session_token', response.token);
      localStorage.setItem('datastraw_user_email', email.toLowerCase());
      localStorage.removeItem('datastraw_login_email');
      localStorage.removeItem('datastraw_dev_otp');
      window.location.replace('/overview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fefaf5,_#f1eee8_35%,_#e7e1d7_100%)] px-4 py-10">
      <div className="card-surface w-full max-w-md rounded-3xl p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Secure access</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-800">Verify your email</h1>
          <p className="mt-2 text-sm text-slate-600">Verification code sent to {email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}</p>
          {devOtp ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Demo OTP: <span className="font-bold tracking-[0.2em]">{devOtp}</span>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                className="h-12 w-12 rounded-xl border border-slate-200 bg-white text-center text-xl font-semibold text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {loading ? 'Verifying...' : 'Verify'}
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </button>

          <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('datastraw_login_email');
                localStorage.removeItem('datastraw_dev_otp');
                setOtp(Array(OTP_LENGTH).fill(''));
                navigate('/login');
              }}
              className="font-medium text-slate-600 hover:text-slate-800"
            >
              Change email
            </button>
            <button type="button" onClick={requestCode} disabled={countdown > 0} className="inline-flex items-center gap-2 font-medium text-brand-700 disabled:text-slate-400">
              <RefreshCw className="h-4 w-4" />
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
