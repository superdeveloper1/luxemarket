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

function App() {
  const [cartCount, setCartCount] = React.useState(0);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [products, setProducts] = React.useState([]);
  const [filteredProducts, setFilteredProducts] = React.useState([]);
  const [activeCategory, setActiveCategory] = React.useState(null);

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

    // Fetch products on mount
    const allProducts = window.ProductManager.getAll();
    setProducts(allProducts);

    // Initial Filter based on URL
    handleFilter(allProducts);

    // Initial Cart Count
    setCartCount(window.CartManager.getCount());

    // Listen for hash/URL changes
    const handleLocationChange = () => handleFilter(allProducts);
    window.addEventListener('popstate', handleLocationChange);

    // Listen for cart changes
    const handleCartUpdate = () => {
      setCartCount(window.CartManager.getCount());
    };
    window.addEventListener('cart-updated', handleCartUpdate);

    // Listen for storage changes (Cross-tab sync for products)
    const handleStorageChange = (e) => {
      if (e.key === 'luxemarket_products' || e.key === 'luxemarket_categories') {
        setProducts(window.ProductManager.getAll());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleFilter = (allProducts) => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const filter = params.get('filter');

    if (filter === 'deals') {
      setActiveCategory('Daily Deals');
      setFilteredProducts(allProducts.filter(p => p.isDailyDeal));
    } else if (category) {
      setActiveCategory(category);
      setFilteredProducts(allProducts.filter(p => p.category === category));
    } else {
      setActiveCategory(null);
      setFilteredProducts(allProducts);
    }
  };

  // Scroll to products when category changes
  React.useEffect(() => {
    if (activeCategory) {
      const section = document.getElementById('featured-products');
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [activeCategory]);

  const addToCart = (product) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    // Default options for quick add from card
    // Use first color/size if available
    const defaultOptions = {
      color: product.colors && product.colors.length > 0 ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name) : null,
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : null,
      quantity: 1
    };

    window.CartManager.addItem(product, defaultOptions);
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
      <div className="min-h-screen flex flex-col" data-name="app-container" data-file="app.js">
        <Header
          cartCount={cartCount}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-grow">
          <Hero />

          <div id="featured-products" className="py-12 bg-gray-50 scroll-mt-32">
            <div className="container-custom">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeCategory ? `${activeCategory}` : 'Featured Products'}
                  </h2>
                  {activeCategory && (
                    <a href="index.html" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 group">
                      <div className="icon-arrow-left text-xs transition-transform group-hover:-translate-x-1"></div>
                      Go back to all products
                    </a>
                  )}
                </div>

                {!activeCategory && (
                  <button
                    onClick={() => {
                      window.scrollTo({ top: document.getElementById('featured-products').offsetTop - 100, behavior: 'smooth' });
                      addToast('Viewing all available products', 'info');
                    }}
                    className="text-[var(--primary-color)] font-medium hover:text-[var(--primary-hover)] flex items-center gap-1"
                  >
                    View All <div className="icon-arrow-right text-sm"></div>
                  </button>
                )}
              </div>

              {filteredProducts.length > 0 ? (
                <FeaturedProducts products={filteredProducts} addToCart={addToCart} />
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <div className="icon-search text-4xl text-gray-300 mx-auto mb-3"></div>
                  <p className="text-gray-500">No products found here.</p>
                  <a href="index.html" className="text-[var(--primary-color)] hover:underline mt-2 inline-block">View all products</a>
                </div>
              )}
            </div>
          </div>

          <Newsletter />
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
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <ToastProvider>
      <App />
    </ToastProvider>
  </ErrorBoundary>
);