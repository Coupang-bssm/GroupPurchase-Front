import type { JwtPayload } from '@/types';

/**
 * JWT 토큰을 디코딩하여 페이로드를 반환
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
}

/**
 * 현재 로그인한 사용자의 역할을 반환
 */
export function getCurrentUserRole(): 'ADMIN' | 'USER' | null {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  const payload = decodeJwt(token);
  return payload?.role || null;
}

/**
 * 현재 로그인한 사용자의 ID를 반환
 */
export function getCurrentUserId(): number | null {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  const payload = decodeJwt(token);
  return payload?.sub ? parseInt(payload.sub, 10) : null;
}

/**
 * 로그인 상태 확인
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;

  const payload = decodeJwt(token);
  if (!payload) return false;

  // 토큰 만료 확인
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

