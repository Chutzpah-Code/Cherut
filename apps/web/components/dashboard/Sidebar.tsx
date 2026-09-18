'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  TrendingUp,
  Calendar,
  User,
  LogOut,
  Sparkles,
  BarChart3,
  BookOpen,
  Heart,
  Bot,
  Wallet,
} from 'lucide-react';
import { Stack, ScrollArea, Tooltip, ActionIcon } from '@mantine/core';
import { logoutUser } from '@/lib/firebase/auth';
import { useSidebar } from '@/contexts/SidebarContext';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const t = useTranslations('sidebar');
  const pathname = usePathname();
  const router = useRouter();
  const { screenSize } = useSidebar();
  const colors = useThemeColors();

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('finance'), href: '/dashboard/finance', icon: Wallet },
    { name: t('visionBoard'), href: '/dashboard/vision-board', icon: Sparkles },
    { name: t('lifeAreas'), href: '/dashboard/life-areas', icon: TrendingUp },
    { name: t('values'), href: '/dashboard/values', icon: Heart },
    { name: t('objectives'), href: '/dashboard/objectives', icon: Target },
    { name: t('tasks'), href: '/dashboard/tasks', icon: CheckSquare },
    { name: t('habits'), href: '/dashboard/habits', icon: Calendar },
    { name: t('journal'), href: '/dashboard/journal', icon: BookOpen },
    { name: t('profile'), href: '/dashboard/profile', icon: User },
  ];

  const comingSoonItems = [
    { name: t('reports'), href: '#', icon: BarChart3 },
    { name: t('cherutOS'), href: '#', icon: Bot },
  ];

  useEffect(() => {
    navigation.forEach((item) => {
      router.prefetch(item.href);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLinkClick = () => {
    if (screenSize === 'mobile') {
      onClose();
    }
  };

  return (
    <>
      {/* Plain <style> tag with dangerouslySetInnerHTML instead of styled-jsx:
          styled-jsx's JSX-scanning scoping transform was pathological against
          this component's shape and made `next build` hang for 15-20+ minutes
          (confirmed by bisection — removing just this block dropped the build
          from an unbounded hang to ~15s). Global scoping isn't needed here
          anyway since every selector below is already prefixed `.premium-*`. */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

        /* Premium Sidebar Styles */
        .premium-sidebar {
          background: linear-gradient(180deg, #fafbff 0%, #f4f6fa 100%);
          border-right: 1px solid ${colors.border};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: width 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        .premium-sidebar.compact {
          width: 80px !important;
        }

        .premium-nav-item {
          position: relative;
          margin: 2px 0;
          border-radius: 12px;
          transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 500;
          font-size: 15px;
          letter-spacing: -0.01em;
          min-height: 48px;
          padding: 0 16px;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .premium-nav-item:hover {
          background: ${colors.hover};
          transform: translateX(2px);
        }

        .premium-nav-item.active {
          background: ${colors.active};
          color: ${colors.primary};
          font-weight: 600;
        }

        .premium-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: ${colors.primary};
          border-radius: 0 2px 2px 0;
          animation: slideIn 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        @keyframes slideIn {
          from {
            transform: translateY(-50%) translateX(-3px);
            opacity: 0;
          }
          to {
            transform: translateY(-50%) translateX(0);
            opacity: 1;
          }
        }

        .premium-nav-icon {
          color: ${colors.text.secondary};
          transition: color 200ms ease;
        }

        .premium-nav-item.active .premium-nav-icon {
          color: ${colors.primary};
        }

        .premium-nav-item:hover .premium-nav-icon {
          color: ${colors.primary};
        }

        .premium-section-header {
          font-family: 'Inter Display', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: ${colors.text.tertiary};
          margin: 24px 0 12px 16px;
        }

        .premium-coming-soon-badge {
          background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%);
          color: #92400E;
          font-weight: 600;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .premium-logo-container {
          padding: 24px 16px 16px 16px;
          transition: transform 200ms ease;
          overflow: hidden;
        }

        .premium-logo-container:hover {
          transform: scale(1.02);
        }

        .premium-logo-container.compact {
          padding: 16px 8px;
          text-align: center;
        }

        .premium-nav-item.compact {
          justify-content: center;
          padding: 0 8px;
        }

        .premium-nav-item.compact .premium-nav-text {
          display: none;
        }

        .premium-compact-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          transition: all 200ms ease;
        }

        .premium-compact-icon-wrapper:hover {
          background: ${colors.hover};
        }

        .premium-compact-icon-wrapper.active {
          background: ${colors.active};
        }

        .premium-coming-soon-compact {
          opacity: 0.4;
          margin: 4px 0;
        }

        .premium-divider {
          border-color: ${colors.border};
          margin: 16px 0;
        }

        .premium-logout-btn {
          border-radius: 12px;
          font-weight: 600;
          transition: all 200ms ease;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
          color: #DC2626;
        }

        .premium-logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
        }

        /* Scrollbar Styling */
        .premium-scrollarea {
          scrollbar-width: thin;
          scrollbar-color: rgba(70, 134, 254, 0.3) transparent;
        }

        .premium-scrollarea::-webkit-scrollbar {
          width: 6px;
        }

        .premium-scrollarea::-webkit-scrollbar-track {
          background: transparent;
        }

        .premium-scrollarea::-webkit-scrollbar-thumb {
          background: rgba(70, 134, 254, 0.3);
          border-radius: 3px;
        }

        .premium-scrollarea::-webkit-scrollbar-thumb:hover {
          background: rgba(70, 134, 254, 0.5);
        }
      ` }} />

      <Stack h="100%" gap={0} className="premium-sidebar compact">
        <ScrollArea
          style={{ flex: 1 }}
          className="premium-scrollarea"
          styles={{
            scrollbar: { display: 'none' },
          }}
        >
          <Stack gap="2px" px="8px" pt="24px">
            {navigation.map((item) => {
              const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href} onClick={handleLinkClick} style={{ textDecoration: 'none' }}>
                  <Tooltip
                    label={item.name}
                    position="right"
                    withArrow
                    offset={8}
                    openDelay={300}
                    styles={{
                      tooltip: {
                        backgroundColor: '#1F2937',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 500,
                        fontFamily: 'Inter, sans-serif',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }
                    }}
                  >
                    <div className={`premium-compact-icon-wrapper ${isActive ? 'active' : ''}`}>
                      <Icon size={20} strokeWidth={1.5} style={{ color: isActive ? colors.primary : colors.text.secondary }} />
                    </div>
                  </Tooltip>
                </Link>
              );
            })}

            {comingSoonItems.map((item) => {
              const Icon = item.icon;

              return (
                <Tooltip
                  key={item.name}
                  label={t('comingSoon', { name: item.name })}
                  position="right"
                  withArrow
                  offset={8}
                  openDelay={300}
                  styles={{
                    tooltip: {
                      backgroundColor: '#1F2937',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 500,
                      fontFamily: 'Inter, sans-serif',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }
                  }}
                >
                  <div className="premium-coming-soon-compact">
                    <div className="premium-compact-icon-wrapper">
                      <Icon size={20} strokeWidth={1.5} style={{ color: colors.text.tertiary }} />
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </Stack>

          <Tooltip
            label={t('logout')}
            position="right"
            withArrow
            offset={8}
            openDelay={300}
            styles={{
              tooltip: {
                backgroundColor: '#1F2937',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                borderRadius: '8px',
                padding: '8px 12px'
              }
            }}
          >
            <ActionIcon
              onClick={handleLogout}
              variant="subtle"
              color="red"
              size={48}
              radius={12}
              style={{
                margin: '8px auto 16px auto',
                display: 'flex'
              }}
            >
              <LogOut size={20} strokeWidth={1.5} />
            </ActionIcon>
          </Tooltip>
        </ScrollArea>
      </Stack>
    </>
  );
}