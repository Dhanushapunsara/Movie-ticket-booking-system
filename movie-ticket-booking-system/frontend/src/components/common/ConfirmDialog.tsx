import Modal from './Modal';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, busy, onConfirm, onCancel }: Props) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="btn-secondary" onClick={onCancel} disabled={busy}>Keep it</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-zinc-300">{message}</p>
    </Modal>
  );
}
