
// src/app/api/suppliers/route.ts
import { NextResponse } from 'next/server';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from '@/lib/db/suppliers';

export async function GET() {
    try {
        const suppliers = await getSuppliers();
        return NextResponse.json(suppliers);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch suppliers', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supplierData = await request.json();
        const newSupplier = await addSupplier(supplierData);
        return NextResponse.json(newSupplier, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add supplier', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'ID query parameter is required' }, { status: 400 });
        }
        const supplierData = await request.json();
        const updatedSupplier = await updateSupplier({ ...supplierData, id });
        return NextResponse.json(updatedSupplier);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update supplier', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'ID query parameter is required' }, { status: 400 });
        }
        await deleteSupplier(id);
        return NextResponse.json({ message: 'Supplier deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to delete supplier', error: error.message }, { status: 500 });
    }
}
