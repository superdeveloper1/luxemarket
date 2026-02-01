// ===============================
// Firebase React Hooks
// Easy Firebase integration
// ===============================

import { useState, useEffect } from 'react';
import productService from '../firebase/services/productService';
import cartService from '../firebase/services/cartService';
import orderService from '../firebase/services/orderService';

// Products Hook
export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAll();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    return {
        products,
        loading,
        error,
        refresh: loadProducts,
        create: productService.create.bind(productService),
        update: productService.update.bind(productService),
        delete: productService.delete.bind(productService)
    };
}

// Cart Hook
export function useCart(userId) {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCart = async () => {
        if (!userId) {
            setCart([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const cartItems = await cartService.getCart(userId);
            
            // Load product details for each cart item
            const itemsWithProducts = await Promise.all(
                cartItems.map(async (item) => {
                    const product = await productService.getById(item.productId);
                    return { ...item, product };
                })
            );
            
            setCart(itemsWithProducts);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error loading cart:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, [userId]);

    const addItem = async (productId, quantity) => {
        if (!userId) {
            throw new Error('User must be logged in');
        }
        await cartService.addItem(userId, productId, quantity);
        await loadCart();
    };

    const updateQuantity = async (cartItemId, quantity) => {
        await cartService.updateQuantity(cartItemId, quantity);
        await loadCart();
    };

    const removeItem = async (cartItemId) => {
        await cartService.removeItem(cartItemId);
        await loadCart();
    };

    const clearCart = async () => {
        if (!userId) return;
        await cartService.clearCart(userId);
        await loadCart();
    };

    return {
        cart,
        loading,
        error,
        refresh: loadCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart
    };
}

// Orders Hook
export function useOrders(userId) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadOrders = async () => {
        if (!userId) {
            setOrders([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await orderService.getByUserId(userId);
            setOrders(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error loading orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [userId]);

    return {
        orders,
        loading,
        error,
        refresh: loadOrders,
        createOrder: orderService.createFromCart.bind(orderService),
        updateStatus: orderService.updateStatus.bind(orderService)
    };
}
