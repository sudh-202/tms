import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Task Management System',
  description: 'Modern task management with Kanban board and notifications',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tasks',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          {/* Script to prevent flash of wrong theme - must be in head */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    // Only add the dark class if specifically set in localStorage
                    // This ensures server and client rendering match
                    var darkMode = localStorage.getItem('darkMode');
                    if (darkMode === 'true') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {}
                })();
              `
            }}
          />
        </head>
        <body className={`${inter.className} h-full antialiased`}>
          <Toaster position="top-right" richColors closeButton />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
} 