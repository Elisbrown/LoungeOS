// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const type: 'staff' | 'meals' = data.get('type') as 'staff' | 'meals';

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
        }
        if (!type) {
            return NextResponse.json({ success: false, message: 'Upload type is required.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define the upload directory and ensure it exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        // Create a unique filename
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadDir, filename);
        
        // Write the file to the server
        await writeFile(filePath, buffer);
        console.log(`File uploaded to ${filePath}`);

        // Return the public path to be stored in the database
        const publicPath = `/uploads/${type}/${filename}`;
        return NextResponse.json({ success: true, path: publicPath });

    } catch (error: any) {
        console.error('Upload failed:', error);
        return NextResponse.json({ success: false, message: 'Upload failed', error: error.message }, { status: 500 });
    }
}
