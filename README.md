# TaskMaster

A modern task management application built with Next.js 15, React 19, and TypeScript. TaskMaster provides a seamless experience for managing tasks, projects, and team collaboration with a beautiful UI and powerful features.

![TaskMaster Preview](/public/preview.png)

## ✨ Features

- **Modern Dashboard**: Intuitive and responsive dashboard to manage all your tasks
- **Task Management**: Create, organize, and track tasks with customizable statuses and priorities
- **Drag-and-Drop Interface**: Easily move tasks between different statuses
- **Projects**: Organize tasks into projects for better workflow management
- **Calendar View**: Visualize tasks with due dates on a calendar interface 
- **User Authentication**: Secure authentication with Clerk
- **Real-time Updates**: Stay in sync with your team's progress
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **AI Assistance**: AI-powered features to help manage and organize tasks

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.3](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [Prisma](https://www.prisma.io/) with [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Drag and Drop**: [dnd-kit](https://dndkit.com/)
- **Date Management**: [date-fns](https://date-fns.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) and [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- **AI Integration**: [Google Generative AI](https://ai.google.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (or Supabase account)
- Clerk account for authentication

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskmaster.git
   cd taskmaster
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # Database
   DATABASE_URL="your-database-url"
   
   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   
   # Google Generative AI (Gemini)
   NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
   ```

   > **Note:** The Gemini API key is required for AI features such as task suggestions, smart descriptions, and the AI assistant chatbot. You can get a key from the [Google AI Studio](https://ai.google.dev/).

4. Set up the database schema:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev
   ```

5. Seed the database (optional):
   ```bash
   npm run prisma:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The application uses a relational database with the following main models:

```prisma
model User {
  id        String    @id @default(cuid())
  clerkId   String    @unique
  name      String?
  email     String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  projects  Project[]
  tasks     Task[]
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  tasks       Task[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      String    @default("TODO")
  priority    String    @default("MEDIUM")
  dueDate     DateTime?
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  projectId   String?
  project     Project?  @relation(fields: [projectId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## 💡 Usage

### Dashboard

The dashboard provides an overview of your tasks, upcoming deadlines, and project progress. From here, you can:
- View task distribution by status
- See upcoming deadlines
- Navigate to different sections of the application

### Task Management

- **Create Tasks**: Click "New Task" to create a task with title, description, priority, and due date
- **Organize Tasks**: Drag and drop tasks between different status columns (Todo, In Progress, Done)
- **Edit Tasks**: Click on a task to view details and make changes
- **Delete Tasks**: Remove tasks that are no longer needed

### Project Management

- **Create Projects**: Organize related tasks into projects
- **Manage Projects**: Add, edit, or archive projects
- **Project Dashboard**: View project-specific tasks and progress

## 🧑‍💻 For Developers

For detailed technical documentation, please visit the [/developers](/developers) page in the application.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

If you have any questions or need support, please open an issue in the GitHub repository.
