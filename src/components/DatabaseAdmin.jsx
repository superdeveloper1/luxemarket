// ===============================
// Database Admin Panel
// Manage database operations
// ===============================

import { useState, useEffect } from 'react';
import db from '../db/database';
import { resetDatabase } from '../db/seedData';

export default function DatabaseAdmin() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadStats = async () => {
        const data = await db.getStats();
        setStats(data);
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleBackup = async () => {
        setLoading(true);
        await db.createBackup();
        setLoading(false);
        alert('Backup created successfully!');
    };

    const handleReset = async () => {
        if (!confirm('Are you sure? This will delete all data and reseed the database.')) {
            return;
        }
        setLoading(true);
        await resetDatabase();
        await loadStats();
        setLoading(false);
        alert('Database reset successfully!');
    };

    const handleClear = async () => {
        if (!confirm('Are you sure? This will delete ALL data permanently.')) {
            return;
        }
        setLoading(true);
        await db.clearAll();
        await loadStats();
        setLoading(false);
        alert('Database cleared successfully!');
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Database Administration</h2>

            {/* Stats */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Database Statistics</h3>
                {stats ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded">
                            <div className="text-2xl font-bold text-blue-600">{stats.products}</div>
                            <div className="text-sm text-gray-600">Products</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded">
                            <div className="text-2xl font-bold text-green-600">{stats.categories}</div>
                            <div className="text-sm text-gray-600">Categories</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded">
                            <div className="text-2xl font-bold text-purple-600">{stats.cart}</div>
                            <div className="text-sm text-gray-600">Cart Items</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded">
                            <div className="text-2xl font-bold text-orange-600">{stats.orders}</div>
                            <div className="text-sm text-gray-600">Orders</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500">Loading stats...</div>
                )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-3">Actions</h3>
                
                <button
                    onClick={loadStats}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    🔄 Refresh Stats
                </button>

                <button
                    onClick={handleBackup}
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
                >
                    📦 Create Backup
                </button>

                <button
                    onClick={handleReset}
                    disabled={loading}
                    className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50"
                >
                    🔄 Reset & Reseed Database
                </button>

                <button
                    onClick={handleClear}
                    disabled={loading}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
                >
                    🗑️ Clear All Data
                </button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-600">
                <p className="font-semibold mb-2">💡 Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Backup creates a downloadable JSON file</li>
                    <li>Reset clears data and adds sample products</li>
                    <li>Access database in console: <code className="bg-gray-200 px-1">window.LuxeMarketDB</code></li>
                </ul>
            </div>
        </div>
    );
}
