
// src/app/api/tickets/route.ts
import { NextResponse } from 'next/server';
import { getTickets, addTicket, updateTicket } from '@/lib/db/tickets';

export async function GET() {
    try {
        const tickets = await getTickets();
        return NextResponse.json(tickets);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch tickets', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const ticketData = await request.json();
        const newTicket = await addTicket(ticketData);
        return NextResponse.json(newTicket, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add ticket', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'ID query parameter is required' }, { status: 400 });
        }
        const ticketData = await request.json();
        const updatedTicket = await updateTicket({ ...ticketData, id });
        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update ticket', error: error.message }, { status: 500 });
    }
}
