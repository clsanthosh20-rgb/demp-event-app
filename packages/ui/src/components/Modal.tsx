import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={cn(
          'w-full sm:max-w-lg rounded-3xl sm:rounded-3xl bg-[#0a0a18] border border-white/[0.06] shadow-2xl shadow-black/40 p-6',
          'sm:mx-4 max-h-[85vh] overflow-y-auto',
          className,
        )}
      >
        {title && <h2 className="mb-4 text-lg font-semibold text-white/80">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export { Modal };
export type { ModalProps };
