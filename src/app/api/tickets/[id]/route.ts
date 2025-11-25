// src/app/api/tickets/[id]/route.ts
import { NextResponse } from 'next/server';
import { getTicketById, updateTicket, deleteTicket } from '@/lib/db/tickets';
import { addActivityLog } from '@/lib/db/activity-logs';

export const runtime = 'nodejs';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const ticket = getTicketById(Number(params.id));
        
        if (!ticket) {
            return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
        }
        
        return NextResponse.json(ticket);
    } catch (error: any) {
        console.error('Failed to fetch ticket:', error);
        return NextResponse.json({ message: 'Failed to fetch ticket', error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const ticketData = await request.json();
        const ticketId = Number(params.id);
        
        const updatedTicket = updateTicket(ticketId, ticketData);
        
        // Log activity - use creator if no user specified
        const userId = ticketData.user_id || updatedTicket.created_by;
        await addActivityLog(
            userId,
            'ticket_updated',
            `Updated ticket: ${updatedTicket.title}`
        );
        
        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        console.error('Failed to update ticket:', error);
        return NextResponse.json({ message: 'Failed to update ticket', error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const ticketId = Number(params.id);
        
        // Get ticket before deletion for logging
        const ticket = getTicketById(ticketId);
        if (!ticket) {
            return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
        }
        
        const deleted = deleteTicket(ticketId);
        
        if (deleted) {
            // Log activity
            await addActivityLog(
                ticket.created_by,
                'ticket_deleted',
                `Deleted ticket: ${ticket.title}`
            );
            
            return NextResponse.json({ message: 'Ticket deleted successfully' });
        } else {
            return NextResponse.json({ message: 'Failed to delete ticket' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Failed to delete ticket:', error);
        return NextResponse.json({ message: 'Failed to delete ticket', error: error.message }, { status: 500 });
    }
}
