import { NextRequest } from 'next/server'
import Database from 'better-sqlite3'

function getDb(): Database.Database {
  const db = new Database('loungeos.db')
  db.pragma('journal_mode = WAL')
  return db
}

export async function GET() {
  const db = getDb()
  
  try {
    // Create events table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        location TEXT,
        capacity INTEGER,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const stmt = db.prepare(`
      SELECT 
        id,
        title,
        description,
        start_date,
        end_date,
        location,
        capacity,
        created_by,
        created_at,
        updated_at
      FROM events 
      ORDER BY start_date DESC
    `)
    
    const events = stmt.all().map(event => ({
      ...event,
      id: event.id.toString()
    }))

    return Response.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return Response.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  } finally {
    db.close()
  }
}

export async function POST(request: NextRequest) {
  const db = getDb()
  
  try {
    const { title, description, start_date, end_date, location, capacity } = await request.json()

    if (!title || !start_date || !end_date) {
      return Response.json(
        { error: 'Title, start date, and end date are required' },
        { status: 400 }
      )
    }

    const stmt = db.prepare(`
      INSERT INTO events (title, description, start_date, end_date, location, capacity, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(title, description, start_date, end_date, location, capacity, 1)
    
    const newEvent = {
      id: result.lastInsertRowid.toString(),
      title,
      description,
      start_date,
      end_date,
      location,
      capacity,
      created_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return Response.json(newEvent)
  } catch (error) {
    console.error('Error creating event:', error)
    return Response.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  } finally {
    db.close()
  }
} 