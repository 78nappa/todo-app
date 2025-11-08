import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAllTodos, addTodo } from './storage';

// GET /api/todos - Get all todos
export async function GET() {
  const todos = getAllTodos();
  return NextResponse.json(todos);
}

// POST /api/todos - Create a new todo
export async function POST(request) {
  try {
    const { title } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const newTodo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      tags: [],
      createdAt: new Date().toISOString(),
    };

    addTodo(newTodo);
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
