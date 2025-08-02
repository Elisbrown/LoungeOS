import { NextRequest } from 'next/server'
import Database from 'better-sqlite3'

function getDb(): Database.Database {
  const db = new Database('loungeos.db')
  db.pragma('journal_mode = WAL')
  return db
}

export async function GET() {
  const db = getDb()
  
  try {
    // Get staff performance data (since orders table doesn't have user_id, we'll use mock data for now)
    const staffPerformanceStmt = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.avatar
      FROM users u
      WHERE u.role IN ('Waiter', 'Cashier', 'Manager', 'Bartender')
      ORDER BY u.name
    `)
    
    const staffData = staffPerformanceStmt.all()
    
    const staffPerformance = staffData.map((staff, index) => {
      // Generate realistic mock data based on role
      const baseOrders = staff.role === 'Manager' ? 25 : staff.role === 'Cashier' ? 35 : 40
      const baseRevenue = staff.role === 'Manager' ? 75000 : staff.role === 'Cashier' ? 95000 : 110000
      const baseRating = staff.role === 'Manager' ? 4.7 : staff.role === 'Cashier' ? 4.5 : 4.8
      
      const orders_processed = baseOrders + Math.floor(Math.random() * 20)
      const total_revenue = baseRevenue + Math.floor(Math.random() * 50000)
      const average_order_value = Math.round(total_revenue / orders_processed)
      const completion_rate = 95 + Math.random() * 4
      const customer_rating = baseRating + (Math.random() * 0.3)
      const hours_worked = 150 + Math.floor(Math.random() * 50)
      const performance_score = 85 + Math.floor(Math.random() * 15)
      
      return {
        ...staff,
        id: staff.id.toString(),
        rank: index + 1,
        orders_processed,
        total_revenue,
        average_order_value,
        completion_rate: Math.round(completion_rate * 10) / 10,
        customer_rating: Math.round(customer_rating * 10) / 10,
        hours_worked,
        performance_score
      }
    })

    // If no real data, return mock data
    if (staffPerformance.length === 0) {
      return Response.json([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Waiter',
          avatar: '',
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
          avatar: '',
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
          avatar: '',
          orders_processed: 42,
          total_revenue: 98000,
          average_order_value: 2333,
          completion_rate: 96.8,
          customer_rating: 4.7,
          hours_worked: 165,
          performance_score: 89,
          rank: 3
        }
      ])
    }

    return Response.json(staffPerformance)
  } catch (error) {
    console.error('Error fetching staff performance:', error)
    return Response.json(
      { error: 'Failed to fetch staff performance' },
      { status: 500 }
    )
  } finally {
    db.close()
  }
} 