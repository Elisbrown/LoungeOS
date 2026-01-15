
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { StaffRole } from './staff-context';

export type User = {
  id: string | number;
  name: string;
  email: string;
  role: StaffRole;
  floor?: string;
  avatar?: string;
  force_password_change?: number; // 1 for true, 0 for false
  hireDate?: Date | string;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getLandingPageRouteForRole = (role: StaffRole): string => {
    switch (role) {
        case "Manager":
        case "Super Admin":
            return "/dashboard";
        case "Waiter":
            return "/dashboard/tables";
        case "Chef":
            return "/dashboard/kitchen";
        case "Bartender":
            return "/dashboard/bar";
        case "Cashier":
            return "/dashboard/orders";
        case "Accountant":
            return "/dashboard/accounting";
        case "Stock Manager":
            return "/dashboard/inventory";
        default:
            return "/dashboard";
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleRedirects = useCallback((currentUser: User | null, currentPath: string, setupStatus: boolean | null) => {
    if (setupStatus === false && currentPath !== '/setup') {
      router.push('/setup');
      return;
    }
    
    if (setupStatus === true && currentPath === '/setup') {
      router.push('/login');
      return;
    }

    if (currentUser) {
      if (currentUser.force_password_change === 1 && currentPath !== '/password-reset') {
        router.push('/password-reset');
      } else if (currentPath === '/password-reset' && currentUser.force_password_change !== 1) {
        router.push(getLandingPageRouteForRole(currentUser.role));
      } else if (['/login', '/forgot-password', '/', '/setup'].includes(currentPath)) {
        router.push(getLandingPageRouteForRole(currentUser.role));
      }
    } else {
      if (!['/login', '/forgot-password', '/password-reset', '/setup'].includes(currentPath)) {
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    const checkSetupAndUser = async () => {
        try {
          // Check setup status
          const setupRes = await fetch('/api/auth/setup-check');
          const setupData = await setupRes.json();
          setIsSetup(setupData.isSetup);

          const storedUser = sessionStorage.getItem('loungeos-user');
          const parsedUser = storedUser ? JSON.parse(storedUser) : null;
          if (parsedUser && parsedUser.hireDate) {
            parsedUser.hireDate = new Date(parsedUser.hireDate);
          }
          
          if (user?.email !== parsedUser?.email) {
              setUser(parsedUser);
          }
          handleRedirects(parsedUser, pathname, setupData.isSetup);
        } catch (e) {
            console.error("Failed to check setup or user session", e);
            handleRedirects(null, pathname, isSetup);
        }
    };

    checkSetupAndUser();
  }, [pathname, handleRedirects, user?.email]);

  const login = (userData: User) => {
    // Directly set the user state and session storage without an extra fetch
    const userToStore = {
        ...userData,
        hireDate: userData.hireDate ? new Date(userData.hireDate).toISOString() : undefined
    };
    setUser(userData);
    sessionStorage.setItem('loungeos-user', JSON.stringify(userToStore));
    handleRedirects(userData, pathname, isSetup);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('loungeos-user');
    router.push('/login');
  };

  // Session Timeout Logic (30 minutes)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (user) {
          timeoutId = setTimeout(() => {
            console.log("Session expired due to inactivity");
            logout();
          }, SESSION_TIMEOUT);
      }
    };

    const handleUserActivity = () => {
      resetTimer();
    };

    if (user) {
        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);
        window.addEventListener('click', handleUserActivity);
        window.addEventListener('scroll', handleUserActivity);
        
        // Initial timer start
        resetTimer();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [user, logout]); // Re-run when user changes (login/logout)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
