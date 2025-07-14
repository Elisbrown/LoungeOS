
// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { getOrders, addOrder, updateOrder, deleteOrder } from '@/lib/db/orders';

export async function GET() {
    try {
        const orders = await getOrders();
        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch orders', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const orderData = await request.json();
        const newOrder = await addOrder(orderData);
        return NextResponse.json(newOrder, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add order', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const orderData = await request.json();
        const updatedOrder = await updateOrder(orderData);
        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update order', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'ID query parameter is required' }, { status: 400 });
        }
        await deleteOrder(id);
        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to delete order', error: error.message }, { status: 500 });
    }
}
