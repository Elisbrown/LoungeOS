
// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getInventoryCategories, addInventoryCategory } from '@/lib/db/inventory';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const categories = await getInventoryCategories();
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { categoryData } = body;

        if (!categoryData) {
            return NextResponse.json(
                { error: 'Category data is required' },
                { status: 400 }
            );
        }

        const newCategory = await addInventoryCategory(categoryData);
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error('Error adding category:', error);
        return NextResponse.json(
            { error: 'Failed to add category' },
            { status: 500 }
        );
    }
}
