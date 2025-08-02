"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Save, X, Calendar, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/auth-context'

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  tags?: string[];
  is_pinned: boolean;
}

export function DashboardNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch notes from database
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        throw new Error('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notes. Please refresh the page."
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new note
  const createNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title and content are required"
      });
      return;
    }

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNote.title,
          content: newNote.content,
          tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (response.ok) {
        const createdNote = await response.json();
        setNotes(prev => [createdNote, ...prev]);
        setNewNote({ title: '', content: '', tags: '' });
        setIsDialogOpen(false);
        toast({
          title: "Success",
          description: "Note created successfully"
        });
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create note"
      });
    }
  };

  // Update note
  const updateNote = async () => {
    if (!selectedNote) return;

    try {
      const response = await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedNote.title,
          content: selectedNote.content,
          tags: selectedNote.tags
        })
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(prev => prev.map(note => 
          note.id === updatedNote.id ? updatedNote : note
        ));
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Note updated successfully"
        });
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update note"
      });
    }
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
          setIsEditing(false);
        }
        toast({
          title: "Success",
          description: "Note deleted successfully"
        });
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete note"
      });
    }
  };

  // Toggle pin note
  const togglePinNote = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    try {
      const response = await fetch(`/api/notes/${noteId}/pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: !note.is_pinned })
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(prev => prev.map(n => 
          n.id === updatedNote.id ? updatedNote : n
        ));
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Quick Notes</h3>
          <Button size="sm" disabled>Loading...</Button>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Quick Notes</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-3 w-3" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Note content..."
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
              />
              <Input
                placeholder="Tags (comma separated)"
                value={newNote.tags}
                onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createNote}>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No notes yet. Create your first note!
          </div>
        ) : (
          sortedNotes.map(note => (
            <Card 
              key={note.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedNote?.id === note.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedNote(note)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{note.title}</h4>
                      {note.is_pinned && (
                        <Badge variant="secondary" className="text-xs">Pinned</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(note.created_at)}
                      </div>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {note.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="text-xs">+{note.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinNote(note.id);
                      }}
                    >
                      📌
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNote(note);
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Note Editor */}
      {selectedNote && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {isEditing ? 'Edit Note' : 'View Note'}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={updateNote}>
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <Input
                  value={selectedNote.title}
                  onChange={(e) => setSelectedNote(prev => 
                    prev ? { ...prev, title: e.target.value } : null
                  )}
                />
                <Textarea
                  value={selectedNote.content}
                  onChange={(e) => setSelectedNote(prev => 
                    prev ? { ...prev, content: e.target.value } : null
                  )}
                  rows={6}
                />
              </>
            ) : (
              <>
                <h4 className="font-medium">{selectedNote.title}</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedNote.content}</p>
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedNote.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 