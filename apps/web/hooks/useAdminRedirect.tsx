'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para redirecionamento automático baseado em role
 *
 * FUNCIONALIDADES:
 * - Redireciona admin para /admin após login
 * - Redireciona usuário comum para /dashboard
 * - Respeita query parameters de redirecionamento
 * - Evita loops de redirecionamento
 */

interface UseAdminRedirectOptions {
  /**
   * Se deve redirecionar automaticamente após login
   * @default true
   */
  autoRedirect?: boolean;

  /**
   * URL de fallback para usuários comuns
   * @default '/dashboard'
   */
  userFallback?: string;

  /**
   * URL de fallback para admins
   * @default '/admin'
   */
  adminFallback?: string;

  /**
   * Se deve aguardar a autenticação completa do backend
   * @default true
   */
  waitForBackend?: boolean;
}

export function useAdminRedirect(options: UseAdminRedirectOptions = {}) {
  const {
    autoRedirect = true,
    userFallback = '/dashboard',
    adminFallback = '/admin',
    waitForBackend = true,
  } = options;

  const { user, userData, loading, backendAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Não fazer nada se ainda está carregando
    if (loading) return;

    // Aguardar autenticação backend se configurado
    if (waitForBackend && !backendAuthenticated) return;

    // Não redirecionar se autoRedirect está desabilitado
    if (!autoRedirect) return;

    // Não redirecionar se usuário não está logado
    if (!user || !userData) return;

    console.log('[AdminRedirect] Checking redirect for user:', {
      uid: user.uid,
      role: userData.role,
      pathname,
      isAdmin,
    });

    // REGRAS DE REDIRECIONAMENTO

    // 1. Se admin está em página de usuário comum, redirecionar para admin
    if (isAdmin && pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/admin')) {
      console.log('[AdminRedirect] 👑 Admin detected, redirecting to admin panel');
      router.replace(adminFallback);
      return;
    }

    // 2. Se usuário comum tenta acessar área admin, redirecionar para dashboard
    if (!isAdmin && pathname.startsWith('/admin')) {
      console.log('[AdminRedirect] 🚫 Non-admin trying to access admin area, redirecting to dashboard');
      router.replace(userFallback);
      return;
    }

    // 3. Se está na página inicial (/) após login, redirecionar para área apropriada
    if (pathname === '/' && user) {
      const targetUrl = isAdmin ? adminFallback : userFallback;
      console.log(`[AdminRedirect] 🏠 Redirecting from home to ${targetUrl}`);
      router.replace(targetUrl);
      return;
    }

    // 4. Verificar query parameter 'redirect' para redirecionamento customizado
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect');

      if (redirectParam) {
        // Verificar se o redirect é válido para o role do usuário
        if (isAdmin && redirectParam.startsWith('/admin')) {
          console.log('[AdminRedirect] 🎯 Admin redirect to:', redirectParam);
          router.replace(redirectParam);
          return;
        }

        if (!isAdmin && !redirectParam.startsWith('/admin')) {
          console.log('[AdminRedirect] 🎯 User redirect to:', redirectParam);
          router.replace(redirectParam);
          return;
        }

        // Se redirect não é válido para o role, usar fallback
        const fallback = isAdmin ? adminFallback : userFallback;
        console.log('[AdminRedirect] ⚠️ Invalid redirect for role, using fallback:', fallback);
        router.replace(fallback);
      }
    }

  }, [
    user,
    userData,
    loading,
    backendAuthenticated,
    isAdmin,
    pathname,
    router,
    autoRedirect,
    userFallback,
    adminFallback,
    waitForBackend,
  ]);

  return {
    /**
     * Força redirecionamento para área apropriada
     */
    redirectToAppropriateArea: () => {
      const targetUrl = isAdmin ? adminFallback : userFallback;
      console.log('[AdminRedirect] 🔄 Manual redirect to:', targetUrl);
      router.push(targetUrl);
    },

    /**
     * Verifica se usuário pode acessar uma URL específica
     */
    canAccess: (url: string): boolean => {
      if (!userData) return false;

      // Admins podem acessar tudo
      if (isAdmin) return true;

      // Usuários comuns não podem acessar área admin
      if (url.startsWith('/admin')) return false;

      return true;
    },

    /**
     * Status do redirecionamento
     */
    status: {
      loading,
      isAdmin,
      hasUser: !!user,
      backendReady: backendAuthenticated,
    },
  };
}

/**
 * Hook simplificado para uso em componentes que só precisam verificar se é admin
 */
export function useIsAdmin() {
  const { isAdmin, loading } = useAuth();
  return { isAdmin, loading };
}