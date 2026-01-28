// ===============================
// LuxeMarket Data Manager
// Handles data persistence and auto-save
// ===============================

class DataManager {
    constructor() {
        this.autoSaveEnabled = false;
        this.saveInterval = 30000; // 30 seconds
        this.intervals = new Map();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.enableAutoSave = this.enableAutoSave.bind(this);
        this.disableAutoSave = this.disableAutoSave.bind(this);
        this.forceBackup = this.forceBackup.bind(this);
    }

    init() {
        console.log('🔧 Initializing DataManager...');
        
        // Wait for managers to be available
        const checkManagers = () => {
            if (window.ProductManager && window.CartManager && window.CategoryManager) {
                this.setupAutoSave();
                this.setupEventListeners();
                this.createInitialBackup();
                console.log('✅ DataManager initialized successfully');
            } else {
                setTimeout(checkManagers, 100);
            }
        };
        
        checkManagers();
    }

    setupAutoSave() {
        // Enable auto-save for all managers
        if (window.ProductManager.enableAutoSave) {
            window.ProductManager.enableAutoSave(this.saveInterval);
            console.log('💾 ProductManager auto-save enabled');
        }
        
        if (window.CartManager.enableAutoSave) {
            window.CartManager.enableAutoSave(this.saveInterval);
            console.log('🛒 CartManager auto-save enabled');
        }
        
        this.autoSaveEnabled = true;
    }

    setupEventListeners() {
        // Save data when page is about to unload
        window.addEventListener('beforeunload', () => {
            this.forceBackup();
        });
        
        // Save data when page becomes hidden (mobile/tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.forceBackup();
            }
        });
        
        // Save data periodically when user is active
        let lastActivity = Date.now();
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        const updateActivity = () => {
            lastActivity = Date.now();
        };
        
        activityEvents.forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });
        
        // Check for inactivity and save
        setInterval(() => {
            const timeSinceActivity = Date.now() - lastActivity;
            if (timeSinceActivity > 60000) { // 1 minute of inactivity
                this.forceBackup();
            }
        }, 60000);
        
        console.log('👂 Event listeners setup for data persistence');
    }

    createInitialBackup() {
        try {
            if (window.ProductManager.createBackup) {
                const backupKey = window.ProductManager.createBackup();
                localStorage.setItem('luxemarket_latest_backup', backupKey);
                console.log('📦 Initial backup created:', backupKey);
            }
        } catch (error) {
            console.error('❌ Failed to create initial backup:', error);
        }
    }

    forceBackup() {
        try {
            // Force save all managers
            if (window.ProductManager.forceSave) {
                window.ProductManager.forceSave();
            }
            
            if (window.CartManager.forceSave) {
                window.CartManager.forceSave();
            }
            
            // Create backup
            if (window.ProductManager.createBackup) {
                const backupKey = window.ProductManager.createBackup();
                localStorage.setItem('luxemarket_latest_backup', backupKey);
                
                // Keep only last 5 backups to save space
                this.cleanupOldBackups();
            }
            
            console.log('💾 Force backup completed');
            return true;
        } catch (error) {
            console.error('❌ Force backup failed:', error);
            return false;
        }
    }

    cleanupOldBackups() {
        try {
            const backupKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('luxemarket_backup_')) {
                    backupKeys.push({
                        key,
                        timestamp: parseInt(key.split('_')[2])
                    });
                }
            }
            
            // Sort by timestamp (newest first)
            backupKeys.sort((a, b) => b.timestamp - a.timestamp);
            
            // Remove old backups (keep only 5 most recent)
            if (backupKeys.length > 5) {
                const toRemove = backupKeys.slice(5);
                toRemove.forEach(backup => {
                    localStorage.removeItem(backup.key);
                });
                console.log(`🧹 Cleaned up ${toRemove.length} old backups`);
            }
        } catch (error) {
            console.error('❌ Backup cleanup failed:', error);
        }
    }

    disableAutoSave() {
        if (window.ProductManager.disableAutoSave) {
            window.ProductManager.disableAutoSave();
        }
        
        if (window.CartManager.disableAutoSave) {
            window.CartManager.disableAutoSave();
        }
        
        this.autoSaveEnabled = false;
        console.log('⏹️ Auto-save disabled');
    }

    getStatus() {
        return {
            autoSaveEnabled: this.autoSaveEnabled,
            saveInterval: this.saveInterval,
            lastBackup: localStorage.getItem('luxemarket_latest_backup'),
            storageUsed: this.getStorageUsage()
        };
    }

    getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith('luxemarket_')) {
                total += localStorage[key].length;
            }
        }
        return `${(total / 1024).toFixed(2)} KB`;
    }

    // Recovery methods
    restoreLatestBackup() {
        try {
            const latestBackupKey = localStorage.getItem('luxemarket_latest_backup');
            if (!latestBackupKey) {
                throw new Error('No backup found');
            }
            
            if (window.ProductManager.restoreFromBackup) {
                const success = window.ProductManager.restoreFromBackup(latestBackupKey);
                if (success) {
                    // Refresh the page to reload all data
                    window.location.reload();
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('❌ Restore failed:', error);
            return false;
        }
    }

    exportData() {
        try {
            const data = {
                products: window.ProductManager ? window.ProductManager.getAll() : [],
                cart: window.CartManager ? window.CartManager.getCart() : [],
                categories: window.CategoryManager ? window.CategoryManager.getAll() : [],
                dailyDeals: window.ProductManager ? window.ProductManager.getDailyDeals() : [],
                homePageOrder: window.ProductManager ? window.ProductManager.getHomePageOrder() : [],
                exportDate: new Date().toISOString(),
                version: localStorage.getItem('luxemarket_data_version')
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `luxemarket-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📤 Data exported successfully');
            return true;
        } catch (error) {
            console.error('❌ Export failed:', error);
            return false;
        }
    }
}

// Create singleton instance
const dataManager = new DataManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', dataManager.init);
} else {
    dataManager.init();
}

// Make available globally
window.DataManager = dataManager;

export default dataManager;