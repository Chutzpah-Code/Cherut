'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Welcome back!</h2>
          <p className="text-xs sm:text-sm text-gray-400">{user?.email || 'Loading...'}</p>
        </div>
        <div className="sm:hidden">
          <h2 className="text-lg font-semibold text-white">Cherut</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
          {user?.email?.[0].toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
