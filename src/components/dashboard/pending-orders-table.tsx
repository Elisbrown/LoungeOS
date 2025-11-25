"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, CheckCircle, XCircle, Eye, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { formatCurrency } from '@/lib/utils'
import { useSettings } from '@/context/settings-context'

type PendingOrder = {
  id: string;
  table: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  status: 'Pending' | 'In Progress' | 'Ready' | 'Completed' | 'Canceled';
  timestamp: string;
  total_amount: number;
  item_count: number;
}

export function PendingOrdersTable() {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { settings } = useSettings();

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('/api/orders?status=pending');
      if (response.ok) {
        const data = await response.json();
        setPendingOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch pending orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pending orders"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: orderId,
          status: newStatus,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Refresh the orders list
        await fetchPendingOrders();
        toast({
          title: "Success",
          description: `Order ${newStatus.toLowerCase()} successfully`
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status"
      });
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'In Progress':
        return 'default';
      case 'Ready':
        return 'default';
      case 'Completed':
        return 'default';
      case 'Canceled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-3 w-3" />;
      case 'In Progress':
        return <ArrowRight className="h-3 w-3" />;
      case 'Ready':
        return <CheckCircle className="h-3 w-3" />;
      case 'Completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'Canceled':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pendingOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No Pending Orders</h3>
        <p className="text-sm text-muted-foreground">All orders are up to date!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {pendingOrders.length} Pending
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPendingOrders}>
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {pendingOrders.map(order => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">Table {order.table}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(order.timestamp)} • {order.item_count} items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(
                      order.total_amount || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
                      settings.defaultCurrency
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Order #{order.id.slice(-6)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={`${order.id}-${item.id}-${idx}`} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{item.quantity}x</span>
                      <span>{item.name}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(item.price * item.quantity, settings.defaultCurrency)}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'In Progress')}
                    disabled={order.status !== 'Pending'}
                  >
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'Ready')}
                    disabled={order.status === 'Pending'}
                  >
                    Ready
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'Completed')}
                    disabled={order.status === 'Pending'}
                  >
                    Complete
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'Canceled')}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 