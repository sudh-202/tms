import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <header className="flex justify-between items-center p-4 max-w-7xl w-full mx-auto border-b-[1px] border-gray-200">
        <div className="font-bold text-xl text-[#3C80FA]">TaskMaster</div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-[#3C80FA] hover:text-[#3061b7] font-medium">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 bg-[#3C80FA] hover:bg-[#3061b7] text-white font-medium rounded-lg transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
        
          <SignedIn>
            <UserButton afterSignOutUrl="/"/>
          </SignedIn>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <section className="max-w-7xl w-full mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Manage your tasks <span className="text-[#3C80FA]">efficiently</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Get more done with our intuitive dashboard. Track progress, set priorities, and collaborate with your team.
            </p>
            <div className="flex gap-4">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="px-6 py-3 bg-[#3C80FA] hover:bg-[#3061b7] text-white font-medium rounded-lg transition-colors">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="px-6 py-3 bg-[#3C80FA] hover:bg-[#3061b7] text-white font-medium rounded-lg transition-colors">
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200 relative">
            <Image 
              src="/preview.png" 
              alt="Dashboard Preview" 
              width={500} 
              height={500} 
              className="w-full h-full object-cover rounded-lg" 
            />
          </div>
        </section>
      </main>
      
      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} TaskMaster. All rights reserved.
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/developers" className="text-sm text-gray-600 hover:text-[#3C80FA]">
              Developers
            </Link>
            <a href="https://github.com/yourusername/taskmaster" className="text-sm text-gray-600 hover:text-[#3C80FA]">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
