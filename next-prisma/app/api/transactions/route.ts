import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransactionMode } from "@prisma/client";

// Helper function to safely convert MongoDB objects to plain objects
function safeJson(data: any) {
  return JSON.parse(JSON.stringify(data));
}

// Format account number for display
function formatAccount(accountNumber: string): string {
  if (!accountNumber) return 'Unknown';
  return accountNumber;
}

// GET /api/transactions - Get all transactions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const sortBy = searchParams.get('sortBy') || 'transactionDateTime';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const transactionMode = searchParams.get('transactionMode');
  
  try {
    await prisma.$connect();
    
    console.log("Fetching transactions...");
    
    // Build filter based on transactionMode if provided
    const filter: any = {};
    if (transactionMode) {
      filter.transactionMode = transactionMode;
    }
    
    // First fetch transactions without including user relations to improve reliability
    const transactions = await prisma.transaction.findMany({
      where: filter,
      orderBy: {
        [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc'
      }
    });
    
    // If no transactions, return empty array
    if (!transactions || transactions.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
    
    // Build arrays of sender and receiver IDs
    const senderIds = transactions.map((t: any) => t.senderId).filter(Boolean);
    const receiverIds = transactions.map((t: any) => t.receiverId).filter(Boolean);
    
    // Fetch all users that are involved in these transactions
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: [...senderIds, ...receiverIds]
        }
      }
    });
    
    // Create a map of user IDs to user information for easier lookup
    const userMap: any = {};
    users.forEach((user: any) => {
      userMap[user.id] = user;
    });
    
    // Combine transaction data with user information
    const transactionsWithUsers = transactions.map((transaction: any, index: number) => {
      // Get user info for sender and receiver
      const sender = userMap[transaction.senderId] || null;
      const receiver = userMap[transaction.receiverId] || null;
      
      // Add a random fraud score for each transaction
      const fraudScore = Math.floor(Math.random() * 101);
      
      return {
        ...transaction,
        sender: sender ? { 
          id: sender.id,
          name: sender.name,
          email: sender.email,
          accountNumber: sender.accountNumber
        } : null,
        receiver: receiver ? {
          id: receiver.id,
          name: receiver.name,
          email: receiver.email,
          accountNumber: receiver.accountNumber
        } : null,
        fraudScore: fraudScore // Add random fraud score between 0-100
      };
    });
    
    return NextResponse.json(safeJson(transactionsWithUsers), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("API: Received transaction creation request:", body);
    
    // Validate request body
    const { 
      senderName, 
      receiverName, 
      senderAccountNumber, 
      receiverAccountNumber, 
      amount, 
      transactionMode 
    } = body;

    if (!senderAccountNumber || !receiverAccountNumber || !amount || !transactionMode) {
      console.error("API Error - Missing required fields:", { body });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse amount as float, ensuring it's a number
    const parsedAmount = typeof amount === 'string' 
      ? parseFloat(amount) 
      : Number(amount);
      
    if (isNaN(parsedAmount)) {
      console.error("API Error - Invalid amount format:", { amount });
      return NextResponse.json(
        { error: "Invalid amount format" },
        { status: 400 }
      );
    }

    // First connect to the database explicitly
    await prisma.$connect();

    try {
      // Find a reference user to use for both sender and receiver
      const referenceUser = await prisma.user.findFirst().catch(() => null);
      
      if (!referenceUser) {
        console.error("No users found to reference for transactions");
        return NextResponse.json({ error: "No reference user found in database" }, { status: 500 });
      }
      
      console.log("Using reference user ID:", referenceUser.id);

      // Get count of existing transactions for the new transaction number
      const transactionCount = await prisma.transaction.count();
      const newTransactionNumber = transactionCount + 1;
      console.log("API: New transaction will be number:", newTransactionNumber);

      // Create transaction with the reference user as both sender and receiver
      // The actual sender/receiver identities will be stored in the account number fields
      console.log("API: Creating new transaction");
      const transaction = await prisma.transaction.create({
        data: {
          senderId: referenceUser.id,     // Use the reference user ID
          receiverId: referenceUser.id,   // Use the reference user ID
          senderAccountNumber,            // Store the actual account number
          receiverAccountNumber,
          amount: parsedAmount,
          transactionMode: transactionMode as TransactionMode,
        }
      });

      // Create virtual sender and receiver objects for the response
      const virtualSender = {
        name: senderName || senderAccountNumber,
        accountNumber: senderAccountNumber
      };
      
      const virtualReceiver = {
        name: receiverName || receiverAccountNumber,
        accountNumber: receiverAccountNumber
      };

      // Add the display number property for frontend use
      const transactionWithNumber = {
        ...safeJson(transaction),
        displayNumber: newTransactionNumber,
        sender: virtualSender,
        receiver: virtualReceiver
      };

      console.log("API: Successfully created transaction:", transactionWithNumber.id);
      return NextResponse.json(transactionWithNumber, { status: 201 });
    } catch (prismaError) {
      console.error("API Error - Database error:", prismaError);
      return NextResponse.json(
        { 
          error: "Database error", 
          details: prismaError instanceof Error ? prismaError.message : String(prismaError) 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API Error - Failed to create transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 