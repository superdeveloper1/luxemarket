 // ===============================
// LuxeMarket ProductManager
// Centralized product data layer
// ===============================

const ProductManager = (() => {
    const STORAGE_KEY = "luxemarket_products";
    const VERSION_KEY = "luxemarket_data_version";
    const CURRENT_VERSION = "v2.0";

    // Default seed products (only used if no data exists)
    const DEFAULT_PRODUCTS = [
        {
            id: 1,
            name: "Premium Wireless Headphones",
            price: 299.99,
            category: "Electronics",
            description: "High-quality wireless headphones with noise cancellation",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
            images: [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300",
                "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300"
            ],
            colors: [
                { 
                    name: "Black", 
                    hex: "#000000",
                    images: [
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
                        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300"
                    ]
                },
                { 
                    name: "White", 
                    hex: "#FFFFFF",
                    images: [
                        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300",
                        "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300"
                    ]
                }
            ],
            sizes: [],
            rating: 4.5,
            reviews: 128,
            stock: 15
        },
        {
            id: 2,
            name: "Designer Leather Jacket",
            price: 449.99,
            category: "Fashion",
            description: "Premium leather jacket with modern styling",
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300",
            images: [
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300",
                "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=300",
                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300"
            ],
            colors: [
                { 
                    name: "Black", 
                    hex: "#000000",
                    images: [
                        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300",
                        "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=300"
                    ]
                },
                { 
                    name: "Brown", 
                    hex: "#8B4513",
                    images: [
                        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300",
                        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300"
                    ]
                }
            ],
            sizes: ["S", "M", "L", "XL"],
            rating: 4.7,
            reviews: 89,
            stock: 8
        },
        {
            id: 3,
            name: "Smart Watch Pro",
            price: 399.99,
            category: "Electronics",
            description: "Advanced smartwatch with health monitoring",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
            images: [
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300",
                "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300"
            ],
            colors: [
                { 
                    name: "Silver", 
                    hex: "#C0C0C0",
                    images: [
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
                        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300"
                    ]
                },
                { 
                    name: "Black", 
                    hex: "#000000",
                    images: [
                        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300",
                        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300"
                    ]
                }
            ],
            sizes: [],
            rating: 4.6,
            reviews: 203,
            stock: 12
        },
        {
            id: 4,
            name: "Luxury Sofa Set",
            price: 1299.99,
            category: "Furniture",
            description: "Comfortable 3-piece luxury sofa set",
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300",
            images: [
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300",
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300",
                "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300"
            ],
            colors: [
                { 
                    name: "Gray", 
                    hex: "#808080",
                    images: [
                        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300",
                        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300"
                    ]
                },
                { 
                    name: "Navy", 
                    hex: "#000080",
                    images: [
                        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300",
                        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300"
                    ]
                }
            ],
            sizes: [],
            rating: 4.8,
            reviews: 45,
            stock: 3
        },
        {
            id: 5,
            name: "Running Sneakers",
            price: 129.99,
            category: "Fashion",
            description: "High-performance running shoes",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
            images: [
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300",
                "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=300"
            ],
            colors: [
                { 
                    name: "White", 
                    hex: "#FFFFFF",
                    images: [
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
                        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300"
                    ]
                },
                { 
                    name: "Black", 
                    hex: "#000000",
                    images: [
                        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=300",
                        "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=300"
                    ]
                },
                { 
                    name: "Red", 
                    hex: "#EF4444",
                    images: [
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
                        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300"
                    ]
                }
            ],
            sizes: ["7", "8", "9", "10", "11", "12"],
            rating: 4.4,
            reviews: 156,
            stock: 0
        },
        {
            id: 6,
            name: "Wireless Speaker",
            price: 199.99,
            category: "Electronics",
            description: "Portable Bluetooth speaker with premium sound",
            image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300",
            images: [
                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300",
                "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300"
            ],
            colors: [
                { 
                    name: "Black", 
                    hex: "#000000",
                    images: [
                        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300",
                        "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300"
                    ]
                },
                { 
                    name: "Blue", 
                    hex: "#3B82F6",
                    images: [
                        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300"
                    ]
                }
            ],
            sizes: [],
            rating: 4.3,
            reviews: 92,
            stock: 25
        },
        {
            id: 7,
            name: "Designer Handbag",
            price: 349.99,
            category: "Accessories",
            description: "Elegant leather handbag for everyday use",
            image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300",
            colors: [
                { name: "Brown", hex: "#8B4513" },
                { name: "Black", hex: "#000000" }
            ],
            sizes: [],
            rating: 4.6,
            reviews: 74,
            stock: 18
        },
        {
            id: 8,
            name: "Gaming Laptop",
            price: 1599.99,
            category: "Electronics",
            description: "High-performance gaming laptop",
            image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300",
            colors: [
                { name: "Black", hex: "#000000" }
            ],
            sizes: [],
            rating: 4.7,
            reviews: 167,
            stock: 7
        },
        {
            id: 9,
            name: "Yoga Mat Premium",
            price: 79.99,
            category: "Sporting Goods",
            description: "Non-slip premium yoga mat",
            image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300",
            colors: [
                { name: "Purple", hex: "#8B5CF6" },
                { name: "Blue", hex: "#3B82F6" }
            ],
            sizes: [],
            rating: 4.5,
            reviews: 88,
            stock: 14
        },
        {
            id: 10,
            name: "Coffee Table Modern",
            price: 299.99,
            category: "Furniture",
            description: "Modern glass coffee table",
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300",
            colors: [
                { name: "Clear", hex: "#F8F9FA" }
            ],
            sizes: [],
            rating: 4.4,
            reviews: 56,
            stock: 9
        },
        {
            id: 11,
            name: "Sunglasses Classic",
            price: 159.99,
            category: "Accessories",
            description: "Classic aviator sunglasses",
            image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300",
            colors: [
                { name: "Gold", hex: "#FFD700" },
                { name: "Silver", hex: "#C0C0C0" }
            ],
            sizes: [],
            rating: 4.2,
            reviews: 134,
            stock: 0
        },
        {
            id: 12,
            name: "Casual T-Shirt",
            price: 29.99,
            category: "Fashion",
            description: "Comfortable cotton t-shirt",
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
            colors: [
                { name: "White", hex: "#FFFFFF" },
                { name: "Black", hex: "#000000" },
                { name: "Gray", hex: "#808080" }
            ],
            sizes: ["S", "M", "L", "XL", "XXL"],
            rating: 4.1,
            reviews: 245,
            stock: 22
        },
        {
            id: 13,
            name: "Bluetooth Earbuds",
            price: 149.99,
            category: "Electronics",
            description: "True wireless earbuds with charging case",
            image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300",
            colors: [
                { name: "White", hex: "#FFFFFF" },
                { name: "Black", hex: "#000000" }
            ],
            sizes: [],
            rating: 4.3,
            reviews: 189,
            stock: 11
        }
    ];

    // -------------------------------
    // Internal helpers
    // -------------------------------

    const load = () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    };

    const save = (products) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    };

    const seedIfNeeded = () => {
        const version = localStorage.getItem(VERSION_KEY);

        if (version !== CURRENT_VERSION) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
            localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
            return DEFAULT_PRODUCTS;
        }

        const existing = load();
        if (!existing || existing.length === 0) {
            save(DEFAULT_PRODUCTS);
            return DEFAULT_PRODUCTS;
        }

        return existing;
    };

    // Initialize data
    let products = seedIfNeeded();

    // -------------------------------
    // Public API
    // -------------------------------

    return {
        getAll() {
            return [...products];
        },

        getById(id) {
            // Handle both string and numeric IDs for compatibility
            return products.find(p => p.id == id || p.id === id) || null;
        },

        add(product) {
            // Generate next numeric ID for consistency
            const maxId = products.length > 0 ? Math.max(...products.map(p => typeof p.id === 'number' ? p.id : 0)) : 0;
            const newProduct = {
                id: maxId + 1,
                ...product
            };

            products.push(newProduct);
            save(products);
            return newProduct;
        },

        update(id, updates) {
            const index = products.findIndex(p => p.id === id);
            if (index === -1) return false;

            products[index] = { ...products[index], ...updates };
            save(products);
            return true;
        },

        delete(id) {
            const filtered = products.filter(p => p.id !== id);
            const changed = filtered.length !== products.length;

            if (changed) {
                products = filtered;
                save(products);
            }

            return changed;
        },

        clearAll() {
            products = [];
            save(products);
        },

        // Debug method to reset data
        resetToDefaults() {
            console.log('🔄 Resetting ProductManager to defaults...');
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(VERSION_KEY);
            products = seedIfNeeded();
            console.log('✅ Reset complete, products:', products.length);
            return products;
        },

        // Stock management methods
        isInStock(id) {
            const product = this.getById(id);
            return product && product.stock > 0;
        },

        getStock(id) {
            const product = this.getById(id);
            return product ? product.stock || 0 : 0;
        },

        updateStock(id, newStock) {
            const index = products.findIndex(p => p.id === id);
            if (index === -1) return false;

            products[index].stock = Math.max(0, newStock);
            save(products);
            return true;
        },

        decreaseStock(id, quantity = 1) {
            const product = this.getById(id);
            if (!product || product.stock < quantity) return false;

            return this.updateStock(id, product.stock - quantity);
        },

        increaseStock(id, quantity = 1) {
            const product = this.getById(id);
            if (!product) return false;

            return this.updateStock(id, product.stock + quantity);
        },

        // Daily Deals Management
        getDailyDeals() {
            const deals = localStorage.getItem('luxemarket_daily_deals');
            return deals ? JSON.parse(deals) : [];
        },

        addToDailyDeals(productId, discountPercent) {
            const deals = this.getDailyDeals();
            const existingIndex = deals.findIndex(deal => deal.productId === productId);
            
            const dealData = {
                productId: productId,
                discountPercent: Math.max(0, Math.min(90, discountPercent)), // 0-90% discount
                addedDate: new Date().toISOString()
            };

            if (existingIndex >= 0) {
                deals[existingIndex] = dealData;
            } else {
                deals.push(dealData);
            }

            localStorage.setItem('luxemarket_daily_deals', JSON.stringify(deals));
            return true;
        },

        removeFromDailyDeals(productId) {
            const deals = this.getDailyDeals();
            const filtered = deals.filter(deal => deal.productId !== productId);
            localStorage.setItem('luxemarket_daily_deals', JSON.stringify(filtered));
            return true;
        },

        getProductWithDeal(productId) {
            const product = this.getById(productId);
            if (!product) return null;

            const deals = this.getDailyDeals();
            const deal = deals.find(d => d.productId === productId);
            
            if (deal) {
                const discountAmount = product.price * (deal.discountPercent / 100);
                return {
                    ...product,
                    originalPrice: product.price,
                    price: product.price - discountAmount,
                    discountPercent: deal.discountPercent,
                    isDailyDeal: true
                };
            }

            return product;
        },

        getAllWithDeals() {
            return products.map(product => this.getProductWithDeal(product.id));
        },

        // Home Page Ordering Management
        getHomePageOrder() {
            const order = localStorage.getItem('luxemarket_homepage_order');
            return order ? JSON.parse(order) : [];
        },

        setHomePageOrder(productIds) {
            localStorage.setItem('luxemarket_homepage_order', JSON.stringify(productIds));
            return true;
        },

        getHomePageProducts(limit = 12) {
            const customOrder = this.getHomePageOrder();
            const allProducts = this.getAllWithDeals();
            
            if (customOrder.length > 0) {
                // Use ONLY custom order - don't auto-fill
                const orderedProducts = [];

                // Add products in custom order
                customOrder.forEach(id => {
                    const product = allProducts.find(p => p.id === id);
                    if (product) {
                        orderedProducts.push(product);
                    }
                });

                return orderedProducts.slice(0, limit);
            }

            // Default: return first 12 products with deals applied
            return allProducts.slice(0, limit);
        },

        reorderHomePageProducts(fromIndex, toIndex) {
            const currentOrder = this.getHomePageOrder();
            const allProducts = this.getAllWithDeals();
            
            // If no custom order exists, create one from current products
            let workingOrder = currentOrder.length > 0 ? [...currentOrder] : allProducts.slice(0, 12).map(p => p.id);
            
            // Perform the reorder
            const [movedItem] = workingOrder.splice(fromIndex, 1);
            workingOrder.splice(toIndex, 0, movedItem);
            
            this.setHomePageOrder(workingOrder);
            return workingOrder;
        },

        // Debug and utility methods
        getProductsByCategory(category, caseInsensitive = true) {
            const allProducts = this.getAll();
            if (caseInsensitive) {
                return allProducts.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
            }
            return allProducts.filter(p => p.category === category);
        },

        getAllCategories() {
            const allProducts = this.getAll();
            return [...new Set(allProducts.map(p => p.category))].sort();
        },

        getCategoryStats() {
            const allProducts = this.getAll();
            const categories = this.getAllCategories();
            return categories.map(cat => ({
                category: cat,
                count: allProducts.filter(p => p.category === cat).length,
                products: allProducts.filter(p => p.category === cat).map(p => ({ id: p.id, name: p.name, stock: p.stock }))
            }));
        },

        // Method to fix any category inconsistencies
        fixCategoryCase(targetCategory = 'Furniture') {
            const allProducts = this.getAll();
            let fixed = 0;
            
            allProducts.forEach(product => {
                if (product.category && product.category.toLowerCase() === targetCategory.toLowerCase() && product.category !== targetCategory) {
                    this.update(product.id, { category: targetCategory });
                    fixed++;
                }
            });
            
            return fixed;
        },

        // Auto-save functionality
        enableAutoSave(intervalMs = 30000) { // Auto-save every 30 seconds
            if (this._autoSaveInterval) {
                clearInterval(this._autoSaveInterval);
            }
            
            this._autoSaveInterval = setInterval(() => {
                try {
                    save(products);
                    console.log('🔄 Auto-saved products data');
                } catch (error) {
                    console.error('❌ Auto-save failed:', error);
                }
            }, intervalMs);
            
            return this._autoSaveInterval;
        },

        disableAutoSave() {
            if (this._autoSaveInterval) {
                clearInterval(this._autoSaveInterval);
                this._autoSaveInterval = null;
            }
        },

        // Force save current state
        forceSave() {
            try {
                save(products);
                // Also save daily deals and home page order
                const dailyDeals = this.getDailyDeals();
                const homePageOrder = this.getHomePageOrder();
                
                localStorage.setItem('luxemarket_daily_deals', JSON.stringify(dailyDeals));
                localStorage.setItem('luxemarket_homepage_order', JSON.stringify(homePageOrder));
                
                console.log('💾 Force saved all product data');
                return true;
            } catch (error) {
                console.error('❌ Force save failed:', error);
                return false;
            }
        },

        // Backup and restore functionality
        createBackup() {
            const backup = {
                products: this.getAll(),
                dailyDeals: this.getDailyDeals(),
                homePageOrder: this.getHomePageOrder(),
                timestamp: new Date().toISOString(),
                version: localStorage.getItem(VERSION_KEY)
            };
            
            const backupKey = `luxemarket_backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(backup));
            
            console.log('📦 Created backup:', backupKey);
            return backupKey;
        },

        restoreFromBackup(backupKey) {
            try {
                const backupData = localStorage.getItem(backupKey);
                if (!backupData) {
                    throw new Error('Backup not found');
                }
                
                const backup = JSON.parse(backupData);
                
                // Restore products
                products = backup.products || [];
                save(products);
                
                // Restore daily deals
                if (backup.dailyDeals) {
                    localStorage.setItem('luxemarket_daily_deals', JSON.stringify(backup.dailyDeals));
                }
                
                // Restore home page order
                if (backup.homePageOrder) {
                    localStorage.setItem('luxemarket_homepage_order', JSON.stringify(backup.homePageOrder));
                }
                
                // Restore version
                if (backup.version) {
                    localStorage.setItem(VERSION_KEY, backup.version);
                }
                
                console.log('📦 Restored from backup:', backupKey);
                return true;
            } catch (error) {
                console.error('❌ Restore failed:', error);
                return false;
            }
        }
    };
})();

// Make available globally and as module export
window.ProductManager = ProductManager;
export default ProductManager;