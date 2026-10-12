import { useEffect, useState, type FormEvent } from 'react';
import { getErrorMessage, getFieldErrors } from '../../api/client';
import { movieApi } from '../../api/services';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ErrorMessage, FieldError, Spinner } from '../../components/common/Feedback';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { MOVIE_STATUSES, type Movie, type MovieRequest, type MovieStatus } from '../../types';
import { formatDate, formatDuration, humanize } from '../../utils/format';

interface FormState {
  title: string;
  description: string;
  durationMinutes: string;
  language: string;
  genre: string;
  releaseDate: string;
  posterUrl: string;
  status: MovieStatus;
}

const EMPTY: FormState = { title: '', description: '', durationMinutes: '', language: 'English', genre: '', releaseDate: '', posterUrl: '', status: 'UPCOMING' };

function validate(f: FormState) {
  const e: Record<string, string> = {};
  if (!f.title.trim()) e.title = 'Title is required';
  const d = Number(f.durationMinutes);
  if (!f.durationMinutes || !Number.isInteger(d) || d < 1 || d > 600) e.durationMinutes = 'Duration must be 1-600 minutes';
  if (!f.language.trim()) e.language = 'Language is required';
  if (!f.genre.trim()) e.genre = 'Genre is required';
  if (f.description.length > 2000) e.description = 'Max 2000 characters';
  if (f.posterUrl && !/^https?:\/\//i.test(f.posterUrl)) e.posterUrl = 'Must start with http:// or https://';
  return e;
}

export default function ManageMovies() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MovieStatus | ''>('');
  const [page, setPage] = useState(0);
  const q = useDebounce(search);
  useEffect(() => setPage(0), [q, status]);

  const { data, loading, error, reload } = useAsync(() => movieApi.list({ title: q, status, page, size: 10, sort: 'id,desc' }), [q, status, page]);

  const [editing, setEditing] = useState<Movie | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Movie | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setFormOpen(true); };
  const openEdit = (m: Movie) => {
    setEditing(m);
    setForm({
      title: m.title, description: m.description ?? '', durationMinutes: String(m.durationMinutes), language: m.language,
      genre: m.genre, releaseDate: m.releaseDate ?? '', posterUrl: m.posterUrl ?? '', status: m.status,
    });
    setErrors({});
    setFormOpen(true);
  };

  const save = async (e?: FormEvent) => {
    e?.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    const body: MovieRequest = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      durationMinutes: Number(form.durationMinutes),
      language: form.language.trim(),
      genre: form.genre.trim(),
      releaseDate: form.releaseDate || null,
      posterUrl: form.posterUrl.trim() || undefined,
      status: form.status,
    };
    setSaving(true);
    try {
      if (editing) {
        await movieApi.update(editing.id, body);
        toast.success(`"${body.title}" updated`);
      } else {
        await movieApi.create(body);
        toast.success(`"${body.title}" added`);
      }
      setFormOpen(false);
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
      await movieApi.remove(toDelete.id);
      toast.success(`"${toDelete.title}" deleted`);
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const input = (key: keyof FormState, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={`m-${key}`}>{label}</label>
      <input id={`m-${key}`} className={`input ${errors[key] ? 'input-error' : ''}`} value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...props} />
      <FieldError message={errors[key]} />
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Manage movies</h1>
          <p className="mt-1 text-sm text-zinc-400">Create, update and remove movies.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add movie</button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input className="input sm:max-w-xs" placeholder="Search by title…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input sm:max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value as MovieStatus | '')}>
          <option value="">All statuses</option>
          {MOVIE_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
        </select>
      </div>

      <div className="card mt-4 overflow-x-auto">
        {loading ? <Spinner /> : error ? <ErrorMessage message={error} onRetry={reload} /> : (
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-zinc-800">
              <tr>
                <th className="table-head">ID</th><th className="table-head">Title</th><th className="table-head">Genre / Language</th>
                <th className="table-head">Duration</th><th className="table-head">Release</th><th className="table-head">Status</th><th className="table-head text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data!.content.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-800/30">
                  <td className="table-cell text-zinc-500">{m.id}</td>
                  <td className="table-cell font-semibold text-white">{m.title}</td>
                  <td className="table-cell">{m.genre} · {m.language}</td>
                  <td className="table-cell">{formatDuration(m.durationMinutes)}</td>
                  <td className="table-cell">{formatDate(m.releaseDate)}</td>
                  <td className="table-cell"><StatusBadge status={m.status} /></td>
                  <td className="table-cell text-right">
                    <button className="btn-ghost px-2 py-1" onClick={() => openEdit(m)}>Edit</button>
                    <button className="btn-ghost px-2 py-1 text-rose-300" onClick={() => setToDelete(m)}>Delete</button>
                  </td>
                </tr>
              ))}
              {data!.content.length === 0 && <tr><td colSpan={7} className="table-cell py-10 text-center text-zinc-500">No movies found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />}

      <Modal open={formOpen} title={editing ? `Edit "${editing.title}"` : 'Add movie'} onClose={() => setFormOpen(false)} wide
        footer={<>
          <button className="btn-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={() => save()} disabled={saving}>{saving ? 'Saving…' : 'Save movie'}</button>
        </>}>
        <form onSubmit={save} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{input('title', 'Title')}</div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="m-description">Description</label>
            <textarea id="m-description" rows={3} className={`input ${errors.description ? 'input-error' : ''}`} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FieldError message={errors.description} />
          </div>
          {input('genre', 'Genre', { placeholder: 'e.g. Drama' })}
          {input('language', 'Language')}
          {input('durationMinutes', 'Duration (minutes)', { type: 'number', min: 1, max: 600 })}
          {input('releaseDate', 'Release date', { type: 'date' })}
          <div>
            <label className="label" htmlFor="m-status">Status</label>
            <select id="m-status" className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MovieStatus })}>
              {MOVIE_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
            </select>
            {form.status === 'ENDED' && <p className="mt-1 text-xs text-amber-300">Ended movies can't get new shows.</p>}
          </div>
          {input('posterUrl', 'Poster URL (optional)', { placeholder: 'https://…' })}
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} title="Delete movie?" danger busy={deleting} confirmLabel="Delete"
        message={`Delete "${toDelete?.title}"? Movies that already have shows can't be deleted - set them to Ended instead.`}
        onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
