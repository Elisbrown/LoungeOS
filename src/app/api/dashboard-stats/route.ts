
// src/app/api/dashboard-stats/route.ts
export const runtime = 'nodejs';

import { NextRequest } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

function getDb(): Database.Database {
  const dbPath = path.join(process.cwd(), 'loungeos.db')
  return new Database(dbPath)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fromDate = searchParams.get('from')
  const toDate = searchParams.get('to')

  const db = getDb()
  
  try {
    // Get current date and yesterday
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Total orders
    const totalOrdersStmt = db.prepare('SELECT COUNT(*) as count FROM orders')
    const totalOrders = totalOrdersStmt.get().count

    // Completed orders
    const completedOrdersStmt = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Completed'")
    const completedOrders = completedOrdersStmt.get().count

    // Canceled orders
    const canceledOrdersStmt = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Canceled'")
    const canceledOrders = canceledOrdersStmt.get().count

    // Pending orders
    const pendingOrdersStmt = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('Pending', 'In Progress')")
    const pendingOrders = pendingOrdersStmt.get().count

    // Total revenue
    const totalRevenueStmt = db.prepare(`
      SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as total
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'Completed'
    `)
    const totalRevenue = totalRevenueStmt.get().total || 0

    // Daily sales (today)
    const dailySalesStmt = db.prepare(`
      SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as total
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'Completed' 
      AND DATE(o.timestamp) = ?
    `)
    const dailySales = dailySalesStmt.get(todayStr).total || 0

    // Yesterday sales
    const yesterdaySalesStmt = db.prepare(`
      SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as total
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'Completed' 
      AND DATE(o.timestamp) = ?
    `)
    const yesterdaySales = yesterdaySalesStmt.get(yesterdayStr).total || 0

    // Calculate changes
    const salesChange = yesterdaySales > 0 ? ((dailySales - yesterdaySales) / yesterdaySales) * 100 : 0
    const ordersChange = completedOrders > 0 ? ((totalOrders - completedOrders) / completedOrders) * 100 : 0
    const revenueChange = yesterdaySales > 0 ? ((totalRevenue - yesterdaySales) / yesterdaySales) * 100 : 0

    // Total spending (inventory cost)
    const totalSpendingStmt = db.prepare(`
      SELECT COALESCE(SUM(current_stock * COALESCE(cost_per_unit, 0)), 0) as total
      FROM inventory_items
    `)
    const totalSpending = totalSpendingStmt.get().total || 0

    // Cash flow (revenue - spending)
    const cashFlow = totalRevenue - totalSpending
    const cashFlowChange = yesterdaySales > 0 ? ((cashFlow - (yesterdaySales - totalSpending)) / (yesterdaySales - totalSpending)) * 100 : 0

    // Active tables
    const activeTablesStmt = db.prepare("SELECT COUNT(*) as count FROM tables WHERE status = 'Occupied'")
    const totalTablesStmt = db.prepare('SELECT COUNT(*) as count FROM tables')
    const activeTables = activeTablesStmt.get().count
    const totalTables = totalTablesStmt.get().count

    // Recent sales
    const recentSalesStmt = db.prepare(`
      SELECT 
        o.id,
        o.table_name as "table",
        o.timestamp,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_amount,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'Completed'
      GROUP BY o.id
      ORDER BY o.timestamp DESC
      LIMIT 10
    `)
    const recentSales = recentSalesStmt.all()

    // Top selling products
    const topProductsStmt = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.category,
        p.image,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'Completed'
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `)
    const topSellingProducts = topProductsStmt.all()

    // Chart data for the last 30 days
    const chartDataStmt = db.prepare(`
      SELECT 
        DATE(o.timestamp) as date,
        COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
        COUNT(DISTINCT o.id) as orders
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'Completed'
      AND o.timestamp >= date('now', '-30 days')
      GROUP BY DATE(o.timestamp)
      ORDER BY date
    `)
    const chartDataRaw = chartDataStmt.all()

    // Process chart data
    const chartData = {
      revenue: chartDataRaw.map(row => ({
        date: row.date,
        value: row.revenue || 0
      })),
      orders: chartDataRaw.map(row => ({
        date: row.date,
        value: row.orders || 0
      })),
      cashFlow: chartDataRaw.map(row => ({
        date: row.date,
        value: (row.revenue || 0) - (totalSpending / 30) // Approximate daily spending
      }))
    }

    // Staff performance data (mock for now)
    const staffPerformance = [
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
    ]

    return Response.json({
      totalRevenue,
      totalSpending,
      totalOrders,
      completedOrders,
      canceledOrders,
      pendingOrders,
      activeTables: `${activeTables} / ${totalTables}`,
      topSellingProducts,
      recentSales,
      dailySales,
      yesterdaySales,
      salesChange,
      ordersChange,
      revenueChange,
      cashFlow,
      cashFlowChange,
      staffPerformance,
      chartData
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return Response.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  } finally {
    db.close()
  }
}
