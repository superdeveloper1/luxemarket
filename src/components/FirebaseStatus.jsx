// ===============================
// Firebase Status Indicator
// Shows Firebase connection status
// ===============================

import { useState, useEffect } from 'react';
import FirebaseProductManager from '../managers/FirebaseProductManager';

export default function FirebaseStatus() {
    const [status, setStatus] = useState('loading');
    const [productCount, setProductCount] = useState(0);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const products = await FirebaseProductManager.getAll();
                setProductCount(products.length);
                setStatus('connected');
            } catch (error) {
                setStatus('error');
            }
        };

        checkStatus();
    }, []);

    if (status === 'loading') {
        return (
            <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Loading from Firebase...</span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                ❌ Firebase connection error
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span>Firebase connected • {productCount} products</span>
        </div>
    );
}
