import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Helper function to check if table exists
async function tableExists(tableName: string) {
  try {
    // Try to query the database tables
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = ${tableName}
      );
    `;
    return result[0]?.exists || false;
  } catch (error) {
    console.error('Error checking table existence:', error);
    return false;
  }
}

// Helper function to get dummy projects when database is not ready
function getDummyProjects() {
  const today = new Date();
  return [
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Redesign the company website with improved UI/UX',
      status: 'IN_PROGRESS',
      icon: 'palette',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 15).toISOString(), // Next month, day 15
      tasksTotal: 3,
      tasksCompleted: 1
    },
    {
      id: '2',
      title: 'Mobile App Development',
      description: 'Create a cross-platform mobile application for the product',
      status: 'PLANNING',
      icon: 'layout',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(today.getFullYear(), today.getMonth() + 2, 1).toISOString(), // Two months from now, day 1
      tasksTotal: 0,
      tasksCompleted: 0
    }
  ];
}

export async function GET() {
  try {
    // If table exists, try to fetch projects
    try {
      const projects = await prisma.project.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          tasks: {
            select: {
              id: true,
              status: true
            }
          }
        }
      });
      
      // Transform projects to include task counts
      const projectsWithTaskCounts = projects.map(project => {
        const tasksTotal = project.tasks.length;
        const tasksCompleted = project.tasks.filter(task => task.status === 'DONE').length;
        
        // Remove tasks array and add counts
        const { tasks, ...projectData } = project;
        return {
          ...projectData,
          tasksTotal,
          tasksCompleted
        };
      });
      
      return NextResponse.json(projectsWithTaskCounts);
    } catch (error) {
      console.error('Error querying projects:', error);
      // If there's an error fetching projects, return dummy data
      return NextResponse.json(getDummyProjects());
    }
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/projects - Request body:', body);
    
    // Ensure dueDate is a valid Date object
    let dueDate;
    try {
      // If body.dueDate is a string, try to convert it to a Date
      if (typeof body.dueDate === 'string') {
        dueDate = new Date(body.dueDate);
        if (isNaN(dueDate.getTime())) {
          // If invalid date, use current time
          dueDate = new Date();
        }
      } else if (body.dueDate instanceof Date) {
        dueDate = body.dueDate;
      } else {
        // Default to current time if no valid date provided
        dueDate = new Date();
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      dueDate = new Date();
    }
    
    // Create project with proper date handling
    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description || null,
        status: body.status || 'PLANNING',
        icon: body.icon || 'folder',
        dueDate: dueDate // Use the properly parsed date
      },
    });
    
    // Add task counts for consistency with GET response
    const projectWithCounts = {
      ...project,
      tasksTotal: 0,
      tasksCompleted: 0
    };
    
    return NextResponse.json(projectWithCounts);
  } catch (error) {
    console.error('Failed to create project:', error);
    
    // Return error details in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { 
          error: 'Failed to create project', 
          details: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }
    
    // Return a dummy project as a fallback
    const dummyProject = {
      id: Date.now().toString(),
      title: 'Project creation failed - please try again',
      description: null,
      status: 'PLANNING',
      icon: 'folder',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      tasksTotal: 0,
      tasksCompleted: 0
    };
    
    return NextResponse.json(
      { 
        error: 'Failed to create project',
        fallback: dummyProject 
      },
      { status: 500 }
    );
  }
} 