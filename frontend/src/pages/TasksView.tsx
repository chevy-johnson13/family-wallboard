import { useState } from 'react';
import { tasksAPI } from '../services/api';
import { cacheTasks, getCachedTasks } from '../services/db';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import type { Task } from '../types';

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const fetchTasks = async () => {
    try {
      try {
        const fetchedTasks = await tasksAPI.getTasks();
        setTasks(fetchedTasks);
        await cacheTasks(fetchedTasks);
      } catch (error) {
        console.log('Using cached tasks');
        const cachedTasks = await getCachedTasks();
        setTasks(cachedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(fetchTasks, 60000); // Refresh every minute

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;

    try {
      await tasksAPI.createTask(newTaskContent);
      setNewTaskContent('');
      setShowAddTask(false);
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await tasksAPI.completeTask(taskId);
      await fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await tasksAPI.deleteTask(taskId);
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-xl text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Family Tasks</h1>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg font-medium shadow-lg transition-colors flex items-center space-x-2"
          >
            <span className="text-2xl">+</span>
            <span>Add Task</span>
          </button>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <form onSubmit={handleAddTask} className="bg-white rounded-2xl p-6 shadow-lg">
            <input
              type="text"
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex space-x-3 mt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Add Task
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddTask(false);
                  setNewTaskContent('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Active Tasks */}
        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Active Tasks ({activeTasks.length})
          </h2>
          <div className="space-y-3">
            {activeTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-2xl text-gray-600">All tasks completed!</p>
              </div>
            ) : (
              activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="w-10 h-10 border-2 border-gray-300 rounded-full hover:border-green-500 hover:bg-green-50 transition-colors flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-gray-800">{task.content}</h3>
                      {task.description && (
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      )}
                      {task.dueDate && (
                        <p className="text-sm text-gray-500 mt-1">Due: {task.dueDate}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="ml-4 text-red-500 hover:text-red-700 p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              Completed ({completedTasks.length})
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-100 rounded-2xl p-6 shadow opacity-60"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-gray-600 line-through">
                        {task.content}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

