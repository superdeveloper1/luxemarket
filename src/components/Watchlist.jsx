import React from 'react';
import { createPortal } from 'react-dom';
import { showToast } from '../utils/simpleToast.js';

function Watchlist({ isOpen, onClose }) {
  const [watchlist, setWatchlist] = React.useState([]);

  React.useEffect(() => {
    const handleUpdate = () => {
      if (window.WatchlistManager) {
        setWatchlist(window.WatchlistManager.getAll());
      }
    };
    handleUpdate();
    window.addEventListener('watchlistUpdated', handleUpdate);
    return () => window.removeEventListener('watchlistUpdated', handleUpdate);
  }, []);

  const handleRemove = (productId) => {
    if (window.WatchlistManager) {
      window.WatchlistManager.remove(productId);
    }
  };

  const handleAddToCart = (product) => {
    if (window.CartManager) {
      window.CartManager.add(product.id, 1);
      window.dispatchEvent(new Event('cartUpdated'));
      showToast(`${product.name} added to cart!`, 'success');
    }
  };

  const handleProductClick = (productId) => {
    onClose();
    window.dispatchEvent(new CustomEvent('openProduct', { detail: { productId } }));
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

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4 modal-overlay modal-backdrop" style={{ isolation: 'isolate' }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="icon-heart text-red-500"></div>
              Saved Items
            </h2>
            <p className="text-gray-500 text-sm mt-1">{watchlist.length} items in your watchlist</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <div className="icon-x text-2xl"></div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {watchlist.length === 0 ? (
            <div className="text-center py-12">
              <div className="icon-heart text-gray-200 text-6xl mb-4 mx-auto"></div>
              <h3 className="text-lg font-medium text-gray-900">Your watchlist is empty</h3>
              <p className="text-gray-500 mt-2">Save items you're interested in to keep track of them.</p>
              <button
                onClick={onClose}
                className="btn btn-primary mt-6"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {watchlist.map(product => (
                <div key={product.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50/30 group">
                  <div
                    className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h4
                        className="font-bold text-gray-900 truncate pr-2 cursor-pointer hover:text-[var(--primary-color)]"
                        onClick={() => handleProductClick(product.id)}
                      >
                        {product.name}
                      </h4>
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove from watchlist"
                      >
                        <div className="icon-x"></div>
                      </button>
                    </div>
                    <p className="text-[var(--primary-color)] font-bold mt-1">${product.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn btn-primary text-xs py-1.5 px-3 flex-grow"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleProductClick(product.id)}
                        className="btn btn-secondary text-xs py-1.5 px-3"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {watchlist.length > 0 && (
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Watchlist;