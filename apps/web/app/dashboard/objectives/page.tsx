'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Target, Calendar, TrendingUp } from 'lucide-react';
import { useObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from '@/hooks/useObjectives';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { CreateObjectiveDto, Objective } from '@/lib/api/services/objectives';

export default function ObjectivesPage() {
  const { data: objectives, isLoading } = useObjectives();
  const { data: lifeAreas } = useLifeAreas();
  const createMutation = useCreateObjective();
  const updateMutation = useUpdateObjective();
  const deleteMutation = useDeleteObjective();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [formData, setFormData] = useState<CreateObjectiveDto>({
    lifeAreaId: '',
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingObjective) {
        await updateMutation.mutateAsync({ id: editingObjective.id, dto: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsModalOpen(false);
      setEditingObjective(null);
      setFormData({
        lifeAreaId: '',
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
    } catch (error) {
      console.error('Error saving objective:', error);
    }
  };

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
    setFormData({
      lifeAreaId: objective.lifeAreaId,
      title: objective.title,
      description: objective.description || '',
      startDate: objective.startDate.split('T')[0],
      endDate: objective.endDate.split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this objective?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting objective:', error);
      }
    }
  };

  const handleNew = () => {
    setEditingObjective(null);
    setFormData({
      lifeAreaId: '',
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setIsModalOpen(true);
  };

  const getLifeAreaName = (lifeAreaId: string) => {
    return lifeAreas?.find((area) => area.id === lifeAreaId)?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600';
      case 'completed':
        return 'bg-blue-600';
      case 'cancelled':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Objectives</h1>
          <p className="text-gray-400">Manage your OKRs and objectives</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Objective
        </button>
      </div>

      {/* Objectives Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {objectives?.map((objective) => (
          <div
            key={objective.id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{objective.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(
                        objective.status
                      )}`}
                    >
                      {getStatusText(objective.status)}
                    </span>
                  </div>
                  {objective.description && (
                    <p className="text-sm text-gray-400 mb-3">{objective.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <TrendingUp className="w-4 h-4" />
                    <span>{getLifeAreaName(objective.lifeAreaId)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-medium">{objective.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${objective.progress}%` }}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(objective.startDate).toLocaleDateString()}</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(objective.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
              <button
                onClick={() => handleEdit(objective)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(objective.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}

        {objectives?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 mb-4">No objectives yet</p>
            <button
              onClick={handleNew}
              className="text-red-500 hover:text-red-400"
            >
              Create your first objective
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingObjective ? 'Edit Objective' : 'New Objective'}
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
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Achieve 10% body fat"
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
                  placeholder="Describe this objective..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingObjective(null);
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
                    : editingObjective
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
