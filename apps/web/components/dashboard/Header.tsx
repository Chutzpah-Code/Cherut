'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Bell } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Welcome back!</h2>
        <p className="text-sm text-gray-400">{user?.email || 'Loading...'}</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
          {user?.email?.[0].toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
