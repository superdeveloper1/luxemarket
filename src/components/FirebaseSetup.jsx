// ===============================
// Firebase Setup Helper
// Quick setup and migration tool
// ===============================

import { useState } from 'react';
import { migrateProductsToFirebase } from '../firebase/migrate';
import productService from '../firebase/services/productService';

export default function FirebaseSetup() {
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [productCount, setProductCount] = useState(null);

    const checkConnection = async () => {
        setStatus('checking');
        setMessage('Checking Firebase connection...');
        
        try {
            const products = await productService.getAll();
            setProductCount(products.length);
            setStatus('success');
            setMessage(`✅ Connected! Found ${products.length} products in Firebase.`);
        } catch (error) {
            setStatus('error');
            if (error.message.includes('apiKey')) {
                setMessage('❌ Firebase not configured. Please update src/firebase/config.js with your Firebase credentials.');
            } else {
                setMessage(`❌ Connection failed: ${error.message}`);
            }
        }
    };

    const handleMigrate = async () => {
        setStatus('migrating');
        setMessage('Migrating products to Firebase...');
        
        try {
            await migrateProductsToFirebase();
            await checkConnection();
        } catch (error) {
            setStatus('error');
            setMessage(`❌ Migration failed: ${error.message}`);
        }
    };

    const getLocalProductCount = () => {
        const data = localStorage.getItem('luxemarket_products');
        return data ? JSON.parse(data).length : 0;
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold mb-2">🔥 Firebase Setup</h1>
                    <p className="text-gray-600">
                        Set up Firebase to share products with all users
                    </p>
                </div>

                {/* Setup Steps */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Setup Steps</h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="font-semibold">Create Firebase Project</h3>
                                <p className="text-sm text-gray-600">
                                    Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Firebase Console</a> and create a new project
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold">Enable Firestore Database</h3>
                                <p className="text-sm text-gray-600">
                                    In Firebase Console, enable Firestore Database in "test mode"
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold">Configure Your App</h3>
                                <p className="text-sm text-gray-600">
                                    Update <code className="bg-gray-100 px-2 py-1 rounded">src/firebase/config.js</code> with your Firebase credentials
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                                4
                            </div>
                            <div>
                                <h3 className="font-semibold">Test Connection & Migrate</h3>
                                <p className="text-sm text-gray-600">
                                    Use the buttons below to test and migrate your data
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Status</h2>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                            <span className="font-semibold">Local Products:</span>
                            <span className="text-2xl font-bold text-blue-600">{getLocalProductCount()}</span>
                        </div>

                        {productCount !== null && (
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                                <span className="font-semibold">Firebase Products:</span>
                                <span className="text-2xl font-bold text-green-600">{productCount}</span>
                            </div>
                        )}

                        {message && (
                            <div className={`p-4 rounded ${
                                status === 'success' ? 'bg-green-50 text-green-800' :
                                status === 'error' ? 'bg-red-50 text-red-800' :
                                'bg-blue-50 text-blue-800'
                            }`}>
                                {message}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Actions</h2>
                    
                    <div className="space-y-3">
                        <button
                            onClick={checkConnection}
                            disabled={status === 'checking' || status === 'migrating'}
                            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
                        >
                            {status === 'checking' ? '⏳ Checking...' : '🔍 Test Firebase Connection'}
                        </button>

                        <button
                            onClick={handleMigrate}
                            disabled={status === 'checking' || status === 'migrating' || getLocalProductCount() === 0}
                            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
                        >
                            {status === 'migrating' ? '⏳ Migrating...' : '⬆️ Migrate Products to Firebase'}
                        </button>

                        <a
                            href="https://console.firebase.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 text-center font-semibold"
                        >
                            🔥 Open Firebase Console
                        </a>
                    </div>
                </div>

                {/* Documentation Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Need help? Check the <a href="/FIREBASE_SETUP.md" className="text-blue-500 hover:underline">complete setup guide</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
