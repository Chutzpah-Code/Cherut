'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Circle, TrendingUp, Calendar } from 'lucide-react';
import { useHabits, useCreateHabit, useUpdateHabit, useDeleteHabit, useLogHabit } from '@/hooks/useHabits';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { CreateHabitDto, Habit, LogHabitDto } from '@/lib/api/services/habits';

export default function HabitsPage() {
  const { data: habits, isLoading } = useHabits();
  const { data: lifeAreas } = useLifeAreas();
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();
  const deleteMutation = useDeleteHabit();
  const logMutation = useLogHabit();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState<CreateHabitDto>({
    title: '',
    description: '',
    type: 'boolean',
    frequency: 'daily',
    lifeAreaId: '',
  });

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [loggingHabit, setLoggingHabit] = useState<Habit | null>(null);
  const [logFormData, setLogFormData] = useState<Partial<LogHabitDto>>({
    date: new Date().toISOString().split('T')[0],
    completed: false,
    value: 0,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingHabit) {
        await updateMutation.mutateAsync({ id: editingHabit.id, dto: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsModalOpen(false);
      setEditingHabit(null);
      setFormData({
        title: '',
        description: '',
        type: 'boolean',
        frequency: 'daily',
        lifeAreaId: '',
      });
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description || '',
      type: habit.type,
      frequency: habit.frequency,
      targetValue: habit.targetValue,
      unit: habit.unit,
      lifeAreaId: habit.lifeAreaId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  const handleNew = () => {
    setEditingHabit(null);
    setFormData({
      title: '',
      description: '',
      type: 'boolean',
      frequency: 'daily',
      lifeAreaId: '',
    });
    setIsModalOpen(true);
  };

  const handleLogClick = (habit: Habit) => {
    setLoggingHabit(habit);
    setLogFormData({
      date: new Date().toISOString().split('T')[0],
      completed: habit.type === 'boolean' ? false : undefined,
      value: habit.type !== 'boolean' ? 0 : undefined,
      notes: '',
    });
    setLogModalOpen(true);
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loggingHabit) return;

    try {
      const logDto: LogHabitDto = {
        habitId: loggingHabit.id,
        date: logFormData.date!,
        completed: logFormData.completed,
        value: logFormData.value,
        notes: logFormData.notes,
      };

      await logMutation.mutateAsync(logDto);
      setLogModalOpen(false);
      setLoggingHabit(null);
    } catch (error) {
      console.error('Error logging habit:', error);
    }
  };

  const quickLogBoolean = async (habit: Habit) => {
    try {
      const logDto: LogHabitDto = {
        habitId: habit.id,
        date: new Date().toISOString().split('T')[0],
        completed: true,
      };
      await logMutation.mutateAsync(logDto);
    } catch (error) {
      console.error('Error logging habit:', error);
    }
  };

  const getLifeAreaName = (lifeAreaId: string) => {
    return lifeAreas?.find((area) => area.id === lifeAreaId)?.name || 'Unknown';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'boolean':
        return <CheckCircle className="w-5 h-5" />;
      case 'counter':
        return <span className="text-lg font-bold">123</span>;
      case 'duration':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'boolean':
        return 'Yes/No';
      case 'counter':
        return 'Counter';
      case 'duration':
        return 'Duration';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Habits</h1>
          <p className="text-sm sm:text-base text-gray-400">Track your daily habits and build consistency</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New Habit</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {habits?.map((habit) => (
          <div
            key={habit.id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-start gap-2 sm:gap-3 flex-1">
                <div className="p-2 sm:p-3 bg-green-600 rounded-lg text-white">
                  {getTypeIcon(habit.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1 truncate">{habit.title}</h3>
                  {habit.description && (
                    <p className="text-sm text-gray-400 mb-2">{habit.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded">
                      {getTypeLabel(habit.type)}
                    </span>
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded capitalize">
                      {habit.frequency}
                    </span>
                    {habit.targetValue && (
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                        Target: {habit.targetValue} {habit.unit || ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <TrendingUp className="w-3 h-3" />
              <span>{getLifeAreaName(habit.lifeAreaId)}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {habit.type === 'boolean' ? (
                <button
                  onClick={() => quickLogBoolean(habit)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Done Today
                </button>
              ) : (
                <button
                  onClick={() => handleLogClick(habit)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Log Entry
                </button>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                <button
                  onClick={() => handleEdit(habit)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {habits?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 mb-4">No habits yet</p>
            <button onClick={handleNew} className="text-red-500 hover:text-red-400">
              Create your first habit
            </button>
          </div>
        )}
      </div>

      {/* Habit Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-4 sm:p-6 border border-gray-700 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              {editingHabit ? 'Edit Habit' : 'New Habit'}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Morning meditation"
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
                  placeholder="Describe this habit..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'boolean' | 'counter' | 'duration',
                    })
                  }
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="boolean">Yes/No (Boolean)</option>
                  <option value="counter">Counter (Numbers)</option>
                  <option value="duration">Duration (Time)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Frequency *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      frequency: e.target.value as 'daily' | 'weekly' | 'monthly',
                    })
                  }
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {formData.type !== 'boolean' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Value
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.targetValue || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetValue: parseInt(e.target.value) || undefined,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., 10000 for steps"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Unit</label>
                    <input
                      type="text"
                      value={formData.unit || ''}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., steps, minutes, pages"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingHabit(null);
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
                    : editingHabit
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Habit Log Modal */}
      {logModalOpen && loggingHabit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-4 sm:p-6 border border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              Log: {loggingHabit.title}
            </h2>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                <input
                  type="date"
                  value={logFormData.date}
                  onChange={(e) => setLogFormData({ ...logFormData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {loggingHabit.type === 'boolean' ? (
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={logFormData.completed || false}
                      onChange={(e) =>
                        setLogFormData({ ...logFormData, completed: e.target.checked })
                      }
                      className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                    />
                    <span className="text-white">Completed</span>
                  </label>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Value {loggingHabit.unit && `(${loggingHabit.unit})`}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={logFormData.value || 0}
                    onChange={(e) =>
                      setLogFormData({ ...logFormData, value: parseFloat(e.target.value) })
                    }
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={logFormData.notes}
                  onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Add notes about this entry..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setLogModalOpen(false);
                    setLoggingHabit(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {logMutation.isPending ? 'Logging...' : 'Log Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
