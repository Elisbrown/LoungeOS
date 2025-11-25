
// New component for displaying activity logs in a table
"use client"

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { useTranslation } from "@/hooks/use-translation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2, Download, Search } from "lucide-react"
import type { ActivityLog } from '@/context/activity-log-context'
import { useActivityLog } from '@/hooks/use-activity-log'
import { useToast } from '@/hooks/use-toast'
import { Pagination } from "@/components/ui/pagination"

type ActivityLogTableProps = {
  logs: ActivityLog[]
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  const { t } = useTranslation()
  const { clearLogs } = useActivityLog()
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

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
      log.user?.name || 'Unknown',
      log.user?.email || 'Unknown',
      log.action,
      log.details || '',
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

  // Filter logs based on search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    
    const search = searchTerm.toLowerCase();
    return logs.filter(log => 
      (log.user?.name?.toLowerCase().includes(search)) ||
      (log.user?.email?.toLowerCase().includes(search)) ||
      (log.action?.toLowerCase().includes(search)) ||
      (log.details?.toLowerCase().includes(search))
    );
  }, [logs, searchTerm]);

  // Paginate filtered logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Reset to page 1 when search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => {
            setItemsPerPage(parseInt(value));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
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
          {paginatedLogs.length > 0 ? (
            paginatedLogs.map((log) => {
              const userName = log.user?.name || 'Unknown User';
              const userEmail = log.user?.email || 'No email';
              const userAvatar = log.user?.avatar || "https://placehold.co/100x100.png";
              
              return (
                <TableRow key={log.id}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={userAvatar} alt={userName} data-ai-hint="person" />
                          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{userName}</p>
                            <p className="text-xs text-muted-foreground">{userEmail}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>{log.details || ''}</TableCell>
                  <TableCell>{format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}</TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                {searchTerm ? 'No logs match your search' : t('activity.noLogs')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredLogs.length}
        />
      )}
    </div>
  )
}
