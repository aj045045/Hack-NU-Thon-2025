// Simple script to test database connection directly
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Database connection test script');
  console.log('--------------------------------');
  
  try {
    // Log the database URL (with masked password)
    const dbUrl = process.env.DATABASE_URL || 'Not set';
    console.log('Database URL:', dbUrl.replace(/:[^:]*@/, ':****@'));
    
    // Create a new Prisma client
    console.log('Creating Prisma client...');
    const prisma = new PrismaClient();
    
    // Test simple queries
    console.log('Testing connection with simple queries...');
    
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
    
    const transactionCount = await prisma.transaction.count();
    console.log(`Transaction count: ${transactionCount}`);
    
    // If we got here, the connection works
    console.log('✅ Database connection successful!');
    
    // Clean up
    await prisma.$disconnect();
    
    return { success: true, userCount, transactionCount };
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error);
    
    return { success: false, error: error.message };
  }
}

// Run the script
main()
  .then(result => {
    console.log('\nTest result:', result.success ? 'SUCCESS' : 'FAILURE');
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(e => {
    console.error('Unexpected error:', e);
    process.exit(1);
  }); 