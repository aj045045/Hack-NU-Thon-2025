import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to safely convert MongoDB objects to plain objects
function safeJson(data: any) {
  return JSON.parse(JSON.stringify(data));
}

// Format account number for display
function formatAccount(accountNumber: string): string {
  if (!accountNumber) return 'Unknown';
  return accountNumber;
}

// GET /api/transactions/[id] - Get a single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("API: Fetching transaction with ID:", params.id);
    
    // Explicitly connect to the database
    await prisma.$connect();
    
    // Fetch the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id }
    });

    if (!transaction) {
      console.log("API: Transaction not found with ID:", params.id);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
    
    // Convert transaction to safe JSON to handle MongoDB ObjectId
    const safeTx = safeJson(transaction);
    
    // Create virtual user objects with proper formatting
    const sender = {
      name: formatAccount(safeTx.senderAccountNumber),
      accountNumber: safeTx.senderAccountNumber
    };
    
    const receiver = {
      name: formatAccount(safeTx.receiverAccountNumber),
      accountNumber: safeTx.receiverAccountNumber
    };
    
    // Combine the data
    const result = {
      ...safeTx,
      sender,
      receiver
    };
    
    console.log("API: Successfully fetched transaction:", params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error - Failed to fetch transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("API: Attempting to delete transaction with ID:", params.id);
    
    // Explicitly connect to the database
    await prisma.$connect();
    
    try {
      // Try to delete the transaction directly
      const deleteResult = await prisma.transaction.delete({
        where: { id: params.id },
      });
      
      console.log("API: Successfully deleted transaction with ID:", params.id);
      
      return NextResponse.json(
        { 
          message: "Transaction deleted successfully", 
          id: params.id,
          transaction: safeJson(deleteResult)
        },
        { status: 200 }
      );
    } catch (deleteError) {
      // If the transaction doesn't exist, Prisma will throw 
      console.error("API Error - Delete operation failed:", deleteError);
      
      return NextResponse.json(
        { 
          error: "Transaction not found or could not be deleted", 
          details: deleteError instanceof Error ? deleteError.message : String(deleteError) 
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("API Error - Failed to process delete request:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete transaction", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 