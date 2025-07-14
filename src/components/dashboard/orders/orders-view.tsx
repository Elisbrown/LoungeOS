
"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useOrders, type Order, type OrderStatus } from "@/context/order-context"
import { useAuth } from "@/context/auth-context"
import { useTranslation } from "@/hooks/use-translation"
import { formatDistanceToNow } from "date-fns"
import { OrderDetailsDialog } from "./order-details-dialog"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"

const statusOptions: (OrderStatus | "All")[] = ["All", "Pending", "In Progress", "Ready", "Completed"];

export function OrdersView() {
  const { orders } = useOrders()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "All">("All")
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  
  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case "Pending": return "destructive"
      case "In Progress": return "secondary"
      case "Ready": return "default"
      case "Completed": return "success"
      default: return "outline"
    }
  }

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
        const matchesUser = !user || user.role === "Manager" || user.role === "Super Admin";
        const matchesSearch = searchTerm === "" || 
                              order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              order.table.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || order.status === statusFilter;
        return matchesUser && matchesSearch && matchesStatus;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [orders, searchTerm, user, statusFilter])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    const headers = ["Order ID", "Table", "Total (XAF)", "Status", "Timestamp"];
    const rows = paginatedOrders.map(order => [
      order.id,
      order.table,
      order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      order.status,
      order.timestamp.toISOString()
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
        <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
                <Input
                  placeholder={t('orders.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map(status => (
                            <SelectItem key={status} value={status}>
                                {t(`orders.statuses.${status.toLowerCase().replace(' ', '_')}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                {t('reports.export')} CSV
            </Button>
        </div>
          <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('orders.orderId')}</TableHead>
                    <TableHead>{t('orders.table')}</TableHead>
                    <TableHead>{t('orders.total')}</TableHead>
                    <TableHead>{t('inventory.status')}</TableHead>
                    <TableHead>{t('orders.lastUpdated')}</TableHead>
                    <TableHead className="text-right">{t('inventory.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => {
                        const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                        return (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.table}</TableCell>
                                <TableCell>XAF {total.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(order.status)}>{t(`orders.statuses.${order.status.toLowerCase().replace(' ', '_')}`)}</Badge>
                                </TableCell>
                                <TableCell>{formatDistanceToNow(order.timestamp, { addSuffix: true })}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                        {t('orders.viewDetails')}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })
                  ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            {t('orders.noOrdersFound')}
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
           </div>
      {selectedOrder && (
          <OrderDetailsDialog 
            order={selectedOrder}
            open={!!selectedOrder}
            onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
          />
      )}
    </>
  )
}
