
// src/app/api/dashboard-stats/route.ts
import { NextResponse } from 'next/server';
import { getDashboardKpis, getTopSellingProducts, getRecentSales } from '@/lib/db/reports';

export async function GET() {
    try {
        const [kpis, topProducts, recentSales] = await Promise.all([
            getDashboardKpis(),
            getTopSellingProducts(),
            getRecentSales(),
        ]);

        return NextResponse.json({
            ...kpis,
            topSellingProducts: topProducts,
            recentSales: recentSales,
        });

    } catch (error: any) {
        console.error('Failed to get dashboard stats:', error);
        return NextResponse.json({ message: 'Failed to get dashboard stats', error: error.message }, { status: 500 });
    }
}
