"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const NotificationContext = createContext(null);

const DEFAULT_DURATIONS = {
  levelup: 0, // Persistent until dismissed or action taken
  summary: 5000,
  complete: 3000,
  reminder: 8000,
  warning: 8000,
  info: 4000,
};

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef({});

  // Dismiss a specific notification by ID
  const dismissNotification = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all active notifications
  const clearAll = useCallback(() => {
    Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    timersRef.current = {};
    setNotifications([]);
  }, []);

  // Dispatch a new notification
  const showNotification = useCallback(
    ({ type = "info", title, message, action, icon, duration }) => {
      const id = generateId();
      const resolvedDuration =
        duration !== undefined ? duration : DEFAULT_DURATIONS[type] ?? 4000;

      const newNotif = {
        id,
        type,
        title,
        message,
        action,
        icon,
        duration: resolvedDuration,
        timestamp: Date.now(),
      };

      setNotifications((prev) => {
        // Keep max 3 notifications visible at once to avoid screen flooding
        const trimmed = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;
        return [...trimmed, newNotif];
      });

      // Auto-dismiss if duration > 0
      if (resolvedDuration > 0) {
        timersRef.current[id] = setTimeout(() => {
          dismissNotification(id);
        }, resolvedDuration);
      }

      return id;
    },
    [dismissNotification]
  );

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        dismissNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

export default NotificationContext;
