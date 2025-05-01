import { z } from 'zod';

// Define TaskStatus as an enum for consistent usage
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

// Create a custom refinement for handling dates from strings or Date objects
const dateSchema = z.union([
  z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Invalid date string format",
  }),
  z.date()
]).transform(val => typeof val === 'string' ? new Date(val) : val);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable(),
  dueDate: dateSchema,
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]),
  projectId: z.string().nullable().optional(),
  project: z.object({
    id: z.string(),
    title: z.string()
  }).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Task = z.infer<typeof taskSchema>;

export const createTaskSchema = taskSchema.omit({
  id: true,
  project: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateTask = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTask = z.infer<typeof updateTaskSchema>; 