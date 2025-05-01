'use client';

import { Task, TaskStatus } from '@/app/types/task';
import { useCallback, useMemo, useState } from 'react';
import { TaskCard } from '@/app/components/TaskCard';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Drag item types
const ItemTypes = {
  TASK: 'task',
};

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

interface DraggableTaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onComplete?: (id: string, isComplete: boolean) => void;
  onUpdateStatus: (status: TaskStatus) => void;
}

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onTaskComplete: (id: string, isComplete: boolean) => void;
}

// Draggable task component
function DraggableTaskCard({ task, onEdit, onDelete, onComplete, onUpdateStatus }: DraggableTaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div 
      ref={drag as any}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="touch-manipulation"
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onComplete={onComplete}
        isDragging={isDragging}
      />
    </div>
  );
}

// Droppable column
function Column({ status, tasks, onEditTask, onDeleteTask, onUpdateTask, onTaskComplete }: ColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: { id: string, status: TaskStatus }) => {
      if (item.status !== status) {
        onUpdateTask(item.id, { status });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // Column header styles based on status
  const getColumnStyles = () => {
    switch (status) {
      case TaskStatus.TODO:
        return {
          headerBg: 'bg-blue-50 dark:bg-blue-900/30',
          border: 'border-blue-100 dark:border-blue-800',
          title: 'text-blue-900 dark:text-blue-300',
          dot: 'bg-blue-500',
          badge: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300',
        };
      case TaskStatus.IN_PROGRESS:
        return {
          headerBg: 'bg-amber-50 dark:bg-amber-900/30',
          border: 'border-amber-100 dark:border-amber-800',
          title: 'text-amber-900 dark:text-amber-300',
          dot: 'bg-amber-500',
          badge: 'bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300',
        };
      case TaskStatus.DONE:
        return {
          headerBg: 'bg-green-50 dark:bg-green-900/30',
          border: 'border-green-100 dark:border-green-800',
          title: 'text-green-900 dark:text-green-300',
          dot: 'bg-green-500',
          badge: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300',
        };
      default:
        return {
          headerBg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-100 dark:border-gray-700',
          title: 'text-gray-900 dark:text-gray-300',
          dot: 'bg-gray-500',
          badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        };
    }
  };

  const styles = getColumnStyles();
  
  return (
    <div 
      ref={drop as any}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden flex flex-col transition-colors ${isOver ? 'ring-2 ring-blue-300 dark:ring-blue-700' : ''}`}
    >
      <div className={`px-4 py-3 ${styles.headerBg} border-b ${styles.border}`}>
        <h2 className={`font-medium ${styles.title} flex items-center`}>
          <span className={`w-3 h-3 rounded-full ${styles.dot} mr-2`}></span>
          {status === TaskStatus.TODO ? 'To Do' : status === TaskStatus.IN_PROGRESS ? 'In Progress' : 'Done'}
          <span className={`ml-2 ${styles.badge} text-xs px-2 py-0.5 rounded-full`}>
            {tasks.length}
          </span>
        </h2>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-300px)] transition-all scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="p-4 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              {status === TaskStatus.TODO ? 'No tasks to do yet' : 
               status === TaskStatus.IN_PROGRESS ? 'No tasks in progress' : 
               'No completed tasks yet'}
            </motion.div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              >
                <DraggableTaskCard
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onComplete={onTaskComplete}
                  onUpdateStatus={(newStatus) => onUpdateTask(task.id, { status: newStatus })}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, onEditTask, onDeleteTask, onUpdateTask }: KanbanBoardProps) {
  const todoTasks = useMemo(() => tasks.filter(task => task.status === TaskStatus.TODO), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter(task => task.status === TaskStatus.IN_PROGRESS), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(task => task.status === TaskStatus.DONE), [tasks]);

  // Handle task completion toggle
  const handleTaskComplete = useCallback((id: string, isComplete: boolean) => {
    const newStatus = isComplete ? TaskStatus.DONE : TaskStatus.TODO;
    onUpdateTask(id, { status: newStatus });
  }, [onUpdateTask]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Column
          status={TaskStatus.TODO}
          tasks={todoTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={onUpdateTask}
          onTaskComplete={handleTaskComplete}
        />
        
        <Column
          status={TaskStatus.IN_PROGRESS}
          tasks={inProgressTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={onUpdateTask}
          onTaskComplete={handleTaskComplete}
        />
        
        <Column
          status={TaskStatus.DONE}
          tasks={doneTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={onUpdateTask}
          onTaskComplete={handleTaskComplete}
        />
      </div>
    </DndProvider>
  );
} 