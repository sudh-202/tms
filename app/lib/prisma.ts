import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a new PrismaClient instance with better error logging
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

  // Add middleware for connection management and error handling
  client.$use(async (params, next) => {
    const before = Date.now();
    
    try {
      const result = await next(params);
      const after = Date.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Prisma Query ${params.model}.${params.action} took ${after - before}ms`);
      }
      
      return result;
    } catch (error) {
      const after = Date.now();
      console.error(`Prisma Query ${params.model}.${params.action} failed after ${after - before}ms`);
      console.error('Query error:', error);
      throw error;
    }
  });
  
  return client;
}

// Function to verify database connection
async function verifyDatabaseConnection(client: PrismaClient) {
  try {
    // Try to query the database to check if it's accessible
    await client.$queryRaw`SELECT 1`;
    console.log('Database connection verified successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Export singleton instance of Prisma Client
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Verify DB connection on startup
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  
  // Immediately invoke async function
  (async () => {
    try {
      const isConnected = await verifyDatabaseConnection(prisma);
      if (!isConnected) {
        console.error('WARNING: Database connection failed during startup');
      }
    } catch (error) {
      console.error('Error verifying database connection:', error);
    }
  })();
} 