'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { logoutUser } from '@/lib/firebase/auth';
import { useAdminOverview } from '@/hooks/useAdmin';
import { useCourses } from '@/hooks/useLearning';
import CherutLogo from '@/components/ui/CherutLogo';
import { AdminStyles } from './components/AdminStyles';
import { geistSans, geistMono } from '@/lib/fonts';

const ADM_CLASS = `adm ${geistSans.variable} ${geistMono.variable}`;

interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
}

function initials(nameOrEmail: string): string {
  const base = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
  return base
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('adminShell');
  const { user, loading, backendAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { data: overview } = useAdminOverview();
  const { data: courses } = useCourses();

  useEffect(() => {
    async function verifyAdminAccess() {
      if (loading) return;

      if (!user || !backendAuthenticated) {
        router.push('/?redirect=' + encodeURIComponent('/admin') + '&error=admin-access-required');
        return;
      }

      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/admin/health`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          if (response.status === 403) {
            router.push('/?redirect=' + encodeURIComponent('/admin') + '&error=admin-access-required');
            return;
          }
          throw new Error('Failed to verify admin access');
        }

        setAdminUser({ uid: user.uid, email: user.email || '', displayName: user.displayName || undefined });
      } catch {
        router.push('/?redirect=' + encodeURIComponent('/admin') + '&error=admin-access-required');
        return;
      } finally {
        setIsVerifying(false);
      }
    }

    verifyAdminAccess();
  }, [user, loading, backendAuthenticated, router]);

  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      window.location.href = '/';
    }
  }

  if (loading || isVerifying) {
    return (
      <div className={ADM_CLASS} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AdminStyles />
        <p className="adm-sub">{t('verifying')}</p>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className={ADM_CLASS} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AdminStyles />
        <p className="adm-sub">{t('accessDenied')}</p>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: t('nav.overview'), active: pathname === '/admin', count: null as number | null },
    { href: '/admin/users', icon: Users, label: t('nav.users'), active: pathname === '/admin/users', count: overview?.overview.totalUsers ?? null },
    { href: '/admin/courses', icon: BookOpen, label: t('nav.courses'), active: pathname.startsWith('/admin/courses'), count: courses?.length ?? null },
    { href: '/admin/analytics', icon: BarChart3, label: t('nav.analytics'), active: pathname === '/admin/analytics', count: null },
    { href: '/admin/settings', icon: Settings, label: t('nav.settings'), active: pathname === '/admin/settings', count: null },
  ];

  return (
    <div className={ADM_CLASS}>
      <AdminStyles />
      <div className="adm-app">
        <div className={`adm-scrim${mobileNavOpen ? ' on' : ''}`} onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
        <aside className={`adm-sb${mobileNavOpen ? ' on' : ''}`}>
          <div className="adm-brand">
            <CherutLogo viewBox="200 279 338 132" width={80} height={31} fillColor="#14141C" />
            <span className="adm-pill ink adm-mono adm-tag" style={{ height: 20, fontSize: 10 }}>{t('adminBadge')}</span>
          </div>
          <nav>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={item.active ? 'on' : ''} onClick={() => setMobileNavOpen(false)}>
                <item.icon size={17} />
                {item.label}
                {item.count !== null && <span className="adm-n">{item.count}</span>}
              </Link>
            ))}
            <button type="button" onClick={handleLogout}>
              <LogOut size={17} />
              {t('exitAdmin')}
            </button>
          </nav>
        </aside>

        <div className="adm-main">
          <div className="adm-topbar">
            <div className="adm-topbar-mob">
              <CherutLogo viewBox="200 279 338 132" width={88} height={34} fillColor="#14141C" />
              <button type="button" className="adm-ia" onClick={() => setMobileNavOpen((v) => !v)} aria-label={t('menu')}>
                {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
            <div className="adm-topbar-profile">
              <span className="adm-av">{initials(adminUser.displayName || adminUser.email)}</span>
              <div className="adm-topbar-text">
                <b>{adminUser.displayName || t('adminBadge')}</b>
                <small>{adminUser.email}</small>
              </div>
            </div>
          </div>
          <div className="adm-panel">{children}</div>
        </div>
      </div>
    </div>
  );
}
