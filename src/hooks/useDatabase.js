// ===============================
// useDatabase Hook
// React hook for database operations
// ===============================

import { useState, useEffect } from 'react';
import ProductRepository from '../db/repositories/ProductRepository';
import CartRepository from '../db/repositories/CartRepository';
import OrderRepository from '../db/repositories/OrderRepository';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await ProductRepository.findAll();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
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
        create: ProductRepository.create.bind(ProductRepository),
        update: ProductRepository.update.bind(ProductRepository),
        delete: ProductRepository.delete.bind(ProductRepository)
    };
}

export function useCart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await CartRepository.getCartWithProducts();
            setCart(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const addItem = async (productId, quantity) => {
        await CartRepository.addItem(productId, quantity);
        await loadCart();
    };

    const updateQuantity = async (id, quantity) => {
        await CartRepository.updateQuantity(id, quantity);
        await loadCart();
    };

    const removeItem = async (id) => {
        await CartRepository.removeItem(id);
        await loadCart();
    };

    const clearCart = async () => {
        await CartRepository.clear();
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

export function useOrders(userId) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = userId 
                ? await OrderRepository.findByUserId(userId)
                : await OrderRepository.findAll();
            setOrders(data);
            setError(null);
        } catch (err) {
            setError(err.message);
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
        createOrder: OrderRepository.createFromCart.bind(OrderRepository),
        updateStatus: OrderRepository.updateStatus.bind(OrderRepository)
    };
}
