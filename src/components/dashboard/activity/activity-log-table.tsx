
// New component for displaying activity logs in a table
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { useTranslation } from "@/hooks/use-translation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ActivityLog } from '@/context/activity-log-context'

type ActivityLogTableProps = {
  logs: ActivityLog[]
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  const { t } = useTranslation()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('activity.user')}</TableHead>
          <TableHead>{t('activity.action')}</TableHead>
          <TableHead>{t('activity.details')}</TableHead>
          <TableHead>{t('activity.timestamp')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length > 0 ? (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                 <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={log.user.avatar} alt={log.user.name} data-ai-hint="person" />
                      <AvatarFallback>{log.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{log.user.name}</p>
                        <p className="text-xs text-muted-foreground">{log.user.email}</p>
                    </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{log.action}</TableCell>
              <TableCell>{log.details}</TableCell>
              <TableCell>{format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              {t('activity.noLogs')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
