import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // Construct query parameters
  let url = '/api/workcenters';
  const params = new URLSearchParams();
  if (id) params.append('id', id);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}${url}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching work centers:', error);
    return NextResponse.json({ error: 'Failed to fetch work centers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    data.id = data.id || randomUUID();
    data.createdAt = data.createdAt || new Date().toISOString();
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/workcenters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating work center:', error);
    return NextResponse.json({ error: 'Failed to create work center' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/workcenters`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating work center:', error);
    return NextResponse.json({ error: 'Failed to update work center' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/workcenters?id=${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting work center:', error);
    return NextResponse.json({ error: 'Failed to delete work center' }, { status: 500 });
  }
}