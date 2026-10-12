import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '../../api/client';
import { userApi } from '../../api/services';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ErrorMessage, FieldError, Spinner } from '../../components/common/Feedback';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import type { Role, User } from '../../types';
import { formatDateTime } from '../../utils/format';
import { isPhone } from '../../utils/validation';

export default function ManageUsers() {
  const toast = useToast();
  const { user: me } = useAuth();
  const { data, loading, error, reload } = useAsync(() => userApi.list(), []);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ fullName: '', phone: '', role: 'CUSTOMER' as Role });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = (data ?? []).filter((u) =>
    `${u.fullName} ${u.email}`.toLowerCase().includes(search.trim().toLowerCase()));

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ fullName: u.fullName, phone: u.phone ?? '', role: u.role });
    setErrors({});
  };

  const save = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!editing) return;
    const v: Record<string, string> = {};
    if (form.fullName.trim().length < 2) v.fullName = 'Full name must be at least 2 characters';
    if (form.phone.trim() && !isPhone(form.phone)) v.phone = 'Phone must be 9-15 digits';
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      await userApi.update(editing.id, { fullName: form.fullName.trim(), phone: form.phone.trim(), role: form.role });
      toast.success(`${form.fullName} updated`);
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await userApi.remove(toDelete.id);
      toast.success(`${toDelete.fullName} deleted`);
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Users</h1>
      <p className="mt-1 text-sm text-zinc-400">Manage customer and administrator accounts.</p>

      <input className="input mt-6 sm:max-w-xs" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="card mt-4 overflow-x-auto">
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> : (
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-zinc-800">
              <tr><th className="table-head">ID</th><th className="table-head">Name</th><th className="table-head">Email</th><th className="table-head">Phone</th><th className="table-head">Role</th><th className="table-head">Joined</th><th className="table-head text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/30">
                  <td className="table-cell text-zinc-500">{u.id}</td>
                  <td className="table-cell font-semibold text-white">{u.fullName}{u.id === me?.id && <span className="ml-2 text-xs text-zinc-500">(you)</span>}</td>
                  <td className="table-cell">{u.email}</td>
                  <td className="table-cell">{u.phone ?? '—'}</td>
                  <td className="table-cell"><StatusBadge status={u.role} /></td>
                  <td className="table-cell text-xs text-zinc-400">{formatDateTime(u.createdAt)}</td>
                  <td className="table-cell text-right">
                    <button className="btn-ghost px-2 py-1" onClick={() => openEdit(u)}>Edit</button>
                    {u.id !== me?.id && <button className="btn-ghost px-2 py-1 text-rose-300" onClick={() => setToDelete(u)}>Delete</button>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="table-cell py-10 text-center text-zinc-500">No users found</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!editing} title={`Edit ${editing?.email ?? ''}`} onClose={() => setEditing(null)}
        footer={<>
          <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
          <button className="btn-primary" onClick={() => save()} disabled={saving}>{saving ? 'Saving…' : 'Save user'}</button>
        </>}>
        <form onSubmit={save} noValidate className="space-y-4">
          <div>
            <label className="label" htmlFor="u-name">Full name</label>
            <input id="u-name" className={`input ${errors.fullName ? 'input-error' : ''}`} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <FieldError message={errors.fullName} />
          </div>
          <div>
            <label className="label" htmlFor="u-phone">Phone</label>
            <input id="u-phone" className={`input ${errors.phone ? 'input-error' : ''}`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <FieldError message={errors.phone} />
          </div>
          <div>
            <label className="label" htmlFor="u-role">Role</label>
            <select id="u-role" className="input" value={form.role} disabled={editing?.id === me?.id}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
            </select>
            {editing?.id === me?.id && <p className="mt-1 text-xs text-zinc-500">You can't change your own role.</p>}
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} title="Delete user?" danger busy={deleting} confirmLabel="Delete"
        message={`Delete ${toDelete?.fullName} (${toDelete?.email})? Users with bookings can't be deleted, to keep booking history.`}
        onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
