// ===============================
// Firebase Migration Script
// Upload existing products to Firebase
// ===============================

import productService from './services/productService';

export async function migrateProductsToFirebase() {
    try {
        console.log('🔄 Starting Firebase migration...');

        // Get products from localStorage
        const productsData = localStorage.getItem('luxemarket_products_v3');

        if (!productsData) {
            console.log('⚠️ No products found in localStorage');
            return;
        }

        const products = JSON.parse(productsData);
        console.log(`📦 Found ${products.length} products to migrate`);

        // Check if products already exist in Firebase
        const existingProducts = await productService.getAll();

        if (existingProducts.length > 0) {
            console.log(`✅ Firebase already has ${existingProducts.length} products`);
            const shouldMigrate = confirm(
                `Firebase already has ${existingProducts.length} products.\n` +
                `Do you want to add ${products.length} more products from localStorage?`
            );

            if (!shouldMigrate) {
                console.log('❌ Migration cancelled');
                return;
            }
        }

        // Upload products to Firebase
        console.log('⬆️ Uploading products to Firebase...');

        let successCount = 0;
        let errorCount = 0;

        for (const product of products) {
            try {
                // Remove the local ID, Firebase will generate new ones
                const { id, ...productData } = product;
                await productService.create(productData);
                successCount++;
                console.log(`✅ Uploaded: ${product.name}`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Failed to upload ${product.name}:`, error);
            }
        }

        console.log(`\n🎉 Migration complete!`);
        console.log(`✅ Success: ${successCount} products`);
        if (errorCount > 0) {
            console.log(`❌ Failed: ${errorCount} products`);
        }

        alert(
            `Migration complete!\n\n` +
            `✅ Uploaded: ${successCount} products\n` +
            `${errorCount > 0 ? `❌ Failed: ${errorCount} products` : ''}`
        );

    } catch (error) {
        console.error('❌ Migration failed:', error);
        alert(`Migration failed: ${error.message}`);
    }
}

// Make available globally for console access
if (typeof window !== 'undefined') {
    window.migrateToFirebase = migrateProductsToFirebase;
}
