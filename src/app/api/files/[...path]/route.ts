import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Simple MIME type detector
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: {[key: string]: string} = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.json': 'application/json',
    '.txt': 'text/plain',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Join the path segments
    const filepath = path.join(process.cwd(), 'uploads', ...params.path);
    
    // Security check: Ensure the path is within uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!filepath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Read the file
    const file = await readFile(filepath);
    
    // Determine content type
    const mimeType = getMimeType(filepath);
    
    // Return the file with appropriate headers
    return new NextResponse(file as BodyInit, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
