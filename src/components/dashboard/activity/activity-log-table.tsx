
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
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { useTranslation } from "@/hooks/use-translation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2, Download } from "lucide-react"
import type { ActivityLog } from '@/context/activity-log-context'
import { useActivityLog } from '@/hooks/use-activity-log'
import { useToast } from '@/hooks/use-toast'

type ActivityLogTableProps = {
  logs: ActivityLog[]
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  const { t } = useTranslation()
  const { clearLogs } = useActivityLog()
  const { toast } = useToast()

  const handleClearLogs = () => {
    clearLogs()
    toast({
      title: t('activity.logsCleared'),
      description: t('activity.logsClearedDesc'),
    })
  }

  const handleExportCSV = () => {
    const headers = ["User", "Email", "Action", "Details", "Timestamp"];
    const rows = logs.map(log => [
      log.user.name,
      log.user.email,
      log.action,
      log.details,
      format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `activity_logs_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('activity.totalLogs', { count: logs.length })}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            {t('reports.export')} CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearLogs}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('activity.clearLogs')}
          </Button>
        </div>
      </div>
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
    </div>
  )
}
