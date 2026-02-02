// ===============================
// Cart Repository
// Database operations for cart
// ===============================

import db from '../database.js';

class CartRepository {
    // Add to cart
    async addItem(productId, quantity = 1) {
        // Check if item already exists
        const existing = await db.cart
            .where('productId')
            .equals(productId)
            .first();

        if (existing) {
            // Update quantity
            await db.cart.update(existing.id, {
                quantity: existing.quantity + quantity,
                updatedAt: new Date()
            });
            return await db.cart.get(existing.id);
        } else {
            // Add new item
            const id = await db.cart.add({
                productId,
                quantity,
                addedAt: new Date(),
                updatedAt: new Date()
            });
            return await db.cart.get(id);
        }
    }

    // Get cart items with product details
    async getCartWithProducts() {
        const cartItems = await db.cart.toArray();
        const items = await Promise.all(
            cartItems.map(async (item) => {
                const product = await db.products.get(item.productId);
                return {
                    ...item,
                    product
                };
            })
        );
        return items.filter(item => item.product); // Filter out items with deleted products
    }

    // Get cart items
    async getAll() {
        return await db.cart.toArray();
    }

    // Update quantity
    async updateQuantity(id, quantity) {
        if (quantity <= 0) {
            await this.removeItem(id);
            return null;
        }
        await db.cart.update(id, {
            quantity,
            updatedAt: new Date()
        });
        return await db.cart.get(id);
    }

    // Remove item
    async removeItem(id) {
        await db.cart.delete(id);
    }

    // Remove by product ID
    async removeByProductId(productId) {
        const items = await db.cart.where('productId').equals(productId).toArray();
        const ids = items.map(item => item.id);
        await db.cart.bulkDelete(ids);
    }

    // Clear cart
    async clear() {
        await db.cart.clear();
    }

    // Get cart total
    async getTotal() {
        const items = await this.getCartWithProducts();
        return items.reduce((total, item) => {
            return total + (item.product?.price || 0) * item.quantity;
        }, 0);
    }

    // Get cart count
    async getCount() {
        const items = await db.cart.toArray();
        return items.reduce((count, item) => count + item.quantity, 0);
    }
}

export default new CartRepository();
