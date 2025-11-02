'use client';

import { Target, CheckSquare, TrendingUp, Calendar } from 'lucide-react';

const stats = [
  { name: 'Active Objectives', value: '0', icon: Target, color: 'bg-blue-600' },
  { name: 'Open Tasks', value: '0', icon: CheckSquare, color: 'bg-green-600' },
  { name: 'Life Areas', value: '0', icon: TrendingUp, color: 'bg-purple-600' },
  { name: 'Active Habits', value: '0', icon: Calendar, color: 'bg-orange-600' },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your personal excellence journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-400 text-sm font-medium">{stat.name}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            <Target className="w-5 h-5" />
            New Objective
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            <CheckSquare className="w-5 h-5" />
            Add Task
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            <Calendar className="w-5 h-5" />
            Track Habit
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-400">
          <p>No recent activity yet</p>
          <p className="text-sm mt-2">Start by creating your first objective or task</p>
        </div>
      </div>
    </div>
  );
}
