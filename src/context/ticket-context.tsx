"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Ticket } from '@/lib/db/tickets';

type TicketContextType = {
  tickets: Ticket[];
  loading: boolean;
  addTicket: (ticketData: any) => Promise<void>;
  updateTicket: (id: number, ticketData: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: number) => Promise<void>;
  fetchTickets: () => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const addTicket = useCallback(async (ticketData: any) => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      
      if (response.ok) {
        await fetchTickets();
      }
    } catch (error) {
      console.error('Failed to add ticket:', error);
      throw error;
    }
  }, [fetchTickets]);

  const updateTicket = useCallback(async (id: number, ticketData: Partial<Ticket>) => {
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      
      if (response.ok) {
        await fetchTickets();
      }
    } catch (error) {
      console.error('Failed to update ticket:', error);
      throw error;
    }
  }, [fetchTickets]);
  
  const deleteTicket = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchTickets();
      }
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      throw error;
    }
  }, [fetchTickets]);

  return (
    <TicketContext.Provider value={{ tickets, loading, addTicket, updateTicket, deleteTicket, fetchTickets }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

// Re-export Ticket type for convenience
export type { Ticket } from '@/lib/db/tickets';
