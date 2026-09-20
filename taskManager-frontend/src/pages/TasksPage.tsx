import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../types';
import { tasksApi } from '../api/tasks.api';
import { Navbar } from '../components/layout/Navbar';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFilters, type FilterStatus } from '../components/tasks/TaskFilters';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Button } from '../components/ui/Button';
import { Plus, Loader2, ClipboardList, SearchX, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtres (RF-15, RF-16, RF-17, RF-18)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL');

  // Modale Formulaire (Ajout / Édition) (RF-11, RF-12)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modale Suppression (RF-13)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // RF-08: Chargement initial de la liste via GET /api/tasks
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await tasksApi.getTasks();
      // Tri par date de création la plus récente par défaut
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
      setTasks(sorted);
    } catch (err: any) {
      toast.error(err.message || 'Impossible de récupérer les tâches.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // RF-15, RF-16, RF-17, RF-18: Filtrage et recherche cumulés côté client
  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus = selectedStatus === 'ALL' || task.status === selectedStatus;

      const titleMatch = task.title.toLowerCase().includes(query);
      const descMatch = task.description ? task.description.toLowerCase().includes(query) : false;
      const matchesSearch = query === '' || titleMatch || descMatch;

      return matchesStatus && matchesSearch;
    });
  }, [tasks, searchQuery, selectedStatus]);

  // Compteurs pour la barre de filtres
  const counts = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      done: tasks.filter((t) => t.status === 'DONE').length,
    };
  }, [tasks]);

  // Ouverture modale création
  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Ouverture modale édition
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Ouverture confirmation suppression
  const handleOpenDelete = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  };

  // Soumission Formulaire (Ajout ou Modification) -> RF-11, RF-12, RF-14, RF-22
  const handleFormSubmit = async (data: CreateTaskDto | UpdateTaskDto) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        // Modification (PUT /api/tasks/{id})
        await tasksApi.updateTask(editingTask.id, data as UpdateTaskDto);
        toast.success('Tâche mise à jour avec succès.');
      } else {
        // Création (POST /api/tasks)
        await tasksApi.createTask(data as CreateTaskDto);
        toast.success('Nouvelle tâche créée avec succès.');
      }
      setIsFormOpen(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (err: any) {
      toast.error(err.message || 'Échec de l\'enregistrement de la tâche.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmation Suppression -> RF-13, RF-14
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await tasksApi.deleteTask(taskToDelete.id);
      toast.success('Tâche supprimée avec succès.');
      setIsDeleteOpen(false);
      setTaskToDelete(null);
      await fetchTasks();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de supprimer la tâche.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Changement rapide de statut
  const handleQuickStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateTask(task.id, {
        title: task.title,
        description: task.description || undefined,
        status: newStatus,
      });
      toast.success(`Statut mis à jour : ${newStatus === 'DONE' ? 'Terminée' : newStatus}`);
      await fetchTasks();
    } catch (err: any) {
      toast.error(err.message || 'Échec du changement de statut.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Action Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Mes Tâches
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Gérez, suivez et organisez vos priorités quotidiennes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={fetchTasks}
              disabled={isLoading}
              title="Rafraîchir la liste"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreate}
              className="shadow-sm shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle tâche</span>
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar (RF-15 à RF-18) */}
        <div className="mb-6">
          <TaskFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            counts={counts}
          />
        </div>

        {/* Content Section: Loading / Empty / Grid (RF-08, RF-09, RF-10) */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Chargement de vos tâches...</p>
          </div>
        ) : tasks.length === 0 ? (
          /* RF-10: État vide quand aucune tâche n'existe */
          <div className="py-16 px-4 bg-white rounded-2xl border border-slate-200 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Aucune tâche pour le moment</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Commencez à organiser vos journées en ajoutant votre toute première tâche dès maintenant.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreate}
              className="mt-5 shadow-sm shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une tâche</span>
            </Button>
          </div>
        ) : filteredTasks.length === 0 ? (
          /* RF-10: État vide après filtrage ou recherche */
          <div className="py-16 px-4 bg-white rounded-2xl border border-slate-200 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <SearchX className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Aucun résultat trouvé</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Aucune tâche ne correspond à vos critères de recherche ou de filtre actuels.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('ALL');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        ) : (
          /* Grid des tâches (RF-09, responsive 1 col mobile, 2 col md, 3 col lg) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onStatusChange={handleQuickStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modale d'Ajout / Édition de tâche (RF-11, RF-12) */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsFormOpen(false);
            setEditingTask(null);
          }
        }}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
        isSubmitting={isSubmitting}
      />

      {/* Modale de Confirmation de Suppression (RF-13) */}
      <AlertDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteOpen(false);
            setTaskToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer la tâche ?"
        description={`Êtes-vous sûr de vouloir supprimer définitivement la tâche "${taskToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        isConfirming={isDeleting}
        variant="danger"
      />
    </div>
  );
};
