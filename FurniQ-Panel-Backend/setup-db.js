import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    console.log('🔄 Testing database schema...');
    // For MongoDB, we'll test by trying to find products instead of using $executeRaw
    const productCount = await prisma.product.count();
    console.log(`✅ Database schema is ready! Found ${productCount} products.`);

    // Test creating a sample product
    console.log('🧪 Testing product creation...');
    const testProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        description: 'This is a test product',
        price: 99.99,
        sku: 'TEST-001',
        stock: 10,
        brand: 'Test Brand',
        color: 'Black',
        material: 'Wood',
        warranty: '1 year'
      }
    });
    console.log('✅ Test product created:', testProduct.name);

    // Clean up test product
    await prisma.product.delete({
      where: { id: testProduct.id }
    });
    console.log('🧹 Test product cleaned up');

    console.log('🎉 Database setup completed successfully!');
    console.log('📊 You can now start your backend server.');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your DATABASE_URL in .env file');
    console.log('3. Try: npx prisma db push');
    console.log('4. Try: npx prisma generate');
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
