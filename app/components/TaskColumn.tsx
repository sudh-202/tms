import { Task, TaskStatus } from '@/app/types/task';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const statusConfig = {
  [TaskStatus.TODO]: {
    title: 'To Do',
    className: 'bg-gray-100 dark:bg-gray-900',
  },
  [TaskStatus.IN_PROGRESS]: {
    title: 'In Progress',
    className: 'bg-blue-50 dark:bg-blue-900/20',
  },
  [TaskStatus.DONE]: {
    title: 'Done',
    className: 'bg-green-50 dark:bg-green-900/20',
  },
};

export function TaskColumn({ status, tasks, onEditTask, onDeleteTask }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const filteredTasks = tasks.filter((task) => task.status === status);

  return (
    <div className="flex flex-col flex-1 min-w-[300px] max-w-[400px]">
      <div className={`p-4 rounded-t-lg ${statusConfig[status].className}`}>
        <h2 className="font-semibold text-gray-900 dark:text-white">
          {statusConfig[status].title} ({filteredTasks.length})
        </h2>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 rounded-b-lg ${statusConfig[status].className}`}
      >
        <SortableContext
          items={filteredTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
} 