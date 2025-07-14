
// src/app/api/tickets/comments/route.ts
import { NextResponse } from 'next/server';
import { addComment } from '@/lib/db/tickets';

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'Ticket ID query parameter is required' }, { status: 400 });
        }
        const commentData = await request.json();
        const updatedTicket = await addComment(id, commentData);
        return NextResponse.json(updatedTicket, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add comment', error: error.message }, { status: 500 });
    }
}
