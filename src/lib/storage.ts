// This file is no longer used for primary data storage.
// It is being kept for its settings management and backup history logic,
// which still rely on localStorage. The main AppData structure is now obsolete.

"use client"

import { type Settings } from '@/context/settings-context';

const SETTINGS_KEY = 'loungeos_settings';
const BACKUP_HISTORY_KEY = 'loungeos_backup_history';
const MAX_BACKUPS_RETAINED = 5;

// The full AppData type is no longer needed here as data is in SQLite.
// We only manage settings and backup history via localStorage.
export type AppData = {
  settings: Settings;
  lastBackup?: string;
};

const getInitialSettings = (): Settings => ({
    platformName: 'LoungeOS',
    platformLogo: '',
    organizationName: 'LoungeOS Inc.',
    contactAddress: '123 Tech Street, Silicon Valley',
    contactPhone: '+1 234 567 890',
    activeTheme: 'Default',
    themes: [
        {
            name: "Default",
            colors: {
                primary: "#E11D48",
                background: "#09090B",
                accent: "#27272A",
            }
        }
    ],
    receiptHeader: "Welcome to our establishment!",
    receiptFooter: "Thank you for your visit! Come again!",
    receiptShowWaiter: true,
    receiptCustomFields: [
        { label: 'NIU', value: 'P123456789012' },
    ],
    receiptLineSpacing: 1.5,
    receiptFont: 'mono',
    loginCarouselImages: [
        'https://placehold.co/1920x1080.png'
    ]
});


export const getSettings = (): Settings => {
    if (typeof window === 'undefined') {
        return getInitialSettings();
    }

    try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (!storedSettings) {
            const initialSettings = getInitialSettings();
            setSettings(initialSettings);
            return initialSettings;
        }
        
        const data = JSON.parse(storedSettings);
        const defaultData = getInitialSettings();
        let needsUpdate = false;
        
        for (const key of Object.keys(defaultData) as Array<keyof Settings>) {
            if (!data.hasOwnProperty(key)) {
                (data as any)[key] = (defaultData as any)[key];
                needsUpdate = true;
            }
        }

        if(needsUpdate) {
            setSettings(data);
        }

        return data;

    } catch (error) {
        console.error("Error getting settings from storage:", error);
        return getInitialSettings();
    }
};

export const setSettings = (settings: Settings) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Error setting settings in storage:", error);
    }
};


// Backup History Management
export const getBackupHistory = (): any[] => {
    if (typeof window === 'undefined') return [];
    const history = localStorage.getItem(BACKUP_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
};

export const saveBackupHistory = (newBackup: any): any[] => {
    if (typeof window === 'undefined') return [];
    const history = getBackupHistory();
    const updatedHistory = [newBackup, ...history].slice(0, MAX_BACKUPS_RETAINED);
    localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
};
