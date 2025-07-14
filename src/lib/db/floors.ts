// src/lib/db/floors.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'loungeos.db');

function getDb() {
  return new Database(dbPath, { fileMustExist: true });
}

export async function getFloors(): Promise<string[]> {
  const db = getDb();
  try {
    const stmt = db.prepare('SELECT name FROM floors');
    const rows = stmt.all() as { name: string }[];
    return rows.map(row => row.name);
  } finally {
    db.close();
  }
}

export async function addFloor(floorName: string): Promise<string> {
  const db = getDb();
  try {
    const stmt = db.prepare('INSERT INTO floors (name) VALUES (?)');
    stmt.run(floorName);
    return floorName;
  } finally {
    db.close();
  }
}

export async function deleteFloor(floorName: string): Promise<{ name: string }> {
  const db = getDb();
  try {
    const stmt = db.prepare('DELETE FROM floors WHERE name = ?');
    stmt.run(floorName);
    return { name: floorName };
  } finally {
    db.close();
  }
}
