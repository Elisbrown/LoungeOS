
// src/app/api/orders/merge/route.ts
import { NextResponse } from 'next/server';
import { mergeOrders } from '@/lib/db/orders';

export async function POST(request: Request) {
    try {
        const { fromOrderId, toOrderId } = await request.json();
        if (!fromOrderId || !toOrderId) {
            return NextResponse.json({ message: 'fromOrderId and toOrderId are required' }, { status: 400 });
        }
        const mergedOrder = await mergeOrders(fromOrderId, toOrderId);
        return NextResponse.json(mergedOrder);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to merge orders', error: error.message }, { status: 500 });
    }
}
