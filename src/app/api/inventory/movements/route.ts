// src/app/api/inventory/movements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getInventoryMovements, addInventoryMovement } from '@/lib/db/inventory';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');
        const limit = searchParams.get('limit');

        const movements = await getInventoryMovements(
            itemId ? Number(itemId) : undefined,
            limit ? Number(limit) : 100
        );

        return NextResponse.json(movements);
    } catch (error) {
        console.error('Error fetching inventory movements:', error);
        return NextResponse.json(
            { error: 'Failed to fetch inventory movements' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { movementData } = body;

        if (!movementData) {
            return NextResponse.json(
                { error: 'Movement data is required' },
                { status: 400 }
            );
        }

        const newMovement = await addInventoryMovement(movementData);
        return NextResponse.json(newMovement, { status: 201 });
    } catch (error) {
        console.error('Error adding inventory movement:', error);
        return NextResponse.json(
            { error: 'Failed to add inventory movement' },
            { status: 500 }
        );
    }
} 