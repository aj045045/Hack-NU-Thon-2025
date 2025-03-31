const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient, TransactionMode } = require('@prisma/client');

const prisma = new PrismaClient();

async function importTransactions() {
  try {
    console.log('Starting transaction import process...');
    
    // Read the CSV file
    const csvFilePath = path.resolve(__dirname, '../more_bulk_transactions.csv');
    console.log(`Reading CSV file from: ${csvFilePath}`);
    
    if (!fs.existsSync(csvFilePath)) {
      console.error('CSV file not found!');
      return;
    }
    
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    console.log('CSV file read successfully');
    
    // Parse CSV data
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Found ${records.length} transaction records to import`);
    
    // First, find a reference user to associate with all transactions
    const referenceUser = await prisma.user.findFirst();
    
    if (!referenceUser) {
      console.error('No reference user found in the database. Please create at least one user first.');
      return;
    }
    
    console.log(`Using reference user ID: ${referenceUser.id}`);
    
    // Get current transaction count for starting transaction number
    const currentTransactionCount = await prisma.transaction.count();
    console.log(`Current transaction count: ${currentTransactionCount}`);
    
    // Process each transaction record
    console.log('Beginning transaction import...');
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    // Use for...of loop for sequential processing with async/await
    for (const [index, record] of records.entries()) {
      try {
        // Extract the exact fields from the CSV record
        const {
          senderId,
          receiverId,
          senderAccountNumber,
          receiverAccountNumber,
          amount,
          transactionDateTime,
          transactionMode
        } = record;
        
        // Convert amount to number
        const parsedAmount = parseFloat(amount);
        
        // Parse date
        const parsedDateTime = new Date(transactionDateTime);
        
        // Create the transaction using the exact format from the CSV
        // Important: We still use the reference user ID for database relations
        // but preserve all the original identifiers in the account fields
        const transaction = await prisma.transaction.create({
          data: {
            // Use reference user for database relations
            senderId: referenceUser.id,
            receiverId: referenceUser.id,
            // Store the original values from CSV
            senderAccountNumber,
            receiverAccountNumber,
            amount: parsedAmount,
            transactionDateTime: parsedDateTime,
            transactionMode
          }
        });
        
        results.push({
          success: true,
          id: transaction.id,
          displayNumber: currentTransactionCount + index + 1,
          // Store original values for verification
          originalSenderId: senderId,
          originalReceiverId: receiverId,
          senderAccountNumber,
          receiverAccountNumber,
          originalIndex: index
        });
        
        successCount++;
        
        // Log progress every 10 transactions
        if (successCount % 10 === 0) {
          console.log(`Progress: ${successCount}/${records.length} transactions imported`);
        }
      } catch (error) {
        console.error(`Error importing transaction at index ${index}:`, error);
        results.push({
          success: false,
          error: error.message,
          record: record,
          originalIndex: index
        });
        errorCount++;
      }
    }
    
    console.log('\nImport process completed:');
    console.log(`Successfully imported: ${successCount} transactions`);
    console.log(`Failed to import: ${errorCount} transactions`);
    
    // Write results to a log file for reference
    const logFile = path.resolve(__dirname, '../transaction_import_log.json');
    fs.writeFileSync(logFile, JSON.stringify(results, null, 2));
    console.log(`Detailed import log written to: ${logFile}`);
    
  } catch (error) {
    console.error('Error during import process:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

// Run the import function
importTransactions()
  .then(() => console.log('Import script execution completed'))
  .catch(err => console.error('Import script failed:', err)); 