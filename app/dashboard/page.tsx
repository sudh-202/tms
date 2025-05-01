'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/app/types/task';
import { KanbanBoard } from '@/app/components/KanbanBoard';
import { TaskForm } from '@/app/components/TaskForm';
import { registerNotificationServiceWorker, requestNotificationPermission, scheduleTaskReminder, showNotification } from '@/app/lib/notifications';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CalendarIcon, CheckCircleIcon, CircleIcon, ListTodoIcon, TimerIcon, MoonIcon, SunIcon, BellIcon, SearchIcon, Gauge, LayoutGrid, List } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { HomeDashboard } from '../components/HomeDashboard';
import { ChatBot } from '../components/ChatBot';

// Define the shape of tasks from the API
interface ApiTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string | null;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'dashboard'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
    requestNotificationPermission();
    registerNotificationServiceWorker();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      
      // Fetch tasks from API instead of using mock data
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        throw new Error(`Error fetching tasks: ${response.status}`);
      }
      
      const data: ApiTask[] = await response.json();
      
      // Convert API response to Task objects
      const fetchedTasks: Task[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status as TaskStatus,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        projectId: task.projectId || null
      }));

      setTasks(fetchedTasks);

      // Schedule reminders for upcoming tasks
      fetchedTasks.forEach(task => {
        if (task.status !== TaskStatus.DONE) {
          scheduleTaskReminder(task.title, task.dueDate);
        }
      });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (data: Partial<Task>) => {
    try {
      // Display loading toast
      const toastId = toast.loading('Creating task...');
      
      // Parse the date string to a Date object if it's a string
      let dueDate = data.dueDate;
      if (typeof dueDate === 'string') {
        dueDate = new Date(dueDate);
        if (isNaN(dueDate.getTime())) {
          toast.dismiss(toastId);
          throw new Error('Invalid date format');
        }
      }

      const taskData = {
        title: data.title || 'New Task',
        description: data.description || null,
        dueDate: dueDate,
        status: data.status || TaskStatus.TODO,
        projectId: data.projectId || null
      };
      
      console.log('Creating task with data:', taskData);
      
      // Send the create request to the API
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        toast.dismiss(toastId);
        throw new Error(`Error creating task: ${response.status}`);
      }
      
      const newTask: ApiTask = await response.json();
      console.log('Task created successfully:', newTask);
      
      // Convert API response to Task object
      const createdTask: Task = {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status as TaskStatus,
        dueDate: new Date(newTask.dueDate),
        createdAt: new Date(newTask.createdAt),
        updatedAt: new Date(newTask.updatedAt),
        projectId: newTask.projectId || null
      };
      
      // Add to tasks array
      setTasks(prev => [...prev, createdTask]);
      setIsFormOpen(false);
      
      // Dismiss loading toast and show success
      toast.dismiss(toastId);
      toast.success('Task created successfully');
      
      // Fetch fresh data to ensure UI is updated with the latest server state
      await fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
      toast.error('Failed to create task');
      // Fetch tasks to ensure we have the correct state
      fetchTasks();
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Display loading toast
      const toastId = toast.loading('Updating task...');
      
      // Handle date conversion for updates
      let updatesToSend = { ...updates };
      
      // If dueDate is provided and is a string, convert it to Date
      if (typeof updates.dueDate === 'string') {
        updatesToSend.dueDate = new Date(updates.dueDate);
        if (isNaN(updatesToSend.dueDate.getTime()!)) {
          throw new Error('Invalid date format');
        }
      }
      
      // Optimistic update
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updatesToSend, updatedAt: new Date() } as Task : task
      ));
      
      // Send the update request to the API
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatesToSend),
      });
      
      if (!response.ok) {
        // If failed, dismiss loading toast and show error
        toast.dismiss(toastId);
        throw new Error(`Error updating task: ${response.status}`);
      }

      // Get the updated task from the response
      const updatedTask = await response.json();
      console.log('Task updated successfully:', updatedTask);
      
      // Update the tasks array with the server response to ensure consistency
      setTasks(prev => prev.map(task => 
        task.id === id ? {
          ...updatedTask,
          dueDate: new Date(updatedTask.dueDate),
          createdAt: new Date(updatedTask.createdAt),
          updatedAt: new Date(updatedTask.updatedAt)
        } as Task : task
      ));
      
      // Dismiss loading toast and show success
      toast.dismiss(toastId);
      toast.success('Task updated successfully');
      
      // Fetch tasks again to ensure we have latest data
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      toast.error('Failed to update task');
      // Refetch tasks to restore correct state
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      // Display loading toast
      const toastId = toast.loading('Deleting task...');
      
      // Optimistic update - remove from UI first
      const previousTasks = [...tasks];
      setTasks(tasks.filter(task => task.id !== id));
      
      // Send the delete request to the API
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // If failed, dismiss loading toast and show error
        toast.dismiss(toastId);
        throw new Error(`Error deleting task: ${response.status}`);
      }
      
      // Verify the response to ensure deletion was successful
      const result = await response.json();
      console.log('Task delete response:', result);
      
      if (!result.success) {
        toast.dismiss(toastId);
        throw new Error('Server reported deletion failure');
      }
      
      // Dismiss loading toast and show success
      toast.dismiss(toastId);
      toast.success('Task deleted successfully');
      
      // Fetch fresh data to ensure the UI reflects the current state
      await fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      toast.error('Failed to delete task');
      // Refetch all tasks to ensure we have the correct state
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg">
        <div className="text-3xl mb-4">⚠️</div>
        <div className="text-xl font-semibold">Error loading tasks</div>
        <div className="mt-2">{error}</div>
        <button 
          onClick={fetchTasks}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Top Control Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {isSearchOpen ? (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
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
                  aria-label="Search"
                >
                  <SearchIcon size={20} />
                </button>
              )}
            </div>
            
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`p-2 flex items-center ${viewMode === 'dashboard' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                title="Dashboard View"
              >
                <Gauge size={18} className="mr-1" />
                <span className="text-sm hidden sm:inline">Dashboard</span>
              </button>
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
          </div>
        </div>
        
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Task</span>
        </button>
      </div>
      
      {/* Search results message */}
      {searchQuery && (
        <div className="container mx-auto px-4 py-4 mb-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
          Showing results for "{searchQuery}" ({filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found)
          <button 
            onClick={() => setSearchQuery('')}
            className="ml-2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Clear
          </button>
        </div>
      )}

      {/* Dashboard View */}
      {viewMode === 'dashboard' && (
        <HomeDashboard tasks={filteredTasks} userName={user?.firstName || user?.username || 'User'} />
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <KanbanBoard 
          tasks={filteredTasks}
          onEditTask={(task) => {
            setActiveTask(task);
            setIsFormOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleUpdateTask}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">All Tasks</h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No tasks match your search' : 'No tasks yet. Click "Add Task" to create your first task.'}
              </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-start">
                    <span className={`mr-3 mt-1 ${getStatusColor(task.status)}`}>
                      {task.status === TaskStatus.DONE ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : task.status === TaskStatus.IN_PROGRESS ? (
                        <TimerIcon className="h-5 w-5" />
                      ) : (
                        <CircleIcon className="h-5 w-5" />
                      )}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(task.dueDate, 'PPP')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        setActiveTask(task);
                        setIsFormOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" 
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {activeTask ? 'Update Task' : 'Create Task'}
            </h2>
            <TaskForm
              task={activeTask || undefined}
              onSubmit={(data) => {
                if (activeTask) {
                  handleUpdateTask(activeTask.id, data);
                } else {
                  handleCreateTask(data);
                }
                setActiveTask(null);
                setIsFormOpen(false);
              }}
              onCancel={() => {
                setActiveTask(null);
                setIsFormOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Add ChatBot */}
      <ChatBot 
        userName={user?.firstName || user?.username || 'User'} 
        onCreateTask={(title) => {
          setActiveTask(null);
          setIsFormOpen(true);
          // Set initial form data with the title from the chatbot
          // The TaskForm component would need to accept initialData prop
          if (typeof window !== 'undefined') {
            // Use localStorage to pass the data to the form
            localStorage.setItem('chatbot_task_title', title);
            // After opening the form, the TaskForm component should check for this value
          }
        }}
      />
    </div>
  );
}

// Helper function for status colors
function getStatusColor(status: TaskStatus) {
  switch (status) {
    case TaskStatus.TODO:
      return 'text-blue-500 dark:text-blue-400';
    case TaskStatus.IN_PROGRESS:
      return 'text-amber-500 dark:text-amber-400';
    case TaskStatus.DONE:
      return 'text-green-500 dark:text-green-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
} 