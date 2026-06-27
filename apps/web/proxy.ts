import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para proteger rotas admin
 *
 * FUNCIONAMENTO:
 * 1. Verifica se é rota admin (/admin/*)
 * 2. Verifica token Firebase no cookie ou header
 * 3. Decodifica token para verificar role
 * 4. Redireciona se não for admin
 */

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🎯 PROTEÇÃO DE ROTAS ADMIN - Usar verificação no lado do cliente
  if (pathname.startsWith('/admin')) {
    console.log(`🔐 Admin route protection - Path: ${pathname}`);

    // Para rotas admin, permitir acesso mas deixar a verificação para o client-side
    // O AuthContext e AdminLayout vão fazer a verificação real e redirecionamento
    const response = NextResponse.next();
    response.headers.set('X-Admin-Route', 'true');
    return response;
  }

  // 📱 OUTRAS ROTAS - permitir acesso
  return NextResponse.next();
}

/**
 * Extrai token Firebase do request
 */
function getFirebaseToken(request: NextRequest): string | null {
  // 1. Tentar pegar do header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Tentar pegar do cookie (se estiver armazenado lá)
  const tokenCookie = request.cookies.get('firebase-token');
  if (tokenCookie?.value) {
    return tokenCookie.value;
  }

  // 3. Tentar pegar de sessionStorage via header customizado
  const customToken = request.headers.get('x-firebase-token');
  if (customToken) {
    return customToken;
  }

  return null;
}

/**
 * Verificação básica do token (sem decodificar completamente)
 * A verificação real é feita no backend
 */
async function verifyTokenBasic(token: string): Promise<boolean> {
  try {
    // Verificação simples: token deve ter formato JWT básico
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Verificar se não está expirado (verificação básica)
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      console.log('Token expired');
      return false;
    }

    // Token parece válido - a verificação real será no backend
    return true;

  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Redireciona para login
 */
function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/', request.url);
  loginUrl.searchParams.set('redirect', request.url);
  loginUrl.searchParams.set('error', 'admin-access-required');

  console.log(`🔄 Redirecting to login: ${loginUrl.toString()}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - _vercel (Vercel internals)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|_vercel).*)',
  ],
};
