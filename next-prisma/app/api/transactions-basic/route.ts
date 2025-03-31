import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions-basic - A simplified version to test database connection
export async function GET() {
  try {
    console.log("Basic API: Testing database connection");
    
    // First try getting users without any complex relations
    const usersPromise = prisma.user.findMany({
      take: 5,
      select: { id: true, name: true, accountNumber: true }
    }).catch(e => {
      console.error("Basic API: User query failed:", e);
      return null;
    });
    
    // Also try getting transactions separately
    const transactionsPromise = prisma.transaction.findMany({
      take: 5,
      select: { 
        id: true, 
        senderAccountNumber: true,
        receiverAccountNumber: true, 
        amount: true
      }
    }).catch(e => {
      console.error("Basic API: Transaction query failed:", e);
      return null;
    });
    
    // Wait for both promises to resolve
    const [users, transactions] = await Promise.all([usersPromise, transactionsPromise]);
    
    // Count totals - these operations won't fail if the previous queries worked
    const userCount = await prisma.user.count().catch(() => 0);
    const transactionCount = await prisma.transaction.count().catch(() => 0);
    
    // Add explicit serialization to convert MongoDB objects
    const safeUsers = users ? JSON.parse(JSON.stringify(users)) : [];
    const safeTransactions = transactions ? JSON.parse(JSON.stringify(transactions)) : [];
    
    console.log(`Basic API: Connection successful. Found ${userCount} users and ${transactionCount} transactions`);
    
    return NextResponse.json({
      status: "success",
      message: "Database connection is working",
      counts: {
        users: userCount,
        transactions: transactionCount
      },
      // Include sample data for debugging
      samples: {
        users: safeUsers,
        transactions: safeTransactions
      }
    });
  } catch (error) {
    console.error("Basic API Error:", error);
    return NextResponse.json(
      { 
        status: "error",
        error: "Failed to connect to database", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 