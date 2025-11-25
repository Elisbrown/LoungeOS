"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, User, Tag, AlertCircle, CheckCircle, Edit } from 'lucide-react'
import type { Ticket } from '@/lib/db/tickets'
import { useState } from 'react'
import { EditTicketDialog } from './edit-ticket-dialog'

interface TicketDetailsDialogProps {
  ticket: Ticket
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketDetailsDialog({ ticket, open, onOpenChange }: TicketDetailsDialogProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const getStatusVariant = (status: Ticket['status']) => {
    switch (status) {
      case 'Open': return 'default'
      case 'In Progress': return 'secondary'
      case 'Resolved': return 'outline'
      case 'Closed': return 'destructive'
    }
  }

  const getPriorityVariant = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'Low': return 'outline'
      case 'Medium': return 'secondary'
      case 'High': return 'default'
      case 'Critical': return 'destructive'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <DialogTitle className="text-2xl">{ticket.title}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getStatusVariant(ticket.status)}>
                    {ticket.status}
                  </Badge>
                  <Badge variant={getPriorityVariant(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {ticket.category}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Description</h3>
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <Separator />

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created By</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {ticket.creator?.name || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <div className="flex items-center gap-2">
                  {ticket.assignee ? (
                    <>
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">{ticket.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(ticket.created_at)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(ticket.updated_at)}</span>
                </div>
              </div>

              {ticket.resolved_at && (
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{formatDate(ticket.resolved_at)}</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Status Info */}
            <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50">
              <AlertCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ticket #{ticket.id}</p>
                <p className="text-sm text-muted-foreground">
                  {ticket.status === 'Open' && 'This ticket is waiting to be addressed.'}
                  {ticket.status === 'In Progress' && 'This ticket is currently being worked on.'}
                  {ticket.status === 'Resolved' && 'This ticket has been resolved.'}
                  {ticket.status === 'Closed' && 'This ticket has been closed.'}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editDialogOpen && (
        <EditTicketDialog
          ticket={ticket}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open)
            if (!open) {
              // Refresh parent when edit dialog closes
              onOpenChange(false)
            }
          }}
        />
      )}
    </>
  )
}
