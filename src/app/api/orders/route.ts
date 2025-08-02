
// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { getOrders, addOrder, updateOrder, updateOrderStatus, deleteOrder } from '@/lib/db/orders';
import { addActivityLog } from '@/lib/db/activity-logs';
import { getStaffByEmail } from '@/lib/db/staff';

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
        
        // Log the activity
        try {
            await addActivityLog(null, 'add_order', `Order for table ${orderData.table} added.`);
        } catch (logError) {
            console.error('Failed to log activity:', logError);
        }
        
        return NextResponse.json(newOrder, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add order', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'ID query parameter is required' }, { status: 400 });
        }
        
        const orderData = await request.json();
        
        // Check if this is a status-only update
        if (orderData.status && Object.keys(orderData).length === 3 && orderData.id && orderData.timestamp) {
            // This is a status-only update (id, status, timestamp)
            const updatedOrder = await updateOrderStatus(id, orderData.status);
            
            // Log the activity
            try {
                await addActivityLog(null, 'update_order_status', `Order ${id} status updated to ${orderData.status}.`);
            } catch (logError) {
                console.error('Failed to log activity:', logError);
            }
            
            return NextResponse.json(updatedOrder);
        } else {
            // This is a full order update
            const updatedOrder = await updateOrder({ ...orderData, id });
            
            // Log the activity
            try {
                await addActivityLog(null, 'update_order', `Order ${id} updated.`);
            } catch (logError) {
                console.error('Failed to log activity:', logError);
            }
            
            return NextResponse.json(updatedOrder);
        }
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
        
        // Log the activity
        try {
            await addActivityLog(null, 'delete_order', `Order ${id} deleted.`);
        } catch (logError) {
            console.error('Failed to log activity:', logError);
        }
        
        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to delete order', error: error.message }, { status: 500 });
    }
}
