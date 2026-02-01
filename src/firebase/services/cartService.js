// ===============================
// Firebase Cart Service
// Cart operations per user
// ===============================

import { 
    collection, 
    doc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config';

const COLLECTION = 'carts';

class CartService {
    // Add item to cart
    async addItem(userId, productId, quantity = 1) {
        // Check if item already exists
        const existing = await this.getItem(userId, productId);
        
        if (existing) {
            // Update quantity
            return await this.updateQuantity(existing.id, existing.quantity + quantity);
        } else {
            // Add new item
            const docRef = await addDoc(collection(db, COLLECTION), {
                userId,
                productId,
                quantity,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { id: docRef.id, userId, productId, quantity };
        }
    }

    // Get user's cart
    async getCart(userId) {
        const q = query(
            collection(db, COLLECTION),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Get specific cart item
    async getItem(userId, productId) {
        const q = query(
            collection(db, COLLECTION),
            where('userId', '==', userId),
            where('productId', '==', productId)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    }

    // Update quantity
    async updateQuantity(cartItemId, quantity) {
        if (quantity <= 0) {
            await this.removeItem(cartItemId);
            return null;
        }
        
        const docRef = doc(db, COLLECTION, cartItemId);
        await updateDoc(docRef, {
            quantity,
            updatedAt: serverTimestamp()
        });
        return { id: cartItemId, quantity };
    }

    // Remove item
    async removeItem(cartItemId) {
        const docRef = doc(db, COLLECTION, cartItemId);
        await deleteDoc(docRef);
    }

    // Clear user's cart
    async clearCart(userId) {
        const cartItems = await this.getCart(userId);
        const promises = cartItems.map(item => this.removeItem(item.id));
        await Promise.all(promises);
    }

    // Get cart count
    async getCount(userId) {
        const cart = await this.getCart(userId);
        return cart.reduce((total, item) => total + item.quantity, 0);
    }
}

export default new CartService();
