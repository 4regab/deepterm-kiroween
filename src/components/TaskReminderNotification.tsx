"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePomodoroStore } from "@/lib/stores";

// Request browser notification permission
function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return Promise.resolve("denied" as NotificationPermission);
  }
  if (Notification.permission === "granted") {
    return Promise.resolve("granted");
  }
  if (Notification.permission !== "denied") {
    return Notification.requestPermission();
  }
  return Promise.resolve(Notification.permission);
}

// Show browser notification
function showBrowserNotification(title: string, body: string, onClick?: () => void) {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: "/favicon-32x32.png",
      badge: "/favicon-16x16.png",
      tag: "task-reminder",
      requireInteraction: true,
    });
    
    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }
    
    // Auto-close after 30 seconds
    setTimeout(() => notification.close(), 30000);
  }
}

// Parse HH:mm time string to today's Date
function parseTimeToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  return date;
}

// Check if time has passed
function hasTimePassed(timeStr: string): boolean {
  const reminderDate = parseTimeToDate(timeStr);
  return new Date() >= reminderDate;
}

export default function TaskReminderNotification() {
  const tasks = usePomodoroStore((state) => state.tasks);
  const markTaskNotified = usePomodoroStore((state) => state.markTaskNotified);
  const permissionRequested = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request permission on mount
  useEffect(() => {
    if (!permissionRequested.current) {
      permissionRequested.current = true;
      requestNotificationPermission();
    }
  }, []);

  const checkReminders = useCallback(() => {
    tasks.forEach((task) => {
      if (
        task.reminder &&
        task.reminder.enabled &&
        task.reminder.time &&
        !task.reminder.notified &&
        !task.completed
      ) {
        if (hasTimePassed(task.reminder.time)) {
          showBrowserNotification(
            "Task Reminder",
            task.text,
            () => {
              // Focus window when notification clicked
              window.focus();
            }
          );
          markTaskNotified(task.id);
        }
      }
    });
  }, [tasks, markTaskNotified]);

  // Check reminders every 30 seconds
  useEffect(() => {
    checkReminders(); // Check immediately
    
    checkIntervalRef.current = setInterval(checkReminders, 30000);
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkReminders]);

  // This component doesn't render anything visible
  return null;
}

// Hook to check notification permission status
export function useNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

// Hook to request permission
export function useRequestNotificationPermission() {
  return useCallback(async () => {
    const permission = await requestNotificationPermission();
    return permission;
  }, []);
}
