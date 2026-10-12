import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { FieldError } from '../components/common/Feedback';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { hasErrors, validateSignIn, type Errors } from '../utils/validation';

export default function SignInPage() {
  const { signIn, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Errors<typeof form>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={from ?? (user.role === 'ADMIN' ? '/admin' : '/')} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateSignIn(form);
    setErrors(v);
    if (hasErrors(v)) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const u = await signIn({ email: form.email.trim(), password: form.password });
      toast.success(`Welcome back, ${u.fullName.split(' ')[0]}!`);
      navigate(from ?? (u.role === 'ADMIN' ? '/admin' : '/'), { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Book your seats in seconds.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError && <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-200" role="alert">{serverError}</p>}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className={`input ${errors.email ? 'input-error' : ''}`}
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <FieldError message={errors.email} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" className={`input ${errors.password ? 'input-error' : ''}`}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <FieldError message={errors.password} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-zinc-400">
          New here? <Link to="/signup" state={location.state} className="font-semibold text-amber-300 hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 md:grid-cols-2">
      <div className="relative hidden flex-col justify-end bg-gradient-to-br from-amber-500 via-rose-600 to-purple-900 p-8 md:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
        <p className="relative font-display text-6xl leading-none text-white">Lights.<br />Camera.<br />Seats.</p>
        <p className="relative mt-4 text-sm text-white/80">Browse what's on, pick your exact seats and pay - all in one place.</p>
      </div>
      <div className="p-6 sm:p-10">
        <h1 className="page-title">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-zinc-400">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
