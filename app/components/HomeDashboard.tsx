'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { Task, TaskStatus } from '@/app/types/task';
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeft, ChevronRight, CalendarIcon, ClockIcon, CheckCircle, User, Users, PlusIcon, PencilIcon, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { TaskForm } from './TaskForm';
import { ProjectForm } from './ProjectForm';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  title: string;
  dueDate: string;
  icon: string;
}

interface HomeDashboardProps {
  tasks: Task[];
  userName: string;
}

export function HomeDashboard({ tasks: initialTasks, userName }: HomeDashboardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [dailyTasks, setDailyTasks] = useState<{ id: string; time: string; title: string; status: string }[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  
  // Loading states
  const [isTaskActionLoading, setIsTaskActionLoading] = useState(false);
  const [isProjectActionLoading, setIsProjectActionLoading] = useState(false);
  const [isCalendarNavLoading, setIsCalendarNavLoading] = useState(false);
  const [isTasksViewLoading, setIsTasksViewLoading] = useState(false);
  const [isProjectsViewLoading, setIsProjectsViewLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  
  // Modal states
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  
  // Calculate stats
  const totalTasks = tasks.length;
  const ongoingTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
  const completedTasks = tasks.filter(task => task.status === TaskStatus.DONE).length;
  const projectCount = projects.length;

  // Get days for calendar
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  // Get today's date for highlighting
  const today = new Date();

  // Calendar navigation with loading indicators
  const prevMonth = () => {
    setIsCalendarNavLoading(true);
    setTimeout(() => {
      setCurrentDate(subMonths(currentDate, 1));
      setIsCalendarNavLoading(false);
    }, 300);
  };
  
  const nextMonth = () => {
    setIsCalendarNavLoading(true);
    setTimeout(() => {
      setCurrentDate(addMonths(currentDate, 1));
      setIsCalendarNavLoading(false);
    }, 300);
  };
  
  const goToToday = () => {
    setIsCalendarNavLoading(true);
    setTimeout(() => {
      setCurrentDate(new Date());
      setIsCalendarNavLoading(false);
    }, 300);
  };

  // Fix the daily schedule creation to avoid circular reference
  useEffect(() => {
    // Skip if no tasks
    if (!tasks || tasks.length === 0) {
      const emptyTimeSlots = ['09 AM', '10 AM', '11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM', '08 PM']
        .map((time, index) => ({ 
          id: `empty-${index}`, 
          time, 
          title: '', 
          status: 'empty' 
        }));
      
      setDailyTasks(emptyTimeSlots);
      return;
    }
    
    // Get today's date for filtering
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    // Filter tasks for today only
    const todaysTasks = tasks.filter(task => {
      // Match tasks with today's date
      const taskDate = format(task.dueDate, 'yyyy-MM-dd');
      return taskDate === todayString;
    });
    
    // Sort today's tasks by time
    const sortedTasks = [...todaysTasks].sort((a, b) => 
      a.dueDate.getTime() - b.dueDate.getTime()
    );
    
    // Create time slots (9AM to 8PM)
    const timeSlots = ['09 AM', '10 AM', '11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM', '08 PM'];
    
    // First pass: create empty schedule
    const emptySchedule = timeSlots.map((time, index) => ({
      id: `empty-${index}`,
      time,
      title: '',
      status: 'empty'
    }));
    
    // Second pass: fill in tasks that match specific time slots
    const scheduledTaskIds = new Set();
    const dailySchedule = emptySchedule.map((slot, index) => {
      const slotHour = slot.time.includes('AM') 
        ? parseInt(slot.time.split(' ')[0]) 
        : (parseInt(slot.time.split(' ')[0]) + 12) % 24;
      
      // Try to find a task for this specific time slot
      const task = sortedTasks.find(t => {
        const taskHour = t.dueDate.getHours();
        return taskHour === slotHour && !scheduledTaskIds.has(t.id);
      });
      
      if (task) {
        scheduledTaskIds.add(task.id);
        return {
          id: task.id,
          time: slot.time,
          title: task.title,
          status: task.status === TaskStatus.IN_PROGRESS ? 'active' : 
                  (task.status === TaskStatus.DONE ? 'completed' : 'pending')
        };
      }
      
      return slot;
    });
    
    // Third pass: fill in remaining unassigned tasks to empty slots
    const remainingTasks = sortedTasks.filter(task => !scheduledTaskIds.has(task.id));
    let taskIndex = 0;
    
    const finalSchedule = dailySchedule.map(slot => {
      if (slot.status === 'empty' && taskIndex < remainingTasks.length) {
        const task = remainingTasks[taskIndex++];
        return {
          id: task.id,
          time: slot.time,
          title: task.title,
          status: task.status === TaskStatus.IN_PROGRESS ? 'active' : 
                  (task.status === TaskStatus.DONE ? 'completed' : 'pending')
        };
      }
      
      return slot;
    });
    
    setDailyTasks(finalSchedule);
  }, [tasks]); // Only depend on tasks

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        
        // Check if there's a projects API endpoint
        try {
          const response = await fetch('/api/projects');
          
          if (response.ok) {
            const data = await response.json();
            setProjects(data);
            return;
          }
        } catch (error) {
          console.error("API fetch failed, falling back to mock data:", error);
        }
        
        // Fallback to mock data if API fails
        const projectsData = [
          { 
            id: '1', 
            title: 'Website Redesign', 
            dueDate: format(addMonths(new Date(), 1), 'dd MMMM yyyy'),
            icon: 'palette' 
          },
          { 
            id: '2', 
            title: 'Mobile App Development', 
            dueDate: format(addMonths(new Date(), 2), 'dd MMMM yyyy'),
            icon: 'layout'
          },
          { 
            id: '3', 
            title: 'Marketing Campaign', 
            dueDate: format(addMonths(new Date(), 1), 'dd MMMM yyyy'),
            icon: 'mail'
          }
        ];
        
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, []);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getIconForProject = (iconName: string) => {
    switch(iconName) {
      case 'palette': return (
        <div className="rounded-full bg-blue-100 p-2 text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
      );
      case 'layout': return (
        <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
      );
      case 'mail': return (
        <div className="rounded-full bg-green-100 p-2 text-green-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      );
      default: return (
        <div className="rounded-full bg-gray-100 p-2 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      );
    }
  };

  // Navigation handlers with loading indicators
  const navigateToTasks = () => {
    setIsTasksViewLoading(true);
    router.push('/tasks');
  };
  
  const navigateToProjects = () => {
    setIsProjectsViewLoading(true);
    router.push('/projects');
  };

  // Handle task creation and editing with loading indicators
  const handleTaskAction = async (taskData: Partial<Task>) => {
    try {
      setIsTaskActionLoading(true);
      
      if (activeTask) {
        // Update existing task
        const response = await fetch(`/api/tasks/${activeTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });
        
        if (!response.ok) {
          throw new Error(`Error updating task: ${response.status}`);
        }
        
        // Get the updated task from response to ensure we have the latest data
        const updatedTask = await response.json();
        console.log('Task updated successfully:', updatedTask);
        
        // Update local state instead of page reload
        const updatedTasks = tasks.map(task => 
          task.id === updatedTask.id ? {
            ...updatedTask,
            dueDate: new Date(updatedTask.dueDate),
            createdAt: new Date(updatedTask.createdAt),
            updatedAt: new Date(updatedTask.updatedAt)
          } : task
        );
        
        setTasks(updatedTasks);
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });
        
        if (!response.ok) {
          throw new Error(`Error creating task: ${response.status}`);
        }
        
        const newTask = await response.json();
        console.log('Task created successfully:', newTask);
        
        // Add new task to local state
        setTasks(prev => [
          {
            ...newTask,
            dueDate: new Date(newTask.dueDate),
            createdAt: new Date(newTask.createdAt),
            updatedAt: new Date(newTask.updatedAt)
          },
          ...prev
        ]);
      }
    } catch (error) {
      console.error('Error handling task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setIsTaskActionLoading(false);
      setActiveTask(null);
      setIsTaskFormOpen(false);
    }
  };

  // Handle project creation and editing with loading indicators
  const handleProjectAction = async (projectData: any) => {
    try {
      setIsProjectActionLoading(true);
      
      if (activeProject) {
        // Update existing project
        const response = await fetch(`/api/projects/${activeProject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });
        
        if (!response.ok) {
          throw new Error(`Error updating project: ${response.status}`);
        }
        
        // Get the updated project from response
        const updatedProject = await response.json();
        console.log('Project updated successfully:', updatedProject);
        
        // Update local state
        setProjects(prev => prev.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        ));
      } else {
        // Create new project
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });
        
        if (!response.ok) {
          throw new Error(`Error creating project: ${response.status}`);
        }
        
        // Get the new project from response
        const newProject = await response.json();
        console.log('Project created successfully:', newProject);
        
        // Update local state
        setProjects(prev => [newProject, ...prev]);
      }
    } catch (error) {
      console.error('Error handling project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsProjectActionLoading(false);
      setActiveProject(null);
      setIsProjectFormOpen(false);
    }
  };

  // Find task by ID from the tasks array
  const findTaskById = (id: string) => {
    return tasks.find(task => task.id === id) || null;
  };

  // Edit task loading handler
  const handleEditTask = (id: string) => {
    setIsEditLoading(true);
    setTimeout(() => {
      setActiveTask(findTaskById(id));
      setIsTaskFormOpen(true);
      setIsEditLoading(false);
    }, 300);
  };

  // Edit project loading handler
  const handleEditProject = (project: any) => {
    setIsEditLoading(true);
    setTimeout(() => {
      setActiveProject(project);
      setIsProjectFormOpen(true);
      setIsEditLoading(false);
    }, 300);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Good {getTimeOfDay()}, {userName}!</h1>
        <p className="text-gray-600 dark:text-gray-400">Every task you complete is a step closer to your goals.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Projects</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{projectCount.toString().padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalTasks.toString().padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">On Going Tasks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ongoingTasks.toString().padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed Tasks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedTasks.toString().padStart(2, '0')}</p>
        </div>
      </div>

      {/* Main Content Grid - Updated column spans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Schedule (Left Column) - Now spans 8 columns instead of 6 */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              <h2 className="font-medium text-gray-900 dark:text-gray-100">Daily Schedule</h2>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {format(today, 'EEEE, MMMM d')}
            </div>
          </div>
          <div className="p-4">
            {dailyTasks.length === 0 ? (
              <div className="flex justify-center items-center h-40 text-gray-500 dark:text-gray-400">
                No tasks scheduled for today
              </div>
            ) : (
              <>
                <div 
                  className="overflow-y-auto pr-2 relative" 
                  style={{ 
                    height: '350px', // Fixed height to show approximately 7 time slots (9am-3pm)
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent' 
                  }}
                >
                  {dailyTasks.map((task) => (
                    <div key={task.id} className="flex mb-6 last:mb-0">
                      <div className="w-16 text-sm text-gray-500 dark:text-gray-400">{task.time}</div>
                      {task.status !== 'empty' ? (
                        <div className={`flex-1 p-3 rounded-lg flex justify-between items-center ${
                          task.status === 'active' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 
                          task.status === 'completed' ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
                          'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                        }`}>
                          <span className="font-medium">{task.title}</span>
                          <button 
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
                            onClick={() => handleEditTask(task.id)}
                            disabled={isEditLoading}
                          >
                            {isEditLoading ? (
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <PencilIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 p-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex justify-center items-center">
                          <span className="text-sm text-gray-400 dark:text-gray-500">No task scheduled</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {dailyTasks.length > 7 && (
                  <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Scroll down to see more time slots</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Calendar (Right Column) - Now spans 4 columns instead of 6 */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              <h2 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                {format(currentDate, 'MMMM')} <span className="text-gray-400 dark:text-gray-500 ml-1">/ {format(currentDate, 'yyyy')}</span>
              </h2>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={goToToday} 
                disabled={isCalendarNavLoading}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors disabled:opacity-50 flex items-center"
              >
                {isCalendarNavLoading ? (
                  <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Today
              </button>
              <button 
                onClick={prevMonth} 
                disabled={isCalendarNavLoading}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                {isCalendarNavLoading ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
              <button 
                onClick={nextMonth} 
                disabled={isCalendarNavLoading}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                {isCalendarNavLoading ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {/* Current date indicator */}
            <div className="mb-4 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{format(today, 'd')}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{format(today, 'EEEE, MMMM yyyy')}</div>
              </div>
            </div>
            
            {/* Days of week */}
            <div className="grid grid-cols-7 mb-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">{day}</div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Fill in blank days at start */}
              {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, index) => (
                <div key={`empty-${index}`} className="h-10"></div>
              ))}
              
              {/* Calendar days */}
              {daysInMonth.map((day) => {
                const isToday = isSameDay(day, today);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                return (
                  <div 
                    key={day.toString()} 
                    className={`h-10 flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors
                      ${isToday ? 'bg-blue-500 text-white font-bold' : 
                        isCurrentMonth ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' : 
                        'text-gray-400 dark:text-gray-600'}`}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Content Grid - Updated column spans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Tasks Table - Now spans 8 columns */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              <h2 className="font-medium text-gray-900 dark:text-gray-100">Tasks</h2>
            </div>
            <button 
              className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex items-center disabled:opacity-50"
              onClick={navigateToTasks}
              disabled={isTasksViewLoading}
            >
              {isTasksViewLoading ? (
                <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              View All
            </button>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {tasks.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No tasks yet. Click "Add Task" to create your first task.
              </div>
            ) : (
              tasks.slice(0, 3).map(task => (
                <div key={task.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="mr-3">
                      {task.status === TaskStatus.DONE ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : task.status === TaskStatus.IN_PROGRESS ? (
                        <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                      {task.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === TaskStatus.DONE ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                      task.status === TaskStatus.IN_PROGRESS ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {task.status === TaskStatus.DONE ? 'Completed' : 
                      task.status === TaskStatus.IN_PROGRESS ? 'In Progress' : 'Pending'}
                    </span>
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-blue-200 dark:bg-blue-700 border-2 border-white dark:border-gray-800 text-xs flex items-center justify-center text-blue-600 dark:text-blue-200">
                        {userName.charAt(0)}
                      </div>
                    </div>
                    <button 
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                      onClick={() => handleEditTask(task.id)}
                      disabled={isEditLoading}
                    >
                      {isEditLoading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <PencilIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {tasks.length > 3 && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center">
              <button 
                className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-50 flex items-center justify-center mx-auto"
                onClick={navigateToTasks}
                disabled={isTasksViewLoading}
              >
                {isTasksViewLoading ? (
                  <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                View All Tasks
              </button>
            </div>
          )}
        </div>

        {/* Projects List - Now spans 4 columns */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              <h2 className="font-medium text-gray-900 dark:text-gray-100">Projects</h2>
            </div>
            <button 
              className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex items-center disabled:opacity-50"
              onClick={navigateToProjects}
              disabled={isProjectsViewLoading}
            >
              {isProjectsViewLoading ? (
                <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              View All
            </button>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {isLoadingProjects ? (
              <div className="p-4 text-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No projects yet. Click "Add Project" to create your first project.
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {getIconForProject(project.icon)}
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{project.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Due Date: {project.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50"
                      onClick={() => handleEditProject(project)}
                      disabled={isEditLoading}
                    >
                      {isEditLoading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <PencilIcon className="w-5 h-5" />
                      )}
                    </button>
                    <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {projects.length > 3 && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center">
              <button 
                className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-50 flex items-center justify-center mx-auto"
                onClick={navigateToProjects}
                disabled={isProjectsViewLoading}
              >
                {isProjectsViewLoading ? (
                  <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                View All Projects
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {isTaskFormOpen && (
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
              onSubmit={handleTaskAction}
              onCancel={() => {
                setActiveTask(null);
                setIsTaskFormOpen(false);
              }}
              isLoading={isTaskActionLoading}
            />
          </div>
        </div>
      )}

      {/* Project Form Modal */}
      {isProjectFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" 
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {activeProject ? 'Update Project' : 'Create Project'}
            </h2>
            <ProjectForm
              project={activeProject || undefined}
              onSubmit={handleProjectAction}
              onCancel={() => {
                setActiveProject(null);
                setIsProjectFormOpen(false);
              }}
              isLoading={isProjectActionLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
} 