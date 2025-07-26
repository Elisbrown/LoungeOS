// New context for logging user activities
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from './auth-context';
import type { User } from './auth-context';

export type ActivityLog = {
    id: string;
    user: {
        name: string;
        email: string;
        avatar: string;
    };
    action: string;
    details: string;
    timestamp: string; // Use ISO string for serialization
};

type ActivityLogContextType = {
    logs: ActivityLog[];
    logActivity: (action: string, details: string) => void;
    clearLogs: () => void;
};

const ACTIVITY_LOG_STORAGE_KEY = 'loungeos_activity_logs';
const MAX_LOGS = 1000; // Keep only the last 1000 logs

export const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export const ActivityLogProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<ActivityLog[]>(() => {
        if (typeof window === 'undefined') {
            return [];
        }
        const saved = localStorage.getItem(ACTIVITY_LOG_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const fetchLogs = useCallback(async () => {
        // In a real app with a DB, this would fetch from an API route.
        // For now, we'll keep it in localStorage for persistence.
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Save logs to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(ACTIVITY_LOG_STORAGE_KEY, JSON.stringify(logs));
        }
    }, [logs]);

    const logActivity = useCallback((action: string, details: string) => {
        if (!user) return; // Only log if a user is signed in

        const newLog: ActivityLog = {
            id: `log_${Date.now()}_${Math.random()}`,
            user: {
                name: user.name,
                email: user.email,
                avatar: user.avatar || "https://placehold.co/100x100.png"
            },
            action,
            details,
            timestamp: new Date().toISOString(),
        };

        setLogs(prev => {
            const newLogs = [newLog, ...prev];
            // Keep only the last MAX_LOGS entries
            return newLogs.slice(0, MAX_LOGS);
        });

        // In a real app, this would be an API call
        // fetch('/api/activity', { method: 'POST', body: JSON.stringify(newLog) });

    }, [user]);

    const clearLogs = useCallback(() => {
        setLogs([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(ACTIVITY_LOG_STORAGE_KEY);
        }
    }, []);

    return (
        <ActivityLogContext.Provider value={{ logs, logActivity, clearLogs }}>
            {children}
        </ActivityLogContext.Provider>
    );
};
