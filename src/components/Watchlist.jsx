import React from 'react';
import { showToast } from '../utils/simpleToast.js';

function Watchlist({ isOpen, onClose }) {
  const [watchlistItems, setWatchlistItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen) {
      loadWatchlist();
    }
  }, [isOpen]);

  const loadWatchlist = () => {
    try {
      const saved = localStorage.getItem('luxemarket_watchlist');
      const watchlist = saved ? JSON.parse(saved) : [];

      if (window.ProductManager) {
        const itemsWithDetails = watchlist.map(productId => {
          const product = window.ProductManager.getById(productId);
          return product;
        }).filter(Boolean);

        setWatchlistItems(itemsWithDetails);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
      showToast('Error loading watchlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = (productId) => {
    try {
      const saved = localStorage.getItem('luxemarket_watchlist');
      const watchlist = saved ? JSON.parse(saved) : [];
      const updated = watchlist.filter(id => id !== productId);

      localStorage.setItem('luxemarket_watchlist', JSON.stringify(updated));
      loadWatchlist();
      showToast('Removed from watchlist', 'success');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      showToast('Error removing from watchlist', 'error');
    }
  };

  const addToCart = (product) => {
    try {
      if (window.CartManager) {
        window.CartManager.add(product.id, 1);
        window.dispatchEvent(new Event('cartUpdated'));
        showToast(`Added ${product.name} to cart!`, 'success');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast(error.message, 'error');
    }
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Watchlist</h2>
            <p className="text-sm text-gray-500 mt-1">
              {watchlistItems.length} {watchlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading watchlist...</div>
            </div>
          ) : watchlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl text-gray-300 mb-4">❤️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your watchlist is empty</h3>
              <p className="text-gray-500 mb-6">Save items you're interested in to view them later!</p>
              <button
                onClick={onClose}
                className="btn btn-primary px-6 py-3"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {watchlistItems.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                      <p className="text-lg font-bold text-blue-600 mb-3">${product.price.toFixed(2)}</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className={`flex-1 text-sm py-2 px-3 rounded transition-colors ${product.stock === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'btn btn-primary'
                            }`}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(product.id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                          title="Remove from watchlist"
                        >
                          <div className="icon-trash text-sm"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Watchlist;