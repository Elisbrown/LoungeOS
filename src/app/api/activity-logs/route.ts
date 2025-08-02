import { NextResponse } from 'next/server';
import { getActivityLogs, addActivityLog, clearActivityLogs } from '@/lib/db/activity-logs';
import { getStaffByEmail } from '@/lib/db/staff';

export async function GET() {
    try {
        const logs = await getActivityLogs();
        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch activity logs', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId, action, details, userEmail } = await request.json();
        
        if (!action) {
            return NextResponse.json({ message: 'Action is required' }, { status: 400 });
        }

        let finalUserId = userId;
        
        // If no userId provided but userEmail is, get the user ID from the database
        if (!userId && userEmail) {
            const user = await getStaffByEmail(userEmail);
            finalUserId = user ? parseInt(user.id) : null;
        }

        const newLog = await addActivityLog(finalUserId, action, details || '');
        return NextResponse.json(newLog, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to add activity log', error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await clearActivityLogs();
        return NextResponse.json({ message: 'Activity logs cleared successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to clear activity logs', error: error.message }, { status: 500 });
    }
} 