import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiFetch } from '@/lib/server-fetch';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const res = await apiFetch('/notifications/read-all', { method: 'PATCH' });
  if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status });
  const data = await res.json();
  return NextResponse.json(data);
}
