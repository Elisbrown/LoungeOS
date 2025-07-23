
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

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

  const addStaff = useCallback(async (member: Omit<StaffMember, 'id' | 'status' | 'avatar'>) => {
    await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member)
    });
    await fetchStaff();
  }, [fetchStaff]);

  const updateStaff = useCallback(async (email: string, updatedMember: Partial<StaffMember>) => {
    await fetch(`/api/staff?email=${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMember)
    });
    await fetchStaff();
  }, [fetchStaff]);

  const deleteStaff = useCallback(async (email: string) => {
     await fetch(`/api/staff?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
    });
    await fetchStaff();
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
