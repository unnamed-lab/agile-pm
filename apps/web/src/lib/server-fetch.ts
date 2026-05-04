import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function apiFetch(path: string, init: RequestInit = {}) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken as string | undefined;

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (init.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
