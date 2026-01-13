// src/app/api/floors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFloors, addFloor, deleteFloor } from '@/lib/db/floors';
import { addActivityLog } from '@/lib/db/activity-logs';
import { getStaffByEmail } from '@/lib/db/staff';

export const runtime = 'nodejs';

async function getActorId(email?: string) {
    if (!email || email === "system") return null;
    const user = await getStaffByEmail(email);
    return user ? Number(user.id) : null;
}

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
        const { name, userEmail } = await request.json();
        if (!name) {
            return NextResponse.json({ message: 'Floor name is required' }, { status: 400 });
        }
        const createdFloorName = await addFloor(name);
        const actorId = await getActorId(userEmail);

        await addActivityLog(
            actorId,
            'FLOOR_CREATE',
            `Created new floor: ${createdFloorName}`,
            createdFloorName,
            { name: createdFloorName }
        );

        return NextResponse.json({ name: createdFloorName }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add floor', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        const userEmail = searchParams.get('userEmail');
        if (!name) {
            return NextResponse.json({ message: 'Name query parameter is required' }, { status: 400 });
        }
        await deleteFloor(name);
        const actorId = await getActorId(userEmail || undefined);

        await addActivityLog(
            actorId,
            'FLOOR_DELETE',
            `Deleted floor: ${name}`,
            name
        );

        return NextResponse.json({ message: 'Floor deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to delete floor', error: error.message }, { status: 500 });
    }
}
