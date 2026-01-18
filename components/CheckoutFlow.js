function CheckoutFlow() {
    const [cart, setCart] = React.useState([]);
    const [step, setStep] = React.useState(1); // 1: Cart, 2: Shipping, 3: Payment, 4: Success
    const [loading, setLoading] = React.useState(false);
    const { addToast } = useToast();

    // Shipping State
    const [shippingInfo, setShippingInfo] = React.useState({
        fullName: '',
        address: '',
        city: '',
        zip: '',
        country: 'United States'
    });

    // Payment State
    const [paymentInfo, setPaymentInfo] = React.useState({
        cardNumber: '',
        expiry: '',
        cvc: ''
    });

    React.useEffect(() => {
        // Initial load
        setCart(window.CartManager.getCart());

        // Listen for updates
        const handleCartUpdate = () => setCart(window.CartManager.getCart());
        window.addEventListener('cart-updated', handleCartUpdate);
        return () => window.removeEventListener('cart-updated', handleCartUpdate);
    }, []);

    const updateQty = (index, delta) => {
        const item = cart[index];
        window.CartManager.updateQuantity(index, item.quantity + delta);
    };

    const removeItem = (index) => {
        window.CartManager.removeItem(index);
        addToast('Item removed from cart', 'info');
    };

    const subtotal = cart.reduce((sum, item) => sum + ((Number(item?.price) || 0) * (Number(item?.quantity) || 0)), 0);
    const shippingCost = subtotal > 100 ? 0 : 15.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        setStep(3);
        window.scrollTo(0, 0);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate processing
        setTimeout(() => {
            setLoading(false);
            window.CartManager.clearCart();
            setStep(4);
            window.scrollTo(0, 0);
            addToast('Order placed successfully!', 'success');
        }, 2000);
    };

    // Render Steps
    if (cart.length === 0 && step === 1) {
        return (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="icon-shopping-cart text-5xl text-gray-300 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
                <a href="index.html" className="btn btn-primary">Start Shopping</a>
            </div>
        );
    }

    if (step === 4) {
        return (
            <div className="text-center py-20 bg-white rounded-lg border border-green-100 shadow-sm animate-[fadeIn_0.5s_ease-out]">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="icon-check text-4xl"></div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Thank you for your order!</h2>
                <p className="text-gray-500 mb-6">Your order #{Math.floor(100000 + Math.random() * 900000)} has been placed successfully.</p>
                <p className="text-sm text-gray-400 mb-8">We've sent a confirmation email to {shippingInfo.fullName ? 'your email' : 'you'}.</p>
                <a href="index.html" className="btn btn-primary">Continue Shopping</a>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" data-name="checkout-flow" data-file="components/CheckoutFlow.js">
            {/* Left Column: Forms/Steps */}
            <div className="lg:col-span-8">
                {/* Progress Indicators */}
                <div className="flex items-center mb-8 text-sm font-medium">
                    <div className={`flex items-center ${step >= 1 ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 ${step >= 1 ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white' : 'border-gray-300'}`}>1</span>
                        Cart
                    </div>
                    <div className={`flex-grow h-px mx-4 ${step >= 2 ? 'bg-[var(--primary-color)]' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center ${step >= 2 ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 ${step >= 2 ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white' : 'border-gray-300'}`}>2</span>
                        Shipping
                    </div>
                    <div className={`flex-grow h-px mx-4 ${step >= 3 ? 'bg-[var(--primary-color)]' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center ${step >= 3 ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 ${step >= 3 ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white' : 'border-gray-300'}`}>3</span>
                        Payment
                    </div>
                </div>

                {/* Step 1: Cart Review */}
                {step === 1 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Shopping Cart ({cart.length} items)</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {cart.map((item, idx) => {
                                const price = Number(item?.price) || 0;
                                const quantity = Number(item?.quantity) || 0;
                                return (
                                    <div key={idx} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                            {(() => {
                                                const vImg = item?.options?.variantImage;
                                                const displayImg = Array.isArray(vImg) ? vImg[0] : (vImg || item?.image);
                                                return <img src={displayImg} alt={item?.name} className="w-full h-full object-contain mix-blend-multiply" />;
                                            })()}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-900">{item?.name || 'Unnamed Product'}</h3>
                                            <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-2">
                                                {item?.options?.color && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">Color: {item.options.color}</span>}
                                                {item?.options?.size && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">Size: {item.options.size}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                            <div className="flex items-center border border-gray-300 rounded-md">
                                                <button onClick={() => updateQty(idx, -1)} className="px-2 py-1 hover:bg-gray-100 text-gray-600">
                                                    <div className="icon-minus text-xs"></div>
                                                </button>
                                                <span className="px-2 text-sm font-medium w-8 text-center">{quantity}</span>
                                                <button onClick={() => updateQty(idx, 1)} className="px-2 py-1 hover:bg-gray-100 text-gray-600">
                                                    <div className="icon-plus text-xs"></div>
                                                </button>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                <div className="font-bold text-gray-900">${(price * quantity).toFixed(2)}</div>
                                                <button onClick={() => removeItem(idx)} className="text-xs text-red-500 hover:underline mt-1">Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-end">
                            <button onClick={() => setStep(2)} className="btn btn-primary w-full sm:w-auto">
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Shipping Info */}
                {step === 2 && (
                    <form onSubmit={handleShippingSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Shipping Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                    value={shippingInfo.fullName}
                                    onChange={e => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                    value={shippingInfo.address}
                                    onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                    value={shippingInfo.city}
                                    onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                    value={shippingInfo.zip}
                                    onChange={e => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                    value={shippingInfo.country}
                                    onChange={e => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                                >
                                    <option>United States</option>
                                    <option>Canada</option>
                                    <option>United Kingdom</option>
                                    <option>Australia</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-between">
                            <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">Back to Cart</button>
                            <button type="submit" className="btn btn-primary">Continue to Payment</button>
                        </div>
                    </form>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                    <form onSubmit={handlePaymentSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Details</h2>

                        <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100 flex items-start gap-2">
                            <div className="icon-lock text-base mt-0.5"></div>
                            <div>
                                <span className="font-bold">Secure Payment:</span> All transactions are encrypted and secure.
                                This is a demo, do not use real card info.
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="0000 0000 0000 0000"
                                        maxLength="19"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                        value={paymentInfo.cardNumber}
                                        onChange={e => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                                    />
                                    <div className="absolute left-3 top-2.5 text-gray-400">
                                        <div className="icon-credit-card"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                        value={paymentInfo.expiry}
                                        onChange={e => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="123"
                                        maxLength="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                        value={paymentInfo.cvc}
                                        onChange={e => setPaymentInfo({ ...paymentInfo, cvc: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">Back to Shipping</button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`btn btn-primary min-w-[140px] ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <div className="icon-loader animate-spin text-xl"></div>
                                ) : (
                                    `Pay $${total.toFixed(2)}`
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Right Column: Order Summary (Visible in Steps 1-3) */}
            <div className="lg:col-span-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `$${shippingCost.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Estimated Tax</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                            <div className="flex items-start gap-2">
                                <div className="icon-truck text-gray-400 mt-0.5"></div>
                                <div>Free shipping on orders over $100</div>
                            </div>
                            <div className="flex items-start gap-2 mt-2">
                                <div className="icon-shield-check text-gray-400 mt-0.5"></div>
                                <div>Buyer Protection Guarantee</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}