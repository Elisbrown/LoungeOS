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
};

export const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export const ActivityLogProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    const fetchLogs = useCallback(async () => {
        // In a real app with a DB, this would fetch from an API route.
        // For now, we'll keep it in-memory for the session.
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

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

        setLogs(prev => [newLog, ...prev]);

        // In a real app, this would be an API call
        // fetch('/api/activity', { method: 'POST', body: JSON.stringify(newLog) });

    }, [user]);

    return (
        <ActivityLogContext.Provider value={{ logs, logActivity }}>
            {children}
        </ActivityLogContext.Provider>
    );
};
