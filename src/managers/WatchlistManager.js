// ===============================
// LuxeMarket WatchlistManager
// Centralized watchlist data layer
// ===============================

import { auth } from '../firebase/config';
import UserService from '../firebase/services/userService';

const WatchlistManager = (() => {
  const STORAGE_KEY = 'luxemarket_watchlist';
  let currentUser = null;
  let isInitialized = false;

  // -------------------------------
  // Internal helpers
  // -------------------------------

  const loadLocal = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading local watchlist:', error);
      return [];
    }
  };

  const saveLocal = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving local watchlist:', error);
    }
  };

  // -------------------------------
  // Public API
  // -------------------------------

  return {
    init() {
      if (isInitialized) return;

      // Listen for auth state changes
      auth.onAuthStateChanged(async (user) => {
        currentUser = user;

        if (user) {
          // Sync local items to cloud
          const localItems = loadLocal();
          if (localItems.length > 0) {
            try {
              await UserService.syncWatchlist(user.uid, localItems);
            } catch (e) {
              console.error('Watchlist sync error:', e);
            }
          }
          // Trigger update to fetch fresh data
          window.dispatchEvent(new Event('watchlistUpdated'));
        } else {
          window.dispatchEvent(new Event('watchlistUpdated'));
        }
      });

      isInitialized = true;
    },

    getAll() {
      // Return local items as the synchronous source of truth
      return loadLocal();
    },

    has(productId) {
      const watchlist = this.getAll();
      return watchlist.some(item => item.id === productId);
    },

    // Alias for backward compatibility
    isInWatchlist(productId) {
      return this.has(productId);
    },

    add(product) {
      try {
        const watchlist = loadLocal();
        if (watchlist.some(item => item.id === product.id)) {
          return false;
        }
        watchlist.push(product);
        saveLocal(watchlist);

        if (currentUser) {
          UserService.addToWatchlist(currentUser.uid, product).catch(console.error);
        }

        window.dispatchEvent(new Event('watchlistUpdated'));
        return true;
      } catch (error) {
        console.error('Error adding to watchlist:', error);
        return false;
      }
    },

    remove(productId) {
      try {
        const watchlist = loadLocal();
        const productToRemove = watchlist.find(item => item.id === productId);
        const updated = watchlist.filter(item => item.id !== productId);

        if (updated.length !== watchlist.length) {
          saveLocal(updated);

          if (currentUser && productToRemove) {
            UserService.removeFromWatchlist(currentUser.uid, productToRemove).catch(console.error);
          }

          window.dispatchEvent(new Event('watchlistUpdated'));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error removing from watchlist:', error);
        return false;
      }
    },

    toggle(product) {
      if (this.has(product.id)) {
        this.remove(product.id);
        return false; // removed
      } else {
        this.add(product);
        return true; // added
      }
    },

    // Alias for ProductDetail compatibility
    toggleWatchlist(productOrId) {
      if (typeof productOrId === 'object') {
        return this.toggle(productOrId);
      } else {
        // It's an ID.
        if (this.has(productOrId)) {
          this.remove(productOrId);
          return false;
        } else {
          console.error("Cannot add to watchlist with ID only. Need full product object.");
          return false;
        }
      }
    },

    count() {
      return this.getAll().length;
    },

    clear() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event('watchlistUpdated'));
        return true;
      } catch (error) {
        return false;
      }
    }
  };
})();

// Initialize immediately
WatchlistManager.init();

// Make available globally
window.WatchlistManager = WatchlistManager;

export default WatchlistManager;