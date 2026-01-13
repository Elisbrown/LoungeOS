// src/app/api/tables/route.ts
import { NextResponse } from 'next/server';
import { getTables, addTable, updateTable } from '@/lib/db/tables';
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
        const tables = await getTables();
        return NextResponse.json(tables);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch tables', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const tableData = await request.json();
        const newTable = await addTable(tableData);
        const actorId = await getActorId(tableData.userEmail);

        await addActivityLog(
            actorId,
            'TABLE_CREATE',
            `Created new table: ${newTable.name}`,
            newTable.name,
            { floor: newTable.floor, capacity: newTable.capacity }
        );

        return NextResponse.json(newTable, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add table', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'ID query parameter is required' }, { status: 400 });
        }
        const tableData = await request.json();
        const updatedTable = await updateTable({ ...tableData, id });
        const actorId = await getActorId(tableData.userEmail);

        await addActivityLog(
            actorId,
            'TABLE_UPDATE',
            `Updated table: ${updatedTable.name}`,
            updatedTable.name,
            { floor: updatedTable.floor, status: updatedTable.status }
        );

        return NextResponse.json(updatedTable);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update table', error: error.message }, { status: 500 });
    }
}
