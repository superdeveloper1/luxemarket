const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: "Premium Wireless Headphones",
        price: 299.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        reviews: 124,
        colors: [
            { name: "Black", hex: "#000000" },
            { name: "Silver", hex: "#C0C0C0" },
            { name: "Navy", hex: "#000080" }
        ],
        sizes: ["One Size"],
        description: "Immerse yourself in pure sound with our active noise-cancelling technology. Features 30-hour battery life and ultra-comfortable ear cushions.",
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        variantImages: {
            "Black": [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            "Silver": [
                "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ],
            "Navy": [
                "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ]
        }
    },
    {
        id: 2,
        name: "Minimalist Watch Series 5",
        price: 159.50,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.6,
        reviews: 89,
        colors: [
            { name: "Black", hex: "#000000" },
            { name: "Gold", hex: "#FFD700" },
            { name: "Rose Gold", hex: "#B76E79" }
        ],
        sizes: ["40mm", "44mm"],
        description: "A timeless piece for the modern individual. Features a genuine leather strap, water resistance up to 50m, and a scratch-resistant sapphire crystal glass.",
        images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        variantImages: {
            "Black": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "Gold": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "Rose Gold": "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        id: 3,
        name: "Ergonomic Office Chair",
        price: 499.00,
        category: "Furniture",
        image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        reviews: 215,
        colors: [
            { name: "Black", hex: "#111827" },
            { name: "Grey", hex: "#6B7280" },
            { name: "Blue", hex: "#2563EB" }
        ],
        sizes: ["Standard", "Large"],
        description: "Work in comfort with adjustable lumbar support, 4D armrests, and breathable mesh back. Designed to support your posture during long working hours.",
        images: [
            "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        variantImages: {
            "Black": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "Grey": "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "Blue": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        id: 4,
        name: "Smart Home Speaker",
        price: 89.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.5,
        reviews: 67,
        colors: [
            { name: "White", hex: "#F3F4F6" },
            { name: "Black", hex: "#111827" },
            { name: "Charcoal", hex: "#374151" }
        ],
        sizes: ["Mini", "Standard"],
        description: "Fill your room with rich, 360-degree sound. Compatible with all major voice assistants and features multi-room audio synchronization.",
        images: [
            "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1543512214-318c77a07298?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        variantImages: {
            "White": "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "Black": "https://images.unsplash.com/photo-1543512214-318c77a07298?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "Charcoal": "https://images.unsplash.com/photo-1543512214-318c77a07298?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        id: 5,
        name: "Classic Leather Backpack",
        price: 129.95,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.7,
        reviews: 156,
        colors: [
            { name: "Brown", hex: "#8B4513" },
            { name: "Black", hex: "#000000" },
            { name: "Tan", hex: "#D2B48C" }
        ],
        sizes: ["15L", "20L"],
        description: "Handcrafted from full-grain leather that ages beautifully. Features a dedicated laptop compartment and multiple organizer pockets for your daily essentials.",
        images: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        variantImages: {
            "Brown": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "Black": "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "Tan": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
    },
    {
        id: 6,
        name: "Digital Camera 4K",
        price: 849.00,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        reviews: 342,
        colors: [
            { name: "Black", hex: "#000000" },
            { name: "Silver", hex: "#C0C0C0" }
        ],
        sizes: ["Body Only", "Kit Lens"],
        description: "Capture life's moments in stunning detail. Features a 24MP sensor, 4K video recording, and fast hybrid autofocus system.",
        images: [
            "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        variantImages: {
            "Black": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "Silver": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
    }
];

const INITIAL_CATEGORIES = [
    "Electronics",
    "Fashion",
    "Furniture",
    "Accessories"
];

const PRODUCT_STORAGE_KEY = 'luxemarket_products';
const CATEGORY_STORAGE_KEY = 'luxemarket_categories';

const ProductManager = {
    init: () => {
        if (!localStorage.getItem(PRODUCT_STORAGE_KEY)) {
            localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
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