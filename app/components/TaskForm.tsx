'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/app/types/task';
import { format } from 'date-fns';
import { getSuggestions, generateDescription } from '@/app/lib/gemini';

interface Project {
  id: string;
  title: string;
}

interface TaskFormProps {
  task?: Task;
  initialValues?: Task;
  onSubmit: (data: Partial<Task>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({ 
  task, 
  initialValues,
  onSubmit, 
  onCancel, 
  isLoading = false 
}: TaskFormProps) {
  const initialTask = task || initialValues;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || TaskStatus.TODO);
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate 
      ? format(initialTask.dueDate, 'yyyy-MM-dd\'T\'HH:mm') 
      : format(new Date(Date.now() + 86400000), 'yyyy-MM-dd\'T\'HH:mm') // Default to tomorrow
  );
  const [projectId, setProjectId] = useState<string | null>(initialTask?.projectId || null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Initialize title from task prop or localStorage (for chatbot integration)
  useEffect(() => {
    // First prioritize the task/initialValues prop if it exists
    if (initialTask?.title) {
      setTitle(initialTask.title);
      return;
    }
    
    // Check if we have a title from chatbot in localStorage
    if (typeof window !== 'undefined' && !initialTask) {
      const chatbotTitle = localStorage.getItem('chatbot_task_title');
      if (chatbotTitle) {
        setTitle(chatbotTitle);
        // Clear the stored title after using it
        localStorage.removeItem('chatbot_task_title');
      }
    }
  }, [initialTask]);

  // Fetch projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Clear suggestions when title changes
  useEffect(() => {
    setShowSuggestions(false);
  }, [title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: Partial<Task> = {
      title,
      description: description || null,
      status,
      dueDate: new Date(dueDate),
      projectId
    };
    
    onSubmit(data);
  };

  const handleGetSuggestions = async () => {
    if (title.length < 3) return;
    
    setIsGenerating(true);
    try {
      const suggestions = await getSuggestions(title, 'task');
      setTitleSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setTitle(suggestion);
    setShowSuggestions(false);
  };

  const handleGenerateDescription = async () => {
    if (title.length < 3) return;
    
    setIsGenerating(true);
    try {
      const generatedDescription = await generateDescription(title);
      if (generatedDescription) {
        setDescription(generatedDescription);
      }
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title
        </label>
        <div className="relative">
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
            required
            placeholder="Task title"
          />
          {title.length >= 3 && !task && (
            <button
              type="button"
              onClick={handleGetSuggestions}
              className="absolute right-2 top-2 text-blue-500 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300"
              disabled={isGenerating}
            >
              {isGenerating ? 'Thinking...' : 'Suggest'}
            </button>
          )}
        </div>
        
        {/* Title Suggestions */}
        {showSuggestions && titleSuggestions.length > 0 && (
          <div className="mt-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Suggestions:</p>
            <ul className="space-y-1">
              {titleSuggestions.map((suggestion, index) => (
                <li key={index} className="text-sm">
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          {title.length >= 3 && (
            <button
              type="button"
              onClick={handleGenerateDescription}
              className="text-blue-500 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          )}
        </div>
        <textarea
          id="description"
          value={description || ''}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
          rows={3}
          placeholder="Task description (optional)"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
          >
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.DONE}>Completed</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project
          </label>
          <select
            id="project"
            value={projectId || ''}
            onChange={(e) => setProjectId(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
            disabled={isLoadingProjects}
          >
            <option value="">No Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Due Date
        </label>
        <input
          type="datetime-local"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>{task ? 'Update Task' : 'Create Task'}</>
          )}
        </button>
      </div>
    </form>
  );
} 