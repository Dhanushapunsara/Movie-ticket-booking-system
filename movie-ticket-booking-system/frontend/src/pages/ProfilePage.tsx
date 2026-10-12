import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '../api/client';
import { paymentApi, userApi } from '../api/services';
import { FieldError } from '../components/common/Feedback';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { formatCurrency, formatDateTime, humanize } from '../utils/format';
import { isPhone } from '../utils/validation';

export default function ProfilePage() {
  const { user, setUser, isCustomer } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ fullName: user!.fullName, phone: user!.phone ?? '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const payments = useAsync(() => (isCustomer ? paymentApi.mine(0, 5) : Promise.resolve(null)), [isCustomer]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (form.fullName.trim().length < 2) v.fullName = 'Full name must be at least 2 characters';
    if (form.phone.trim() && !isPhone(form.phone)) v.phone = 'Phone must be 9-15 digits';
    if (form.password && form.password.length < 6) v.password = 'Password must be at least 6 characters';
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      const updated = await userApi.update(user!.id, {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        password: form.password || undefined,
      });
      setUser(updated);
      setForm((f) => ({ ...f, password: '' }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="page-title">My profile</h1>
        <div className="card mt-6 p-6">
          <div className="mb-6 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 font-display text-3xl text-zinc-950">
              {user!.fullName.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-semibold text-white">{user!.email}</p>
              <StatusBadge status={user!.role} />
            </div>
          </div>
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label className="label" htmlFor="fullName">Full name</label>
              <input id="fullName" className={`input ${errors.fullName ? 'input-error' : ''}`} value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <FieldError message={errors.fullName} />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone</label>
              <input id="phone" className={`input ${errors.phone ? 'input-error' : ''}`} value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <FieldError message={errors.phone} />
            </div>
            <div>
              <label className="label" htmlFor="password">New password</label>
              <input id="password" type="password" autoComplete="new-password" placeholder="Leave blank to keep current"
                className={`input ${errors.password ? 'input-error' : ''}`} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <FieldError message={errors.password} />
            </div>
            <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </form>
        </div>
      </div>

      {isCustomer && (
        <div>
          <h2 className="font-display text-3xl tracking-wide text-white sm:mt-3">Recent payments</h2>
          <div className="card mt-6 divide-y divide-zinc-800">
            {payments.loading ? <p className="p-4 text-sm text-zinc-400">Loading…</p> :
              !payments.data || payments.data.content.length === 0 ? <p className="p-4 text-sm text-zinc-400">No payments yet.</p> :
                payments.data.content.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                    <div>
                      <p className="font-semibold text-white">{p.movieTitle}</p>
                      <p className="text-xs text-zinc-400">
                        Booking #{p.bookingId} · {humanize(p.paymentMethod)} · {formatDateTime(p.paymentDate ?? p.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">{formatCurrency(p.amount)}</p>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}
