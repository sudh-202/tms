'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Send, Bot, X, Minimize2, Maximize2, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { GEMINI_API_KEY, getAIConfigStatus } from '../lib/env';

// Initialize the Google Generative AI with API key from environment variable
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  userName?: string;
  onCreateTask?: (title: string) => void;
  onCreateProject?: (title: string) => void;
}

// List of inappropriate content patterns to filter
const INAPPROPRIATE_PATTERNS = [
  /\b(porn|xxx|sex|naked|nude|explicit|adult content)\b/i,
  /\b(drugs|cocaine|heroin|illegal substances)\b/i,
  /\b(hack|crack|steal|illegal|pirate)\b/i,
  /\b(suicide|kill myself|self harm)\b/i,
  /\b(racist|racism|nazi|white power|supremacy)\b/i,
  /\b(gambling|betting|casino)\b/i
];

// Function to check if text contains inappropriate content
const containsInappropriateContent = (text: string): boolean => {
  return INAPPROPRIATE_PATTERNS.some(pattern => pattern.test(text));
};

export function ChatBot({ userName = 'User', onCreateTask, onCreateProject }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `# Hello ${userName}! 👋\n\nI'm your TaskElite assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus] = useState(getAIConfigStatus());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Instructions for how the AI should format responses
  const systemPrompt = `
    You are a helpful task management assistant. Follow these guidelines:
    
    1. Use markdown for formatting - include headings (# or ##), paragraphs, and emojis 
    2. Keep responses concise and direct - max 3-4 short paragraphs
    3. Use emoji icons where appropriate to improve readability
    4. When mentioning specific task or project titles, format them like [Task: Title] or [Project: Title]
    5. Avoid lengthy explanations
    6. Focus on actionable advice
  `;

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Check if API key is missing
    if (!aiStatus.geminiAvailable) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: input },
        { 
          role: 'assistant', 
          content: "❌ **Configuration Error**\n\nThe Gemini API key is missing. Please set the `NEXT_PUBLIC_GEMINI_API_KEY` in your environment variables to enable AI features."
        }
      ]);
      setInput('');
      return;
    }
    
    // Check for inappropriate content
    if (containsInappropriateContent(input)) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: input },
        { 
          role: 'assistant', 
          content: "❗ **I'm sorry** but I can't respond to that type of request. Please keep conversations focused on task management and appropriate topics." 
        }
      ]);
      setInput('');
      return;
    }
    
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if genAI is initialized
      if (!genAI) {
        throw new Error('Gemini API not initialized');
      }
      
      // Select a generative model
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Create a chat session
      const chat = model.startChat({
        history: messages
          .filter(msg => msg.role === 'user')
          .map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          })),
        generationConfig: {
          maxOutputTokens: 800, // Reduced token limit for more concise responses
        },
      });
      
      // Send message with system prompt instructions
      const result = await chat.sendMessage(
        `${systemPrompt}\n\nUser request: ${input}`
      );
      const response = await result.response;
      const responseText = response.text();
      
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      console.error('Error communicating with Gemini:', error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: "❌ **Sorry!** I encountered an error. Please try again later." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(prev => !prev);
    }
  };

  const minimizeChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(true);
  };
  
  // Handler for task/project creation from chat
  const handleTaskProjectClick = (text: string) => {
    const taskMatch = text.match(/\[Task: (.*?)\]/);
    const projectMatch = text.match(/\[Project: (.*?)\]/);
    
    if (taskMatch && onCreateTask) {
      onCreateTask(taskMatch[1]);
    } else if (projectMatch && onCreateProject) {
      onCreateProject(projectMatch[1]);
    }
  };
  
  // Custom renderer for markdown content to handle task/project clickable links
  const renderMarkdownContent = (content: string) => {
    // Replace task/project patterns with clickable spans
    let processedContent = content
      .replace(/\[Task: (.*?)\]/g, '<span class="task-title">$1</span>')
      .replace(/\[Project: (.*?)\]/g, '<span class="project-title">$1</span>');
    
    return (
      <div 
        className="prose prose-sm dark:prose-invert max-w-none"
        onClick={(e) => {
          // Check if clicked element is a task or project title
          const target = e.target as HTMLElement;
          if (target.classList.contains('task-title') && onCreateTask) {
            onCreateTask(target.textContent || '');
          } else if (target.classList.contains('project-title') && onCreateProject) {
            onCreateProject(target.textContent || '');
          }
        }}
      >
        <ReactMarkdown>
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-5 right-5 z-50 p-3 rounded-full shadow-lg transition-colors ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={20} /> : <Bot size={20} />}
      </button>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: isMinimized ? '60px' : '480px' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              height: isMinimized ? '60px' : '480px',
              width: isMinimized ? '300px' : '360px'
            }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-20 right-5 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden`}
          >
            {/* Chat header */}
            <div 
              className="bg-blue-500 text-white p-3 flex justify-between items-center cursor-pointer"
              onClick={() => setIsMinimized(false)}
            >
              <div className="flex items-center">
                <Bot size={20} className="mr-2" />
                <h3 className="font-medium">TaskElite Assistant</h3>
              </div>
              <button 
                onClick={isMinimized ? (e) => {
                  e.stopPropagation();
                  setIsMinimized(false);
                } : minimizeChat}
                className="text-white/80 hover:text-white"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
            </div>
            
            {/* Chat messages */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 p-4 overflow-y-auto"
                >
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`mb-4 ${
                        message.role === 'user' ? 'ml-auto mr-0 text-right' : 'ml-0 mr-auto'
                      }`}
                    >
                      <div 
                        className={`inline-block rounded-lg px-4 py-2 max-w-[85%] ${
                          message.role === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <p>{message.content}</p>
                        ) : (
                          <div className="markdown-content">
                            <ReactMarkdown
                              components={{
                                // Apply custom styles to markdown elements
                                h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-md font-bold mb-1" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                                a: ({ node, ...props }) => {
                                  const { href, children } = props;
                                  // Check if link text matches task or project patterns
                                  const text = String(children);
                                  const isTask = text.match(/Task: (.*)/i);
                                  const isProject = text.match(/Project: (.*)/i);
                                  
                                  if (isTask || isProject) {
                                    return (
                                      <button 
                                        className="inline-flex items-center text-blue-500 hover:text-blue-700"
                                        onClick={() => {
                                          if (isTask && onCreateTask) onCreateTask(isTask[1]);
                                          if (isProject && onCreateProject) onCreateProject(isProject[1]);
                                        }}
                                      >
                                        <PlusCircle size={14} className="mr-1" />
                                        {children}
                                      </button>
                                    );
                                  }
                                  
                                  return <a {...props} className="text-blue-500 hover:underline" />;
                                }
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '250ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '500ms' }}></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Chat input */}
            {!isMinimized && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-100 text-black dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-700 flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 