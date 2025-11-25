
// src/app/api/tables/route.ts
import { NextResponse } from 'next/server';
import { getTables, addTable, updateTable } from '@/lib/db/tables';

export const runtime = 'nodejs';

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
        return NextResponse.json(updatedTable);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update table', error: error.message }, { status: 500 });
    }
}
