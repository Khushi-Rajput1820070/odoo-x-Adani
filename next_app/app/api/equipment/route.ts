import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const teamId = searchParams.get('teamId');
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  
  // Construct query parameters
  let url = '/api/equipment';
  const params = new URLSearchParams();
  if (id) params.append('id', id);
  if (teamId) params.append('teamId', teamId);
  if (status) params.append('status', status);
  if (category) params.append('category', category);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}${url}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    data.id = data.id || randomUUID();
    data.status = data.status || 'Active';
    data.createdAt = data.createdAt || new Date().toISOString();
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/equipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/equipment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating equipment:', error);
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/equipment?id=${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 });
  }
}