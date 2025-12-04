"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check } from "lucide-react";
import { usePomodoroStore, useThemeStore } from "@/lib/stores";
import useSound from "use-sound";
import {
  NOTIFICATION_SOUND,
  STORAGE_KEYS,
  DEFAULT_NOTIFICATION_VOLUME,
} from "@/lib/sounds";

// Helper to safely access localStorage
function getStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

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
      tag: "task-reminder-" + Date.now(),
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

// Check if reminder time has passed (within a 60 second window to avoid missing reminders)
function shouldTriggerReminder(reminderTimeStr: string): boolean {
  const reminderTime = new Date(reminderTimeStr);
  const now = new Date();
  const nowTimestamp = now.getTime();
  const reminderTimestamp = reminderTime.getTime();
  
  // Trigger if current time is at or past the reminder time (within 60 second window)
  return nowTimestamp >= reminderTimestamp && nowTimestamp - reminderTimestamp < 60000;
}

interface PendingReminder {
  taskId: string;
  taskText: string;
}

export default function TaskReminderNotification() {
  const tasks = usePomodoroStore((state) => state.tasks);
  const markTaskNotified = usePomodoroStore((state) => state.markTaskNotified);
  const permissionRequested = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const theme = useThemeStore((state) => state.theme);
  const isSpooky = theme === "spooky";
  
  // Pending reminder for in-app notification popup
  const [pendingReminder, setPendingReminder] = useState<PendingReminder | null>(null);
  
  // Get notification volume from localStorage
  const [notificationVolume] = useState(() =>
    getStoredValue(STORAGE_KEYS.NOTIFICATION_VOLUME, DEFAULT_NOTIFICATION_VOLUME)
  );

  const [playNotification, { stop: stopNotification }] = useSound(NOTIFICATION_SOUND, {
    volume: notificationVolume,
  });

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
        if (shouldTriggerReminder(task.reminder.time)) {
          // Show browser notification
          showBrowserNotification(
            isSpooky ? "Dark Deed Reminder" : "Task Reminder",
            task.text,
            () => window.focus()
          );
          
          // Show in-app notification popup and play sound
          setPendingReminder({ taskId: task.id, taskText: task.text });
          playNotification();
          
          // Mark as notified
          markTaskNotified(task.id);
        }
      }
    });
  }, [tasks, markTaskNotified, isSpooky, playNotification]);

  // Check reminders every 10 seconds
  useEffect(() => {
    checkReminders(); // Check immediately
    
    checkIntervalRef.current = setInterval(checkReminders, 10000);
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkReminders]);

  // Dismiss handler
  const handleDismiss = useCallback(() => {
    stopNotification();
    setPendingReminder(null);
  }, [stopNotification]);

  // Render in-app notification popup (similar to PomodoroNotification)
  return (
    <AnimatePresence>
      {pendingReminder && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className={`rounded-2xl shadow-2xl overflow-hidden ${
            isSpooky ? "bg-[#1a1625] border border-purple-500/30" : "bg-[#171d2b]"
          } text-white`}>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isSpooky ? "bg-purple-500/20" : "bg-white/10"
                }`}>
                  <Bell size={20} className={isSpooky ? "text-purple-300" : "text-white"} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-sora font-semibold text-base mb-1 ${
                    isSpooky ? "text-purple-100" : "text-white"
                  }`}>
                    {isSpooky ? "Dark Deed Reminder" : "Task Reminder"}
                  </h3>
                  <p className={`text-sm ${isSpooky ? "text-purple-300/70" : "text-white/70"}`}>
                    {pendingReminder.taskText}
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                    isSpooky ? "hover:bg-purple-500/20" : "hover:bg-white/10"
                  }`}
                  aria-label="Dismiss"
                >
                  <X size={18} className={isSpooky ? "text-purple-300/60" : "text-white/60"} />
                </button>
              </div>
            </div>
            <div className={`flex border-t ${isSpooky ? "border-purple-500/20" : "border-white/10"}`}>
              <button
                onClick={handleDismiss}
                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  isSpooky 
                    ? "bg-purple-500/10 hover:bg-purple-500/20 text-purple-100" 
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <Check size={14} />
                Got it
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to check notification permission status
export function useNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}
