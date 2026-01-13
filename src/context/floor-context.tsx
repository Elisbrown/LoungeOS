
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';

type FloorContextType = {
  floors: string[];
  addFloor: (floorName: string) => Promise<void>;
  deleteFloor: (floorName: string) => Promise<void>;
  fetchFloors: () => Promise<void>;
};

const FloorContext = createContext<FloorContextType | undefined>(undefined);

export const FloorProvider = ({ children }: { children: ReactNode }) => {
  const [floors, setFloors] = useState<string[]>([]);
  const { user } = useAuth();
  
  const fetchFloors = useCallback(async () => {
    const response = await fetch('/api/floors');
    if (response.ok) {
        const data = await response.json();
        setFloors(data);
    } else {
        console.error("Failed to fetch floors");
    }
  }, []);

  useEffect(() => {
    fetchFloors();
  }, [fetchFloors]);

  const addFloor = async (floorName: string) => {
    await fetch('/api/floors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: floorName, userEmail: user?.email })
    });
    await fetchFloors();
  };

  const deleteFloor = async (floorNameToDelete: string) => {
    await fetch(`/api/floors?name=${encodeURIComponent(floorNameToDelete)}&userEmail=${encodeURIComponent(user?.email || '')}`, {
        method: 'DELETE'
    });
    await fetchFloors();
  };

  return (
    <FloorContext.Provider value={{ floors, addFloor, deleteFloor, fetchFloors }}>
      {children}
    </FloorContext.Provider>
  );
};

export const useFloors = () => {
  const context = useContext(FloorContext);
  if (context === undefined) {
    throw new Error('useFloors must be used within a FloorProvider');
  }
  return context;
};
