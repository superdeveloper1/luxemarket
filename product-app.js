// Important: DO NOT remove this `ErrorBoundary` component.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <div className="icon-triangle-alert text-2xl text-red-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">We encountered an unexpected error. Please try reloading.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProductApp() {
  const [cartCount, setCartCount] = React.useState(0);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [currentProduct, setCurrentProduct] = React.useState(null);

  // Auth State
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  const { addToast } = useToast();

  React.useEffect(() => {
    // Load User
    const savedUser = localStorage.getItem('luxemarket_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Parse query parameter for product ID
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      const foundProduct = window.ProductManager.getById(id);
      if (foundProduct) {
        setCurrentProduct(foundProduct);
        document.title = `${foundProduct.name} - LuxeMarket`;
      }
    }

    // Initial Cart Count
    setCartCount(window.CartManager.getCount());

    // Listen for cart changes
    const handleCartUpdate = () => {
      setCartCount(window.CartManager.getCount());
    };
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);

  }, []);

  const addToCart = (product, options) => {
    // Auth Check
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    // Add to Real Cart
    // Also store the variant image if we can resolve it from options
    // (This logic is partly in ProductDetail, but we can enhance CartManager logic too)
    // For now we pass what we have. ProductDetail sends the right color.

    // We need to resolve the image for the cart item based on color if not passed
    // But ProductDetail handles UI image switch. 
    // Let's rely on ProductDetail to pass specific image if needed, or CartManager resolves it.
    // Simpler: Just pass basic options for now.

    // Wait, let's grab the current active image from the ProductDetail component? 
    // Easier way: The ProductDetail passes 'options' which includes color. 
    // Let's look up the variant image in CartManager or here.

    let variantImage = null;
    if (options.color && product.variantImages && product.variantImages[options.color]) {
      const vImgs = product.variantImages[options.color];
      variantImage = Array.isArray(vImgs) ? vImgs[0] : vImgs;
    }

    window.CartManager.addItem(product, { ...options, variantImage });

    addToast(`Added ${product.name} to cart`, 'success');
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    addToast(`Welcome back, ${user.name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('luxemarket_user');
    setCurrentUser(null);
    addToast('Successfully logged out', 'info');
    setTimeout(() => window.location.reload(), 1000);
  };

  try {
    return (
      <div className="min-h-screen flex flex-col" data-name="product-app-container" data-file="product-app.js">
        <Header
          cartCount={cartCount}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-grow bg-gray-50 py-12">
          <div className="container-custom">
            {currentProduct ? (
              <ProductDetail product={currentProduct} onAddToCart={addToCart} />
            ) : (
              <div className="text-center py-24">
                <div className="icon-loader animate-spin text-4xl text-[var(--primary-color)] mx-auto mb-4"></div>
                <p className="text-gray-500">Loading product details...</p>
                <a href="index.html" className="text-[var(--primary-color)] hover:underline mt-4 inline-block">Return to Home</a>
              </div>
            )}
          </div>
          <div className="mt-16">
            <Newsletter />
          </div>
        </main>

        <Footer />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  } catch (error) {
    console.error('ProductApp component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <ToastProvider>
      <ProductApp />
    </ToastProvider>
  </ErrorBoundary>
);