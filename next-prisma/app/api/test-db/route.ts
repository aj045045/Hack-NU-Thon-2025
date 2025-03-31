import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // For MongoDB, we can't use $queryRaw with SQL, so we'll try a different approach
    // First, try to check the database connection by running a simple operation
    let isConnected = false;
    try {
      // Check if the client is connected by trying to run a simple operation
      await prisma.$connect();
      isConnected = true;
    } catch (connectionError) {
      console.error('Database connection failed:', connectionError);
      throw new Error('Failed to connect to database');
    }
    
    // Now try counting users and transactions
    const userCount = await prisma.user.count()
      .catch((e: Error) => {
        console.error('User count failed:', e);
        return 0;
      });
    
    const transactionCount = await prisma.transaction.count()
      .catch((e: Error) => {
        console.error('Transaction count failed:', e);
        return 0;
      });
    
    // Get connection details (masking password)
    const dbUrl = process.env.DATABASE_URL || 'Not set';
    const maskedUrl = dbUrl.replace(/:[^:]*@/, ':****@');
    
    console.log(`Database connection successful: Users=${userCount}, Transactions=${transactionCount}`);
    
    return NextResponse.json({
      status: 'ok',
      connected: isConnected,
      database: {
        url: maskedUrl,
        provider: 'mongodb'
      },
      counts: {
        users: userCount,
        transactions: transactionCount
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      connected: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 