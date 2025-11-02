'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Timer, TrendingUp, AlertCircle } from 'lucide-react';
import { useKanbanBoard, useCreateTask, useUpdateTask, useDeleteTask, useIncrementPomodoro } from '@/hooks/useTasks';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useObjectives } from '@/hooks/useObjectives';
import { CreateTaskDto, Task } from '@/lib/api/services/tasks';

export default function TasksPage() {
  const { data: kanban, isLoading } = useKanbanBoard();
  const { data: lifeAreas } = useLifeAreas();
  const { data: objectives } = useObjectives();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const pomodoroMutation = useIncrementPomodoro();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<CreateTaskDto>({
    lifeAreaId: '',
    title: '',
    description: '',
    priority: 'medium',
    estimatedPomodoros: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTask) {
        await updateMutation.mutateAsync({ id: editingTask.id, dto: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsModalOpen(false);
      setEditingTask(null);
      setFormData({
        lifeAreaId: '',
        title: '',
        description: '',
        priority: 'medium',
        estimatedPomodoros: 1,
      });
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      lifeAreaId: task.lifeAreaId,
      objectiveId: task.objectiveId,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate?.split('T')[0],
      estimatedPomodoros: task.estimatedPomodoros,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleNew = () => {
    setEditingTask(null);
    setFormData({
      lifeAreaId: '',
      title: '',
      description: '',
      priority: 'medium',
      estimatedPomodoros: 1,
    });
    setIsModalOpen(true);
  };

  const handlePomodoro = async (taskId: string) => {
    try {
      await pomodoroMutation.mutateAsync(taskId);
    } catch (error) {
      console.error('Error incrementing pomodoro:', error);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        dto: { status: newStatus },
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getLifeAreaName = (lifeAreaId: string) => {
    return lifeAreas?.find((area) => area.id === lifeAreaId)?.name || 'Unknown';
  };

  const getObjectiveName = (objectiveId?: string) => {
    if (!objectiveId) return null;
    return objectives?.find((obj) => obj.id === objectiveId)?.title;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'border-green-500 bg-green-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <AlertCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const renderTaskCard = (task: Task) => (
    <div
      key={task.id}
      className={`bg-gray-800 border-l-4 rounded-lg p-4 mb-3 hover:bg-gray-750 transition-colors ${getPriorityColor(
        task.priority
      )}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          {getPriorityIcon(task.priority)}
          <h4 className="text-white font-medium">{task.title}</h4>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-400 mb-3">{task.description}</p>
      )}

      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <TrendingUp className="w-3 h-3" />
          <span>{getLifeAreaName(task.lifeAreaId)}</span>
        </div>
        {task.objectiveId && (
          <div className="text-xs text-gray-500">
            <span>Objective: {getObjectiveName(task.objectiveId)}</span>
          </div>
        )}
      </div>

      {/* Pomodoro Tracker */}
      {task.estimatedPomodoros && task.estimatedPomodoros > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Pomodoros</span>
            <span>
              {task.completedPomodoros}/{task.estimatedPomodoros}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-red-600 h-1.5 rounded-full transition-all"
              style={{
                width: `${(task.completedPomodoros / task.estimatedPomodoros) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
        {task.estimatedPomodoros && task.completedPomodoros < task.estimatedPomodoros && (
          <button
            onClick={() => handlePomodoro(task.id)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            title="Complete a Pomodoro"
          >
            <Timer className="w-3 h-3" />
            +1
          </button>
        )}
        <button
          onClick={() => handleEdit(task)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={() => handleDelete(task.id)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>

      {/* Status Change Buttons */}
      <div className="flex gap-2 mt-2">
        {task.status !== 'todo' && (
          <button
            onClick={() => handleStatusChange(task, 'todo')}
            className="flex-1 text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
          >
            To Do
          </button>
        )}
        {task.status !== 'in_progress' && (
          <button
            onClick={() => handleStatusChange(task, 'in_progress')}
            className="flex-1 text-xs px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors"
          >
            In Progress
          </button>
        )}
        {task.status !== 'done' && (
          <button
            onClick={() => handleStatusChange(task, 'done')}
            className="flex-1 text-xs px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded transition-colors"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
          <p className="text-gray-400">Manage your tasks with Kanban board</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-white">
              To Do ({kanban?.todo?.length || 0})
            </h2>
          </div>
          <div className="space-y-3">
            {kanban?.todo?.map((task) => renderTaskCard(task))}
            {kanban?.todo?.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No tasks</p>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-white">
              In Progress ({kanban?.in_progress?.length || 0})
            </h2>
          </div>
          <div className="space-y-3">
            {kanban?.in_progress?.map((task) => renderTaskCard(task))}
            {kanban?.in_progress?.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No tasks</p>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-white">
              Done ({kanban?.done?.length || 0})
            </h2>
          </div>
          <div className="space-y-3">
            {kanban?.done?.map((task) => renderTaskCard(task))}
            {kanban?.done?.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No tasks</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700 my-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingTask ? 'Edit Task' : 'New Task'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Life Area *
                </label>
                <select
                  value={formData.lifeAreaId}
                  onChange={(e) => setFormData({ ...formData, lifeAreaId: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a life area</option>
                  {lifeAreas?.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Objective (Optional)
                </label>
                <select
                  value={formData.objectiveId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, objectiveId: e.target.value || undefined })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">No objective</option>
                  {objectives?.map((obj) => (
                    <option key={obj.id} value={obj.id}>
                      {obj.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Complete workout"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Describe this task..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as 'low' | 'medium' | 'high',
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estimated Pomodoros
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.estimatedPomodoros || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedPomodoros: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0 = no tracking"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingTask
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
