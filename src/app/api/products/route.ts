
// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { getMeals, getUnifiedProducts, addMeal, updateMeal, deleteMeal } from '@/lib/db/products';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const unified = searchParams.get('unified');
        
        if (unified === 'true') {
            const products = await getUnifiedProducts();
            return NextResponse.json(products);
        } else {
            const meals = await getMeals();
            return NextResponse.json(meals);
        }
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch products', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const mealData = await request.json();
        const newMeal = await addMeal(mealData);
        return NextResponse.json(newMeal, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add meal', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'ID query parameter is required' }, { status: 400 });
        }
        const mealData = await request.json();
        const updatedMeal = await updateMeal(mealData);
        return NextResponse.json(updatedMeal);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update meal', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ message: 'ID query parameter is required' }, { status: 400 });
        }
        await deleteMeal(id);
        return NextResponse.json({ message: 'Meal deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to delete meal', error: error.message }, { status: 500 });
    }
}
