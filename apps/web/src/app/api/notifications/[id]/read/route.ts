import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiFetch } from '@/lib/server-fetch';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const res = await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
  if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status });
  const data = await res.json();
  return NextResponse.json(data);
}
