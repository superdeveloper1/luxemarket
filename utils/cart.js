const CART_STORAGE_KEY = 'luxemarket_cart';

const CartManager = {
    getCart: () => {
        try {
            return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    },

    addItem: (product, options = {}) => {
        const cart = CartManager.getCart();
        const existingItemIndex = cart.findIndex(item =>
            item.productId === product.id &&
            item.options.color === options.color &&
            item.options.size === options.size
        );

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += (options.quantity || 1);
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.isDailyDeal && product.dealPrice ? product.dealPrice : product.price,
                image: product.image, // Use main image or specific variant image if passed
                options: {
                    color: options.color,
                    size: options.size,
                    variantImage: options.variantImage // Store the specific image for the selected color
                },
                quantity: options.quantity || 1,
                addedAt: new Date().toISOString()
            });
        }

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
    },

    updateQuantity: (index, newQuantity) => {
        const cart = CartManager.getCart();
        if (newQuantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = newQuantity;
        }
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
    },

    removeItem: (index) => {
        const cart = CartManager.getCart();
        cart.splice(index, 1);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
    },

    clearCart: () => {
        localStorage.removeItem(CART_STORAGE_KEY);
        window.dispatchEvent(new Event('cart-updated'));
    },

    getCount: () => {
        const cart = CartManager.getCart();
        return cart.reduce((total, item) => total + (Number(item?.quantity) || 0), 0);
    },

    getSubtotal: () => {
        const cart = CartManager.getCart();
        return cart.reduce((total, item) => total + ((Number(item?.price) || 0) * (Number(item?.quantity) || 0)), 0);
    }
};

window.CartManager = CartManager;