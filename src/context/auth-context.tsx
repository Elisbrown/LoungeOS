
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { StaffRole } from './staff-context';

export type User = {
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
  const router = useRouter();
  const pathname = usePathname();

  const handleRedirects = useCallback((currentUser: User | null, currentPath: string) => {
    if (currentUser) {
      if (currentUser.force_password_change === 1 && currentPath !== '/password-reset') {
        router.push('/password-reset');
      } else if (currentPath === '/password-reset' && currentUser.force_password_change !== 1) {
        router.push(getLandingPageRouteForRole(currentUser.role));
      } else if (['/login', '/forgot-password', '/'].includes(currentPath)) {
        router.push(getLandingPageRouteForRole(currentUser.role));
      }
    } else {
      if (currentPath !== '/login' && currentPath !== '/forgot-password' && currentPath !== '/password-reset') {
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('loungeos-user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (parsedUser && parsedUser.hireDate) {
        parsedUser.hireDate = new Date(parsedUser.hireDate);
      }
      
      if (user?.email !== parsedUser?.email) {
          setUser(parsedUser);
      }
      handleRedirects(parsedUser, pathname);
    } catch (e) {
        console.error("Failed to parse user from session storage", e);
        sessionStorage.removeItem('loungeos-user');
        handleRedirects(null, pathname);
    }
  }, [pathname, handleRedirects, user?.email]);

  const login = (userData: User) => {
    // Directly set the user state and session storage without an extra fetch
    const userToStore = {
        ...userData,
        hireDate: userData.hireDate ? new Date(userData.hireDate).toISOString() : undefined
    };
    setUser(userData);
    sessionStorage.setItem('loungeos-user', JSON.stringify(userToStore));
    handleRedirects(userData, pathname);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('loungeos-user');
    router.push('/login');
  };

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
