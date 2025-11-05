'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  }

  async function addTodo() {
    if (!newTask.trim()) return;

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask }),
      });

      if (res.ok) {
        const todo = await res.json();
        setTodos(prevTodos => [...prevTodos, todo]);
        setNewTask('');
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  }

  async function updateTodo(id, updates) {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updatedTodo = await res.json();
        setTodos(prevTodos => prevTodos.map(t => t.id === id ? updatedTodo : t));
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  }

  async function deleteTodo(id) {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTodos(prevTodos => prevTodos.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle('');
  }

  function saveEdit(id) {
    if (!editingTitle.trim()) {
      cancelEdit();
      return;
    }
    updateTodo(id, { title: editingTitle });
    setEditingId(null);
    setEditingTitle('');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 py-6 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-amber-200 rounded-t-3xl shadow-lg p-6 sm:p-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-amber-900">TODO</h1>
        </div>

        {/* Main Content */}
        <div className="bg-amber-50 rounded-b-3xl shadow-lg p-4 sm:p-8">
          {/* Add Task Form */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a new task"
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-2 border-amber-300 rounded-2xl focus:outline-none focus:border-amber-500 bg-white"
            />
            <button
              onClick={addTodo}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold text-base sm:text-lg rounded-2xl transition-colors whitespace-nowrap"
            >
              Add
            </button>
          </div>

          {/* Todo List */}
          <div className="space-y-3 sm:space-y-4">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-2 sm:gap-4 bg-white border-2 border-amber-300 rounded-2xl p-3 sm:p-6"
              >
                {editingId === todo.id ? (
                  <>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') saveEdit(todo.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="flex-1 px-3 sm:px-4 py-2 text-base sm:text-lg border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="text-green-600 hover:text-green-700 text-xl sm:text-2xl min-w-[2rem] sm:min-w-0"
                      title="Save"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-red-600 hover:text-red-700 text-xl sm:text-2xl min-w-[2rem] sm:min-w-0"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-base sm:text-lg text-gray-800 break-words">
                      {todo.title}
                    </span>
                    <button
                      onClick={() => startEdit(todo)}
                      className="text-xl sm:text-2xl hover:opacity-70 transition-opacity min-w-[2rem] sm:min-w-0 flex-shrink-0"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-xl sm:text-2xl hover:opacity-70 transition-opacity min-w-[2rem] sm:min-w-0 flex-shrink-0"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {todos.length === 0 && (
            <div className="text-center text-amber-700 text-base sm:text-lg py-6 sm:py-8">
              No tasks yet. Add one to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
