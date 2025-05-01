'use client';

import ProtectedRoute from '@/app/components/protected-route';
import NavMenu from '@/app/components/NavMenu';

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <NavMenu />
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
} 