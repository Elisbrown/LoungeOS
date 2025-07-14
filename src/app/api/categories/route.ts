
// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/lib/db/categories';

export async function GET() {
    try {
        const categories = await getCategories();
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch categories', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const categoryData = await request.json();
        const newCategory = await addCategory(categoryData);
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add category', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'ID query parameter is required' }, { status: 400 });
        }
        const categoryData = await request.json();
        const updatedCategory = await updateCategory({ ...categoryData, id });
        return NextResponse.json(updatedCategory);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update category', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'ID query parameter is required' }, { status: 400 });
        }
        await deleteCategory(id);
        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to delete category', error: error.message }, { status: 500 });
    }
}
