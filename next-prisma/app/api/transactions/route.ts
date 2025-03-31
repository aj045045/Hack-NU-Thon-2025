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
export async function GET() {
  try {
    console.log("API: Starting to fetch transactions");
    
    // First connect to the database explicitly
    await prisma.$connect();
    
    // Find a reference user to ensure we have at least one in the system
    const referenceUser = await prisma.user.findFirst().catch(() => null);
    
    if (!referenceUser) {
      console.log("No users found to reference for transactions");
      return NextResponse.json([], { status: 200 }); // Return empty array if no users
    }
    
    // Fetch all transactions with simplified approach
    const baseTransactions = await prisma.transaction.findMany({
      orderBy: {
        transactionDateTime: 'desc',
      }
    });
    
    // Use JSON.stringify and parse to handle MongoDB ObjectIds
    const transactions = safeJson(baseTransactions);
    
    console.log(`API: Successfully found ${transactions.length} transactions`);
    
    // Process transactions without requiring actual user objects
    const processedTransactions = transactions.map((transaction: any, index: number) => {
      return {
        ...transaction,
        displayNumber: transactions.length - index,
        // Use account numbers for sender/receiver objects
        sender: {
          name: formatAccount(transaction.senderAccountNumber),
          accountNumber: transaction.senderAccountNumber
        },
        receiver: {
          name: formatAccount(transaction.receiverAccountNumber),
          accountNumber: transaction.receiverAccountNumber
        }
      };
    });

    console.log("API: Processed transactions with virtual user data");
    return NextResponse.json(processedTransactions);
  } catch (error) {
    console.error("API Error - Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
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