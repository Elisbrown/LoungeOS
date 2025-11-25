
// src/app/api/floors/route.ts
import { NextResponse } from 'next/server';
import { getFloors, addFloor, deleteFloor } from '@/lib/db/floors';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const floors = await getFloors();
        return NextResponse.json(floors);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch floors', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ message: 'Floor name is required' }, { status: 400 });
        }
        const newFloor = await addFloor(name);
        return NextResponse.json(newFloor, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add floor', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        if (!name) {
            return NextResponse.json({ message: 'Name query parameter is required' }, { status: 400 });
        }
        await deleteFloor(name);
        return NextResponse.json({ message: 'Floor deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to delete floor', error: error.message }, { status: 500 });
    }
}
