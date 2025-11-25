
// src/app/api/suppliers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getInventorySuppliers, addInventorySupplier, updateInventorySupplier, deleteInventorySupplier } from '@/lib/db/inventory';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const suppliers = await getInventorySuppliers();
        return NextResponse.json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch suppliers' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { supplierData } = body;

        if (!supplierData) {
            return NextResponse.json(
                { error: 'Supplier data is required' },
                { status: 400 }
            );
        }

        const newSupplier = await addInventorySupplier(supplierData);
        return NextResponse.json(newSupplier, { status: 201 });
    } catch (error) {
        console.error('Error adding supplier:', error);
        return NextResponse.json(
            { error: 'Failed to add supplier' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { supplierData } = body;

        if (!supplierData || !supplierData.id) {
            return NextResponse.json(
                { error: 'Supplier data with ID is required' },
                { status: 400 }
            );
        }

        const updatedSupplier = await updateInventorySupplier(supplierData);
        return NextResponse.json(updatedSupplier);
    } catch (error) {
        console.error('Error updating supplier:', error);
        return NextResponse.json(
            { error: 'Failed to update supplier' },
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
                { error: 'Supplier ID is required' },
                { status: 400 }
            );
        }

        await deleteInventorySupplier(parseInt(id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        return NextResponse.json(
            { error: 'Failed to delete supplier' },
            { status: 500 }
        );
    }
}
