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
            <button onClick={() => window.location.reload()} className="btn btn-primary">Reload Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function CheckoutApp() {
  const [cartCount, setCartCount] = React.useState(0);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  React.useEffect(() => {
    // Auth Check
    const savedUser = sessionStorage.getItem('luxemarket_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user data:', e);
        sessionStorage.removeItem('luxemarket_user');
      }
    } else {
      // Redirect to home if not logged in (simplified protection)
      // Or we could show the auth modal immediately
      // For better UX, let's keep them here but they might need to login? 
      // Actually the prompt was "user needs to either register or sign in before checking out"
      // Since we check auth at "Add to Cart", user should be logged in here theoretically
      // But if they access directly, we show login.
      setIsAuthModalOpen(true);
    }

    // Initial Cart Load
    setCartCount(window.CartManager.getCount());

    // Listen for cart changes
    const handleCartUpdate = () => {
      setCartCount(window.CartManager.getCount());
    };
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => {
    sessionStorage.removeItem('luxemarket_user');
    setCurrentUser(null);
    window.location.href = 'index.html';
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col font-sans" data-name="checkout-app-container">
        <Header
          cartCount={cartCount}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-grow py-12">
          <div className="container-custom">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Secure Checkout</h1>
            <CheckoutFlow />
          </div>
        </main>

        <Footer />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    </ToastProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <CheckoutApp />
  </ErrorBoundary>
);