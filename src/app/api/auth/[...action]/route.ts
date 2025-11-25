// src/app/api/auth/[...action]/route.ts

import { NextResponse } from 'next/server';
import { getStaffByEmail, verifyPassword, updatePassword as dbUpdatePassword } from '@/lib/db/staff';

export const runtime = 'nodejs';

async function handleLogin(request: Request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }
        
        const user = await getStaffByEmail(email);
        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const isCorrectPassword = await verifyPassword(email, password);
        if (!isCorrectPassword) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const { ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);

    } catch (error: any) {
        return NextResponse.json({ message: 'Login failed', error: error.message }, { status: 500 });
    }
}

async function handleVerifyPassword(request: Request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }
        
        const isCorrectPassword = await verifyPassword(email, password);
        
        return NextResponse.json({ success: isCorrectPassword });

    } catch (error: any) {
        return NextResponse.json({ message: 'Verification failed', error: error.message, success: false }, { status: 500 });
    }
}


async function handlePasswordReset(request: Request) {
    try {
        const { email, newPassword } = await request.json();
        if (!email || !newPassword) {
            return NextResponse.json({ message: 'Email and new password are required' }, { status: 400 });
        }
        
        await dbUpdatePassword(email, newPassword);

        const updatedUser = await getStaffByEmail(email);
        if (!updatedUser) {
             return NextResponse.json({ message: 'User not found after password update' }, { status: 404 });
        }

        return NextResponse.json(updatedUser);

    } catch (error: any) {
        return NextResponse.json({ message: 'Password reset failed', error: error.message }, { status: 500 });
    }
}


export async function POST(
  request: Request,
  context: { params: { action: string[] } }
) {
  // Await params if they are a Promise (Next.js app router)
  const params = context.params instanceof Promise ? await context.params : context.params;
  const action = params.action[0];

  switch (action) {
    case 'login':
      return handleLogin(request);
    case 'reset-password':
      return handlePasswordReset(request);
    case 'verify-password':
      return handleVerifyPassword(request);
    default:
      return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  }
}
