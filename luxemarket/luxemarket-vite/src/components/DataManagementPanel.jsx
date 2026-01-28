import React from 'react';
import { showToast } from '../utils/simpleToast.js';

function DataManagementPanel() {
    const [status, setStatus] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const refreshStatus = React.useCallback(() => {
        if (window.DataManager) {
            const currentStatus = window.DataManager.getStatus();
            setStatus(currentStatus);
        }
    }, []);

    React.useEffect(() => {
        refreshStatus();
        
        // Refresh status every 30 seconds
        const interval = setInterval(refreshStatus, 30000);
        return () => clearInterval(interval);
    }, [refreshStatus]);

    const handleForceBackup = async () => {
        setLoading(true);
        try {
            if (window.DataManager) {
                const success = window.DataManager.forceBackup();
                if (success) {
                    showToast('Backup created successfully!', 'success');
                    refreshStatus();
                } else {
                    showToast('Backup failed', 'error');
                }
            }
        } catch (error) {
            showToast(`Backup error: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        setLoading(true);
        try {
            if (window.DataManager) {
                const success = window.DataManager.exportData();
                if (success) {
                    showToast('Data exported successfully!', 'success');
                } else {
                    showToast('Export failed', 'error');
                }
            }
        } catch (error) {
            showToast(`Export error: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreBackup = async () => {
        if (!confirm('Restore from latest backup? This will reload the page.')) {
            return;
        }

        setLoading(true);
        try {
            if (window.DataManager) {
                const success = window.DataManager.restoreLatestBackup();
                if (!success) {
                    showToast('Restore failed', 'error');
                    setLoading(false);
                }
                // If successful, page will reload automatically
            }
        } catch (error) {
            showToast(`Restore error: ${error.message}`, 'error');
            setLoading(false);
        }
    };

    const handleToggleAutoSave = () => {
        if (window.DataManager) {
            if (status?.autoSaveEnabled) {
                window.DataManager.disableAutoSave();
                showToast('Auto-save disabled', 'info');
            } else {
                window.DataManager.setupAutoSave();
                showToast('Auto-save enabled', 'success');
            }
            refreshStatus();
        }
    };

    if (!status) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="icon-database text-2xl text-blue-600"></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
                        <p className="text-gray-600">Loading status...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="icon-database text-2xl text-blue-600"></div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
                    <p className="text-gray-600">Backup, export, and manage your store data</p>
                </div>
            </div>

            {/* Status Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${status.autoSaveEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-semibold text-gray-700">Auto-Save</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {status.autoSaveEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="icon-clock text-blue-600"></div>
                        <span className="font-semibold text-gray-700">Save Interval</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {status.saveInterval / 1000}s
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="icon-archive text-green-600"></div>
                        <span className="font-semibold text-gray-700">Last Backup</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {status.lastBackup ? 'Available' : 'None'}
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="icon-hard-drive text-purple-600"></div>
                        <span className="font-semibold text-gray-700">Storage Used</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {status.storageUsed}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleForceBackup}
                    disabled={loading}
                    className="btn bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <div className="icon-save"></div>
                    {loading ? 'Creating...' : 'Create Backup'}
                </button>

                <button
                    onClick={handleExportData}
                    disabled={loading}
                    className="btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <div className="icon-download"></div>
                    {loading ? 'Exporting...' : 'Export Data'}
                </button>

                <button
                    onClick={handleRestoreBackup}
                    disabled={loading || !status.lastBackup}
                    className="btn bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <div className="icon-upload"></div>
                    {loading ? 'Restoring...' : 'Restore Backup'}
                </button>

                <button
                    onClick={handleToggleAutoSave}
                    className={`btn ${status.autoSaveEnabled 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white flex items-center gap-2`}
                >
                    <div className={status.autoSaveEnabled ? 'icon-pause' : 'icon-play'}></div>
                    {status.autoSaveEnabled ? 'Disable Auto-Save' : 'Enable Auto-Save'}
                </button>

                <button
                    onClick={refreshStatus}
                    className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
                >
                    <div className="icon-refresh"></div>
                    Refresh Status
                </button>
            </div>

            {/* Info Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Data Management Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Auto-save runs every 30 seconds and when you leave the page</li>
                    <li>• Backups are created automatically and kept for recovery</li>
                    <li>• Export data to download a complete backup file</li>
                    <li>• All data is stored locally in your browser</li>
                </ul>
            </div>
        </div>
    );
}

export default DataManagementPanel;