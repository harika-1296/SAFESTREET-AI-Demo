import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  hideClose?: boolean;
}

export function Modal({ open, onClose, children, title, className, hideClose }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-plum/30 backdrop-blur-sm" />
      <div
        className={cn(
          'relative bg-white rounded-t-4xl sm:rounded-4xl shadow-elevated w-full sm:max-w-lg max-h-[90vh] overflow-y-auto scroll-thin animate-slide-up sm:animate-scale-in',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-3 sticky top-0 bg-white/80 glass z-10">
            {title && <h3 className="text-lg font-bold text-plum">{title}</h3>}
            {!hideClose && (
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-lavender-100 transition-colors text-plum-muted hover:text-plum">
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} hideClose>
      <div className="text-center py-2">
        <div className={cn('w-14 h-14 rounded-3xl mx-auto flex items-center justify-center mb-4', danger ? 'bg-emergency-light' : 'bg-lavender-100')}>
          <div className={cn('w-7 h-7 rounded-2xl', danger ? 'bg-emergency' : 'bg-lavender-400')} />
        </div>
        <h3 className="text-lg font-bold text-plum">{title}</h3>
        <p className="text-sm text-muted mt-2 max-w-sm mx-auto">{message}</p>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-lavender-200 text-plum font-semibold text-sm hover:bg-lavender-100/50 transition-colors">
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={cn('flex-1 py-3 rounded-2xl text-white font-semibold text-sm transition-all', danger ? 'bg-emergency hover:bg-emergency-dark' : 'bg-lavender-400 hover:bg-lavender-700')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
