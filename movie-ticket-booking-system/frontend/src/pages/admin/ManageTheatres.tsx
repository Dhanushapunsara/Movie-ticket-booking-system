import { useState, type FormEvent } from 'react';
import { getErrorMessage, getFieldErrors } from '../../api/client';
import { theatreApi } from '../../api/services';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ErrorMessage, FieldError, Spinner } from '../../components/common/Feedback';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { THEATRE_STATUSES, type Theatre, type TheatreStatus } from '../../types';
import { humanize } from '../../utils/format';

interface FormState { name: string; location: string; capacity: string; status: TheatreStatus }
const EMPTY: FormState = { name: '', location: '', capacity: '100', status: 'ACTIVE' };

export default function ManageTheatres() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => theatreApi.list(), []);
  const [editing, setEditing] = useState<Theatre | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Theatre | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setOpen(true); };
  const openEdit = (t: Theatre) => {
    setEditing(t);
    setForm({ name: t.name, location: t.location, capacity: String(t.capacity), status: t.status });
    setErrors({});
    setOpen(true);
  };

  const save = async (e?: FormEvent) => {
    e?.preventDefault();
    const v: Record<string, string> = {};
    if (!form.name.trim()) v.name = 'Name is required';
    if (!form.location.trim()) v.location = 'Location is required';
    const cap = Number(form.capacity);
    if (!Number.isInteger(cap) || cap < 10 || cap > 500) v.capacity = 'Capacity must be 10-500 seats';
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      const body = { name: form.name.trim(), location: form.location.trim(), capacity: cap, status: form.status };
      if (editing) {
        await theatreApi.update(editing.id, body);
        toast.success(`${body.name} updated`);
      } else {
        await theatreApi.create(body);
        toast.success(`${body.name} added`);
      }
      setOpen(false);
      reload();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await theatreApi.remove(toDelete.id);
      toast.success(`${toDelete.name} deleted`);
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Manage theatres</h1>
          <p className="mt-1 text-sm text-zinc-400">Seats are laid out in rows of 10 (A1–A10, B1–B10 …).</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add theatre</button>
      </div>

      <div className="card mt-6 overflow-x-auto">
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> : (
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-zinc-800">
              <tr><th className="table-head">ID</th><th className="table-head">Name</th><th className="table-head">Location</th><th className="table-head">Capacity</th><th className="table-head">Status</th><th className="table-head text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data!.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-800/30">
                  <td className="table-cell text-zinc-500">{t.id}</td>
                  <td className="table-cell font-semibold text-white">{t.name}</td>
                  <td className="table-cell">{t.location}</td>
                  <td className="table-cell">{t.capacity} seats</td>
                  <td className="table-cell"><StatusBadge status={t.status} /></td>
                  <td className="table-cell text-right">
                    <button className="btn-ghost px-2 py-1" onClick={() => openEdit(t)}>Edit</button>
                    <button className="btn-ghost px-2 py-1 text-rose-300" onClick={() => setToDelete(t)}>Delete</button>
                  </td>
                </tr>
              ))}
              {data!.length === 0 && <tr><td colSpan={6} className="table-cell py-10 text-center text-zinc-500">No theatres yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={open} title={editing ? `Edit ${editing.name}` : 'Add theatre'} onClose={() => setOpen(false)}
        footer={<>
          <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={() => save()} disabled={saving}>{saving ? 'Saving…' : 'Save theatre'}</button>
        </>}>
        <form onSubmit={save} noValidate className="space-y-4">
          {(['name', 'location'] as const).map((k) => (
            <div key={k}>
              <label className="label" htmlFor={`t-${k}`}>{humanize(k)}</label>
              <input id={`t-${k}`} className={`input ${errors[k] ? 'input-error' : ''}`} value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              <FieldError message={errors[k]} />
            </div>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="t-capacity">Capacity</label>
              <input id="t-capacity" type="number" min={10} max={500} className={`input ${errors.capacity ? 'input-error' : ''}`}
                value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              <FieldError message={errors.capacity} />
            </div>
            <div>
              <label className="label" htmlFor="t-status">Status</label>
              <select id="t-status" className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TheatreStatus })}>
                {THEATRE_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} title="Delete theatre?" danger busy={deleting} confirmLabel="Delete"
        message={`Delete ${toDelete?.name}? Theatres that already have shows can't be deleted - set them to Inactive instead.`}
        onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
