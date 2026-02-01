import { createPortal } from 'react-dom';

function Checkout({ isOpen, onClose, onOrderComplete }) {
  const [cartItems, setCartItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [step, setStep] = React.useState(1); // 1: Review, 2: Shipping, 3: Payment, 4: Confirmation
  const [orderData, setOrderData] = React.useState({
    shipping: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    payment: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      sameAsShipping: true
    }
  });

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
        }).filter(item => item.product);

        setCartItems(itemsWithDetails);
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      showToast('Error loading cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getTax = () => {
    return getTotal() * 0.08; // 8% tax
  };

  const getShipping = () => {
    return getTotal() > 50 ? 0 : 9.99; // Free shipping over $50
  };

  const getGrandTotal = () => {
    return getTotal() + getTax() + getShipping();
  };

  const handleInputChange = (section, field, value) => {
    setOrderData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return cartItems.length > 0;
      case 2:
        const { shipping } = orderData;
        return shipping.firstName && shipping.lastName && shipping.email &&
          shipping.address && shipping.city && shipping.state && shipping.zipCode;
      case 3:
        const { payment } = orderData;
        return payment.cardNumber && payment.expiryDate && payment.cvv && payment.cardName;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      showToast('Please fill in all required fields', 'error');
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart
      window.CartManager.clear();

      // Generate order number
      const orderNumber = 'LM' + Date.now().toString().slice(-6);

      setStep(4);
      onOrderComplete(orderNumber);
      showToast('Order placed successfully!', 'success');

    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Error placing order. Please try again.', 'error');
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4 modal-overlay modal-backdrop" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
            <div className="flex items-center mt-2 space-x-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                    {stepNum}
                  </div>
                  <span className={`ml-2 text-sm ${step >= stepNum ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {stepNum === 1 && 'Review'}
                    {stepNum === 2 && 'Shipping'}
                    {stepNum === 3 && 'Payment'}
                    {stepNum === 4 && 'Complete'}
                  </span>
                  {stepNum < 4 && <div className="w-8 h-0.5 bg-gray-200 mx-2"></div>}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            title="Close (Esc)"
          >
            <div className="icon-x text-2xl"></div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)]">
          {loading && step !== 4 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Step 1: Review Order */}
                  {step === 1 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Review Your Order</h3>
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.product.name}</h4>
                              <p className="text-sm text-gray-500">{item.product.category}</p>
                              <p className="text-sm">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Shipping Information */}
                  {step === 2 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Shipping Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                          <input
                            type="text"
                            value={orderData.shipping.firstName}
                            onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                          <input
                            type="text"
                            value={orderData.shipping.lastName}
                            onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                          <input
                            type="email"
                            value={orderData.shipping.email}
                            onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={orderData.shipping.phone}
                            onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                          <input
                            type="text"
                            value={orderData.shipping.address}
                            onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input
                            type="text"
                            value={orderData.shipping.city}
                            onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                          <input
                            type="text"
                            value={orderData.shipping.state}
                            onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                          <input
                            type="text"
                            value={orderData.shipping.zipCode}
                            onChange={(e) => handleInputChange('shipping', 'zipCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <select
                            value={orderData.shipping.country}
                            onChange={(e) => handleInputChange('shipping', 'country', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Australia">Australia</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Payment Information */}
                  {step === 3 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Payment Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                          <input
                            type="text"
                            value={orderData.payment.cardNumber}
                            onChange={(e) => handleInputChange('payment', 'cardNumber', e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                            <input
                              type="text"
                              value={orderData.payment.expiryDate}
                              onChange={(e) => handleInputChange('payment', 'expiryDate', e.target.value)}
                              placeholder="MM/YY"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                            <input
                              type="text"
                              value={orderData.payment.cvv}
                              onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
                              placeholder="123"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name *</label>
                          <input
                            type="text"
                            value={orderData.payment.cardName}
                            onChange={(e) => handleInputChange('payment', 'cardName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="sameAsShipping"
                            checked={orderData.payment.sameAsShipping}
                            onChange={(e) => handleInputChange('payment', 'sameAsShipping', e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="sameAsShipping" className="text-sm text-gray-700">
                            Billing address same as shipping
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Order Confirmation */}
                  {step === 4 && (
                    <div className="text-center py-8">
                      <div className="text-6xl text-green-500 mb-4">✓</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h3>
                      <p className="text-gray-600 mb-4">Thank you for your purchase. You will receive a confirmation email shortly.</p>
                      <div className="bg-gray-50 rounded-lg p-4 inline-block">
                        <p className="text-sm text-gray-500">Order Number</p>
                        <p className="text-lg font-bold text-gray-900">LM{Date.now().toString().slice(-6)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-6 sticky top-0">
                    <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${getTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${getTax().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{getShipping() === 0 ? 'FREE' : `$${getShipping().toFixed(2)}`}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>${getGrandTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {getTotal() < 50 && step < 4 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          Add ${(50 - getTotal()).toFixed(2)} more for free shipping!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-between">
            <div>
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="btn btn-secondary px-6 py-3"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="btn btn-ghost px-6 py-3"
              >
                Cancel
              </button>
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="btn btn-primary px-6 py-3"
                  disabled={!validateStep(step)}
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="btn btn-primary px-8 py-3"
                  disabled={loading || !validateStep(step)}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-center">
            <button
              onClick={onClose}
              className="btn btn-primary px-8 py-3"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Checkout;
