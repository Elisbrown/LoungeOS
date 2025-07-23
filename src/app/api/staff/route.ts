
// src/app/api/staff/route.ts
import { NextResponse } from 'next/server';
import { getStaff, addStaff, updateStaff, deleteStaff } from '@/lib/db/staff';

export async function GET(request: Request) {
    try {
        const staffList = await getStaff();
        return NextResponse.json(staffList);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch staff', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const staffData = await request.json();
        const newStaffMember = await addStaff(staffData);
        return NextResponse.json(newStaffMember, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add staff member', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        if (!email) {
            return NextResponse.json({ message: 'Email query parameter is required' }, { status: 400 });
        }
        const staffData = await request.json();
        const updatedStaffMember = await updateStaff(email, staffData);
        return NextResponse.json(updatedStaffMember);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update staff member', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        if (!email) {
            return NextResponse.json({ message: 'Email query parameter is required' }, { status: 400 });
        }
        await deleteStaff(email);
        return NextResponse.json({ message: 'Staff member deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to delete staff member', error: error.message }, { status: 500 });
    }
}
