
// New context for managing global application settings
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getSettings, setSettings } from '@/lib/storage';
import { hexToHsl } from '@/lib/utils';

type ThemeColor = {
    primary: string; // HEX
    background: string; // HEX
    accent: string; // HEX
}

type Theme = {
    name: string;
    colors: ThemeColor;
}

export type ReceiptField = {
    label: string;
    value: string;
}

export type Settings = {
    platformName: string;
    platformLogo: string;
    organizationName: string;
    contactAddress: string;
    contactPhone: string;
    activeTheme: string;
    themes: Theme[];
    receiptHeader: string;
    receiptFooter: string;
    receiptShowWaiter: boolean;
    receiptCustomFields: ReceiptField[];
    receiptLineSpacing: number;
    receiptFont: 'mono' | 'sans' | 'serif';
    loginCarouselImages?: string[];
};

type SettingsContextType = {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    addTheme: (theme: Theme) => void;
    deleteTheme: (themeName: string) => void;
    applyTheme: (themeName: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettingsState] = useState<Settings>(() => {
        // Use the correct function to get settings
        return getSettings();
    });

    const handleSetSettings = useCallback((newSettings: Settings) => {
        setSettingsState(newSettings);
        // Use the correct function to save settings
        setSettings(newSettings);
    }, []);

    const updateSetting = useCallback(<K extends keyof Settings,>(key: K, value: Settings[K]) => {
        const newSettings = { ...settings, [key]: value };
        handleSetSettings(newSettings);
    }, [settings, handleSetSettings]);
    
    const addTheme = useCallback((theme: Theme) => {
        const newSettings = { ...settings, themes: [...settings.themes, theme] };
        handleSetSettings(newSettings);
    }, [settings, handleSetSettings]);

    const deleteTheme = useCallback((themeName: string) => {
        if (themeName === "Default") return; // Cannot delete default theme
        const newSettings = {
            ...settings,
            themes: settings.themes.filter(t => t.name !== themeName),
            activeTheme: settings.activeTheme === themeName ? "Default" : settings.activeTheme
        };
        handleSetSettings(newSettings);
    }, [settings, handleSetSettings]);
    
    const applyTheme = useCallback((themeName: string) => {
        updateSetting('activeTheme', themeName);
    }, [updateSetting]);

    useEffect(() => {
        // This effect ensures that if data is loaded from storage after initial render,
        // the context state is updated.
        const data = getSettings();
        setSettingsState(data);
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, setSettings: handleSetSettings, updateSetting, addTheme, deleteTheme, applyTheme }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

// This component ensures the theme is applied on the client side after hydration
export function SettingsInitializer() {
    const { settings } = useSettings();
    
    useEffect(() => {
        const activeTheme = settings.themes.find(t => t.name === settings.activeTheme);
        if (activeTheme) {
            const root = document.documentElement;
            root.style.setProperty('--theme-primary', hexToHsl(activeTheme.colors.primary));
            root.style.setProperty('--theme-background', hexToHsl(activeTheme.colors.background));
            root.style.setProperty('--theme-accent', hexToHsl(activeTheme.colors.accent));
        }
    }, [settings.activeTheme, settings.themes]);

    return null;
}
