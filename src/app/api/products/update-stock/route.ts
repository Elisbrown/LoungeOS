// src/app/api/products/update-stock/route.ts
import { NextResponse } from 'next/server';
import { updateInventoryStockForSale } from '@/lib/db/products';

export async function POST(request: Request) {
    try {
        const { inventoryId, quantitySold } = await request.json();
        
        if (!inventoryId || !quantitySold) {
            return NextResponse.json({ 
                message: 'inventoryId and quantitySold are required' 
            }, { status: 400 });
        }
        
        await updateInventoryStockForSale(inventoryId, quantitySold);
        return NextResponse.json({ 
            message: 'Inventory stock updated successfully' 
        });
    } catch (error: any) {
        return NextResponse.json({ 
            message: 'Failed to update inventory stock', 
            error: error.message 
        }, { status: 500 });
    }
} 