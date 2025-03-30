import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // Get the session to verify authentication
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get email from query params or use session email
    const url = new URL(request.url);
    const email = url.searchParams.get('email') || session.user.email;

    // Verify the requested email matches the session email (security measure)
    if (email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized to access this user data' }, { status: 403 });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            transactionsSent: true,
            transactionsReceived: true,
            fraudReports: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch recent transactions for this user
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: {
          select: { name: true }
        },
        receiver: {
          select: { name: true }
        }
      },
      orderBy: {
        transactionDateTime: 'desc'
      },
      take: 3 // Limit to recent 3 transactions
    });

    // Format transactions for the front-end
    const recentTransactions = transactions.map(t => {
      const isSender = t.senderId === user.id;
      return {
        id: t.id,
        amount: t.amount,
        date: t.transactionDateTime.toISOString().split('T')[0],
        type: isSender ? 'sent' : 'received',
        to: isSender ? t.receiver.name : undefined,
        from: !isSender ? t.sender.name : undefined
      };
    });

    // Prepare response (excluding sensitive fields)
    const safeUser = {
      ...user,
      password: undefined, // Remove password from response
      recentTransactions
    };

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 