import express from 'express';
import { getTasks, createTask, completeTask, deleteTask } from '../services/todoistService.js';

const router = express.Router();

// Get all tasks from family project
router.get('/', async (req, res, next) => {
  try {
    // Debug logging
    console.log('Todoist Token (first 10 chars):', process.env.TODOIST_API_TOKEN?.substring(0, 10));
    console.log('Todoist Project ID:', process.env.TODOIST_PROJECT_ID);
    
    const tasks = await getTasks();
    res.json({ tasks, count: tasks.length });
  } catch (error) {
    next(error);
  }
});

// Create a new task
router.post('/', async (req, res, next) => {
  try {
    const { content, description, dueDate, priority } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Task content is required' });
    }
    
    const task = await createTask({ content, description, dueDate, priority });
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
});

// Complete a task
router.post('/:taskId/complete', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    await completeTask(taskId);
    res.json({ success: true, message: 'Task completed' });
  } catch (error) {
    next(error);
  }
});

// Delete a task
router.delete('/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    await deleteTask(taskId);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;

