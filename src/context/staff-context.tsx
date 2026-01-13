"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from './auth-context';
import { useToast } from "@/hooks/use-toast";

export type StaffRole = "Super Admin" | "Manager" | "Accountant" | "Stock Manager" | "Chef" | "Waiter" | "Cashier" | "Bartender";

export type StaffMember = {
  id: string; // Add ID from DB
  name: string
  email: string
  role: StaffRole
  status: "Active" | "Away" | "Inactive"
  avatar: string
  floor?: string
  phone?: string
  hireDate?: Date,
  force_password_change?: number // 1 for true, 0 for false
  emergency_contact_name?: string
  emergency_contact_relationship?: string
  emergency_contact_phone?: string
}

type StaffContextType = {
  staff: StaffMember[];
  addStaff: (staffMember: Omit<StaffMember, 'id' | 'status' | 'avatar'>) => Promise<void>;
  updateStaff: (email: string, updatedStaff: Partial<StaffMember>) => Promise<void>;
  deleteStaff: (email: string) => Promise<void>;
  bulkDeleteStaff: (emails: string[]) => Promise<void>;
  bulkUpdateStaffStatus: (emails: string[], status: "Active" | "Away" | "Inactive") => Promise<void>;
  fetchStaff: () => Promise<void>;
};

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider = ({ children }: { children: ReactNode }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

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
      const errorData = await response.json();
      console.error("Failed to add staff member:", errorData.message || errorData.error);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorData.message || "Failed to add staff member. Please check if the email is unique.",
      });
    }
  }, [fetchStaff, user?.email, toast]);

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
      const errorData = await response.json();
      console.error("Failed to update staff member:", errorData.message || errorData.error);
      toast({
        variant: "destructive",
        title: "Update Error",
        description: errorData.message || "Failed to update staff member.",
      });
    }
  }, [fetchStaff, user?.email, toast]);

  const deleteStaff = useCallback(async (email: string) => {
    const response = await fetch(`/api/staff?email=${encodeURIComponent(email)}&userEmail=${encodeURIComponent(user?.email || '')}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await fetchStaff();
    } else {
      const errorData = await response.json();
      console.error("Failed to delete staff member:", errorData.message || errorData.error);
      toast({
        variant: "destructive",
        title: "Delete Error",
        description: errorData.message || "Failed to delete staff member.",
      });
    }
  }, [fetchStaff, toast, user?.email]);

  const bulkDeleteStaff = useCallback(async (emails: string[]) => {
      const response = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              action: 'bulk_delete',
              emails,
              userEmail: user?.email
          })
      });
      if (response.ok) {
          await fetchStaff();
      } else {
          console.error("Failed to bulk delete staff members");
      }
  }, [fetchStaff, user?.email]);

  const bulkUpdateStaffStatus = useCallback(async (emails: string[], status: "Active" | "Away" | "Inactive") => {
      const response = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              action: 'bulk_update_status',
              emails,
              status,
              userEmail: user?.email
          })
      });
      if (response.ok) {
          await fetchStaff();
      } else {
          console.error("Failed to bulk update staff status");
      }
  }, [fetchStaff, user?.email]);

  return (
    <StaffContext.Provider value={{ staff, addStaff, updateStaff, deleteStaff, bulkDeleteStaff, bulkUpdateStaffStatus, fetchStaff }}>
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
