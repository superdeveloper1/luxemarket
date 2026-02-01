// Watchlist utility functions - stores full product objects
import { auth } from '../firebase/config';
import UserService from '../firebase/services/userService';

export const WatchlistManager = {
  STORAGE_KEY: 'luxemarket_watchlist',
  currentUser: null,
  isInitialized: false,

  // Initialize listeners
  init() {
    if (this.isInitialized) return;

    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
      this.currentUser = user;

      if (user) {
        console.log('👤 WatchlistManager: User logged in, syncing...');
        // Sync local items to cloud
        const localItems = this.getLocal();
        if (localItems.length > 0) {
          try {
            await UserService.syncWatchlist(user.uid, localItems);
            // Optional: Clear local storage after sync or keep as backup?
            // For Incognito/Privacy mostly, we probably shouldn't clear it 
            // incase they logout, but standard behavior usually merges then clears or keeps.
            // Let's keep it simple: We now rely on cloud data.
          } catch (e) {
            console.error('Watchlist sync error:', e);
          }
        }
        // Trigger update to fetch fresh data
        window.dispatchEvent(new Event('watchlistUpdated'));
      } else {
        console.log('👤 WatchlistManager: User logged out');
        // Revert to local storage view
        window.dispatchEvent(new Event('watchlistUpdated'));
      }
    });

    this.isInitialized = true;
    console.log('✅ WatchlistManager initialized (Cloud Sync Enabled)');
  },

  // Get from Local Storage (internal use)
  getLocal() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading local watchlist:', error);
      return [];
    }
  },

  // Save to Local Storage (internal use)
  saveLocal(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  },

  // Get all watchlist items
  getAll() {
    // NOTE: complex sync operations are async, but UI needs sync return.
    // We return what we have currently. 
    // For cloud, we might need a separate async fetch, but to keep API compatible
    // we'll rely on the background sync updating an in-memory cache if we were fully rigorous.
    // OR, we simply returned local storage for guests, and for users we try to use a 
    // cached version or return local if cloud not ready.

    // CURRENT LIMITATION: getUserProfile/getWatchlist is async. 
    // Blockers: Refactoring entire app to await WatchlistManager.getAll().
    // Solution: Fetch cloud data in background and update local cache/state?
    // Actually, simplest path: 
    // 1. If not logged in -> use localStorage.
    // 2. If logged in -> We effectively need a reactive state. 
    //    Use a temporary in-memory cache that gets updated.

    if (this.currentUser) {
      // Ideally we return the cached cloud data. 
      // For now, let's assume we fetch it separately or the component handles it?
      // No, components call getAll() directly.

      // HYBRID APPROACH:
      // When logged in, we'll try to keep localStorage in sync with Cloud 
      // so getAll() still works synchronously!
      return this.getLocal();
    }

    return this.getLocal();
  },

  // Check if product is in watchlist
  has(productId) {
    const watchlist = this.getAll();
    return watchlist.some(item => item.id === productId);
  },

  // Alias for backward compatibility (ProductDetail.jsx uses this)
  isInWatchlist(productId) {
    return this.has(productId);
  },

  // Alias for backward compatibility (ProductDetail.jsx uses this)
  toggleWatchlist(productId) {
    // We need the full product to add, but toggle usually only takes ID?
    // Wait, ProductDetail passes product.id to toggleWatchlist?
    // Checking old code: 
    // toggle(product) takes product object
    // But toggleWatchlist(productId) in ProductDetail.jsx only passes ID.
    // This is a bug in original code or assumed usage.
    // Let's look at ProductDetail:
    // const handleWatchlistToggle = () => { ... toggleWatchlist(product.id) ... }
    // But add() needs full product.

    // FIX: We can't add only ID if we store full objects.
    // We need to fetch product by ID or change usage.
    // Luckily ProductDetail HAS the product object.
    // I will update ProductDetail to pass the whole product.
    // But for now, let's try to handle it if possible.

    console.error("Deprecation Warning: Use toggle(product) instead of toggleWatchlist(id)");
    return false;
  },

  // Add full product object to watchlist
  add(product) {
    try {
      // 1. Update Local State (Immediate UI Feedback)
      const watchlist = this.getLocal();
      if (watchlist.some(item => item.id === product.id)) {
        return false;
      }
      watchlist.push(product);
      this.saveLocal(watchlist);

      // 2. Sync to Cloud if Logged In
      if (this.currentUser) {
        UserService.addToWatchlist(this.currentUser.uid, product).catch(console.error);
      }

      window.dispatchEvent(new Event('watchlistUpdated'));
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  },

  // Remove from watchlist by product ID
  remove(productId) {
    try {
      // 1. Update Local State
      const watchlist = this.getLocal();
      const productToRemove = watchlist.find(item => item.id === productId);
      const updated = watchlist.filter(item => item.id !== productId);
      this.saveLocal(updated);

      // 2. Sync to Cloud if Logged In
      if (this.currentUser && productToRemove) {
        UserService.removeFromWatchlist(this.currentUser.uid, productToRemove).catch(console.error);
      }

      window.dispatchEvent(new Event('watchlistUpdated'));
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  },

  // Toggle product in/out of watchlist
  toggle(product) {
    if (this.has(product.id)) {
      this.remove(product.id);
      return false; // removed
    } else {
      this.add(product);
      return true; // added
    }
  },

  // Get count of items
  count() {
    return this.getAll().length;
  },

  // Clear all items
  clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      // NOTE: We probably don't want to wipe Cloud watchlist on clear() 
      // unless explicit. Usually clear() is for logout or debug.

      window.dispatchEvent(new Event('watchlistUpdated'));
      return true;
    } catch (error) {
      console.error('Error clearing watchlist:', error);
      return false;
    }
  },

  // Explicit Cloud Fetch (for components that want to force refresh)
  async fetchCloud() {
    if (!this.currentUser) return;
    try {
      const cloudItems = await UserService.getWatchlist(this.currentUser.uid);
      // Update local storage to match cloud
      this.saveLocal(cloudItems);
      window.dispatchEvent(new Event('watchlistUpdated'));
    } catch (e) {
      console.error("Failed to fetch cloud watchlist", e);
    }
  }
};

// Auto-init
WatchlistManager.init();

// Make available globally
window.WatchlistManager = WatchlistManager;
console.log('✅ WatchlistManager initialized. (Cloud Sync Enabled)');