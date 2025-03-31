import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    // Check if the current user is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    // Get query parameters for pagination and filtering
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "transactionDateTime";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const transactionMode = searchParams.get("transactionMode") || undefined;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Prepare where clause for filtering
    const where: any = {};
    if (transactionMode) {
      where.transactionMode = transactionMode;
    }

    // Get total count for pagination
    const totalCount = await db.transaction.count({ where });

    // Fetch transactions with pagination, sorting and filtering
    const transactions = await db.transaction.findMany({
      skip,
      take: limit,
      where,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            accountNumber: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            accountNumber: true
          }
        }
      }
    });

    // Map the results to handle potential null values
    const mappedTransactions = transactions.map(transaction => ({
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
    }));

    return NextResponse.json({
      transactions: mappedTransactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
} 