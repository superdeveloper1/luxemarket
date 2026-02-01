// Watchlist utility functions - stores full product objects
export const WatchlistManager = {
  STORAGE_KEY: 'luxemarket_watchlist',

  // Get all watchlist items as full product objects
  getAll() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading watchlist:', error);
      return [];
    }
  },

  // Check if product is in watchlist
  has(productId) {
    const watchlist = this.getAll();
    return watchlist.some(item => item.id === productId);
  },

  // Add full product object to watchlist
  add(product) {
    try {
      const watchlist = this.getAll();
      // Check if already in watchlist
      if (watchlist.some(item => item.id === product.id)) {
        return false;
      }
      watchlist.push(product);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(watchlist));
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
      const watchlist = this.getAll();
      const updated = watchlist.filter(item => item.id !== productId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
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
      return false;
    } else {
      this.add(product);
      return true;
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
      window.dispatchEvent(new Event('watchlistUpdated'));
      return true;
    } catch (error) {
      console.error('Error clearing watchlist:', error);
      return false;
    }
  }
};

// Make available globally
window.WatchlistManager = WatchlistManager;
console.log('✅ WatchlistManager initialized (stores full product objects)');