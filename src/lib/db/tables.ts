// src/lib/db/tables.ts
import Database from 'better-sqlite3';
import path from 'path';
import type { Table } from '@/context/table-context';

const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'loungeos.db');

function getDb() {
  return new Database(dbPath, { fileMustExist: true });
}

export async function getTables(): Promise<Table[]> {
  const db = getDb();
  try {
    const stmt = db.prepare(`
        SELECT t.id, t.name, t.capacity, t.status, f.name as floor 
        FROM tables t
        LEFT JOIN floors f ON t.floor_id = f.id
    `);
    const rows = stmt.all() as any[];
    return rows.map(row => ({ ...row, id: String(row.id) }));
  } finally {
    db.close();
  }
}

export async function addTable(tableData: Omit<Table, 'status' | 'id'>): Promise<Table> {
  const db = getDb();
  try {
    const floor = db.prepare('SELECT id FROM floors WHERE name = ?').get(tableData.floor) as { id: number };
    if (!floor) throw new Error(`Floor "${tableData.floor}" not found.`);

    const stmt = db.prepare('INSERT INTO tables (name, capacity, floor_id) VALUES (@name, @capacity, @floor_id)');
    const info = stmt.run({
      name: tableData.name,
      capacity: tableData.capacity,
      floor_id: floor.id
    });

    return {
      ...tableData,
      id: String(info.lastInsertRowid),
      status: 'Available'
    };
  } finally {
    db.close();
  }
}

export async function updateTable(updatedTable: Table): Promise<Table> {
  const db = getDb();
  try {
    const floor = db.prepare('SELECT id FROM floors WHERE name = ?').get(updatedTable.floor) as { id: number };
    if (!floor) throw new Error(`Floor "${updatedTable.floor}" not found.`);

    const stmt = db.prepare('UPDATE tables SET name = @name, capacity = @capacity, status = @status, floor_id = @floor_id WHERE id = @id');
    stmt.run({
      name: updatedTable.name,
      capacity: updatedTable.capacity,
      status: updatedTable.status,
      floor_id: floor.id,
      id: updatedTable.id
    });
    return updatedTable;
  } finally {
    db.close();
  }
}

export async function deleteTable(id: string): Promise<boolean> {
  const db = getDb();
  try {
    const stmt = db.prepare('DELETE FROM tables WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  } finally {
    db.close();
  }
}
