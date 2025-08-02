
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from './auth-context';

export type StaffRole = "Super Admin" | "Manager" | "Accountant" | "Stock Manager" | "Chef" | "Waiter" | "Cashier" | "Bartender";

export type StaffMember = {
  id: string; // Add ID from DB
  name: string
  email: string
  role: StaffRole
  status: "Active" | "Away"
  avatar: string
  floor?: string
  phone?: string
  hireDate?: Date,
  force_password_change?: number // 1 for true, 0 for false
}

type StaffContextType = {
  staff: StaffMember[];
  addStaff: (staffMember: Omit<StaffMember, 'id' | 'status' | 'avatar'>) => Promise<void>;
  updateStaff: (email: string, updatedStaff: Partial<StaffMember>) => Promise<void>;
  deleteStaff: (email: string) => Promise<void>;
  fetchStaff: () => Promise<void>;
};

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider = ({ children }: { children: ReactNode }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const { user } = useAuth();

  const fetchStaff = useCallback(async () => {
    const response = await fetch('/api/staff');
    const data = await response.json();
    if (response.ok) {
        setStaff(data.map((s: any) => ({...s, hireDate: s.hireDate ? new Date(s.hireDate) : undefined})));
    } else {
        console.error("Failed to fetch staff:", data.message);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff])

  const addStaff = useCallback(async (staffMember: Omit<StaffMember, 'id' | 'status' | 'avatar'>) => {
    const response = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...staffMember,
        userEmail: user?.email // Pass current user's email for activity logging
      })
    });
    
    if (response.ok) {
      await fetchStaff();
    } else {
      console.error("Failed to add staff member");
    }
  }, [fetchStaff, user?.email]);

  const updateStaff = useCallback(async (email: string, updatedStaff: Partial<StaffMember>) => {
    const response = await fetch(`/api/staff?email=${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...updatedStaff,
        userEmail: user?.email // Pass current user's email for activity logging
      })
    });
    
    if (response.ok) {
      await fetchStaff();
    } else {
      console.error("Failed to update staff member");
    }
  }, [fetchStaff, user?.email]);

  const deleteStaff = useCallback(async (email: string) => {
    const response = await fetch(`/api/staff?email=${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await fetchStaff();
    } else {
      console.error("Failed to delete staff member");
    }
  }, [fetchStaff]);

  return (
    <StaffContext.Provider value={{ staff, addStaff, updateStaff, deleteStaff, fetchStaff }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};
