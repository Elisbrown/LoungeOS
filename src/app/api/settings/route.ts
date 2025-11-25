// src/app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { getSettings, setSettings, updateSetting, saveImage, deleteImage } from '@/lib/db/settings';
import { addActivityLog } from '@/lib/db/activity-logs';
import { getStaffByEmail } from '@/lib/db/staff';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const settings = await getSettings();
        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch settings', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        const settingsData = await request.json();
        
        if (key) {
            // Update specific setting
            await updateSetting(key as any, settingsData.value);
        } else {
            // Update all settings
            await setSettings(settingsData.settings);
        }
        
        // Log the activity
        try {
            const userEmail = settingsData.userEmail || 'system';
            let userId: number | null = null;
            if (userEmail !== 'system') {
                const user = await getStaffByEmail(userEmail);
                userId = user ? Number(user.id) : null;
            }
            
            await addActivityLog(
                userId,
                'update_settings',
                key ? `Updated setting: ${key}` : 'Updated application settings'
            );
        } catch (logError) {
            console.error('Failed to log activity:', logError);
        }
        
        return NextResponse.json({ message: 'Settings updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update settings', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'logo' or 'carousel'
        const userEmail = formData.get('userEmail') as string;
        
        if (!file) {
            return NextResponse.json({ message: 'No file provided' }, { status: 400 });
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ message: 'File must be an image' }, { status: 400 });
        }
        
        // Generate unique filename
        const fileExtension = path.extname(file.name);
        const filename = `${type}-${uuidv4()}${fileExtension}`;
        
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Save image to file system
        const imagePath = await saveImage(buffer, filename);
        
        // Log the activity
        try {
            let userId: number | null = null;
            if (userEmail && userEmail !== 'system') {
                const user = await getStaffByEmail(userEmail);
                userId = user ? Number(user.id) : null;
            }
            
            await addActivityLog(
                userId,
                'upload_image',
                `Uploaded ${type} image: ${filename}`
            );
        } catch (logError) {
            console.error('Failed to log activity:', logError);
        }
        
        return NextResponse.json({ 
            message: 'Image uploaded successfully',
            imagePath: imagePath
        });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to upload image', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const imagePath = searchParams.get('imagePath');
        const userEmail = searchParams.get('userEmail');
        
        if (!imagePath) {
            return NextResponse.json({ message: 'Image path is required' }, { status: 400 });
        }
        
        // Delete image from file system
        await deleteImage(imagePath);
        
        // Log the activity
        try {
            let userId: number | null = null;
            if (userEmail && userEmail !== 'system') {
                const user = await getStaffByEmail(userEmail);
                userId = user ? Number(user.id) : null;
            }
            
            await addActivityLog(
                userId,
                'delete_image',
                `Deleted image: ${imagePath}`
            );
        } catch (logError) {
            console.error('Failed to log activity:', logError);
        }
        
        return NextResponse.json({ message: 'Image deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to delete image', error: error.message }, { status: 500 });
    }
} 