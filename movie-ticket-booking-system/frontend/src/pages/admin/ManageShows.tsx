import { useEffect, useState, type FormEvent } from 'react';
import { getErrorMessage, getFieldErrors } from '../../api/client';
import { movieApi, showApi, theatreApi } from '../../api/services';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ErrorMessage, FieldError, Spinner } from '../../components/common/Feedback';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { SHOW_STATUSES, type Show, type ShowStatus } from '../../types';
import { formatCurrency, formatDate, formatTime, humanize, todayIso } from '../../utils/format';

interface FormState { movieId: string; theatreId: string; showDate: string; showTime: string; ticketPrice: string; status: ShowStatus }
const EMPTY: FormState = { movieId: '', theatreId: '', showDate: '', showTime: '', ticketPrice: '', status: 'SCHEDULED' };

export default function ManageShows() {
  const toast = useToast();
  const [filters, setFilters] = useState({ movieId: '', theatreId: '', date: '', status: '' as ShowStatus | '' });
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [filters]);

  const movies = useAsync(() => movieApi.list({ size: 100, sort: 'title,asc' }), []);
  const theatres = useAsync(() => theatreApi.list(), []);
  const { data, loading, error, reload } = useAsync(() => showApi.list({
    movieId: filters.movieId ? Number(filters.movieId) : '',
    theatreId: filters.theatreId ? Number(filters.theatreId) : '',
    date: filters.date,
    status: filters.status,
    page,
    size: 10,
  }), [filters, page]);

  const [editing, setEditing] = useState<Show | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Show | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setOpen(true); };
  const openEdit = (s: Show) => {
    setEditing(s);
    setForm({
      movieId: String(s.movieId), theatreId: String(s.theatreId), showDate: s.showDate,
      showTime: s.showTime.slice(0, 5), ticketPrice: String(s.ticketPrice), status: s.status,
    });
    setErrors({});
    setOpen(true);
  };

  const save = async (e?: FormEvent) => {
    e?.preventDefault();
    const v: Record<string, string> = {};
    if (!form.movieId) v.movieId = 'Choose a movie';
    if (!form.theatreId) v.theatreId = 'Choose a theatre';
    if (!form.showDate) v.showDate = 'Date is required';
    if (!form.showTime) v.showTime = 'Time is required';
    const price = Number(form.ticketPrice);
    if (!form.ticketPrice || !(price > 0)) v.ticketPrice = 'Price must be greater than 0';
    setErrors(v);
    if (Object.keys(v).length) return;

    const body = {
      movieId: Number(form.movieId), theatreId: Number(form.theatreId), showDate: form.showDate,
      showTime: form.showTime, ticketPrice: price, status: editing ? form.status : undefined,
    };
    setSaving(true);
    try {
      if (editing) {
        await showApi.update(editing.id, body);
        toast.success(form.status === 'CANCELLED' && editing.status !== 'CANCELLED'
          ? 'Show cancelled - its bookings were cancelled and paid ones refunded'
          : 'Show updated');
      } else {
        await showApi.create(body);
        toast.success('Show scheduled');
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
      await showApi.remove(toDelete.id);
      toast.success('Show deleted');
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // Only NOW_SHOWING / UPCOMING movies and ACTIVE theatres can get new shows (backend rules).
  const movieOptions = (movies.data?.content ?? []).filter((m) => m.status !== 'ENDED' || String(m.id) === form.movieId);
  const theatreOptions = (theatres.data ?? []).filter((t) => t.status === 'ACTIVE' || String(t.id) === form.theatreId);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Manage shows</h1>
          <p className="mt-1 text-sm text-zinc-400">Schedule screenings. Overlapping shows in the same theatre are rejected.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Schedule show</button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select className="input" value={filters.movieId} onChange={(e) => setFilters({ ...filters, movieId: e.target.value })}>
          <option value="">All movies</option>
          {movies.data?.content.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <select className="input" value={filters.theatreId} onChange={(e) => setFilters({ ...filters, theatreId: e.target.value })}>
          <option value="">All theatres</option>
          {theatres.data?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input type="date" className="input" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as ShowStatus | '' })}>
          <option value="">All statuses</option>
          {SHOW_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
        </select>
      </div>

      <div className="card mt-4 overflow-x-auto">
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> : (
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-zinc-800">
              <tr>
                <th className="table-head">ID</th><th className="table-head">Movie</th><th className="table-head">Theatre</th><th className="table-head">Date & time</th>
                <th className="table-head">Price</th><th className="table-head">Seats</th><th className="table-head">Status</th><th className="table-head text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data!.content.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-800/30">
                  <td className="table-cell text-zinc-500">{s.id}</td>
                  <td className="table-cell font-semibold text-white">{s.movieTitle}</td>
                  <td className="table-cell">{s.theatreName}</td>
                  <td className="table-cell">{formatDate(s.showDate)}<br /><span className="text-xs text-zinc-400">{formatTime(s.showTime)} – {formatTime(s.endTime)}</span></td>
                  <td className="table-cell">{formatCurrency(s.ticketPrice)}</td>
                  <td className="table-cell">{s.bookedSeats}/{s.capacity}</td>
                  <td className="table-cell"><StatusBadge status={s.status} /></td>
                  <td className="table-cell text-right">
                    <button className="btn-ghost px-2 py-1" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn-ghost px-2 py-1 text-rose-300" onClick={() => setToDelete(s)}>Delete</button>
                  </td>
                </tr>
              ))}
              {data!.content.length === 0 && <tr><td colSpan={8} className="table-cell py-10 text-center text-zinc-500">No shows found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />}

      <Modal open={open} title={editing ? `Edit show #${editing.id}` : 'Schedule show'} onClose={() => setOpen(false)}
        footer={<>
          <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={() => save()} disabled={saving}>{saving ? 'Saving…' : 'Save show'}</button>
        </>}>
        <form onSubmit={save} noValidate className="grid gap-4 sm:grid-cols-2">
          {editing && editing.bookedSeats > 0 && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200 sm:col-span-2">
              This show has bookings - only the price and status can be changed.
            </p>
          )}
          <div className="sm:col-span-2">
            <label className="label" htmlFor="s-movie">Movie</label>
            <select id="s-movie" className={`input ${errors.movieId ? 'input-error' : ''}`} value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })}>
              <option value="">Select a movie…</option>
              {movieOptions.map((m) => <option key={m.id} value={m.id}>{m.title} ({humanize(m.status)})</option>)}
            </select>
            <FieldError message={errors.movieId} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="s-theatre">Theatre</label>
            <select id="s-theatre" className={`input ${errors.theatreId ? 'input-error' : ''}`} value={form.theatreId} onChange={(e) => setForm({ ...form, theatreId: e.target.value })}>
              <option value="">Select a theatre…</option>
              {theatreOptions.map((t) => <option key={t.id} value={t.id}>{t.name} - {t.location} ({t.capacity} seats)</option>)}
            </select>
            <FieldError message={errors.theatreId} />
          </div>
          <div>
            <label className="label" htmlFor="s-date">Date</label>
            <input id="s-date" type="date" min={editing ? undefined : todayIso()} className={`input ${errors.showDate ? 'input-error' : ''}`}
              value={form.showDate} onChange={(e) => setForm({ ...form, showDate: e.target.value })} />
            <FieldError message={errors.showDate} />
          </div>
          <div>
            <label className="label" htmlFor="s-time">Time</label>
            <input id="s-time" type="time" className={`input ${errors.showTime ? 'input-error' : ''}`}
              value={form.showTime} onChange={(e) => setForm({ ...form, showTime: e.target.value })} />
            <FieldError message={errors.showTime} />
          </div>
          <div>
            <label className="label" htmlFor="s-price">Ticket price (LKR)</label>
            <input id="s-price" type="number" min={1} step="0.01" className={`input ${errors.ticketPrice ? 'input-error' : ''}`}
              value={form.ticketPrice} onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })} />
            <FieldError message={errors.ticketPrice} />
          </div>
          {editing && (
            <div>
              <label className="label" htmlFor="s-status">Status</label>
              <select id="s-status" className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ShowStatus })}>
                {SHOW_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
              </select>
              {form.status === 'CANCELLED' && editing.status !== 'CANCELLED' && (
                <p className="mt-1 text-xs text-rose-300">All bookings for this show will be cancelled.</p>
              )}
            </div>
          )}
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} title="Delete show?" danger busy={deleting} confirmLabel="Delete"
        message="Shows with bookings can't be deleted - change their status to Cancelled instead."
        onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
