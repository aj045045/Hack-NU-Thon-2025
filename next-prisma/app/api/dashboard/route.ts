import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { TransactionMode } from "@prisma/client";

// Define interfaces for better type safety
interface FraudStatsByMode {
  transactionMode: TransactionMode;
  count: number;
}

interface FraudStats {
  total: number;
  percentage: number;
  byMode: FraudStatsByMode[];
}

// Regular user dashboard - doesn't require admin privileges
export async function GET() {
  try {
    // Initialize default values in case of query errors
    let totalTransactions = 0;
    let transactionVolume: any = { _sum: { amount: 0 } };
    let transactionsByMode: any[] = [];
    let recentTransactions: any[] = [];
    let dailyTransactions: any[] = [];
    let fraudStats: FraudStats = {
      total: 0,
      percentage: 0,
      byMode: []
    };

    try {
      // Get total transactions count
      totalTransactions = await db.transaction.count();
    } catch (error) {
      console.error("Error fetching transaction count:", error);
    }

    try {
      // Get transaction volume (sum of all amounts)
      transactionVolume = await db.transaction.aggregate({
        _sum: {
          amount: true
        }
      });
    } catch (error) {
      console.error("Error fetching transaction volume:", error);
    }

    try {
      // Get transactions by mode
      const groupedTransactions = await db.transaction.groupBy({
        by: ['transactionMode'],
        _count: {
          _all: true
        },
        _sum: {
          amount: true
        }
      });
      transactionsByMode = groupedTransactions as any[];
    } catch (error) {
      console.error("Error fetching transactions by mode:", error);
    }

    try {
      // Get recent transactions (last 10)
      const recent = await db.transaction.findMany({
        orderBy: {
          transactionDateTime: 'desc'
        },
        take: 10,
        select: {
          id: true,
          amount: true,
          transactionDateTime: true,
          transactionMode: true,
          sender: {
            select: {
              accountNumber: true
            }
          },
          receiver: {
            select: {
              accountNumber: true
            }
          }
        }
      });
      
      // Format recent transactions
      recentTransactions = recent.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        transactionDateTime: tx.transactionDateTime.toISOString(),
        transactionMode: tx.transactionMode,
        senderAccountNumber: tx.sender?.accountNumber || 'Unknown',
        receiverAccountNumber: tx.receiver?.accountNumber || 'Unknown',
        // Add random fraud score between 0 and 100
        fraudScore: Math.floor(Math.random() * 101)
      }));
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
    }

    try {
      // Get transaction data for chart (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const dailyData = await db.transaction.groupBy({
        by: ['transactionDateTime'],
        where: {
          transactionDateTime: {
            gte: sevenDaysAgo
          }
        },
        _count: {
          _all: true
        },
        _sum: {
          amount: true
        },
        orderBy: {
          transactionDateTime: 'asc'
        }
      });
      
      // Format data for chart (fill in missing days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      dailyTransactions = last7Days.map(date => {
        // Find data for this date by matching date part of ISO string
        const found = dailyData.find(d => 
          d.transactionDateTime.toISOString().split('T')[0] === date
        );
        
        return {
          date,
          count: found && found._count ? found._count._all || 0 : 0,
          volume: found && found._sum ? found._sum.amount || 0 : 0,
          // Add random fraud count (between 0 and 10% of transactions)
          fraudCount: found && found._count && found._count._all 
            ? Math.floor(Math.random() * (found._count._all * 0.1)) 
            : 0
        };
      });
    } catch (error) {
      console.error("Error fetching daily transactions:", error);
    }

    // Generate random fraud statistics
    const fraudTotal = Math.floor(Math.random() * (totalTransactions * 0.05)); // 0-5% of total
    fraudStats = {
      total: fraudTotal,
      percentage: (fraudTotal / totalTransactions) * 100,
      byMode: transactionsByMode.map(mode => ({
        transactionMode: mode.transactionMode as TransactionMode,
        count: Math.floor(Math.random() * ((mode._count?._all || 1) * 0.08)) // 0-8% fraud by mode
      }))
    };

    // Return simplified dashboard data
    return NextResponse.json({
      transactions: {
        total: totalTransactions,
        volume: transactionVolume._sum?.amount ?? 0,
        byMode: transactionsByMode,
        recent: recentTransactions,
        chartData: dailyTransactions
      },
      fraud: fraudStats
    });
    
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
} 