import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAllTodos, addTodo } from './storage';
import { corsHeaders } from '../../../lib/cors';

// OPTIONS /api/todos - Handle preflight requests
export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get('origin')),
  });
}

// GET /api/todos - Get all todos
export async function GET(request) {
  try {
    const todos = await getAllTodos();
    return NextResponse.json(todos, {
      headers: corsHeaders(request.headers.get('origin')),
    });
  } catch (error) {
    console.error('Error in GET /api/todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      {
        status: 500,
        headers: corsHeaders(request.headers.get('origin')),
      }
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
        {
          status: 400,
          headers: corsHeaders(request.headers.get('origin')),
        }
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
    return NextResponse.json(savedTodo, {
      status: 201,
      headers: corsHeaders(request.headers.get('origin')),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      {
        status: 400,
        headers: corsHeaders(request.headers.get('origin')),
      }
    );
  }
}
