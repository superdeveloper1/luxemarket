// ===============================
// Firebase User Service
// User-specific data operations
// ===============================

import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';

const COLLECTION = 'users';

class UserService {
    // Get user profile/settings
    async getUserProfile(userId) {
        const docRef = doc(db, COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    }

    // Create or update user profile
    async updateUserProfile(userId, profileData) {
        const docRef = doc(db, COLLECTION, userId);
        await setDoc(docRef, {
            ...profileData,
            updatedAt: serverTimestamp()
        }, { merge: true });

        return { id: userId, ...profileData };
    }

    // --- Watchlist Operations ---

    // Get user's watchlist
    async getWatchlist(userId) {
        const docRef = doc(db, COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.watchlist || [];
        }
        return [];
    }

    // Add item to watchlist
    async addToWatchlist(userId, product) {
        const docRef = doc(db, COLLECTION, userId);

        // We store the full product object to avoid extra fetches, 
        // consistent with current WatchlistManager behavior
        await setDoc(docRef, {
            watchlist: arrayUnion(product),
            updatedAt: serverTimestamp()
        }, { merge: true });

        return true;
    }

    // Remove item from watchlist
    async removeFromWatchlist(userId, product) {
        // Firestore arrayRemove requires exact object match. 
        // Since we might have slightly different objects (timestamps etc), 
        // it's safer to read-modify-write for complex objects, 
        // OR store only IDs. 
        // HOWEVER, to keep it simple and given the implementation plan, 
        // we'll fetch, filter, and update.

        const docRef = doc(db, COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const currentList = data.watchlist || [];
            const updatedList = currentList.filter(item => item.id !== product.id);

            await updateDoc(docRef, {
                watchlist: updatedList,
                updatedAt: serverTimestamp()
            });
            return true;
        }
        return false;
    }

    // Sync local watchlist to cloud (merge)
    async syncWatchlist(userId, localItems) {
        if (!localItems || localItems.length === 0) return;

        const docRef = doc(db, COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        let cloudItems = [];
        if (docSnap.exists()) {
            cloudItems = docSnap.data().watchlist || [];
        }

        // Merge strategies:
        // 1. Create Map of existing cloud items by ID
        const itemMap = new Map();
        cloudItems.forEach(item => itemMap.set(item.id, item));

        // 2. Add local items if not present
        let changed = false;
        localItems.forEach(item => {
            if (!itemMap.has(item.id)) {
                itemMap.set(item.id, item);
                changed = true;
            }
        });

        if (changed) {
            const mergedList = Array.from(itemMap.values());
            await setDoc(docRef, {
                watchlist: mergedList,
                updatedAt: serverTimestamp()
            }, { merge: true });
            return mergedList;
        }

        return cloudItems;
    }
}

export default new UserService();
