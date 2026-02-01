// ===============================
// Database Seed Data
// Initial data for development
// ===============================

import db from './database.js';

export const seedCategories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Home & Garden', slug: 'home-garden' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Books', slug: 'books' },
    { name: 'Toys', slug: 'toys' }
];

export const seedProducts = [
    {
        name: 'Wireless Headphones',
        description: 'Premium noise-cancelling wireless headphones',
        price: 299.99,
        category: 'Electronics',
        featured: true,
        dailyDeal: false,
        stock: 50,
        image: 'https://via.placeholder.com/300x300?text=Headphones'
    },
    {
        name: 'Smart Watch',
        description: 'Fitness tracking smartwatch with heart rate monitor',
        price: 199.99,
        category: 'Electronics',
        featured: true,
        dailyDeal: true,
        stock: 30,
        image: 'https://via.placeholder.com/300x300?text=Smart+Watch'
    },
    {
        name: 'Designer Sunglasses',
        description: 'Luxury polarized sunglasses',
        price: 149.99,
        category: 'Fashion',
        featured: false,
        dailyDeal: false,
        stock: 100,
        image: 'https://via.placeholder.com/300x300?text=Sunglasses'
    },
    {
        name: 'Yoga Mat',
        description: 'Non-slip eco-friendly yoga mat',
        price: 39.99,
        category: 'Sports',
        featured: false,
        dailyDeal: true,
        stock: 75,
        image: 'https://via.placeholder.com/300x300?text=Yoga+Mat'
    }
];

export async function seedDatabase() {
    try {
        console.log('🌱 Starting database seed...');

        // Check if already seeded
        const productCount = await db.products.count();
        if (productCount > 0) {
            console.log('✅ Database already seeded');
            return;
        }

        // Seed categories
        await db.categories.bulkAdd(seedCategories);
        console.log(`✅ Seeded ${seedCategories.length} categories`);

        // Seed products
        await db.products.bulkAdd(seedProducts.map(p => ({
            ...p,
            createdAt: new Date(),
            updatedAt: new Date()
        })));
        console.log(`✅ Seeded ${seedProducts.length} products`);

        console.log('🎉 Database seeding completed!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
}

export async function resetDatabase() {
    try {
        console.log('🔄 Resetting database...');
        
        await db.clearAll();
        await seedDatabase();
        
        console.log('✅ Database reset complete');
    } catch (error) {
        console.error('❌ Reset failed:', error);
    }
}
