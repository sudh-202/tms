"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Settings,
  Menu,
  X,
  Home,
  Calendar,
  BarChart2,
  List,
  Users,
  CheckCircle,
  Clock,
  LayoutGrid,
  SearchIcon,
} from "lucide-react";
import { showNotification } from "@/app/lib/notifications";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";

export default function NavMenu() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New task assigned",
      message: "UI Design task was assigned to you",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Task deadline approaching",
      message: 'Complete "API Integration" within 2 days',
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "Task completed",
      message: 'Mark completed the "Wireframe Design" task',
      time: "3 hours ago",
      read: true,
    },
  ]);

  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Regular menu items
  const publicMenuItems = [
    { name: "Home", path: "/", icon: <Home size={18} /> },
  ];

  // Menu items that require authentication
  const protectedMenuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <BarChart2 size={18} /> },
    { name: "Tasks", path: "/tasks", icon: <List size={18} /> },
    // { name: "Projects", path: "/projects", icon: <Users size={18} /> },
    { name: "Calendar", path: "/calendar", icon: <Calendar size={18} /> },
  ];

  // Get the menu items based on authentication status
  const menuItems = isSignedIn
    ? [...publicMenuItems, ...protectedMenuItems]
    : publicMenuItems;

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isNotificationsOpen &&
        !target.closest("[data-notification-container]")
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const handleNotificationClick = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setNotificationCount(0);
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setNotificationCount((prev) => Math.max(0, prev - 1));
  };

  const showTestNotification = () => {
    showNotification(
      "Test Notification",
      "This is a test notification to demonstrate functionality!",
      "info"
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Desktop Menu */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <div className="bg-blue-500 dark:bg-blue-600 rounded-full p-2 mr-2">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                TaskManager
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            {isLoaded && isSignedIn && (
              <>
                {/* Search bar */}
               

                {/* View mode toggle - Only show on tasks page */}
                {pathname === "/tasks" && (
                  <div className="hidden sm:flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                    <button
                      onClick={() => router.push("/tasks?view=kanban")}
                      className={`p-2 ${
                        !pathname.includes("view=list")
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                      title="Kanban View"
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      onClick={() => router.push("/tasks?view=list")}
                      className={`p-2 ${
                        pathname.includes("view=list")
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                      title="List View"
                    >
                      <List size={18} />
                    </button>
                  </div>
                )}

                {/* Notifications */}
                <div className="relative" data-notification-container>
                  <button
                    onClick={handleNotificationClick}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md relative"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {notificationCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20 border border-gray-200 dark:border-gray-700">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          Notifications
                        </h3>
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Mark all as read
                        </button>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-6 px-4 text-center text-gray-500 dark:text-gray-400">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                                !notification.read
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                  {notification.read ? (
                                    <CheckCircle
                                      size={16}
                                      className="text-green-500 mt-1"
                                    />
                                  ) : (
                                    <Clock
                                      size={16}
                                      className="text-blue-500 mt-1"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium ${
                                      notification.read
                                        ? "text-gray-700 dark:text-gray-300"
                                        : "text-gray-900 dark:text-gray-100"
                                    }`}
                                  >
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      {notification.time}
                                    </span>
                                    {!notification.read && (
                                      <button
                                        onClick={() =>
                                          markAsRead(notification.id)
                                        }
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800"
                                      >
                                        Mark as read
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={showTestNotification}
                          className="w-full py-2 px-3 text-sm text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          Test Notification
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* User authentication */}
            <ThemeToggle />
            <div className="ml-2">
              {isLoaded &&
                (isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <div className="flex items-center gap-2">
                    <SignInButton mode="modal">
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <Link href="/sign-up">
                      <button className="px-4 py-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium shadow-sm transition-colors">
                        Sign Up
                      </button>
                    </Link>
                  </div>
                ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-1 px-2 pb-3">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.path
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}

              {!isSignedIn && (
                <div className="flex flex-col gap-2 mt-4 px-3">
                  <SignInButton mode="modal">
                    <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <Link href="/sign-up" className="w-full">
                    <button className="w-full py-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium shadow-sm transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
