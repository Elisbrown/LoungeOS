// src/app/api/orders/split/route.ts
import { NextResponse } from 'next/server';
import { splitOrder } from '@/lib/db/orders';

export async function POST(request: Request) {
    try {
        const { orderId, itemsToSplit } = await request.json();
        if (!orderId || !itemsToSplit) {
            return NextResponse.json({ message: 'orderId and itemsToSplit are required' }, { status: 400 });
        }
        const result = await splitOrder(orderId, itemsToSplit);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to split order', error: error.message }, { status: 500 });
    }
}
