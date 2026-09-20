import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  variant?: 'danger' | 'primary';
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isConfirming = false,
  variant = 'danger',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isConfirming) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isConfirming]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={() => {
          if (!isConfirming) onClose();
        }}
        aria-hidden="true"
      />

      {/* Container */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={cn(
          'relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 p-6 animate-scaleIn'
        )}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 id="alert-dialog-title" className="text-base font-bold text-slate-900">
              {title}
            </h2>
            <p id="alert-dialog-description" className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isConfirming}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
