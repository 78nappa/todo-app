// Supabase storage for Phase 2
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAllTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }

  return data || [];
}

export async function addTodo(todo) {
  const { data, error } = await supabase
    .from('todos')
    .insert([todo])
    .select()
    .single();

  if (error) {
    console.error('Error adding todo:', error);
    throw error;
  }

  return data;
}

export async function getTodoById(id) {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching todo:', error);
    return null;
  }

  return data;
}

export async function updateTodo(id, updates) {
  // Prepare the update object
  const updateData = {};

  if (updates.title !== undefined) {
    updateData.title = updates.title;
  }
  if (updates.completed !== undefined) {
    updateData.completed = updates.completed;
  }
  if (updates.tags !== undefined) {
    updateData.tags = updates.tags;
  }

  const { data, error } = await supabase
    .from('todos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating todo:', error);
    return null;
  }

  return data;
}

export async function deleteTodo(id) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting todo:', error);
    return false;
  }

  return true;
}
