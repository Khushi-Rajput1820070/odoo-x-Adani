import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    const category = await DB.getById('categories', id);
    return NextResponse.json(category);
  }
  
  const categories = await DB.getAll('categories');
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const data = await request.json();
  data.id = data.id || randomUUID();
  
  const categories = await DB.getAll('categories');
  categories.push(data);
  await DB.setAll('categories', categories);
  
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const data = await request.json();
  let categories = await DB.getAll('categories');
  categories = categories.map((c: any) => c.id === data.id ? data : c);
  await DB.setAll('categories', categories);
  
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    let categories = await DB.getAll('categories');
    categories = categories.filter((c: any) => c.id !== id);
    await DB.setAll('categories', categories);
    
    // Update equipment that was using this category
    let equipment = await DB.getAll('equipment');
    equipment = equipment.map((e: any) => {
      if (e.category === id) {
        e.category = ''; // Clear category assignment
      }
      return e;
    });
    await DB.setAll('equipment', equipment);
    
    // Update requests that were using this category
    let requests = await DB.getAll('requests');
    requests = requests.map((r: any) => {
      if (r.category === id) {
        r.category = ''; // Clear category assignment
      }
      return r;
    });
    await DB.setAll('requests', requests);
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
}