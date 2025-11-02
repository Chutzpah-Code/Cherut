'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  TrendingUp,
  Calendar,
  User,
  LogOut,
  X
} from 'lucide-react';
import { logoutUser } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Life Areas', href: '/dashboard/life-areas', icon: TrendingUp },
  { name: 'Objectives', href: '/dashboard/objectives', icon: Target },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Habits', href: '/dashboard/habits', icon: Calendar },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Cherut</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
