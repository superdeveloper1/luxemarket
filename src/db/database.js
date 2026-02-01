// ===============================
// LuxeMarket Database
// IndexedDB with Dexie.js
// ===============================

import Dexie from 'dexie';

class LuxeMarketDB extends Dexie {
    constructor() {
        super('LuxeMarketDB');
        
        // Define database schema
        this.version(1).stores({
            products: '++id, name, category, price, featured, dailyDeal, createdAt',
            categories: '++id, name, slug',
            cart: '++id, productId, quantity, addedAt',
            orders: '++id, userId, status, createdAt, total',
            orderItems: '++id, orderId, productId, quantity, price',
            users: '++id, email, username, createdAt',
            watchlist: '++id, productId, userId, addedAt',
            settings: 'key'
        });

        // Define table references
        this.products = this.table('products');
        this.categories = this.table('categories');
        this.cart = this.table('cart');
        this.orders = this.table('orders');
        this.orderItems = this.table('orderItems');
        this.users = this.table('users');
        this.watchlist = this.table('watchlist');
        this.settings = this.table('settings');
    }

    // Migration helper: Import from localStorage
    async migrateFromLocalStorage() {
        try {
            console.log('🔄 Starting migration from localStorage...');
            
            // Check if already migrated
            const migrated = await this.settings.get('migrated');
            if (migrated?.value) {
                console.log('✅ Already migrated');
                // Sync with localStorage on every load
                await this.syncWithLocalStorage();
                return;
            }

            // Migrate products
            const productsData = localStorage.getItem('luxemarket_products');
            if (productsData) {
                const products = JSON.parse(productsData);
                await this.products.bulkAdd(products.map(p => ({
                    ...p,
                    createdAt: p.createdAt || new Date(),
                    updatedAt: new Date()
                })));
                console.log(`✅ Migrated ${products.length} products`);
            }

            // Migrate categories
            const categoriesData = localStorage.getItem('luxemarket_categories');
            if (categoriesData) {
                const categories = JSON.parse(categoriesData);
                await this.categories.bulkAdd(categories);
                console.log(`✅ Migrated ${categories.length} categories`);
            }

            // Migrate cart
            const cartData = localStorage.getItem('luxemarket_cart');
            if (cartData) {
                const cart = JSON.parse(cartData);
                await this.cart.bulkAdd(cart.map(item => ({
                    ...item,
                    addedAt: item.addedAt || new Date(),
                    updatedAt: new Date()
                })));
                console.log(`✅ Migrated ${cart.length} cart items`);
            }

            // Mark as migrated
            await this.settings.put({ key: 'migrated', value: true, date: new Date() });
            console.log('✅ Migration completed successfully');
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
        }
    }

    // Sync with localStorage (keep both in sync)
    async syncWithLocalStorage() {
        try {
            const productsData = localStorage.getItem('luxemarket_products');
            if (productsData) {
                const localProducts = JSON.parse(productsData);
                const dbProducts = await this.products.toArray();
                
                // If localStorage has more/different products, sync them
                if (localProducts.length !== dbProducts.length) {
                    console.log('🔄 Syncing products from localStorage...');
                    await this.products.clear();
                    await this.products.bulkAdd(localProducts.map(p => ({
                        ...p,
                        createdAt: p.createdAt || new Date(),
                        updatedAt: new Date()
                    })));
                    console.log(`✅ Synced ${localProducts.length} products`);
                }
            }
        } catch (error) {
            console.error('❌ Sync failed:', error);
        }
    }

    // Backup and restore
    async createBackup() {
        try {
            const backup = {
                products: await this.products.toArray(),
                categories: await this.categories.toArray(),
                cart: await this.cart.toArray(),
                orders: await this.orders.toArray(),
                orderItems: await this.orderItems.toArray(),
                watchlist: await this.watchlist.toArray(),
                settings: await this.settings.toArray(),
                timestamp: new Date().toISOString(),
                version: 1
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `luxemarket-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📦 Backup created successfully');
            return true;
        } catch (error) {
            console.error('❌ Backup failed:', error);
            return false;
        }
    }

    async restoreFromBackup(backupData) {
        try {
            console.log('🔄 Restoring from backup...');
            
            // Clear existing data
            await this.transaction('rw', this.tables, async () => {
                await Promise.all(this.tables.map(table => table.clear()));
            });

            // Restore data
            if (backupData.products) await this.products.bulkAdd(backupData.products);
            if (backupData.categories) await this.categories.bulkAdd(backupData.categories);
            if (backupData.cart) await this.cart.bulkAdd(backupData.cart);
            if (backupData.orders) await this.orders.bulkAdd(backupData.orders);
            if (backupData.orderItems) await this.orderItems.bulkAdd(backupData.orderItems);
            if (backupData.watchlist) await this.watchlist.bulkAdd(backupData.watchlist);
            if (backupData.settings) await this.settings.bulkAdd(backupData.settings);

            console.log('✅ Restore completed successfully');
            return true;
        } catch (error) {
            console.error('❌ Restore failed:', error);
            return false;
        }
    }

    // Clear all data
    async clearAll() {
        try {
            await this.transaction('rw', this.tables, async () => {
                await Promise.all(this.tables.map(table => table.clear()));
            });
            console.log('🗑️ All data cleared');
            return true;
        } catch (error) {
            console.error('❌ Clear failed:', error);
            return false;
        }
    }

    // Get database stats
    async getStats() {
        try {
            const stats = {
                products: await this.products.count(),
                categories: await this.categories.count(),
                cart: await this.cart.count(),
                orders: await this.orders.count(),
                watchlist: await this.watchlist.count(),
                users: await this.users.count()
            };
            return stats;
        } catch (error) {
            console.error('❌ Failed to get stats:', error);
            return null;
        }
    }
}

// Create singleton instance
const db = new LuxeMarketDB();

// Auto-migrate on first load
db.migrateFromLocalStorage().catch(console.error);

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.LuxeMarketDB = db;
}

export default db;
