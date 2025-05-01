'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Search, MoreHorizontal, Plus, Calendar, Users, CheckCircle, Clock, Folder, FolderOpen } from 'lucide-react';
import { format, isFuture, differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ChatBot } from '../components/ChatBot';

interface Project {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'inProgress' | 'completed' | 'planning';
  members: { id: string; name: string; avatar: string }[];
  tasksTotal: number;
  tasksCompleted: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  useEffect(() => {
    // Mock projects data
    const mockProjects: Project[] = [
      {
        id: '1',
        title: 'Website Redesign',
        description: 'Redesign the company website with improved UI/UX and modern design principles',
        dueDate: new Date(Date.now() + 86400000 * 14), // 14 days from now
        status: 'inProgress',
        members: [
          { id: 'user1', name: 'Alex', avatar: '/avatars/alex.jpg' },
          { id: 'user2', name: 'Taylor', avatar: '/avatars/taylor.jpg' },
          { id: 'user3', name: 'Jordan', avatar: '/avatars/jordan.jpg' },
        ],
        tasksTotal: 12,
        tasksCompleted: 5,
      },
      {
        id: '2',
        title: 'Mobile App Development',
        description: 'Create a cross-platform mobile application for the product',
        dueDate: new Date(Date.now() + 86400000 * 30), // 30 days from now
        status: 'planning',
        members: [
          { id: 'user4', name: 'Morgan', avatar: '/avatars/morgan.jpg' },
          { id: 'user1', name: 'Alex', avatar: '/avatars/alex.jpg' },
          { id: 'user5', name: 'Casey', avatar: '/avatars/casey.jpg' },
          { id: 'user6', name: 'Riley', avatar: '/avatars/riley.jpg' },
        ],
        tasksTotal: 18,
        tasksCompleted: 0,
      },
      {
        id: '3',
        title: 'Marketing Campaign',
        description: 'Plan and execute Q3 marketing campaign for the new product launch',
        dueDate: new Date(Date.now() - 86400000 * 5), // 5 days ago
        status: 'completed',
        members: [
          { id: 'user7', name: 'Jamie', avatar: '/avatars/jamie.jpg' },
          { id: 'user8', name: 'Sam', avatar: '/avatars/sam.jpg' },
        ],
        tasksTotal: 8,
        tasksCompleted: 8,
      },
      {
        id: '4',
        title: 'Product Analytics Implementation',
        description: 'Integrate analytics tools to track user engagement and product metrics',
        dueDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
        status: 'inProgress',
        members: [
          { id: 'user5', name: 'Casey', avatar: '/avatars/casey.jpg' },
          { id: 'user3', name: 'Jordan', avatar: '/avatars/jordan.jpg' },
        ],
        tasksTotal: 6,
        tasksCompleted: 2,
      },
      {
        id: '5',
        title: 'Customer Feedback Analysis',
        description: 'Analyze customer feedback and prepare recommendations for the product team',
        dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
        status: 'inProgress',
        members: [
          { id: 'user2', name: 'Taylor', avatar: '/avatars/taylor.jpg' },
          { id: 'user7', name: 'Jamie', avatar: '/avatars/jamie.jpg' },
          { id: 'user4', name: 'Morgan', avatar: '/avatars/morgan.jpg' },
        ],
        tasksTotal: 4,
        tasksCompleted: 1,
      },
    ];

    setTimeout(() => {
      setProjects(mockProjects);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter projects based on search
  const filteredProjects = searchQuery
    ? projects.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  // Project click handler
  const handleProjectClick = (projectId: string) => {
    setIsButtonLoading(true);
    // Simulate loading time before navigation
    setTimeout(() => {
      router.push(`/projects/${projectId}`);
    }, 400);
  };

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'inProgress':
        return (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'planning':
        return (
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium flex items-center">
            <FolderOpen className="w-3 h-3 mr-1" />
            Planning
          </span>
        );
      default:
        return null;
    }
  };

  const getDueDateStatus = (dueDate: Date) => {
    if (!isFuture(dueDate)) {
      return (
        <span className="text-red-600 dark:text-red-400 text-sm flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Overdue
        </span>
      );
    }

    const daysLeft = differenceInDays(dueDate, new Date());
    if (daysLeft <= 3) {
      return (
        <span className="text-amber-600 dark:text-amber-400 text-sm flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Due soon ({daysLeft} {daysLeft === 1 ? 'day' : 'days'})
        </span>
      );
    }

    return (
      <span className="text-gray-600 dark:text-gray-400 text-sm">
        Due {format(dueDate, 'MMM d, yyyy')}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-40"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track all your projects</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            {isSearchOpen ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
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
                aria-label="Search projects"
              >
                <Search size={20} />
              </button>
            )}
          </div>
          
          <button 
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
                New Project
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Search results message */}
      {searchQuery && (
        <div className="py-3 px-4 mb-6 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
          Showing results for "{searchQuery}" ({filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found)
          <button 
            onClick={() => setSearchQuery('')}
            className="ml-2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Clear
          </button>
        </div>
      )}
      
      {/* Projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-2 py-12 text-center bg-white dark:bg-gray-800 rounded-lg">
            <Folder className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-1">No projects found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? "No projects match your search criteria"
                : "Create your first project to get started"
              }
            </p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div 
              key={project.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:translate-y-[-2px] cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                  {getStatusBadge(project.status)}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map(member => (
                      <div key={member.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                        {member.avatar ? (
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
                            }} 
                          />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                    ))}
                    {project.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar size={14} className="text-gray-500 dark:text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(project.dueDate, 'MMM d')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Progress</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {project.tasksCompleted}/{project.tasksTotal}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${project.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} 
                        style={{ width: `${project.tasksTotal ? (project.tasksCompleted / project.tasksTotal) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                {getDueDateStatus(project.dueDate)}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the click from bubbling up to the card
                    // Handle more actions button click
                    console.log('Show more actions for project', project.id);
                  }}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add ChatBot */}
      <ChatBot 
        userName={user?.firstName || user?.username || 'User'} 
        onCreateProject={(title) => {
          // Handle project creation
          // This would typically open a project creation form 
          // or directly create a project with the title
          if (typeof window !== 'undefined') {
            // Store the project title for use by the form
            localStorage.setItem('chatbot_project_title', title);
            // Trigger project creation modal/form here
            // For now, just alert the user
            alert(`Creating new project: ${title}`);
          }
        }}
      />
    </div>
  );
} 