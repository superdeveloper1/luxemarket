import React from 'react';
import { showToast } from '../utils/simpleToast.js';

function Cart({ isOpen, onClose, onCartUpdate, onCheckout }) {
  const [cartItems, setCartItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen) {
      loadCartItems();
    }
  }, [isOpen]);

  const loadCartItems = () => {
    try {
      if (window.CartManager && window.ProductManager) {
        const cart = window.CartManager.getCart();
        const itemsWithDetails = cart.map(cartItem => {
          const product = window.ProductManager.getById(cartItem.id);
          return {
            ...cartItem,
            product: product
          };
        }).filter(item => item.product); // Filter out items where product wasn't found
        
        setCartItems(itemsWithDetails);
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      showToast('Error loading cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        removeItem(productId);
        return;
      }

      window.CartManager.update(productId, newQuantity);
      loadCartItems();
      onCartUpdate();
      showToast('Cart updated', 'success');
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast(error.message, 'error');
    }
  };

  const removeItem = (productId) => {
    try {
      window.CartManager.remove(productId);
      loadCartItems();
      onCartUpdate();
      showToast('Item removed from cart', 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      showToast('Error removing item', 'error');
    }
  };

  const clearCart = () => {
    try {
      window.CartManager.clear();
      loadCartItems();
      onCartUpdate();
      showToast('Cart cleared', 'success');
    } catch (error) {
      console.error('Error clearing cart:', error);
      showToast('Error clearing cart', 'error');
    }
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 cart-modal">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
            <p className="text-sm text-gray-500 mt-1">
              {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
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
              <div className="text-gray-500">Loading cart...</div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl text-gray-300 mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some products to get started!</p>
              <button 
                onClick={onClose}
                className="btn btn-primary px-6 py-3"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-6">
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cart-item">
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">{item.product.category}</p>
                      <p className="text-lg font-bold text-blue-600">${item.product.price.toFixed(2)}</p>
                      
                      {/* Stock Warning */}
                      {item.quantity > item.product.stock && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Only {item.product.stock} available
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-0">
                      <p className="font-bold text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">${getTotal().toFixed(2)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button 
                    onClick={clearCart}
                    className="flex-1 btn btn-secondary py-3"
                  >
                    Clear Cart
                  </button>
                  <button 
                    onClick={() => {
                      onCheckout();
                    }}
                    className="flex-2 btn btn-primary py-3 px-8"
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;