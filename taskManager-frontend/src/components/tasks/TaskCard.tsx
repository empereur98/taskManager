import React from 'react';
import type { Task, TaskStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/utils';
import { Calendar, Clock, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isDone = task.status === 'DONE';

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
      {/* Visual left indicator border */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          task.status === 'DONE'
            ? 'bg-emerald-500'
            : task.status === 'IN_PROGRESS'
            ? 'bg-blue-500'
            : 'bg-amber-400'
        }`}
      />

      <div>
        {/* Top bar: Status Badge & Action buttons */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge status={task.status} />

          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {onStatusChange && !isDone && (
              <button
                onClick={() => onStatusChange(task, 'DONE')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="Marquer comme terminée"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Modifier la tâche"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Supprimer la tâche"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-base font-semibold text-slate-900 leading-snug break-words ${
            isDone ? 'line-through text-slate-500' : ''
          }`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description ? (
          <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed break-words whitespace-pre-line">
            {task.description}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic mt-2">Aucune description</p>
        )}
      </div>

      {/* Footer: Creation & Update dates */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1" title={`Créée le ${formatDate(task.createdAt)}`}>
          <Calendar className="w-3.5 h-3.5" />
          <span>Créé: {formatDate(task.createdAt)}</span>
        </div>

        {task.updatedAt && task.updatedAt !== task.createdAt && (
          <div className="flex items-center gap-1" title={`Modifiée le ${formatDate(task.updatedAt)}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>Modifié: {formatDate(task.updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
