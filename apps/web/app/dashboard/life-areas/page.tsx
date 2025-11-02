'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { useLifeAreas, useCreateLifeArea, useUpdateLifeArea, useDeleteLifeArea } from '@/hooks/useLifeAreas';
import { CreateLifeAreaDto, LifeArea } from '@/lib/api/services/lifeAreas';

export default function LifeAreasPage() {
  const { data: lifeAreas, isLoading } = useLifeAreas();
  const createMutation = useCreateLifeArea();
  const updateMutation = useUpdateLifeArea();
  const deleteMutation = useDeleteLifeArea();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<LifeArea | null>(null);
  const [formData, setFormData] = useState<CreateLifeAreaDto>({
    name: '',
    description: '',
    satisfactionLevel: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingArea) {
        await updateMutation.mutateAsync({ id: editingArea.id, dto: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsModalOpen(false);
      setEditingArea(null);
      setFormData({ name: '', description: '', satisfactionLevel: 5 });
    } catch (error) {
      console.error('Error saving life area:', error);
    }
  };

  const handleEdit = (area: LifeArea) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      description: area.description || '',
      satisfactionLevel: area.satisfactionLevel || 5,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this life area?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting life area:', error);
      }
    }
  };

  const handleNew = () => {
    setEditingArea(null);
    setFormData({ name: '', description: '', satisfactionLevel: 5 });
    setIsModalOpen(true);
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
          <h1 className="text-3xl font-bold text-white mb-2">Life Areas</h1>
          <p className="text-gray-400">Manage the key areas of your life</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Life Area
        </button>
      </div>

      {/* Life Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lifeAreas?.map((area) => (
          <div
            key={area.id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{area.name}</h3>
                  {area.description && (
                    <p className="text-sm text-gray-400 mt-1">{area.description}</p>
                  )}
                </div>
              </div>
            </div>

            {area.satisfactionLevel !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Satisfaction</span>
                  <span className="text-white font-medium">{area.satisfactionLevel}/10</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(area.satisfactionLevel / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
              <button
                onClick={() => handleEdit(area)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(area.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}

        {lifeAreas?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 mb-4">No life areas yet</p>
            <button
              onClick={handleNew}
              className="text-red-500 hover:text-red-400"
            >
              Create your first life area
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingArea ? 'Edit Life Area' : 'New Life Area'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Health & Fitness"
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
                  placeholder="Describe this life area..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Satisfaction Level: {formData.satisfactionLevel}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.satisfactionLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, satisfactionLevel: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingArea(null);
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
                    : editingArea
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
