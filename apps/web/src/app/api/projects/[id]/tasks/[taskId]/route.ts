import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiFetch } from '@/lib/server-fetch';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id, taskId } = await params;
  const body = await req.json();
  const res = await apiFetch(`/projects/${id}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id, taskId } = await params;
  const res = await apiFetch(`/projects/${id}/tasks/${taskId}`, {
    method: 'DELETE',
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
