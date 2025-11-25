// src/app/api/backup/history/route.ts
import { NextResponse } from 'next/server';
import { getBackupHistory, deleteBackupRecord } from '@/lib/db/backup';
import path from 'path';
import fs from 'fs';

const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');

// GET - Retrieve backup history
export async function GET() {
    try {
        const history = getBackupHistory(20); // Get last 20 backups
        return NextResponse.json(history, { status: 200 });
    } catch (error: any) {
        console.error('Failed to get backup history:', error);
        return NextResponse.json(
            { message: 'Failed to get backup history', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Remove a backup by ID
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Backup ID is required' }, { status: 400 });
        }

        const deleted = deleteBackupRecord(parseInt(id));

        if (deleted) {
            return NextResponse.json({ message: 'Backup deleted successfully' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Backup not found' }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Failed to delete backup:', error);
        return NextResponse.json(
            { message: 'Failed to delete backup', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Download a specific backup by filename
export async function POST(request: Request) {
    try {
        const { filename } = await request.json();

        if (!filename) {
            return NextResponse.json({ message: 'Filename is required' }, { status: 400 });
        }

        const backupFilePath = path.join(backupDir, filename);

        if (!fs.existsSync(backupFilePath)) {
            return NextResponse.json({ message: 'Backup file not found' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(backupFilePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/x-sqlite3',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error: any) {
        console.error('Failed to download backup:', error);
        return NextResponse.json(
            { message: 'Failed to download backup', error: error.message },
            { status: 500 }
        );
    }
}
