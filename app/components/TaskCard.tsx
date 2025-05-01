'use client';

import { Task, TaskStatus } from '@/app/types/task';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { CalendarIcon, Clock3Icon, TrashIcon, PencilIcon, AlertCircleIcon, CheckCircleIcon, CircleIcon } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onComplete?: (id: string, isComplete: boolean) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onComplete, isDragging = false }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!onComplete) return;
    
    setIsCompleting(true);
    
    // Add a small delay for animation
    setTimeout(() => {
      onComplete(task.id, task.status !== TaskStatus.DONE);
      setIsCompleting(false);
    }, 300);
  };

  // Format the date for display
  const formattedDate = formatDate(task.dueDate);
  const isOverdue = isPast(task.dueDate) && task.status !== TaskStatus.DONE;
  const isSoon = !isOverdue && 
                 !isToday(task.dueDate) && 
                 Math.abs(new Date().getTime() - task.dueDate.getTime()) < 86400000 * 2; // Within 2 days

  // Get colors based on status
  const getStatusColors = () => {
    switch (task.status) {
      case TaskStatus.TODO:
        return 'border-l-blue-500 dark:border-l-blue-400';
      case TaskStatus.IN_PROGRESS:
        return 'border-l-amber-500 dark:border-l-amber-400';
      case TaskStatus.DONE:
        return 'border-l-green-500 dark:border-l-green-400';
      default:
        return 'border-l-gray-500 dark:border-l-gray-600';
    }
  };

  return (
    <motion.div
      animate={{
        scale: isCompleting ? 0.95 : 1,
        opacity: isCompleting ? 0.7 : 1,
      }}
      transition={{ duration: 0.2 }}
      data-status={task.status}
      className={`
        mb-2 p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border-l-4 ${getStatusColors()}
        hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none
        dark:text-gray-100
        ${isDragging ? 'shadow-lg ring-2 ring-blue-200 dark:ring-blue-800' : ''}
        ${task.status === TaskStatus.DONE ? 'opacity-75' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-medium text-gray-900 dark:text-gray-100 mb-1 pr-2 break-words ${task.status === TaskStatus.DONE ? 'line-through opacity-75' : ''}`}>
          {task.title}
        </h3>
        <div className="flex space-x-1 shrink-0">
          <button
            onClick={handleComplete}
            className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            aria-label={task.status === TaskStatus.DONE ? "Mark as incomplete" : "Mark as complete"}
          >
            {task.status === TaskStatus.DONE ? (
              <CheckCircleIcon size={16} className="text-green-500 dark:text-green-400" />
            ) : (
              <CircleIcon size={16} className="text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEdit();
            }}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded"
            aria-label="Edit task"
          >
            <PencilIcon size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete();
            }}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 rounded"
            aria-label="Delete task"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className={`text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2 break-words ${task.status === TaskStatus.DONE ? 'line-through opacity-75' : ''}`}>
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs mt-2">
        <div className={`flex items-center ${isOverdue ? 'text-red-500 dark:text-red-400' : isSoon ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
          <CalendarIcon size={12} className="mr-1" />
          <span>{formattedDate}</span>
        </div>
        
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <Clock3Icon size={12} className="mr-1" />
          <span>{format(task.dueDate, 'HH:mm')}</span>
        </div>
      </div>

      {isOverdue && task.status !== TaskStatus.DONE && (
        <div className="mt-2 text-xs px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-sm flex items-center">
          <AlertCircleIcon size={12} className="mr-1" />
          Overdue
        </div>
      )}
      
      {!isOverdue && isSoon && task.status !== TaskStatus.DONE && (
        <div className="mt-2 text-xs px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-sm flex items-center">
          <Clock3Icon size={12} className="mr-1" />
          Due soon
        </div>
      )}
    </motion.div>
  );
}

// Helper function to format date in a user-friendly way
function formatDate(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  } else if (isTomorrow(date)) {
    return 'Tomorrow';
  } else {
    return format(date, 'MMM dd');
  }
} 