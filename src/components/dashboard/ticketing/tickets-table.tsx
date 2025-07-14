
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useTickets, type Ticket, type TicketStatus, type TicketPriority } from "@/context/ticket-context"
import { useAuth } from "@/context/auth-context"
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from "@/hooks/use-translation"

type TicketsTableProps = {
  onSelectTicket: (ticket: Ticket) => void
}

const getPriorityVariant = (priority: TicketPriority) => {
    switch(priority) {
        case "Urgent":
        case "High":
            return "destructive"
        case "Medium":
            return "secondary"
        default:
            return "default"
    }
}

const getStatusVariant = (status: TicketStatus) => {
    switch(status) {
        case "Closed":
            return "outline"
        case "Resolved":
            return "success"
        case "Open":
            return "default"
        default:
            return "secondary"
    }
}

export function TicketsTable({ onSelectTicket }: TicketsTableProps) {
  const { user } = useAuth()
  const { tickets } = useTickets()
  const { t } = useTranslation()

  if (!user) return null

  const canManage = user.role === "Manager" || user.role === "Super Admin"

  const filteredTickets = canManage
    ? tickets
    : tickets.filter(t => t.creatorId === user.email || t.assignee?.id === user.email)
    
  const sortedTickets = filteredTickets.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('support.title')}</TableHead>
          <TableHead>{t('staff.status')}</TableHead>
          <TableHead>{t('support.priority')}</TableHead>
          <TableHead>{t('support.creator')}</TableHead>
          <TableHead>{t('support.assignee')}</TableHead>
          <TableHead>{t('support.lastUpdated')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTickets.length > 0 ? sortedTickets.map((ticket) => (
          <TableRow key={ticket.id} onClick={() => onSelectTicket(ticket)} className="cursor-pointer">
            <TableCell className="font-medium">{ticket.title}</TableCell>
            <TableCell>
                <Badge variant={getStatusVariant(ticket.status)}>{t(`support.statuses.${ticket.status.toLowerCase().replace(" ", "")}`)}</Badge>
            </TableCell>
            <TableCell>
                <Badge variant={getPriorityVariant(ticket.priority)}>{t(`support.priorities.${ticket.priority.toLowerCase()}`)}</Badge>
            </TableCell>
            <TableCell>{ticket.creatorName}</TableCell>
            <TableCell>{ticket.assignee?.name || t('support.unassigned')}</TableCell>
            <TableCell>{formatDistanceToNow(ticket.timestamp, { addSuffix: true })}</TableCell>
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={6} className="text-center h-24">{t('support.noTickets')}</TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
