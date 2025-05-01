'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getSuggestions, generateDescription } from '@/app/lib/gemini';

// Define the Project interface based on our Prisma schema
interface Project {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: Partial<Project>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProjectForm({ project, onSubmit, onCancel, isLoading = false }: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [status, setStatus] = useState<Project['status']>(project?.status || 'PLANNING');
  const [dueDate, setDueDate] = useState(
    project?.dueDate 
      ? format(project.dueDate, 'yyyy-MM-dd') 
      : format(new Date(Date.now() + 86400000 * 14), 'yyyy-MM-dd') // Default to 2 weeks from now
  );
  const [icon, setIcon] = useState(project?.icon || 'folder');
  const [isGenerating, setIsGenerating] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Clear suggestions when title changes
  useEffect(() => {
    setShowSuggestions(false);
  }, [title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: Partial<Project> = {
      title,
      description: description || null,
      status,
      dueDate: new Date(dueDate),
      icon
    };
    
    onSubmit(data);
  };

  const handleGetSuggestions = async () => {
    if (title.length < 3) return;
    
    setIsGenerating(true);
    try {
      const suggestions = await getSuggestions(title, 'project');
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
      const generatedDescription = await generateDescription(`project: ${title}`);
      if (generatedDescription) {
        setDescription(generatedDescription);
      }
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Available icons
  const iconOptions = [
    { value: 'folder', label: 'Folder' },
    { value: 'palette', label: 'Design' },
    { value: 'layout', label: 'Layout' },
    { value: 'mail', label: 'Mail' },
    { value: 'code', label: 'Code' },
    { value: 'chart', label: 'Chart' },
    { value: 'calendar', label: 'Calendar' },
    { value: 'users', label: 'Team' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project Title
        </label>
        <div className="relative">
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
            required
            placeholder="Project title"
          />
          {title.length >= 3 && !project && (
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
          placeholder="Project description (optional)"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Project['status'])}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
          >
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Icon
          </label>
          <select
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
          >
            {iconOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Due Date
        </label>
        <input
          type="date"
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
            <>{project ? 'Update Project' : 'Create Project'}</>
          )}
        </button>
      </div>
    </form>
  );
} 