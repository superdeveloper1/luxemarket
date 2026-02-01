// ===============================
// Firebase Product Service
// CRUD operations for products
// ===============================

import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    limit,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config';

const COLLECTION = 'products';

class ProductService {
    // Create
    async create(productData) {
        const docRef = await addDoc(collection(db, COLLECTION), {
            ...productData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { id: docRef.id, ...productData };
    }

    // Read all
    async getAll() {
        const querySnapshot = await getDocs(collection(db, COLLECTION));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Read by ID
    async getById(id) {
        const docRef = doc(db, COLLECTION, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    }

    // Read by category
    async getByCategory(category) {
        const q = query(
            collection(db, COLLECTION),
            where('category', '==', category)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Read featured products
    async getFeatured() {
        const q = query(
            collection(db, COLLECTION),
            where('featured', '==', true)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Read daily deals
    async getDailyDeals() {
        const q = query(
            collection(db, COLLECTION),
            where('dailyDeal', '==', true)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Search products
    async search(searchTerm) {
        // Note: Firestore doesn't support full-text search natively
        // This is a simple implementation - consider Algolia for production
        const products = await this.getAll();
        const lowerSearch = searchTerm.toLowerCase();
        
        return products.filter(product => 
            product.name.toLowerCase().includes(lowerSearch) ||
            product.description?.toLowerCase().includes(lowerSearch) ||
            product.category.toLowerCase().includes(lowerSearch)
        );
    }

    // Update
    async update(id, updates) {
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return this.getById(id);
    }

    // Delete
    async delete(id) {
        const docRef = doc(db, COLLECTION, id);
        await deleteDoc(docRef);
    }

    // Bulk create (for migration)
    async bulkCreate(products) {
        const promises = products.map(product => this.create(product));
        return await Promise.all(promises);
    }

    // Get products with pagination
    async getPaginated(limitCount = 20) {
        const q = query(
            collection(db, COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}

export default new ProductService();
