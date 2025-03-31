import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ReviewStatus, TransactionMode, Prisma } from "@prisma/client";


export async function GET() {
  try {
    // Check if the current user is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    // Initialize default values in case of query errors
    let totalUsers = 0;
    let usersByAccountType: any[] = [];
    let adminUsers = 0;
    let totalTransactions = 0;
    let transactionVolume: any = { _sum: { amount: 0 } };
    let transactionsByMode: any[] = [];
    let recentTransactions: any[] = [];
    let totalFraudDetections = 0;
    let fraudByStatus: any[] = [];
    let highRiskUsers = 0;
    let dailyTransactions: any[] = [];
    let accountBalances: any = { _sum: { amount: 0 } };

    try {
      // Get total users count
      totalUsers = await db.user.count();
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
    
    try {
      // Get users by account type
      const groupedUsers = await db.user.groupBy({
        by: ['accountType'],
        _count: {
          _all: true
        }
      });
      usersByAccountType = groupedUsers as any[];
    } catch (error) {
      console.error("Error fetching users by account type:", error);
    }

    try {
      // Get admin users count
      adminUsers = await db.user.count({
        where: {
          isAdmin: true
        }
      });
    } catch (error) {
      console.error("Error fetching admin count:", error);
    }

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
      recentTransactions = await db.transaction.findMany({
        take: 10,
        orderBy: {
          transactionDateTime: 'desc'
        },
        include: {
          sender: {
            select: {
              name: true,
              accountNumber: true
            }
          },
          receiver: {
            select: {
              name: true,
              accountNumber: true
            }
          }
        }
      });
      
      // Log for debugging before mapping
      console.log(`Found ${recentTransactions.length} raw transactions`);
      
      // Map the results to handle potential null values
      recentTransactions = recentTransactions.map(transaction => {
        console.log(`Processing transaction ${transaction.id}, sender: ${transaction.sender ? 'exists' : 'null'}, receiver: ${transaction.receiver ? 'exists' : 'null'}`);
        return {
          id: transaction.id,
          amount: transaction.amount,
          transactionDateTime: transaction.transactionDateTime,
          transactionMode: transaction.transactionMode,
          sender: transaction.sender ? {
            name: transaction.sender.name,
            accountNumber: transaction.sender.accountNumber
          } : null,
          receiver: transaction.receiver ? {
            name: transaction.receiver.name,
            accountNumber: transaction.receiver.accountNumber
          } : null
        };
      });
      
      // Log for debugging
      console.log(`Mapped ${recentTransactions.length} recent transactions`);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
    }

    try {
      // Get fraud detections stats
      totalFraudDetections = await db.fraudDetection.count();
    } catch (error) {
      console.error("Error fetching fraud detection count:", error);
    }
    
    try {
      // Get fraud detections by status
      const groupedFraud = await db.fraudDetection.groupBy({
        by: ['reviewStatus'],
        _count: {
          _all: true
        }
      });
      fraudByStatus = groupedFraud as any[];
    } catch (error) {
      console.error("Error fetching fraud by status:", error);
    }

    try {
      // Get high-risk users (users with at least one confirmed fraud)
      const highRiskUserIds = await db.fraudDetection.findMany({
        where: {
          reviewStatus: ReviewStatus.FRAUD_CONFIRMED
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      });
      
      highRiskUsers = highRiskUserIds.length;
    } catch (error) {
      console.error("Error fetching high risk users:", error);
    }

    try {
      // Get transaction data for chart (last 7 days)
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      
      const groupedDaily = await db.transaction.groupBy({
        by: ['transactionDateTime'],
        _count: {
          _all: true
        },
        _sum: {
          amount: true
        },
        where: {
          transactionDateTime: {
            gte: last7Days
          }
        }
      });
      dailyTransactions = groupedDaily as any[];
    } catch (error) {
      console.error("Error fetching daily transactions:", error);
    }

    // Structure daily transaction data for chart
    const chartData = dailyTransactions.map(day => ({
      date: day.transactionDateTime.toISOString().split('T')[0],
      count: day._count?._all ?? 0,
      volume: day._sum?.amount ?? 0
    }));

    try {
      // Get total account balance (theoretical)
      accountBalances = await db.transaction.aggregate({
        _sum: {
          amount: true
        }
      });
    } catch (error) {
      console.error("Error fetching account balances:", error);
    }

    return NextResponse.json({
      users: {
        total: totalUsers,
        byAccountType: usersByAccountType,
        admins: adminUsers
      },
      transactions: {
        total: totalTransactions,
        volume: transactionVolume._sum?.amount ?? 0,
        byMode: transactionsByMode,
        recent: recentTransactions,
        chartData: chartData
      },
      fraud: {
        total: totalFraudDetections,
        byStatus: fraudByStatus,
        highRiskUsers: highRiskUsers
      },
      financials: {
        totalBalance: accountBalances._sum?.amount ?? 0
      }
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