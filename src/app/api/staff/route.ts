
// src/app/api/staff/route.ts
import { NextResponse } from 'next/server';
import { getStaff, addStaff, updateStaff, deleteStaff, getStaffByEmail } from '@/lib/db/staff';
import { addActivityLog } from '@/lib/db/activity-logs';

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
        
        // Log the activity
        try {
            // Resolve user ID from email if provided
            let userId: number | null = null;
            if (staffData.userEmail && staffData.userEmail !== 'system') {
                const user = await getStaffByEmail(staffData.userEmail);
                userId = user ? Number(user.id) : null;
            }
            
            await addActivityLog(
                userId,
                'add_staff',
                `Added new staff member: ${newStaffMember.name} (${newStaffMember.email})`
            );
        } catch (logError) {
            console.error('Failed to log activity:', logError);
        }
        
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
        
        // Log the activity
        try {
            // Resolve user ID from email if provided
            let userId: number | null = null;
            if (staffData.userEmail && staffData.userEmail !== 'system') {
                const user = await getStaffByEmail(staffData.userEmail);
                userId = user ? Number(user.id) : null;
            }
            
            await addActivityLog(
                userId,
                'update_staff',
                `Updated staff member: ${updatedStaffMember.name} (${email})`
            );
        } catch (logError) {
            console.error('Failed to log activity:', logError);
        }
        
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
        
        // Get staff member details before deletion for logging
        const staffMember = await getStaffByEmail(email);
        
        await deleteStaff(email);
        
        // Log the activity
        try {
            await addActivityLog(
                null, // No user ID for system operations
                'delete_staff',
                `Deleted staff member: ${staffMember?.name || 'Unknown'} (${email})`
            );
        } catch (logError) {
            console.error('Failed to log activity:', logError);
        }
        
        return NextResponse.json({ message: 'Staff member deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to delete staff member', error: error.message }, { status: 500 });
    }
}
