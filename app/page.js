'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [newTag, setNewTag] = useState('');
  const [editingTags, setEditingTags] = useState([]);

  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }

  // Sort todos by date
  function getSortedTodos() {
    return [...todos].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  // Toggle sort order
  function toggleSortOrder() {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  }

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

        // Clear input
        setNewTask('');

        // Open in edit mode for tag editing
        setEditingId(todo.id);
        setEditingTitle(todo.title);
        setEditingTags([]);
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
      } else if (res.status === 404) {
        // Todo not found on server, refetch all todos
        await fetchTodos();
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
    setEditingTags(todo.tags || []);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle('');
    setEditingTags([]);
    setNewTag('');
  }

  async function saveEdit(id) {
    if (!editingTitle.trim()) {
      cancelEdit();
      return;
    }
    await updateTodo(id, { title: editingTitle, tags: editingTags });
    setEditingId(null);
    setEditingTitle('');
    setEditingTags([]);
    setNewTag('');
  }

  function addTagToTodo(todoId, tag) {
    if (!tag.trim()) return;

    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const currentTags = todo.tags || [];
    if (currentTags.includes(tag.trim())) {
      return; // 重複を防ぐ
    }

    const updatedTags = [...currentTags, tag.trim()];
    updateTodo(todoId, { tags: updatedTags });
  }

  function removeTagFromTodo(todoId, tagToRemove) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const updatedTags = (todo.tags || []).filter(tag => tag !== tagToRemove);
    updateTodo(todoId, { tags: updatedTags });
  }

  function addTagToEditingTask(tag) {
    if (!tag.trim()) return;
    if (editingTags.includes(tag.trim())) {
      return; // 重複を防ぐ
    }
    setEditingTags([...editingTags, tag.trim()]);
    setNewTag('');
  }

  function removeTagFromEditingTask(tagToRemove) {
    setEditingTags(editingTags.filter(tag => tag !== tagToRemove));
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

          {/* Sort Button */}
          {todos.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={toggleSortOrder}
                className="flex items-center gap-2 px-4 py-2 text-sm text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
              >
                <span>日付</span>
                <span className="text-lg">{sortOrder === 'desc' ? '↓' : '↑'}</span>
              </button>
            </div>
          )}

          {/* Todo List */}
          <div className="space-y-3 sm:space-y-4">
            {getSortedTodos().map((todo) => (
              <div
                key={todo.id}
                className="bg-white border-2 border-amber-300 rounded-2xl p-3 sm:p-6"
              >
                {editingId === todo.id ? (
                  <div className="space-y-3">
                    {/* Title Edit */}
                    <div className="flex items-center gap-2">
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
                        className="text-green-600 hover:text-green-700 text-xl sm:text-2xl min-w-[2rem]"
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-600 hover:text-red-700 text-xl sm:text-2xl min-w-[2rem]"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Tag Edit Area */}
                    <div className="border-t pt-3">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') addTagToEditingTask(newTag);
                          }}
                          placeholder="タグを追加"
                          className="flex-1 px-3 py-1.5 text-sm border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={() => addTagToEditingTask(newTag)}
                          className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 text-sm rounded-lg whitespace-nowrap"
                        >
                          追加
                        </button>
                      </div>
                      {editingTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {editingTags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full"
                            >
                              {tag}
                              <button
                                onClick={() => removeTagFromEditingTask(tag)}
                                className="hover:text-red-600"
                                title="削除"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Title and Date */}
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-base sm:text-lg text-gray-800 break-words">
                          {todo.title}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">
                          {formatDate(todo.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => startEdit(todo)}
                          className="text-xl sm:text-2xl hover:opacity-70 transition-opacity"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-xl sm:text-2xl hover:opacity-70 transition-opacity"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Tag Display Area */}
                    {(todo.tags && todo.tags.length > 0) && (
                      <div className="border-t pt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {todo.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full"
                            >
                              {tag}
                              <button
                                onClick={() => removeTagFromTodo(todo.id, tag)}
                                className="hover:text-red-600"
                                title="削除"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
