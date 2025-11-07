import fetch from 'node-fetch';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: parseInt(process.env.TASKS_CACHE_TTL) || 60 });

const TODOIST_API_BASE = 'https://api.todoist.com/rest/v2';

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.TODOIST_API_TOKEN}`,
    'Content-Type': 'application/json'
  };
}

// Get all tasks from the family project
export async function getTasks() {
  const cacheKey = 'tasks';
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('✅ Returning cached tasks');
    return cached;
  }
  
  try {
    const projectId = process.env.TODOIST_PROJECT_ID;
    let url = `${TODOIST_API_BASE}/tasks`;
    
    if (projectId) {
      url += `?project_id=${projectId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Todoist API error: ${response.statusText}`);
    }
    
    const tasks = await response.json();
    
    // Transform to our format
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      content: task.content,
      description: task.description || '',
      completed: task.is_completed || false,
      dueDate: task.due?.date || null,
      priority: task.priority || 1,
      labels: task.labels || [],
      projectId: task.project_id,
      createdAt: task.created_at
    }));
    
    cache.set(cacheKey, formattedTasks);
    console.log(`✅ Fetched ${formattedTasks.length} tasks`);
    
    return formattedTasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

// Create a new task
export async function createTask({ content, description, dueDate, priority = 1 }) {
  try {
    const body = {
      content,
      project_id: process.env.TODOIST_PROJECT_ID || undefined,
      description: description || undefined,
      due_date: dueDate || undefined,
      priority: priority || 1
    };
    
    const response = await fetch(`${TODOIST_API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }
    
    const task = await response.json();
    
    // Clear cache
    cache.del('tasks');
    
    console.log(`✅ Created task: ${task.content}`);
    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

// Complete a task
export async function completeTask(taskId) {
  try {
    const response = await fetch(`${TODOIST_API_BASE}/tasks/${taskId}/close`, {
      method: 'POST',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to complete task: ${response.statusText}`);
    }
    
    // Clear cache
    cache.del('tasks');
    
    console.log(`✅ Completed task: ${taskId}`);
    return true;
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
}

// Delete a task
export async function deleteTask(taskId) {
  try {
    const response = await fetch(`${TODOIST_API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
    
    // Clear cache
    cache.del('tasks');
    
    console.log(`✅ Deleted task: ${taskId}`);
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

