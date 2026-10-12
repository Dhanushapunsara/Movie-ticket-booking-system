import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage, getFieldErrors } from '../api/client';
import { FieldError } from '../components/common/Feedback';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { hasErrors, validateSignUp, type Errors } from '../utils/validation';
import { AuthShell } from './SignInPage';

const EMPTY = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' };

export default function SignUpPage() {
  const { signUp, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors<typeof EMPTY>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={from ?? '/'} replace />;

  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateSignUp(form);
    setErrors(v);
    if (hasErrors(v)) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await signUp({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      toast.success('Account created - you are signed in!');
      navigate(from ?? '/', { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err) as Errors<typeof EMPTY>);
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof EMPTY, label: string, type = 'text', autoComplete?: string, hint?: string) => (
    <div>
      <label className="label" htmlFor={key}>{label}</label>
      <input id={key} type={type} autoComplete={autoComplete} className={`input ${errors[key] ? 'input-error' : ''}`}
        value={form[key]} onChange={set(key)} />
      {hint && !errors[key] && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
      <FieldError message={errors[key]} />
    </div>
  );

  return (
    <AuthShell title="Create account" subtitle="Sign up as a customer to start booking.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError && <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-200" role="alert">{serverError}</p>}
        {field('fullName', 'Full name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('phone', 'Phone (optional)', 'tel', 'tel', 'e.g. 0771234567')}
        <div className="grid gap-4 sm:grid-cols-2">
          {field('password', 'Password', 'password', 'new-password', 'At least 6 characters')}
          {field('confirmPassword', 'Confirm password', 'password', 'new-password')}
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
        <p className="text-center text-sm text-zinc-400">
          Already have an account? <Link to="/signin" state={location.state} className="font-semibold text-amber-300 hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
