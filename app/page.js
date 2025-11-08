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
  const [selectedTags, setSelectedTags] = useState([]); // フィルター用
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grouped'
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true); // 完了済みタスクを表示するか

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

  // Get all unique tags from todos
  function getAllTags() {
    const tagSet = new Set();
    todos.forEach(todo => {
      if (todo.tags && Array.isArray(todo.tags)) {
        todo.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }

  // Toggle tag filter
  function toggleTagFilter(tag) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  // Toggle task completion
  async function toggleComplete(id, currentStatus) {
    await updateTodo(id, { completed: !currentStatus });
  }

  // Get filtered todos
  function getFilteredTodos() {
    const sorted = getSortedTodos();
    let filtered = sorted;

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(todo => !todo.completed);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(todo =>
        todo.tags && todo.tags.some(tag => selectedTags.includes(tag))
      );
    }

    return filtered;
  }

  // Get grouped todos by tag
  function getGroupedTodos() {
    const filtered = getFilteredTodos();
    const grouped = {};

    // Initialize groups for selected tags or all tags
    const tagsToGroup = selectedTags.length > 0 ? selectedTags : getAllTags();
    tagsToGroup.forEach(tag => {
      grouped[tag] = [];
    });

    // Add "No tags" group
    grouped['タグなし'] = [];

    // Group todos
    filtered.forEach(todo => {
      if (!todo.tags || todo.tags.length === 0) {
        grouped['タグなし'].push(todo);
      } else {
        todo.tags.forEach(tag => {
          if (grouped[tag]) {
            grouped[tag].push(todo);
          }
        });
      }
    });

    // Remove empty groups
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });

    return grouped;
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

          {/* Filter and View Controls */}
          {todos.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Tag Filter Dropdown */}
              <div className="relative flex-1">
                <button
                  onClick={() => setShowTagFilter(!showTagFilter)}
                  className="w-full sm:w-auto flex items-center gap-2 px-4 py-2 text-sm text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                >
                  <span>タグで絞り込み</span>
                  {selectedTags.length > 0 && (
                    <span className="px-2 py-0.5 bg-amber-300 text-amber-900 text-xs rounded-full">
                      {selectedTags.length}
                    </span>
                  )}
                  <span className="text-lg">{showTagFilter ? '▲' : '▼'}</span>
                </button>

                {showTagFilter && getAllTags().length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-white border-2 border-amber-300 rounded-lg shadow-lg z-10 p-3 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {getAllTags().map(tag => (
                        <label
                          key={tag}
                          className="flex items-center gap-2 cursor-pointer hover:bg-amber-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag)}
                            onChange={() => toggleTagFilter(tag)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{tag}</span>
                        </label>
                      ))}
                    </div>
                    {selectedTags.length > 0 && (
                      <button
                        onClick={() => setSelectedTags([])}
                        className="w-full mt-3 px-3 py-1.5 text-xs text-amber-800 bg-amber-100 hover:bg-amber-200 rounded"
                      >
                        すべてクリア
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* View Mode and Sort */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    showCompleted
                      ? 'text-amber-800 bg-amber-100 hover:bg-amber-200'
                      : 'text-white bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <span>{showCompleted ? '完了済みを非表示' : '完了済みを表示'}</span>
                </button>

                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grouped' : 'list')}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                >
                  <span>{viewMode === 'list' ? 'グループ表示' : 'リスト表示'}</span>
                </button>

                <button
                  onClick={toggleSortOrder}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                >
                  <span>日付</span>
                  <span className="text-lg">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Todo List */}
          {viewMode === 'list' ? (
            // List View
            <div className="space-y-3 sm:space-y-4">
              {getFilteredTodos().map((todo) => (
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
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={todo.completed || false}
                        onChange={() => toggleComplete(todo.id, todo.completed)}
                        className="mt-1 w-5 h-5 rounded border-2 border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className={`text-base sm:text-lg break-words ${
                          todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}>
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
          ) : (
            // Grouped View
            <div className="space-y-6">
              {Object.entries(getGroupedTodos()).map(([tag, tagTodos]) => (
                <div key={tag} className="space-y-3">
                  <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-200 rounded-lg">{tag}</span>
                    <span className="text-sm text-amber-700">({tagTodos.length})</span>
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {tagTodos.map((todo) => (
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
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addTagToEditingTask(newTag);
                                    }
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
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <input
                                type="checkbox"
                                checked={todo.completed || false}
                                onChange={() => toggleComplete(todo.id, todo.completed)}
                                className="mt-1 w-5 h-5 rounded border-2 border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer flex-shrink-0"
                              />

                              <div className="flex-1 min-w-0">
                                <div className={`text-base sm:text-lg break-words ${
                                  todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                                }`}>
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
                </div>
              ))}
            </div>
          )}

          {todos.length === 0 && (
            <div className="text-center text-amber-700 text-base sm:text-lg py-6 sm:py-8">
              No tasks yet. Add one to get started!
            </div>
          )}

          {todos.length > 0 && getFilteredTodos().length === 0 && (
            <div className="text-center text-amber-700 text-base sm:text-lg py-6 sm:py-8">
              選択したタグのタスクがありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
