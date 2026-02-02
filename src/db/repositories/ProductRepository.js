// ===============================
// Product Repository
// Database operations for products
// ===============================

import db from '../database.js';

class ProductRepository {
    // Create
    async create(product) {
        const id = await db.products.add({
            ...product,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return await this.findById(id);
    }

    async bulkCreate(products) {
        const ids = await db.products.bulkAdd(products.map(p => ({
            ...p,
            createdAt: new Date(),
            updatedAt: new Date()
        })), { allKeys: true });
        return ids;
    }

    // Read
    async findAll() {
        return await db.products.toArray();
    }

    async findById(id) {
        return await db.products.get(id);
    }

    async findByCategory(category) {
        return await db.products.where('category').equals(category).toArray();
    }

    async findFeatured() {
        return await db.products.where('featured').equals(true).toArray();
    }

    async findDailyDeals() {
        return await db.products.where('dailyDeal').equals(true).toArray();
    }

    async search(query) {
        const lowerQuery = query.toLowerCase();
        return await db.products
            .filter(product => 
                product.name.toLowerCase().includes(lowerQuery) ||
                product.description?.toLowerCase().includes(lowerQuery) ||
                product.category.toLowerCase().includes(lowerQuery)
            )
            .toArray();
    }

    async findByPriceRange(min, max) {
        return await db.products
            .where('price')
            .between(min, max, true, true)
            .toArray();
    }

    // Update
    async update(id, updates) {
        await db.products.update(id, {
            ...updates,
            updatedAt: new Date()
        });
        return await this.findById(id);
    }

    async updateMany(ids, updates) {
        await db.products.bulkUpdate(
            ids.map(id => ({
                key: id,
                changes: { ...updates, updatedAt: new Date() }
            }))
        );
    }

    // Delete
    async delete(id) {
        await db.products.delete(id);
    }

    async deleteMany(ids) {
        await db.products.bulkDelete(ids);
    }

    // Utility
    async count() {
        return await db.products.count();
    }

    async exists(id) {
        const product = await db.products.get(id);
        return !!product;
    }

    async clear() {
        await db.products.clear();
    }
}

export default new ProductRepository();
