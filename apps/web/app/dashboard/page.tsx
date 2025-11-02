'use client';

import { useRouter } from 'next/navigation';
import { Target, CheckSquare, TrendingUp, Calendar, Clock } from 'lucide-react';
import { useObjectives } from '@/hooks/useObjectives';
import { useTasks } from '@/hooks/useTasks';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useHabits } from '@/hooks/useHabits';

export default function DashboardPage() {
  const router = useRouter();
  const { data: objectives, isLoading: objectivesLoading } = useObjectives();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: lifeAreas, isLoading: lifeAreasLoading } = useLifeAreas();
  const { data: habits, isLoading: habitsLoading } = useHabits();

  // Calculate stats
  const activeObjectives = objectives?.filter((obj) => obj.status !== 'completed').length || 0;
  const openTasks = tasks?.filter((task) => task.status !== 'done').length || 0;
  const lifeAreasCount = lifeAreas?.length || 0;
  const activeHabits = habits?.filter((habit) => habit.isActive).length || 0;

  const stats = [
    { name: 'Active Objectives', value: activeObjectives, icon: Target, color: 'bg-blue-600' },
    { name: 'Open Tasks', value: openTasks, icon: CheckSquare, color: 'bg-green-600' },
    { name: 'Life Areas', value: lifeAreasCount, icon: TrendingUp, color: 'bg-purple-600' },
    { name: 'Active Habits', value: activeHabits, icon: Calendar, color: 'bg-orange-600' },
  ];

  // Get recent activity from all sources
  const getRecentActivity = () => {
    const activities: Array<{ type: string; title: string; time: string; color: string }> = [];

    // Add recent objectives
    objectives?.slice(0, 3).forEach((obj) => {
      activities.push({
        type: 'Objective',
        title: obj.title,
        time: new Date(obj.createdAt).toLocaleDateString(),
        color: 'text-blue-400',
      });
    });

    // Add recent tasks
    tasks?.slice(0, 3).forEach((task) => {
      activities.push({
        type: 'Task',
        title: task.title,
        time: new Date(task.createdAt).toLocaleDateString(),
        color: 'text-green-400',
      });
    });

    // Add recent habits
    habits?.slice(0, 3).forEach((habit) => {
      activities.push({
        type: 'Habit',
        title: habit.title,
        time: new Date(habit.createdAt).toLocaleDateString(),
        color: 'text-orange-400',
      });
    });

    // Sort by creation date and take top 5
    return activities.slice(0, 5);
  };

  const recentActivity = getRecentActivity();
  const isLoading = objectivesLoading || tasksLoading || lifeAreasLoading || habitsLoading;

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-400">Overview of your personal excellence journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">{stat.name}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {isLoading ? '...' : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/dashboard/objectives')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Target className="w-5 h-5" />
            New Objective
          </button>
          <button
            onClick={() => router.push('/dashboard/tasks')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <CheckSquare className="w-5 h-5" />
            Add Task
          </button>
          <button
            onClick={() => router.push('/dashboard/habits')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Track Habit
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Recent Activity</h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            <p>Loading...</p>
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${activity.color}`}>
                      {activity.type}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-white mt-1">{activity.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No recent activity yet</p>
            <p className="text-sm mt-2">Start by creating your first objective or task</p>
          </div>
        )}
      </div>
    </div>
  );
}
