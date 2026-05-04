import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiFetch } from '@/lib/server-fetch';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sprintId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id, sprintId } = await params;
  const res = await apiFetch(`/projects/${id}/sprints/${sprintId}/burndown`);
  if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status });
  const data = await res.json();
  return NextResponse.json(data);
}
