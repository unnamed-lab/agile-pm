import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiFetch } from '@/lib/server-fetch';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });

  const res = await apiFetch('/notifications/unread-count');
  if (!res.ok) return NextResponse.json({ count: 0 });
  const data = await res.json();
  return NextResponse.json(data);
}
