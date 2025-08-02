"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, TrendingUp, TrendingDown, Users, DollarSign, PackageSearch } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { formatCurrency } from '@/lib/utils'
import { useSettings } from '@/context/settings-context'

type StaffPerformance = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  orders_processed: number;
  total_revenue: number;
  average_order_value: number;
  completion_rate: number;
  customer_rating: number;
  hours_worked: number;
  performance_score: number;
  rank: number;
}

type StaffPerformanceTableProps = {
  data: StaffPerformance[];
}

export function StaffPerformanceTable({ data }: StaffPerformanceTableProps) {
  const [staffData, setStaffData] = useState<StaffPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'performance_score' | 'orders_processed' | 'total_revenue'>('performance_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();
  const { t } = useTranslation();
  const { settings } = useSettings();

  const fetchStaffPerformance = async () => {
    try {
      const response = await fetch('/api/staff/performance');
      if (response.ok) {
        const data = await response.json();
        setStaffData(data);
      }
    } catch (error) {
      console.error('Failed to fetch staff performance:', error);
      // Use mock data for now
      setStaffData([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Waiter',
          orders_processed: 45,
          total_revenue: 125000,
          average_order_value: 2778,
          completion_rate: 98.5,
          customer_rating: 4.8,
          hours_worked: 160,
          performance_score: 95,
          rank: 1
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Cashier',
          orders_processed: 38,
          total_revenue: 110000,
          average_order_value: 2895,
          completion_rate: 97.2,
          customer_rating: 4.6,
          hours_worked: 155,
          performance_score: 92,
          rank: 2
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          role: 'Bartender',
          orders_processed: 42,
          total_revenue: 98000,
          average_order_value: 2333,
          completion_rate: 96.8,
          customer_rating: 4.7,
          hours_worked: 165,
          performance_score: 89,
          rank: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffPerformance();
  }, []);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedData = [...staffData].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    if (score >= 70) return 'outline';
    return 'destructive';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Top Performer</p>
                <p className="font-semibold">{staffData[0]?.name || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PackageSearch className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="font-semibold">
                  {staffData.reduce((sum, staff) => sum + staff.orders_processed, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="font-semibold">
                  {formatCurrency(
                    staffData.reduce((sum, staff) => sum + staff.total_revenue, 0),
                    settings.defaultCurrency
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('orders_processed')}
                >
                  Orders
                  {sortBy === 'orders_processed' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('total_revenue')}
                >
                  Revenue
                  {sortBy === 'total_revenue' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead>Avg Order</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('performance_score')}
                >
                  Performance
                  {sortBy === 'performance_score' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getRankIcon(staff.rank)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={staff.avatar} alt={staff.name} />
                        <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{staff.name}</div>
                        <div className="text-sm text-muted-foreground">{staff.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{staff.role}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {staff.orders_processed}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(staff.total_revenue, settings.defaultCurrency)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(staff.average_order_value, settings.defaultCurrency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{staff.completion_rate}%</span>
                      {staff.completion_rate >= 95 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{staff.customer_rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getPerformanceVariant(staff.performance_score)}
                      className={getPerformanceColor(staff.performance_score)}
                    >
                      {staff.performance_score}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Performance Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Average Performance Score</p>
              <p className="font-medium">
                {(staffData.reduce((sum, staff) => sum + staff.performance_score, 0) / staffData.length).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Average Customer Rating</p>
              <p className="font-medium">
                {(staffData.reduce((sum, staff) => sum + staff.customer_rating, 0) / staffData.length).toFixed(1)} ★
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Average Completion Rate</p>
              <p className="font-medium">
                {(staffData.reduce((sum, staff) => sum + staff.completion_rate, 0) / staffData.length).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Total Hours Worked</p>
              <p className="font-medium">
                {staffData.reduce((sum, staff) => sum + staff.hours_worked, 0)} hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 