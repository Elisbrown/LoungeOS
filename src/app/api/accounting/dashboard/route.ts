import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

// Type definitions for database query results
interface TotalResult {
    total: number
}

interface MonthlyRevenueRow {
    month: string
    year: string
    revenue: number
}

interface MonthlyExpensesRow {
    month: string
    year: string
    expenses: number
}

function getDb(): Database.Database {
    const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'loungeos.db')
    return new Database(dbPath)
}

export async function GET() {
    try {
        const db = getDb()

        // Get current month and previous month for comparisons
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
        const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

        // Calculate revenue from completed orders
        const currentMonthRevenue = db.prepare(`
            SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as total
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'Completed'
            AND strftime('%m', o.timestamp) = ?
            AND strftime('%Y', o.timestamp) = ?
        `).get(currentMonth.toString().padStart(2, '0'), currentYear.toString()) as TotalResult

        const previousMonthRevenue = db.prepare(`
            SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as total
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'Completed'
            AND strftime('%m', o.timestamp) = ?
            AND strftime('%Y', o.timestamp) = ?
        `).get(previousMonth.toString().padStart(2, '0'), previousYear.toString()) as TotalResult

        // Calculate expenses from inventory movements (cost of goods sold)
        const currentMonthExpenses = db.prepare(`
            SELECT COALESCE(SUM(m.quantity * COALESCE(m.unit_cost, 0)), 0) as total
            FROM inventory_movements m
            WHERE m.movement_type = 'OUT'
            AND strftime('%m', m.movement_date) = ?
            AND strftime('%Y', m.movement_date) = ?
        `).get(currentMonth.toString().padStart(2, '0'), currentYear.toString()) as TotalResult

        const previousMonthExpenses = db.prepare(`
            SELECT COALESCE(SUM(m.quantity * COALESCE(m.unit_cost, 0)), 0) as total
            FROM inventory_movements m
            WHERE m.movement_type = 'OUT'
            AND strftime('%m', m.movement_date) = ?
            AND strftime('%Y', m.movement_date) = ?
        `).get(previousMonth.toString().padStart(2, '0'), previousYear.toString()) as TotalResult

        // Calculate monthly revenue for the last 6 months
        const monthlyRevenue = db.prepare(`
            SELECT 
                strftime('%m', o.timestamp) as month,
                strftime('%Y', o.timestamp) as year,
                COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'Completed'
            AND o.timestamp >= date('now', '-6 months')
            GROUP BY strftime('%Y-%m', o.timestamp)
            ORDER BY year, month
        `).all() as MonthlyRevenueRow[]

        // Calculate monthly expenses for the last 6 months
        const monthlyExpenses = db.prepare(`
            SELECT 
                strftime('%m', m.movement_date) as month,
                strftime('%Y', m.movement_date) as year,
                COALESCE(SUM(m.quantity * COALESCE(m.unit_cost, 0)), 0) as expenses
            FROM inventory_movements m
            WHERE m.movement_type = 'OUT'
            AND m.movement_date >= date('now', '-6 months')
            GROUP BY strftime('%Y-%m', m.movement_date)
            ORDER BY year, month
        `).all() as MonthlyExpensesRow[]

        // Calculate current month profit
        const currentRevenue = currentMonthRevenue?.total || 0
        const currentExpenses = currentMonthExpenses?.total || 0
        const currentProfit = currentRevenue - currentExpenses

        // Calculate previous month profit
        const previousRevenue = previousMonthRevenue?.total || 0
        const previousExpenses = previousMonthExpenses?.total || 0
        const previousProfit = previousRevenue - previousExpenses

        // Calculate percentage changes
        const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
        const expensesChange = previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0
        const profitChange = previousProfit > 0 ? ((currentProfit - previousProfit) / previousProfit) * 100 : 0

        // Calculate profit margin
        const profitMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0
        const previousProfitMargin = previousRevenue > 0 ? (previousProfit / previousRevenue) * 100 : 0
        const profitMarginChange = previousProfitMargin > 0 ? profitMargin - previousProfitMargin : 0

        // Prepare chart data
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        const chartData = monthNames.slice(-6).map((month, index) => {
            const monthNum = (now.getMonth() - 5 + index + 12) % 12 + 1
            const year = now.getMonth() - 5 + index < 0 ? now.getFullYear() - 1 : now.getFullYear()

            const revenue = monthlyRevenue.find(r =>
                parseInt(r.month) === monthNum && parseInt(r.year) === year
            )?.revenue || 0

            const expenses = monthlyExpenses.find(e =>
                parseInt(e.month) === monthNum && parseInt(e.year) === year
            )?.expenses || 0

            return {
                month,
                revenue: Math.round(revenue),
                expenses: Math.round(expenses)
            }
        })

        const dashboardData = {
            currentMonth: {
                netProfit: Math.round(currentProfit),
                totalRevenue: Math.round(currentRevenue),
                totalExpenses: Math.round(currentExpenses),
                profitMargin: Math.round(profitMargin * 100) / 100
            },
            changes: {
                revenue: Math.round(revenueChange * 100) / 100,
                expenses: Math.round(expensesChange * 100) / 100,
                profit: Math.round(profitChange * 100) / 100,
                profitMargin: Math.round(profitMarginChange * 100) / 100
            },
            chartData
        }

        return NextResponse.json(dashboardData)
    } catch (error) {
        console.error('Error fetching accounting dashboard data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch accounting dashboard data' },
            { status: 500 }
        )
    }
} 