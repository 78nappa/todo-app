import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAllTodos, addTodo } from './storage';

// GET /api/todos - Get all todos
export async function GET() {
  try {
    const todos = await getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error in GET /api/todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
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

    const savedTodo = await addTodo(newTodo);
    return NextResponse.json(savedTodo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
