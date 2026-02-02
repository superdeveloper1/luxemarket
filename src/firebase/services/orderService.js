// ===============================
// Firebase Order Service
// Order management
// ===============================

import { 
    collection, 
    doc, 
    getDocs, 
    getDoc,
    addDoc, 
    updateDoc, 
    query, 
    where,
    orderBy,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config';
import cartService from './cartService';
import productService from './productService';

const COLLECTION = 'orders';

class OrderService {
    // Create order from cart
    async createFromCart(userId, shippingInfo, paymentInfo) {
        const cartItems = await cartService.getCart(userId);
        
        if (cartItems.length === 0) {
            throw new Error('Cart is empty');
        }

        // Get product details and calculate total
        let total = 0;
        const orderItems = await Promise.all(
            cartItems.map(async (item) => {
                const product = await productService.getById(item.productId);
                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }
                const itemTotal = product.price * item.quantity;
                total += itemTotal;
                return {
                    productId: item.productId,
                    productName: product.name,
                    quantity: item.quantity,
                    price: product.price,
                    image: product.image
                };
            })
        );

        // Create order
        const docRef = await addDoc(collection(db, COLLECTION), {
            userId,
            items: orderItems,
            total,
            status: 'pending',
            shippingInfo,
            paymentInfo,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Clear cart
        await cartService.clearCart(userId);

        return { id: docRef.id, userId, items: orderItems, total, status: 'pending' };
    }

    // Get all orders
    async getAll() {
        const q = query(
            collection(db, COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Get order by ID
    async getById(id) {
        const docRef = doc(db, COLLECTION, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    }

    // Get user's orders
    async getByUserId(userId) {
        const q = query(
            collection(db, COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Get orders by status
    async getByStatus(status) {
        const q = query(
            collection(db, COLLECTION),
            where('status', '==', status)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Update order status
    async updateStatus(orderId, status) {
        const docRef = doc(db, COLLECTION, orderId);
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp()
        });
        return this.getById(orderId);
    }

    // Update order
    async update(orderId, updates) {
        const docRef = doc(db, COLLECTION, orderId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return this.getById(orderId);
    }
}

export default new OrderService();
