// ===============================
// LuxeMarket CategoryManager
// Centralized category data layer
// ===============================

const CategoryManager = (() => {
    const STORAGE_KEY = "luxemarket_categories";

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

    const save = (categories) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    };

    // Extract categories from products
    const extractFromProducts = () => {
        const products = window.ProductManager ? window.ProductManager.getAll() : [];
        const set = new Set(products.map(p => p.category));
        return Array.from(set);
    };

    const DEFAULT_CATEGORIES = [
        "Electronics", "Fashion", "Furniture", "Accessories",
        "Sporting Goods", "Industrial", "Motors", "Deals"
    ];

    // Initialize categories
    let categories = load();

    if (!categories || categories.length === 0) {
        const extracted = extractFromProducts();
        categories = extracted.length > 0 ? extracted : [...DEFAULT_CATEGORIES];
        save(categories);
    }

    // -------------------------------
    // Public API
    // -------------------------------

    return {
        getAll() {
            if (categories.length === 0) {
                const extracted = extractFromProducts();
                if (extracted.length > 0) {
                    categories = extracted;
                    save(categories);
                } else {
                    return [...DEFAULT_CATEGORIES];
                }
            }
            return [...categories];
        },

        add(name) {
            const clean = name.trim();
            if (!clean) return false;

            if (!categories.includes(clean)) {
                categories.push(clean);
                save(categories);
                return true;
            }

            return false;
        },

        delete(name) {
            const filtered = categories.filter(c => c !== name);
            const changed = filtered.length !== categories.length;

            if (changed) {
                categories = filtered;
                save(categories);
            }

            return changed;
        },

        syncWithProducts() {
            const extracted = extractFromProducts();
            categories = extracted;
            save(categories);
        }
    };
})();

// Make available globally and as module export
window.CategoryManager = CategoryManager;
export default CategoryManager;
