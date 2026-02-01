// ===============================
// LuxeMarket CartManager
// Centralized cart data layer
// ===============================

// Check if we are in environment where ProductManager might be loaded later
// We don't import it directly as it's a global manager pattern in this codebase

const CartManager = (() => {
    const STORAGE_KEY = "luxemarket_cart";

    // -------------------------------
    // Internal helpers
    // -------------------------------

    const load = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            return JSON.parse(raw);
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            return [];
        }
    };

    const save = (cart) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
            // Dispatch cart update event
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    };

    // Initialize cart
    let cart = load();

    // -------------------------------
    // Public API
    // -------------------------------

    return {
        getCart() {
            return [...cart];
        },

        getCount() {
            return cart.reduce((sum, item) => sum + item.quantity, 0);
        },

        // Alias for getCount for compatibility
        getItemCount() {
            return this.getCount();
        },

        getTotal() {
            return cart.reduce((sum, item) => {
                const product = window.ProductManager ? window.ProductManager.getById(item.id) : null;
                return product ? sum + product.price * item.quantity : sum;
            }, 0);
        },

        add(productId, quantity = 1) {
            // Check if ProductManager is available and validate stock
            if (window.ProductManager) {
                const product = window.ProductManager.getById(productId);
                if (!product) {
                    throw new Error('Product not found');
                }

                if (!window.ProductManager.isInStock(productId)) {
                    throw new Error('Product is out of stock');
                }

                const currentInCart = cart.find(item => item.id === productId)?.quantity || 0;
                const requestedTotal = currentInCart + quantity;

                if (requestedTotal > product.stock) {
                    throw new Error(`Only ${product.stock} items available (${currentInCart} already in cart)`);
                }
            }

            const existing = cart.find(item => item.id === productId);

            if (existing) {
                existing.quantity += quantity;
            } else {
                cart.push({ id: productId, quantity });
            }

            save(cart);
            return true; // Return success status
        },

        update(productId, quantity) {
            const item = cart.find(i => i.id === productId);
            if (!item) return false;

            if (quantity <= 0) {
                this.remove(productId);
                return true;
            }

            // Validate stock when updating quantity
            if (window.ProductManager) {
                const product = window.ProductManager.getById(productId);
                if (product && quantity > product.stock) {
                    throw new Error(`Only ${product.stock} items available`);
                }
            }

            item.quantity = quantity;
            save(cart);
            return true;
        },

        remove(productId) {
            const filtered = cart.filter(i => i.id !== productId);
            const changed = filtered.length !== cart.length;

            if (changed) {
                cart = filtered;
                save(cart);
            }

            return changed;
        },

        clear() {
            cart = [];
            save(cart);
        },

        // Auto-save functionality
        enableAutoSave(intervalMs = 30000) { // Auto-save every 30 seconds
            if (this._autoSaveInterval) {
                clearInterval(this._autoSaveInterval);
            }

            this._autoSaveInterval = setInterval(() => {
                try {
                    save(cart);
                    console.log('🛒 Auto-saved cart data');
                } catch (error) {
                    console.error('❌ Cart auto-save failed:', error);
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
                save(cart);
                console.log('💾 Force saved cart data');
                return true;
            } catch (error) {
                console.error('❌ Cart force save failed:', error);
                return false;
            }
        }
    };
})();

// Make available globally and as module export
window.CartManager = CartManager;
export default CartManager;