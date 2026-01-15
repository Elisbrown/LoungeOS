import { NextResponse } from 'next/server';
import { isAppSetup, addStaff } from '@/lib/db/staff';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'loungeos.db');

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const isSetup = await isAppSetup();
        if (isSetup) {
            return NextResponse.json({ message: 'Application is already setup' }, { status: 400 });
        }

        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Name, email and password are required' }, { status: 400 });
        }

        // Create Super Admin
        const db = new Database(dbPath);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const stmt = db.prepare(`
            INSERT INTO users (name, email, password, role, status, avatar, force_password_change) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(name, email, hashedPassword, 'Super Admin', 'Active', 'https://placehold.co/100x100.png', 0);
        db.close();

        return NextResponse.json({ message: 'Super Admin created successfully. Setup complete.' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to complete setup', error: error.message }, { status: 500 });
    }
}
