// src/app/api/inventory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
    getInventoryItems, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem,
    getInventoryCategories,
    getInventorySuppliers,
    getInventoryStats
} from '@/lib/db/inventory';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        switch (type) {
            case 'categories':
                const categories = await getInventoryCategories();
                return NextResponse.json(categories);
            
            case 'suppliers':
                const suppliers = await getInventorySuppliers();
                return NextResponse.json(suppliers);
            
            case 'stats':
                const stats = await getInventoryStats();
                return NextResponse.json(stats);
            
            default:
                const items = await getInventoryItems();
                return NextResponse.json(items);
        }
    } catch (error) {
        console.error('Error fetching inventory data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch inventory data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { itemData } = body;

        if (!itemData) {
            return NextResponse.json(
                { error: 'Item data is required' },
                { status: 400 }
            );
        }

        const newItem = await addInventoryItem(itemData);
        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error('Error adding inventory item:', error);
        return NextResponse.json(
            { error: 'Failed to add inventory item' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...itemData } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Item ID is required' },
                { status: 400 }
            );
        }

        const updatedItem = await updateInventoryItem(id, itemData);
        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error('Error updating inventory item:', error);
        return NextResponse.json(
            { error: 'Failed to update inventory item' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Item ID is required' },
                { status: 400 }
            );
        }

        await deleteInventoryItem(id);
        return NextResponse.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        return NextResponse.json(
            { error: 'Failed to delete inventory item' },
            { status: 500 }
        );
    }
} 