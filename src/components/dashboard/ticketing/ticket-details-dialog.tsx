
"use client"

import { useState } from "react"
import { formatDistanceToNow } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import { useAuth } from "@/context/auth-context"
import { useTickets } from "@/context/ticket-context"
import { useStaff } from "@/context/staff-context"
import type { Ticket, TicketStatus, TicketComment } from "@/context/ticket-context"

type TicketDetailsDialogProps = {
  ticket: Ticket
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getPriorityVariant = (priority: string) => {
    switch (priority) {
        case "Urgent":
        case "High":
            return "destructive"
        case "Medium":
            return "secondary"
        default:
            return "default"
    }
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case "Closed":
            return "outline"
        case "Resolved":
            return "default"
        default:
            return "secondary"
    }
}

export function TicketDetailsDialog({ ticket, open, onOpenChange }: TicketDetailsDialogProps) {
  const { user } = useAuth()
  const { staff } = useStaff()
  const { updateTicket, addComment } = useTickets()
  const [newComment, setNewComment] = useState("")

  if (!user) return null

  const canManage = user.role === "Manager" || user.role === "Super Admin"

  const handleUpdateStatus = (newStatus: TicketStatus) => {
    const updatedTicket = { ...ticket, status: newStatus }
    updateTicket(updatedTicket)
  }
  
  const handleAssignTicket = (assigneeId: string) => {
    const assignee = staff.find(s => s.email === assigneeId)
    if (assignee) {
        const updatedTicket = { ...ticket, assignee: { id: assignee.email, name: assignee.name } }
        updateTicket(updatedTicket)
    }
  }

  const handleAddComment = () => {
    if (newComment.trim() === "") return
    const comment: TicketComment = {
        authorId: user.email,
        authorName: user.name,
        text: newComment,
        timestamp: new Date()
    }
    addComment(ticket.id, comment)
    setNewComment("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">{ticket.title}</DialogTitle>
          <DialogDescription>
            Ticket #{ticket.id} created by {ticket.creatorName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                    <p className="font-medium">Status</p>
                    {canManage ? (
                        <Select value={ticket.status} onValueChange={(val) => handleUpdateStatus(val as TicketStatus)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : <Badge variant={getStatusVariant(ticket.status)} className="mt-1">{ticket.status}</Badge>}
                </div>
                 <div>
                    <p className="font-medium">Priority</p>
                    <Badge variant={getPriorityVariant(ticket.priority)} className="mt-2">{ticket.priority}</Badge>
                </div>
                 <div>
                    <p className="font-medium">Category</p>
                    <p className="text-muted-foreground mt-2">{ticket.category}</p>
                </div>
                 <div>
                    <p className="font-medium">Created</p>
                    <p className="text-muted-foreground mt-2">{formatDistanceToNow(ticket.timestamp, { addSuffix: true })}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label>Assigned To</Label>
                    {canManage ? (
                        <Select value={ticket.assignee?.id} onValueChange={handleAssignTicket}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                                {staff.map(s => (
                                    <SelectItem key={s.email} value={s.email}>{s.name} - ({s.role})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <p className="text-muted-foreground mt-1">{ticket.assignee?.name || "Unassigned"}</p>
                    )}
                 </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{ticket.description}</p>
            </div>
            
             <Separator />
             
             <div className="space-y-4">
                <h4 className="font-medium">Comments</h4>
                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                    {ticket.comments.map((comment, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://placehold.co/100x100.png" alt={comment.authorName} data-ai-hint="person" />
                                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm">{comment.authorName}</p>
                                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(comment.timestamp, { addSuffix: true })}</p>
                                </div>
                                <p className="text-sm text-muted-foreground p-2 bg-muted rounded-md mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Textarea 
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button onClick={handleAddComment}>Send</Button>
                </div>
             </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
