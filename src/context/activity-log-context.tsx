// New context for logging user activities
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from './auth-context';
import type { User } from './auth-context';

export type ActivityLog = {
    id: number;
    user_id: number | null;
    action: string;
    details: string | null;
    timestamp: string;
    user?: {
        name: string;
        email: string;
        avatar: string;
    };
};

type ActivityLogContextType = {
    logs: ActivityLog[];
    logActivity: (action: string, details: string) => void;
    clearLogs: () => void;
    fetchLogs: () => Promise<void>;
};

export const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export const ActivityLogProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    const fetchLogs = useCallback(async () => {
        try {
            const response = await fetch('/api/activity-logs');
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            } else {
                console.error('Failed to fetch activity logs');
            }
        } catch (error) {
            console.error('Error fetching activity logs:', error);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const logActivity = useCallback(async (action: string, details: string) => {
        if (!user) return; // Only log if a user is signed in

        try {
            // For now, we'll log without user ID to avoid circular dependency
            // The user information will be available in the logs through the user object
            const response = await fetch('/api/activity-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: null, // We'll get this from the backend using email
                    action, 
                    details,
                    userEmail: user.email // Pass email to backend
                })
            });

            if (response.ok) {
                // Refresh logs after adding new one
                await fetchLogs();
            } else {
                console.error('Failed to log activity');
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }, [user, fetchLogs]);

    const clearLogs = useCallback(async () => {
        try {
            const response = await fetch('/api/activity-logs', {
                method: 'DELETE'
            });

            if (response.ok) {
                setLogs([]);
            } else {
                console.error('Failed to clear activity logs');
            }
        } catch (error) {
            console.error('Error clearing activity logs:', error);
        }
    }, []);

    return (
        <ActivityLogContext.Provider value={{ logs, logActivity, clearLogs, fetchLogs }}>
            {children}
        </ActivityLogContext.Provider>
    );
};

export const useActivityLog = () => {
    const context = useContext(ActivityLogContext);
    if (context === undefined) {
        throw new Error('useActivityLog must be used within an ActivityLogProvider');
    }
    return context;
};
