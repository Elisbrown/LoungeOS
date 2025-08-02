import { NextRequest } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

function getDb(): Database.Database {
  const dbPath = path.join(process.cwd(), 'loungeos.db')
  return new Database(dbPath)
}

export async function GET() {
  const db = getDb()
  
  try {
    // Create notes table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT,
        user_id INTEGER,
        is_pinned BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const stmt = db.prepare(`
      SELECT 
        id,
        title,
        content,
        tags,
        user_id,
        is_pinned,
        created_at,
        updated_at
      FROM notes 
      ORDER BY is_pinned DESC, updated_at DESC
    `)
    
    const notes = stmt.all().map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : [],
      id: note.id.toString(),
      is_pinned: Boolean(note.is_pinned)
    }))

    return Response.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return Response.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  } finally {
    db.close()
  }
}

export async function POST(request: NextRequest) {
  const db = getDb()
  
  try {
    const { title, content, tags } = await request.json()

    if (!title || !content) {
      return Response.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Create notes table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT,
        user_id INTEGER,
        is_pinned BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const stmt = db.prepare(`
      INSERT INTO notes (title, content, tags, user_id)
      VALUES (?, ?, ?, ?)
    `)
    
    const result = stmt.run(title, content, JSON.stringify(tags || []), 1)
    
    const newNote = {
      id: result.lastInsertRowid.toString(),
      title,
      content,
      tags: tags || [],
      user_id: 1,
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return Response.json(newNote)
  } catch (error) {
    console.error('Error creating note:', error)
    return Response.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  } finally {
    db.close()
  }
} 