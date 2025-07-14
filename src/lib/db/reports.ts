

import { getOrders } from './orders';
import { getStaff } from './staff';
import { getTables } from './tables';
import { getMeals } from './products';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';

export async function getDashboardKpis() {
    const orders = await getOrders();
    const tables = await getTables();

    const completedOrders = orders.filter(o => o.status === 'Completed');
    const canceledOrders = orders.filter(o => o.status === 'Canceled');

    const totalRevenue = completedOrders.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0), 0);
    
    // Placeholder for total spending, would need an expenses table
    const totalSpending = totalRevenue * 0.45; // Mocking this for now
    
    const totalOrders = orders.length;

    const avgSale = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    
    const activeTables = orders.filter(o => o.status === 'In Progress' || o.status === 'Pending').length;

    return {
        totalRevenue: totalRevenue,
        totalSpending: totalSpending,
        totalOrders: totalOrders,
        completedOrders: completedOrders.length,
        canceledOrders: canceledOrders.length,
        activeTables: `${activeTables} / ${tables.length}`,
    }
}


export async function getTopSellingProducts() {
    const orders = await getOrders();
    const meals = await getMeals();

    const productSales: { [key: string]: { name: string, sales: number, avatar: string, dataAiHint: string } } = {};

    orders.filter(o => o.status === 'Completed').forEach(order => {
        order.items.forEach(item => {
            if (!productSales[item.id]) {
                 const mealDetails = meals.find(m => m.id === item.id);
                productSales[item.id] = { 
                    name: item.name, 
                    sales: 0, 
                    avatar: mealDetails?.image || 'https://placehold.co/100x100.png',
                    dataAiHint: 'product' 
                };
            }
            productSales[item.id].sales += item.price * item.quantity;
        })
    });

    return Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)
        .map(p => ({...p, sales: `+XAF ${p.sales.toLocaleString()}`}));
}


export async function getRecentSales() {
    const orders = await getOrders();
    const completedOrders = orders.filter(o => o.status === 'Completed');
    const now = new Date();
    
    const salesByMonth: { [key: string]: number } = {};

    for (let i = 0; i < 6; i++) {
        const date = subMonths(now, i);
        const monthKey = format(date, 'yyyy-MM');
        salesByMonth[monthKey] = 0;
    }

    completedOrders.forEach(order => {
        const monthKey = format(new Date(order.timestamp), 'yyyy-MM');
        if (monthKey in salesByMonth) {
            const orderTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            salesByMonth[monthKey] += orderTotal;
        }
    });

    return Object.entries(salesByMonth)
        .map(([monthKey, sales]) => ({
            month: format(new Date(monthKey), 'MMMM'),
            sales,
        }))
        .reverse();
}

export async function getStaffPerformance() {
    const staff = await getStaff();
    const orders = await getOrders(); // Assuming orders have a 'cashierId' or similar field
    // This is a simplified mock as we don't store cashier ID on orders yet.
    // In a real app, you'd join orders and users tables.

    const relevantStaff = staff.filter(s => ['Waiter', 'Cashier', 'Manager'].includes(s.role));
    
    const performanceData = relevantStaff.map(s => ({
        ...s,
        totalSales: Math.floor(Math.random() * 500000) + 50000, // Random sales for demo
    }));
    
    return performanceData.sort((a, b) => b.totalSales - a.totalSales);
}
