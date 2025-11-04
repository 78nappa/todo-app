// In-memory storage for Phase 1
// This will be replaced with Supabase in Phase 2

let todos = [];

export function getAllTodos() {
  return todos;
}

export function addTodo(todo) {
  todos.push(todo);
  return todo;
}

export function getTodoById(id) {
  return todos.find(todo => todo.id === id);
}

export function updateTodo(id, updates) {
  const index = todos.findIndex(todo => todo.id === id);
  if (index === -1) return null;

  if (updates.title !== undefined) {
    todos[index].title = updates.title;
  }
  if (updates.completed !== undefined) {
    todos[index].completed = updates.completed;
  }

  return todos[index];
}

export function deleteTodo(id) {
  const index = todos.findIndex(todo => todo.id === id);
  if (index === -1) return false;

  todos.splice(index, 1);
  return true;
}
