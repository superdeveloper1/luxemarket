// ===============================
// Firebase Product Manager
// Wrapper for Firebase product operations
// ===============================

import productService from '../firebase/services/productService.js';

const FirebaseProductManager = (() => {
    let cachedProducts = [];
    let isInitialized = false;

    // Initialize and load products from Firebase
    const init = async () => {
        if (isInitialized) return;

        try {
            console.log('🔥 Initializing Firebase ProductManager...');
            cachedProducts = await productService.getAll();
            isInitialized = true;
            console.log(`✅ Loaded ${cachedProducts.length} products from Firebase`);

            // ⭐ HEALER: Automatically fix 3D model URLs
            let fixedCount = 0;
            cachedProducts = cachedProducts.map(p => {
                const needsFix =
                    // Fix astronaut URLs
                    (p.modelUrl && p.modelUrl.includes("DamagedHelmet")) ||
                    // Fix undefined modelUrl for products that should have 3D models
                    (!p.modelUrl && p.name && (
                        p.name.toLowerCase().includes('headphone') ||
                        p.name.toLowerCase().includes('raycon')
                    ));

                if (needsFix) {
                    fixedCount++;
                    return {
                        ...p,
                        modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF/FlightHelmet.gltf",
                        has3DModel: true
                    };
                }
                return p;
            });
            if (fixedCount > 0) {
                console.log(`🔧 HEALER: Fixed ${fixedCount} products with missing/broken 3D models.`);
            }

            if (cachedProducts.length > 0) {
                console.log('📦 Sample product:', cachedProducts[0]);
            } else {
                console.warn('⚠️ No products found in Firebase!');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Firebase ProductManager:', error);
            cachedProducts = [];
        }
    };

    // Get all products
    const getAll = async () => {
        if (!isInitialized) await init();
        return cachedProducts;
    };

    // Get product by ID
    const getById = async (id) => {
        if (!isInitialized) await init();
        return cachedProducts.find(p => p.id === id);
    };

    // Get products by category
    const getByCategory = async (category) => {
        if (!isInitialized) await init();
        return cachedProducts.filter(p => p.category === category);
    };

    // Get featured products
    const getFeatured = async () => {
        if (!isInitialized) await init();
        return cachedProducts.filter(p => p.featured === true);
    };

    // Get daily deals
    const getDailyDeals = async () => {
        if (!isInitialized) await init();
        return cachedProducts.filter(p => p.dailyDeal === true);
    };

    // Search products
    const search = async (query) => {
        if (!isInitialized) await init();
        const lowerQuery = query.toLowerCase();
        return cachedProducts.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
        );
    };

    // Add product
    const add = async (productData) => {
        try {
            const newProduct = await productService.create(productData);
            cachedProducts.push(newProduct);
            console.log('✅ Product added to Firebase:', newProduct.name);
            return newProduct;
        } catch (error) {
            console.error('❌ Failed to add product:', error);
            throw error;
        }
    };

    // Update product
    const update = async (id, updates) => {
        try {
            const updated = await productService.update(id, updates);
            const index = cachedProducts.findIndex(p => p.id === id);
            if (index !== -1) {
                cachedProducts[index] = updated;
            }
            console.log('✅ Product updated in Firebase:', id);
            return updated;
        } catch (error) {
            console.error('❌ Failed to update product:', error);
            throw error;
        }
    };

    // Delete product
    const remove = async (id) => {
        try {
            await productService.delete(id);
            cachedProducts = cachedProducts.filter(p => p.id !== id);
            console.log('✅ Product deleted from Firebase:', id);
            return true;
        } catch (error) {
            console.error('❌ Failed to delete product:', error);
            throw error;
        }
    };

    // Refresh cache from Firebase
    const refresh = async () => {
        try {
            cachedProducts = await productService.getAll();
            console.log('🔄 Products refreshed from Firebase');
            return cachedProducts;
        } catch (error) {
            console.error('❌ Failed to refresh products:', error);
            throw error;
        }
    };

    // Sync methods (for compatibility with old ProductManager)
    const getAllSync = () => cachedProducts;
    const getByIdSync = (id) => cachedProducts.find(p => p.id === id);
    const getByCategorySync = (category) => cachedProducts.filter(p => p.category === category);
    const getFeaturedSync = () => cachedProducts.filter(p => p.featured === true);
    const getDailyDealsSync = () => cachedProducts.filter(p => p.dailyDeal === true);

    return {
        init,
        getAll,
        getById,
        getByCategory,
        getFeatured,
        getDailyDeals,
        search,
        add,
        update,
        remove,
        refresh,
        // Sync methods for backward compatibility
        getAllSync,
        getByIdSync,
        getByCategorySync,
        getFeaturedSync,
        getDailyDealsSync,
        // Async aliases for compatibility
        getAllAsync: getAll,
        getByIdAsync: getById,
        getAllWithDealsAsync: getAll
    };
})();

// Auto-initialize
FirebaseProductManager.init().catch(console.error);

// Make available globally
if (typeof window !== 'undefined') {
    window.FirebaseProductManager = FirebaseProductManager;
}

export default FirebaseProductManager;
