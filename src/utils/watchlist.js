// Watchlist utility functions
export const WatchlistManager = {
  STORAGE_KEY: 'luxemarket_watchlist',

  getWatchlist() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading watchlist:', error);
      return [];
    }
  },

  isInWatchlist(productId) {
    const watchlist = this.getWatchlist();
    return watchlist.includes(productId);
  },

  addToWatchlist(productId) {
    try {
      const watchlist = this.getWatchlist();
      if (!watchlist.includes(productId)) {
        watchlist.push(productId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(watchlist));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  },

  removeFromWatchlist(productId) {
    try {
      const watchlist = this.getWatchlist();
      const updated = watchlist.filter(id => id !== productId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  },

  toggleWatchlist(productId) {
    if (this.isInWatchlist(productId)) {
      this.removeFromWatchlist(productId);
      return false;
    } else {
      this.addToWatchlist(productId);
      return true;
    }
  },

  getCount() {
    return this.getWatchlist().length;
  }
};

// Make available globally
window.WatchlistManager = WatchlistManager;