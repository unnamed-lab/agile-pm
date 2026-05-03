import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; sprintId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  
  const endpoint = action === 'start' 
    ? `${API_URL}/projects/${params.id}/sprints/${params.sprintId}/start`
    : `${API_URL}/projects/${params.id}/sprints/${params.sprintId}/complete`;

  const res = await fetch(endpoint, {
    method: 'PATCH',
    headers: { Cookie: req.headers.get('cookie') || '' },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
