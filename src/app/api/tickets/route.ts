// src/app/api/tickets/route.ts
import { NextResponse } from 'next/server';
import { getTickets, createTicket } from '@/lib/db/tickets';
import { addActivityLog } from '@/lib/db/activity-logs';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        
        const filters = {
            status: searchParams.get('status') || undefined,
            priority: searchParams.get('priority') || undefined,
            category: searchParams.get('category') || undefined,
            assigned_to: searchParams.get('assigned_to') ? Number(searchParams.get('assigned_to')) : undefined,
            created_by: searchParams.get('created_by') ? Number(searchParams.get('created_by')) : undefined,
        };
        
        const tickets = getTickets(filters);
        return NextResponse.json(tickets);
    } catch (error: any) {
        console.error('Failed to fetch tickets:', error);
        return NextResponse.json({ message: 'Failed to fetch tickets', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const ticketData = await request.json();
        
        const newTicket = createTicket({
            title: ticketData.title,
            description: ticketData.description,
            priority: ticketData.priority || 'Medium',
            category: ticketData.category,
            created_by: ticketData.created_by
        });
        
        // Log activity
        await addActivityLog(
            ticketData.created_by,
            'ticket_created',
            `Created ticket: ${newTicket.title}`
        );
        
        return NextResponse.json(newTicket, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create ticket:', error);
        return NextResponse.json({ message: 'Failed to create ticket', error: error.message }, { status: 500 });
    }
}
