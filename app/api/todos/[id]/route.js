import { NextResponse } from 'next/server';
import { updateTodo, deleteTodo } from '../storage';

// PATCH /api/todos/[id] - Update a todo
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    // Trim title if provided
    if (updates.title !== undefined) {
      updates.title = updates.title.trim();
    }

    const updatedTodo = updateTodo(id, updates);

    if (!updatedTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const success = deleteTodo(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
