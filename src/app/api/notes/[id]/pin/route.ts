import { NextRequest } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

function getDb(): Database.Database {
  const dbPath = path.join(process.cwd(), 'loungeos.db')
  return new Database(dbPath)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  
  try {
    const { is_pinned } = await request.json()
    const { id } = await params
    const noteId = parseInt(id)

    const stmt = db.prepare(`
      UPDATE notes 
      SET is_pinned = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const result = stmt.run(is_pinned ? 1 : 0, noteId)
    
    if (result.changes === 0) {
      return Response.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const updatedNote = {
      id: noteId.toString(),
      is_pinned: is_pinned,
      updated_at: new Date().toISOString()
    }

    return Response.json(updatedNote)
  } catch (error) {
    console.error('Error updating note pin status:', error)
    return Response.json(
      { error: 'Failed to update note pin status' },
      { status: 500 }
    )
  } finally {
    db.close()
  }
} 