import React from 'react';
import { createPortal } from 'react-dom';
import { showToast } from '../utils/simpleToast.js';

function Cart({ isOpen, onClose, onCartUpdate, onCheckout }) {
  const [cartItems, setCartItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);

  const loadCartItems = React.useCallback(() => {
    try {
      if (window.CartManager) {
        const items = window.CartManager.getItems();
        setCartItems(items);
        setTotal(window.CartManager.getTotal());
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      loadCartItems();
    }
  }, [isOpen, loadCartItems]);

  const handleUpdateQuantity = (productId, delta) => {
    if (window.CartManager) {
      window.CartManager.updateQuantity(productId, delta);
      loadCartItems();
      if (onCartUpdate) onCartUpdate();
    }
  };

  const handleRemove = (productId) => {
    if (window.CartManager) {
      window.CartManager.removeItem(productId);
      loadCartItems();
      if (onCartUpdate) onCartUpdate();
      showToast('Item removed from cart', 'info');
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

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4 modal-overlay modal-backdrop cart-modal" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="icon-shopping-cart text-[var(--primary-color)]"></div>
              Shopping Cart
            </h2>
            <p className="text-gray-500 text-sm mt-1">{cartItems.length} items in your basket</p>
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
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="icon-shopping-bag text-gray-200 text-6xl mb-4 mx-auto"></div>
              <h3 className="text-lg font-medium text-gray-900">Your basket is empty</h3>
              <p className="text-gray-500 mt-2">Go ahead and explore our premium collection.</p>
              <button
                onClick={onClose}
                className="btn btn-primary mt-6"
              >
                Go Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cart-item">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-white">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 truncate pr-2">{item.name}</h4>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <div className="icon-x"></div>
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 shadow-inner">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="hover:text-[var(--primary-color)] transition-colors w-6 h-6 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="hover:text-[var(--primary-color)] transition-colors w-6 h-6 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        {item.originalPrice > item.price && (
                          <p className="text-sm text-gray-500 line-through">${item.originalPrice.toFixed(2)}</p>
                        )}
                        <p className="font-bold text-gray-900 text-lg">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-2xl font-black text-gray-900">${total.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn btn-secondary flex-1 py-3"
              >
                Continue Shopping
              </button>
              <button
                onClick={onCheckout}
                className="btn btn-primary flex-1 py-3 text-lg font-bold shadow-lg shadow-blue-200 hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
              >
                Checkout <div className="icon-arrow-right"></div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    , document.body);
}

export default Cart;