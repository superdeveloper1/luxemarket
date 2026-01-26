const INITIAL_PRODUCTS = [
    // Empty by default - products can be added through admin interface
];

const INITIAL_CATEGORIES = [
    "Electronics",
    "Fashion",
    "Furniture",
    "Accessories",
    "Sporting Goods",
    "Industrial",
    "Motors",
    "Deals"
];

const PRODUCT_STORAGE_KEY = 'luxemarket_products';
const CATEGORY_STORAGE_KEY = 'luxemarket_categories';
const CURRENT_DATA_VERSION = 'v1.9'; // Increment this to force a reset for all users

const ProductManager = {
    init: () => {
        const storedVersion = localStorage.getItem('luxemarket_data_version');
        const urlParams = new URLSearchParams(window.location.search);
        const forceReset = urlParams.get('v') === '1.8' || urlParams.get('reset') === 'true';
        
        if (!localStorage.getItem(PRODUCT_STORAGE_KEY) || storedVersion !== CURRENT_DATA_VERSION || forceReset) {
            console.log("Initializing/Resetting data to version:", CURRENT_DATA_VERSION, forceReset ? "(forced by URL parameter)" : "");
            localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
            localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
            localStorage.setItem('luxemarket_data_version', CURRENT_DATA_VERSION);
        }
    },

    getAll: () => {
        ProductManager.init();
        try {
            const raw = localStorage.getItem(PRODUCT_STORAGE_KEY);
            let stored = JSON.parse(raw) || [];
            let modified = false;

            const migrated = stored.map(p => {
                const initial = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
                if (initial) {
                    // Backfill variantImages if missing
                    if (!p.variantImages && initial.variantImages) {
                        p.variantImages = initial.variantImages;
                        modified = true;
                    }
                    // Backfill images array if missing or empty
                    if ((!p.images || p.images.length === 0) && initial.images) {
                        p.images = initial.images;
                        modified = true;
                    }
                }

                // DATA MIGRATION: Normalize variantImages to be arrays
                if (p.variantImages) {
                    let variantModified = false;
                    Object.keys(p.variantImages).forEach(color => {
                        if (typeof p.variantImages[color] === 'string') {
                            p.variantImages[color] = [p.variantImages[color]];
                            variantModified = true;
                        }
                    });
                    if (variantModified) {
                        modified = true;
                    }
                }

                // DATA MIGRATION: Normalize Colors
                if (p.colors && p.colors.length > 0) {
                    let colorsModified = false;
                    const normalizedColors = p.colors.map(c => {
                        if (typeof c === 'string') {
                            colorsModified = true;
                            const lower = c.toLowerCase();
                            let hex = '#374151'; // Default gray-700
                            if (lower === 'black') hex = '#000000';
                            if (lower === 'white') hex = '#FFFFFF';
                            if (lower === 'silver') hex = '#C0C0C0';
                            if (lower === 'gold') hex = '#FFD700';
                            if (lower === 'navy') hex = '#000080';
                            if (lower === 'red') hex = '#EF4444';
                            if (lower === 'blue') hex = '#3B82F6';
                            if (lower === 'rose gold') hex = '#B76E79';
                            if (lower === 'grey' || lower === 'gray') hex = '#808080';
                            if (lower === 'brown') hex = '#8B4513';
                            if (lower === 'tan') hex = '#D2B48C';

                            return { name: c, hex: hex };
                        }
                        return c;
                    });
                    if (colorsModified) {
                        p.colors = normalizedColors;
                        modified = true;
                    }
                }

                return p;
            });

            if (modified) {
                console.log("Persisting migrated data to localStorage");
                localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(migrated));
            }

            return migrated;
        } catch (e) {
            console.error("Error loading products from localStorage", e);
            return INITIAL_PRODUCTS;
        }
    },

    getById: (id) => {
        const products = ProductManager.getAll();
        return products.find(p => p.id === Number(id));
    },

    save: (product) => {
        console.log("ProductManager.save called with:", product);
        const products = ProductManager.getAll();
        if (product.id) {
            // Update existing
            const index = products.findIndex(p => p.id === Number(product.id));
            if (index !== -1) {
                products[index] = { ...products[index], ...product, id: Number(product.id) };
                console.log("Updated product at index:", index);
            } else {
                console.warn("Product with ID not found for update, adding as new:", product.id);
                const newId = Math.max(...products.map(p => Number(p.id) || 0), 0) + 1;
                products.push({ ...product, id: newId, rating: product.rating || 0, reviews: product.reviews || 0 });
            }
        } else {
            // Add new
            const newId = Math.max(...products.map(p => Number(p.id) || 0), 0) + 1;
            products.push({ ...product, id: newId, rating: 0, reviews: 0 });
            console.log("Added new product with ID:", newId);
        }
        localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
        console.log("Saved to localStorage. New count:", products.length);
    },

    delete: (id) => {
        const products = ProductManager.getAll();
        const filtered = products.filter(p => p.id !== id);
        localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(filtered));
    },

    reorder: (newProducts) => {
        localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(newProducts));
    }
};

const CategoryManager = {
    init: () => {
        if (!localStorage.getItem(CATEGORY_STORAGE_KEY)) {
            localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
        }
    },

    getAll: () => {
        CategoryManager.init();
        try {
            return JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || INITIAL_CATEGORIES;
        } catch (e) {
            console.error("Error loading categories", e);
            return INITIAL_CATEGORIES;
        }
    },

    add: (category) => {
        const categories = CategoryManager.getAll();
        if (!categories.includes(category)) {
            categories.push(category);
            localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
        }
    },

    delete: (category) => {
        const categories = CategoryManager.getAll();
        const filtered = categories.filter(c => c !== category);
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(filtered));
    }
};

try {
    window.ProductManager = ProductManager;
    window.CategoryManager = CategoryManager;
    console.log("Data Managers initialized");
} catch (e) {
    console.warn("Could not attach managers to window", e);
}

// Export initial products for legacy support if needed, though most uses are via ProductManager
const PRODUCTS = ProductManager.getAll();