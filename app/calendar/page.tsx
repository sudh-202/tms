'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
  setHours,
  setMinutes,
  parseISO,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Tag } from 'lucide-react';
import { Task, TaskStatus } from '@/app/types/task';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  category: 'meeting' | 'personal' | 'deadline' | 'other';
  description?: string;
}

export default function CalendarPage() {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isNavLoading, setIsNavLoading] = useState(false);

  // Navigation with loading indicators
  const prevMonth = () => {
    setIsNavLoading(true);
    // Simulate a small delay to show the loading effect
    setTimeout(() => {
      setCurrentDate(subMonths(currentDate, 1));
      setIsNavLoading(false);
    }, 300);
  };
  
  const nextMonth = () => {
    setIsNavLoading(true);
    // Simulate a small delay to show the loading effect
    setTimeout(() => {
      setCurrentDate(addMonths(currentDate, 1));
      setIsNavLoading(false);
    }, 300);
  };
  
  const today = () => {
    setIsNavLoading(true);
    // Simulate a small delay to show the loading effect
    setTimeout(() => {
      setCurrentDate(new Date());
      setIsNavLoading(false);
    }, 300);
  };

  // Get days for month view
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const tasksData = await response.json();
        const formattedTasks = tasksData.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }));
        
        setTasks(formattedTasks);
        
        // Convert tasks to calendar events
        const taskEvents: CalendarEvent[] = formattedTasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          startTime: task.dueDate,
          endTime: new Date(task.dueDate.getTime() + 60 * 60 * 1000), // Add 1 hour as default duration
          category: getTaskCategory(task.status),
          description: task.description || ''
        }));
        
        setEvents(taskEvents);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // Fallback to mock data
        setMockEvents();
      }
    };
    
    const setMockEvents = () => {
      // Mock calendar events
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Standup',
          startTime: setMinutes(setHours(new Date(), 10), 0), // 10:00 AM today
          endTime: setMinutes(setHours(new Date(), 10), 30), // 10:30 AM today
          category: 'meeting',
          description: 'Daily team coordination meeting'
        },
        {
          id: '2',
          title: 'Product Review',
          startTime: setMinutes(setHours(new Date(), 13), 0), // 1:00 PM today
          endTime: setMinutes(setHours(new Date(), 14), 30), // 2:30 PM today
          category: 'meeting',
          description: 'Review latest product changes with the design team'
        },
        {
          id: '3',
          title: 'Project Deadline',
          startTime: setMinutes(setHours(addMonths(new Date(), 0), 17), 0), // 5:00 PM 2 days from now
          endTime: setMinutes(setHours(addMonths(new Date(), 0), 17), 0), // 5:00 PM 2 days from now
          category: 'deadline',
          description: 'Submit final deliverables for the client project'
        },
        {
          id: '4',
          title: 'Lunch with Alex',
          startTime: setMinutes(setHours(addMonths(new Date(), 0), 12), 0), // 12:00 PM tomorrow
          endTime: setMinutes(setHours(addMonths(new Date(), 0), 13), 0), // 1:00 PM tomorrow
          category: 'personal',
          description: 'Catch up over lunch at the Italian place'
        },
        {
          id: '5',
          title: 'Quarterly Planning',
          startTime: setMinutes(setHours(addMonths(new Date(), 0), 9), 0), // 9:00 AM next week
          endTime: setMinutes(setHours(addMonths(new Date(), 0), 16), 0), // 4:00 PM next week
          category: 'meeting',
          description: 'Quarterly planning session with leadership team'
        }
      ];
  
      setEvents(mockEvents);
      setIsLoading(false);
    };
    
    fetchTasks();
  }, []);

  // Map task status to event category
  const getTaskCategory = (status: string): 'meeting' | 'personal' | 'deadline' | 'other' => {
    switch (status) {
      case TaskStatus.TODO:
        return 'personal';
      case TaskStatus.IN_PROGRESS:
        return 'meeting';
      case TaskStatus.DONE:
        return 'other';
      default:
        return 'deadline';
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.startTime, date));
  };

  // Get category styling
  const getCategoryStyle = (category: CalendarEvent['category']) => {
    switch (category) {
      case 'meeting':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'personal':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'deadline':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'other':
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      {/* Header and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">Plan and manage your schedule</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={today}
            disabled={isNavLoading}
            className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors flex items-center"
          >
            {isNavLoading ? (
              <svg className="animate-spin h-3 w-3 text-gray-500 dark:text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Today
          </button>
          
          <div className="flex items-center">
            <button
              onClick={prevMonth}
              disabled={isNavLoading}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
            >
              {isNavLoading ? (
                <svg className="animate-spin h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
            <span className="text-base font-medium mx-2 text-gray-900 dark:text-gray-100 min-w-32 text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={nextMonth}
              disabled={isNavLoading}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
            >
              {isNavLoading ? (
                <svg className="animate-spin h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
          </div>
          
          <button 
            onClick={() => setIsButtonLoading(true)}
            disabled={isButtonLoading}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70"
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
                Event
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div 
              key={day} 
              className="text-center text-sm text-gray-600 dark:text-gray-400 py-3 font-medium"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {/* Fill in blank days at start */}
          {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, index) => (
            <div key={`empty-start-${index}`} className="border-b border-r border-gray-200 dark:border-gray-700 min-h-[100px] bg-gray-50 dark:bg-gray-850"></div>
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            
            return (
              <div 
                key={day.toString()} 
                className={`p-1 border-b border-r border-gray-200 dark:border-gray-700 min-h-[100px] ${
                  !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-850 text-gray-400 dark:text-gray-600' : ''
                } ${
                  isTodayDate ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex justify-between p-1">
                  <span 
                    className={`text-sm font-medium ${
                      isTodayDate 
                        ? 'h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                    </span>
                  )}
                </div>
                
                <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto scrollbar-thin">
                  {dayEvents.map((event) => (
                    <div 
                      key={event.id}
                      className={`px-2 py-1 text-xs rounded-sm border-l-2 ${getCategoryStyle(event.category)}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="flex items-center mt-0.5 text-xs opacity-80">
                        <Clock size={10} className="mr-1" />
                        {format(event.startTime, 'h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Fill in blank days at end */}
          {Array.from({ length: (7 - ((getDay(startOfMonth(currentDate)) + daysInMonth.length) % 7)) % 7 }).map((_, index) => (
            <div key={`empty-end-${index}`} className="border-b border-r border-gray-200 dark:border-gray-700 min-h-[100px] bg-gray-50 dark:bg-gray-850"></div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">Categories:</div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Meeting</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Personal</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Deadline</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-500 mr-1"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Other</span>
        </div>
      </div>
    </div>
  );
} 