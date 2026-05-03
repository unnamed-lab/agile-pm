import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const res = await fetch(`${baseUrl}/projects`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch' }, { status: res.status });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const res = await fetch(`${baseUrl}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) return NextResponse.json({ error: 'Failed to create' }, { status: res.status });
  const data = await res.json();
  return NextResponse.json(data, { status: 201 });
}
