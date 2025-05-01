"use client"

import React from 'react';
import Link from 'next/link';

export default function DevelopersPage() {
  const techStack = [
    { name: 'Next.js', icon: '/icons/nextjs.svg', description: 'React framework with App Router (v15.3.1)' },
    { name: 'React', icon: '/icons/react.svg', description: 'UI library (v19)' },
    { name: 'TypeScript', icon: '/icons/typescript.svg', description: 'Type-safe JavaScript' },
    { name: 'Tailwind CSS', icon: '/icons/tailwind.svg', description: 'Utility-first CSS framework' },
    { name: 'Clerk', icon: '/icons/clerk.svg', description: 'Authentication & user management' },
    { name: 'Prisma', icon: '/icons/prisma.svg', description: 'ORM for database access' },
    { name: 'Supabase', icon: '/icons/supabase.svg', description: 'Backend-as-a-Service' },
    { name: 'dnd-kit', icon: '/icons/dndkit.svg', description: 'Drag & drop toolkit' },
    { name: 'Zod', icon: '/icons/zod.svg', description: 'Schema validation' },
    { name: 'Google AI', icon: '/icons/google-ai.svg', description: 'AI-powered features' },
  ];

  // Key packages with simple descriptions
  const packages = [
    { name: '@clerk/nextjs', purpose: 'Authentication' },
    { name: '@prisma/client', purpose: 'Database ORM' },
    { name: '@supabase/supabase-js', purpose: 'Supabase client' },
    { name: '@dnd-kit/*', purpose: 'Drag and drop' },
    { name: 'react-hook-form', purpose: 'Form handling' },
    { name: 'zod', purpose: 'Schema validation' },
    { name: 'date-fns', purpose: 'Date utilities' },
    { name: 'framer-motion', purpose: 'Animations' },
    { name: 'lucide-react', purpose: 'Icons' },
    { name: 'sonner', purpose: 'Toast notifications' },
  ];

  return (
    <>
      <style jsx global>{`
        :root {
          color-scheme: light;
        }
        body {
          background-color: white;
          color: #111827;
        }
      `}</style>
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 flex items-center justify-between">
            <div>
              <Link href="/" className="text-[#3C80FA] hover:text-[#3061b7] mb-2 inline-flex items-center gap-1 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Developer Documentation</h1>
              <p className="text-gray-600 mt-1">Technical overview of the TaskMaster application</p>
            </div>
            <div className="hidden md:block">
              
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
              <nav className="sticky top-8 bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3C80FA]">
                      <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
                    </svg>
                    <a href="#tech-stack" className="text-[#3C80FA] hover:text-[#3061b7] font-medium">Tech Stack</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3C80FA]">
                      <path d="M3 3h18v18H3z"/>
                      <path d="M21 9H3"/>
                      <path d="M8 21V9"/>
                    </svg>
                    <a href="#packages" className="text-[#3C80FA] hover:text-[#3061b7] font-medium">Key Packages</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3C80FA]">
                      <path d="M2 9V5c0-1 .9-2 2-2h3.2"/>
                      <path d="M19 5c0-1-.9-2-2-2h-1.7"/>
                      <path d="M16 19h3c1 0 2-.9 2-2v-4"/>
                      <path d="M2 12v5c0 1 .9 2 2 2h6"/>
                      <path d="M11 12H8v7"/>
                      <path d="M14 8v7h4"/>
                    </svg>
                    <a href="#file-structure" className="text-[#3C80FA] hover:text-[#3061b7] font-medium">File Structure</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3C80FA]">
                      <path d="M2 9V5c0-1 .9-2 2-2h3.2"/>
                      <path d="M19 5c0-1-.9-2-2-2h-1.7"/>
                      <path d="M16 19h3c1 0 2-.9 2-2v-4"/>
                      <path d="M2 12v5c0 1 .9 2 2 2h6"/>
                      <path d="M11 12H8v7"/>
                      <path d="M14 8v7h4"/>
                    </svg>
                    <a href="#authentication" className="text-[#3C80FA] hover:text-[#3061b7] font-medium">Authentication</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3C80FA]">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    </svg>
                    <a href="#database" className="text-[#3C80FA] hover:text-[#3061b7] font-medium">Database</a>
                  </li>
                </ul>
              </nav>
            </aside>

            <main className="md:col-span-3 space-y-16">
              <section id="tech-stack" className="scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
                  </svg>
                  Tech Stack
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {techStack.map((tech, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 mb-3 flex items-center justify-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          {/* Fallback for missing icons */}
                          <span className="text-lg font-bold text-[#3C80FA]">{tech.name.charAt(0)}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{tech.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="packages" className="scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h18v18H3z"/>
                    <path d="M21 9H3"/>
                    <path d="M8 21V9"/>
                  </svg>
                  Key Packages
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packages.map((pkg, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-[#3C80FA] bg-opacity-10 flex items-center justify-center text-[#3C80FA]">
                        <span className="font-mono text-xs">{pkg.name.replace(/[@/-]/g, '').charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-mono text-sm font-semibold">{pkg.name}</h3>
                        <p className="text-xs text-gray-600">{pkg.purpose}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="file-structure" className="scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9V5c0-1 .9-2 2-2h3.2"/>
                    <path d="M19 5c0-1-.9-2-2-2h-1.7"/>
                    <path d="M16 19h3c1 0 2-.9 2-2v-4"/>
                    <path d="M2 12v5c0 1 .9 2 2 2h6"/>
                    <path d="M11 12H8v7"/>
                    <path d="M14 8v7h4"/>
                  </svg>
                  File Structure
                </h2>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">Main Directories</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-[#3C80FA]">
                            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                          </svg>
                          <span>
                            <strong className="font-mono">app/</strong> 
                            <span className="text-gray-600 ml-1">Next.js app router</span>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-[#3C80FA]">
                            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                          </svg>
                          <span>
                            <strong className="font-mono">prisma/</strong> 
                            <span className="text-gray-600 ml-1">Database schema & migrations</span>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-[#3C80FA]">
                            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                          </svg>
                          <span>
                            <strong className="font-mono">public/</strong> 
                            <span className="text-gray-600 ml-1">Static assets</span>
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">App Structure</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-[#3C80FA]">
                            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                          </svg>
                          <span>
                            <strong className="font-mono">components/</strong> 
                            <span className="text-gray-600 ml-1">UI components</span>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-[#3C80FA]">
                            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                          </svg>
                          <span>
                            <strong className="font-mono">dashboard/</strong> 
                            <span className="text-gray-600 ml-1">Dashboard pages</span>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-[#3C80FA]">
                            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                          </svg>
                          <span>
                            <strong className="font-mono">api/</strong> 
                            <span className="text-gray-600 ml-1">API routes</span>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section id="authentication" className="scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Authentication
                </h2>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Clerk Authentication</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Secure</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">User authentication with JWT, OAuth providers, and secure session management.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                          <path d="m9 12 2 2 4-4"/>
                        </svg>
                        Sign In/Up
                      </h4>
                      <p className="text-xs text-gray-600">Email, password, social login support</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                          <path d="m9 12 2 2 4-4"/>
                        </svg>
                        Route Protection
                      </h4>
                      <p className="text-xs text-gray-600">Middleware-based auth protection</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                          <path d="m9 12 2 2 4-4"/>
                        </svg>
                        User Management
                      </h4>
                      <p className="text-xs text-gray-600">Dashboard for user administration</p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="database" className="scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                  Database
                </h2>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Prisma + Supabase</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Type-safe</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <h4 className="text-sm font-medium">User</h4>
                      </div>
                      <div className="p-3 text-xs">
                        <p><span className="font-mono text-blue-600">id</span>: String</p>
                        <p><span className="font-mono text-blue-600">clerkId</span>: String</p>
                        <p><span className="font-mono text-blue-600">email</span>: String</p>
                        <p><span className="font-mono text-blue-600">tasks</span>: Task[]</p>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <h4 className="text-sm font-medium">Task</h4>
                      </div>
                      <div className="p-3 text-xs">
                        <p><span className="font-mono text-blue-600">id</span>: String</p>
                        <p><span className="font-mono text-blue-600">title</span>: String</p>
                        <p><span className="font-mono text-blue-600">status</span>: Enum</p>
                        <p><span className="font-mono text-blue-600">userId</span>: String</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>
          
          <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>For more information, check out our <a href="https://github.com/yourusername/taskmaster" className="text-[#3C80FA] hover:underline">GitHub repository</a></p>
          </footer>
        </div>
      </div>
    </>
  );
} 