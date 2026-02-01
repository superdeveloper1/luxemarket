// ===============================
// Order Repository
// Database operations for orders
// ===============================

import db from '../database.js';

class OrderRepository {
    // Create order from cart
    async createFromCart(userId, shippingInfo, paymentInfo) {
        const cartItems = await db.cart.toArray();
        
        if (cartItems.length === 0) {
            throw new Error('Cart is empty');
        }

        // Calculate total
        let total = 0;
        const orderItems = await Promise.all(
            cartItems.map(async (item) => {
                const product = await db.products.get(item.productId);
                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }
                const itemTotal = product.price * item.quantity;
                total += itemTotal;
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price,
                    name: product.name
                };
            })
        );

        // Create order
        const orderId = await db.orders.add({
            userId,
            status: 'pending',
            total,
            shippingInfo,
            paymentInfo,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Create order items
        await db.orderItems.bulkAdd(
            orderItems.map(item => ({
                ...item,
                orderId
            }))
        );

        // Clear cart
        await db.cart.clear();

        return await this.findById(orderId);
    }

    // Read
    async findAll() {
        return await db.orders.orderBy('createdAt').reverse().toArray();
    }

    async findById(id) {
        const order = await db.orders.get(id);
        if (!order) return null;

        const items = await db.orderItems.where('orderId').equals(id).toArray();
        return {
            ...order,
            items
        };
    }

    async findByUserId(userId) {
        return await db.orders
            .where('userId')
            .equals(userId)
            .reverse()
            .sortBy('createdAt');
    }

    async findByStatus(status) {
        return await db.orders.where('status').equals(status).toArray();
    }

    // Update
    async updateStatus(id, status) {
        await db.orders.update(id, {
            status,
            updatedAt: new Date()
        });
        return await this.findById(id);
    }

    async update(id, updates) {
        await db.orders.update(id, {
            ...updates,
            updatedAt: new Date()
        });
        return await this.findById(id);
    }

    // Delete
    async delete(id) {
        // Delete order items first
        const items = await db.orderItems.where('orderId').equals(id).toArray();
        await db.orderItems.bulkDelete(items.map(item => item.id));
        
        // Delete order
        await db.orders.delete(id);
    }

    // Stats
    async getStats() {
        const orders = await db.orders.toArray();
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'processing').length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
            totalRevenue: orders
                .filter(o => o.status !== 'cancelled')
                .reduce((sum, o) => sum + o.total, 0)
        };
    }
}

export default new OrderRepository();
