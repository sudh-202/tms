import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create initial projects
    const project1 = await prisma.project.create({
      data: {
        title: 'Website Redesign',
        description: 'Redesign the company website with improved UI/UX',
        status: 'IN_PROGRESS',
        icon: 'palette',
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });

    const project2 = await prisma.project.create({
      data: {
        title: 'Mobile App Development',
        description: 'Create a cross-platform mobile application for the product',
        status: 'PLANNING',
        icon: 'layout',
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      },
    });

    // Create initial tasks with correct relation syntax
    await prisma.task.create({
      data: {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new features',
        status: 'TODO',
        dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
        project: {
          connect: { id: project1.id }
        }
      },
    });

    await prisma.task.create({
      data: {
        title: 'Design user dashboard',
        description: 'Create wireframes and mockups for the user dashboard',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 86400000), // 1 day from now
        project: {
          connect: { id: project1.id }
        }
      },
    });

    await prisma.task.create({
      data: {
        title: 'Fix login bug',
        description: 'Resolve the issue with user login on mobile devices',
        status: 'DONE',
        dueDate: new Date(Date.now() - 86400000), // 1 day ago
        project: {
          connect: { id: project2.id }
        }
      },
    });

    console.log('Database has been seeded with initial data');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 