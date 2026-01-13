import { NextResponse } from 'next/server';
import { getChartOfAccounts } from '@/lib/db/accounting';

export async function GET() {
  try {
    const accounts = getChartOfAccounts();
    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error('Error fetching chart of accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart of accounts', message: error.message },
      { status: 500 }
    );
  }
}
