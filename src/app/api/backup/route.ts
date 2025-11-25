// src/app/api/backup/route.ts
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { recordBackup } from '@/lib/db/backup';

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'loungeos.db');
const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

function getFormattedTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

export async function GET() {
    try {
        const db = new Database(dbPath, { readonly: true });
        
        // Use the .iter() method to create a backup. This is a built-in feature of better-sqlite3
        // that safely creates a backup of the live database.
        const backupFilename = `loungeos_backup_${getFormattedTimestamp()}.db`;
        const backupFilePath = path.join(backupDir, backupFilename);
        
        await db.backup(backupFilePath);
        db.close();

        const fileBuffer = fs.readFileSync(backupFilePath);
        const fileSize = fileBuffer.length;
        
        // Record backup in database
        try {
            recordBackup(backupFilename, fileSize, 'manual');
        } catch (error) {
            console.error('Failed to record backup:', error);
        }

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/x-sqlite3',
                'Content-Disposition': `attachment; filename="${backupFilename}"`,
            },
        });

    } catch (error: any) {
        console.error('Backup failed:', error);
        return NextResponse.json({ message: 'Backup failed', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('backupFile') as File | null;

        if (!file) {
            return NextResponse.json({ message: 'No backup file provided' }, { status: 400 });
        }

        // Close existing connections if db is open
        // In a real app, you'd have a connection manager. For here, we assume it's closed.
        
        const tempPath = path.join(os.tmpdir(), file.name);
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(tempPath, fileBuffer);

        // Replace the current database with the backup
        fs.renameSync(tempPath, dbPath);

        return NextResponse.json({ message: 'Restore successful. Please restart the application.' }, { status: 200 });

    } catch (error: any) {
        console.error('Restore failed:', error);
        return NextResponse.json({ message: 'Restore failed', error: error.message }, { status: 500 });
    }
}
