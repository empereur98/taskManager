import React, { useState, useEffect } from 'react';
import type { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskDto | UpdateTaskDto) => Promise<void>;
  initialTask?: Task | null;
  isSubmitting: boolean;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  isSubmitting,
}) => {
  const isEditing = Boolean(initialTask);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [titleError, setTitleError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setStatus(initialTask.status);
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
    }
    setTitleError(undefined);
  }, [initialTask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError(undefined);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
      });
    } catch (err: any) {
      if (err?.fieldErrors?.title) {
        setTitleError(err.fieldErrors.title);
      }
    }
  };

  const statusOptions = [
    { value: 'TODO', label: 'À faire' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'DONE', label: 'Terminée' },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}
      description={
        isEditing
          ? 'Mettez à jour les informations de votre tâche ci-dessous.'
          : 'Remplissez les détails pour créer une nouvelle tâche.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Titre (requis) */}
        <Input
          label="Titre de la tâche"
          placeholder="Ex: Rédiger le compte-rendu..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setTitleError(undefined);
          }}
          error={titleError}
          required
          autoFocus
          disabled={isSubmitting}
        />

        {/* Description (optionnel) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-description" className="text-sm font-medium text-slate-700 select-none">
            Description <span className="text-xs text-slate-400 font-normal">(optionnelle)</span>
          </label>
          <textarea
            id="task-description"
            rows={3}
            placeholder="Détails supplémentaires, notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-150 resize-y disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        {/* Statut */}
        <Select
          label="Statut"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          disabled={isSubmitting}
        />

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? 'Enregistrer les modifications' : 'Créer la tâche'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
