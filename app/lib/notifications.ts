import { toast } from 'sonner';

// Check if the browser supports notifications
const areNotificationsSupported = () => 
  typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;

// Request permission for notifications
export async function requestNotificationPermission() {
  if (!areNotificationsSupported()) {
    console.warn('Notifications are not supported in this browser');
    showFallbackNotification('Notifications', 'Notifications are not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return true;
    } else if (permission === 'denied') {
      showFallbackNotification('Notifications', 'Notification permission denied');
    } else {
      showFallbackNotification('Notifications', 'Please enable notifications for better experience');
    }
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    showFallbackNotification('Error', 'Could not request notification permission');
    return false;
  }
}

// Check if notification permission is granted
export function hasNotificationPermission() {
  if (!areNotificationsSupported()) return false;
  return Notification.permission === 'granted';
}

// Schedule a reminder for a task
export function scheduleTaskReminder(title: string, dueDate: Date) {
  // Calculate time until 15 minutes before due date
  const now = new Date();
  const reminderTime = new Date(dueDate.getTime() - 15 * 60 * 1000); // 15 minutes before
  
  // If the reminder time is in the past, don't schedule it
  if (reminderTime <= now) return;
  
  // Calculate the delay in milliseconds
  const delay = reminderTime.getTime() - now.getTime();
  
  // Schedule the notification
  setTimeout(() => {
    sendTaskReminder(title, dueDate);
  }, delay);
}

// Send a reminder notification
export function sendTaskReminder(title: string, dueDate: Date) {
  const notificationTitle = 'Task Reminder';
  const notificationOptions = {
    body: `"${title}" is due in 15 minutes`,
    icon: '/icons/icon-192x192.png', // Add your app icon path
    badge: '/icons/badge-72x72.png', // Add a badge icon path
    tag: `task-${dueDate.getTime()}`, // Unique tag to prevent duplicate notifications
    requireInteraction: true, // Notification persists until user interacts with it
    vibrate: [100, 50, 100], // Vibration pattern
    actions: [
      {
        action: 'view',
        title: 'View Task',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      }
    ]
  };

  // Try to use the web Notification API first
  if (hasNotificationPermission()) {
    try {
      // Show the notification
      const notification = new Notification(notificationTitle, notificationOptions);
      
      // Add event listeners
      notification.onclick = function() {
        // Focus on the window when the notification is clicked
        window.focus();
        notification.close();
      };
      
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      showFallbackNotification(notificationTitle, notificationOptions.body);
      return false;
    }
  } else {
    // Use fallback if permission not granted
    showFallbackNotification(notificationTitle, notificationOptions.body);
    return false;
  }
}

// Fallback notification using toast
export function showFallbackNotification(title: string, message: string = '', type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  const toastFn = toast[type] || toast.info;
  
  toastFn(message ? `${title}: ${message}` : title, {
    duration: 10000, // 10 seconds
    position: 'top-center',
    action: {
      label: 'Dismiss',
      onClick: () => {
        // Dismiss action
      }
    },
  });
}

// Register service worker for notifications (call this on app initialization)
export async function registerNotificationServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    showFallbackNotification('Error', 'Could not register service worker for notifications');
    return false;
  }
}

export function showNotification(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
  // Try native notification first
  if (hasNotificationPermission()) {
    try {
      const notification = new Notification(title, {
        body: message,
        icon: '/icons/icon-192x192.png',
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (_err) {
      // Fall back to toast
      showFallbackNotification(title, message, type);
    }
  } else {
    // Fall back to toast
    showFallbackNotification(title, message, type);
  }
} 