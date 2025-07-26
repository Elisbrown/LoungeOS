
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast"

export type TicketPriority = "Low" | "Medium" | "High" | "Urgent"
export type TicketCategory = "IT Support" | "Maintenance" | "Inventory Request" | "HR Issue"
export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed"

export type TicketComment = {
    authorId: string;
    authorName: string;
    text: string;
    timestamp: Date;
}

export type Ticket = {
  id: string
  title: string
  description: string
  priority: TicketPriority
  category: TicketCategory
  status: TicketStatus
  creatorId: string
  creatorName: string
  assignee?: {
    id: string
    name: string
  }
  timestamp: Date
  lastUpdated: Date
  comments: TicketComment[]
}

type TicketContextType = {
  tickets: Ticket[]
  addTicket: (ticket: Omit<Ticket, 'id' | 'timestamp' | 'lastUpdated' | 'status' | 'assignee' | 'comments'>) => Promise<void>;
  updateTicket: (updatedTicket: Ticket) => Promise<void>;
  addComment: (ticketId: string, comment: TicketComment) => Promise<void>;
  fetchTickets: () => Promise<void>;
}


const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { toast } = useToast()
  
  const fetchTickets = useCallback(async () => {
    const response = await fetch('/api/tickets');
    if (response.ok) {
        const data = await response.json();
        setTickets(data.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp),
            lastUpdated: new Date(t.lastUpdated || t.timestamp),
            comments: t.comments.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp)}))
        })));
    } else {
        console.error("Failed to fetch tickets");
    }
  }, []);
  
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets])

  const addTicket = useCallback(async (ticketData: Omit<Ticket, 'id' | 'timestamp' | 'lastUpdated' | 'status' | 'assignee'| 'comments'>) => {
    await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
    });
    await fetchTickets();
  }, [fetchTickets])

  const updateTicket = useCallback(async (updatedTicketData: Ticket) => {
    const ticketWithUpdatedTime = {
      ...updatedTicketData,
      lastUpdated: new Date()
    };
    
    await fetch(`/api/tickets?id=${updatedTicketData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketWithUpdatedTime)
    });
    await fetchTickets();
    toast({
        title: "Ticket Updated",
        description: `Ticket #${updatedTicketData.id} has been updated.`,
    })
  }, [fetchTickets, toast])
  
  const addComment = useCallback(async (ticketId: string, comment: TicketComment) => {
    await fetch(`/api/tickets/comments?id=${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
    });
    await fetchTickets();
     toast({
        title: "Comment Added",
        description: `Your comment has been added to ticket #${ticketId}.`,
    })
  }, [fetchTickets, toast])

  return (
    <TicketContext.Provider value={{ tickets, addTicket, updateTicket, addComment, fetchTickets }}>
      {children}
    </TicketContext.Provider>
  )
}

export const useTickets = () => {
  const context = useContext(TicketContext)
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider')
  }
  return context
}
