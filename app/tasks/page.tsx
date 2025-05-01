'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/app/types/task';
import { KanbanBoard } from '@/app/components/KanbanBoard';
import { TaskForm } from '@/app/components/TaskForm';
import { useUser } from '@clerk/nextjs';
import { Plus, Search, List, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { ChatBot } from '../components/ChatBot';

export default function TasksPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchTasks();
    }
  }, [isLoaded, isSignedIn]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      let data = await response.json();
      
      // Convert date strings to Date objects
      data = data.map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
      
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (data: Partial<Task>) => {
    try {
      setIsButtonLoading(true);
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      
      const newTask = await response.json();
      
      // Convert date strings to Date objects
      const taskWithDates = {
        ...newTask,
        dueDate: new Date(newTask.dueDate),
        createdAt: new Date(newTask.createdAt),
        updatedAt: new Date(newTask.updatedAt),
      };
      
      setTasks(prev => [taskWithDates, ...prev]);
      setIsFormOpen(false);
      toast.success('Task created successfully');
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task');
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Optimistic update for immediate UI feedback
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates, updatedAt: new Date() } as Task : task
      ));
      
      // Send update to API
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      const updatedTask = await response.json();
      
      // Update with server response to ensure consistency
      setTasks(prev => prev.map(task => 
        task.id === id ? {
          ...updatedTask,
          dueDate: new Date(updatedTask.dueDate),
          createdAt: new Date(updatedTask.createdAt),
          updatedAt: new Date(updatedTask.updatedAt),
        } as Task : task
      ));
      
      toast.success('Task updated successfully');
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
      
      // Revert the optimistic update on error by refetching
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      // Optimistic update - remove from UI first
      setTasks(prev => prev.filter(task => task.id !== id));
      
      // Send delete request to API
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task');
      
      // Revert the optimistic update on error by refetching
      fetchTasks();
    }
  };

  // Filter tasks by search query
  const filteredTasks = searchQuery
    ? tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tasks;

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-10">
      {/* Header and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and organize all your tasks</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                aria-label="Search tasks"
              >
                <Search size={20} />
              </button>
            )}
          </div>
          
          {/* View mode toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 flex items-center ${viewMode === 'kanban' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              title="Kanban Board View"
            >
              <LayoutGrid size={18} className="mr-1" />
              <span className="text-sm hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 flex items-center ${viewMode === 'list' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              title="List View"
            >
              <List size={18} className="mr-1" />
              <span className="text-sm hidden sm:inline">List</span>
            </button>
          </div>
          
          <button 
            onClick={() => {
              setActiveTask(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center"
            disabled={isButtonLoading}
          >
            {isButtonLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <Plus size={18} className="mr-1" /> 
                New Task
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <KanbanBoard
          tasks={filteredTasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={(task) => {
            setActiveTask(task);
            setIsFormOpen(true);
          }}
        />
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-750">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{task.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.status === TaskStatus.TODO 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                        : task.status === TaskStatus.IN_PROGRESS
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {task.dueDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => {
                        setActiveTask(task);
                        setIsFormOpen(true);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Task Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {activeTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <TaskForm
              initialValues={activeTask || undefined}
              onSubmit={(data) => {
                if (activeTask) {
                  handleUpdateTask(activeTask.id, data);
                } else {
                  handleCreateTask(data);
                }
                setIsFormOpen(false);
              }}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Add ChatBot */}
      <ChatBot 
        userName={user?.firstName || user?.username || 'User'} 
        onCreateTask={(title) => {
          // Open the task form with prefilled title
          setActiveTask(null);
          setIsFormOpen(true);
          // Store the title in localStorage for the form to use
          if (typeof window !== 'undefined') {
            localStorage.setItem('chatbot_task_title', title);
          }
        }}
      />
    </div>
  );
} 