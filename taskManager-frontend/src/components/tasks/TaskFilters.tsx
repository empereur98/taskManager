import React from 'react';
import type { TaskStatus } from '../../types';
import { Search, X, Filter } from 'lucide-react';
import { STATUS_CONFIG } from '../ui/Badge';

export type FilterStatus = 'ALL' | TaskStatus;

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  counts: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  counts,
}) => {
  const statusTabs: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'ALL', label: 'Toutes', count: counts.total },
    { id: 'TODO', label: STATUS_CONFIG.TODO.label, count: counts.todo },
    { id: 'IN_PROGRESS', label: STATUS_CONFIG.IN_PROGRESS.label, count: counts.inProgress },
    { id: 'DONE', label: STATUS_CONFIG.DONE.label, count: counts.done },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input (RF-16) */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher par titre ou description..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-150"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              title="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter select */}
        <div className="sm:hidden flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none"
          >
            {statusTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label} ({tab.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Filter Pills (RF-15, RF-17) */}
      <div className="hidden sm:flex items-center gap-1.5 border-t border-slate-100 pt-3">
        <span className="text-xs font-medium text-slate-500 mr-1.5">Statut :</span>
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
