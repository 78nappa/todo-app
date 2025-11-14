import { NextResponse } from 'next/server';
import { updateTodo, deleteTodo } from '../storage';
import { corsHeaders } from '../../../../lib/cors';

// OPTIONS /api/todos/[id] - Handle preflight requests
export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get('origin')),
  });
}

// PATCH /api/todos/[id] - Update a todo
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    // Trim title if provided
    if (updates.title !== undefined) {
      updates.title = updates.title.trim();
    }

    const updatedTodo = await updateTodo(id, updates);

    if (!updatedTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        {
          status: 404,
          headers: corsHeaders(request.headers.get('origin')),
        }
      );
    }

    return NextResponse.json(updatedTodo, {
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

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const success = await deleteTodo(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Todo not found' },
        {
          status: 404,
          headers: corsHeaders(request.headers.get('origin')),
        }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders(request.headers.get('origin')) }
    );
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
