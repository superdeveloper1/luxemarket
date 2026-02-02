 import React from 'react';
import Header from './Header.jsx';
import Hero from './Hero.jsx';
import FeaturedProductsSection from './FeaturedProducts.jsx';
import Footer from './Footer.jsx';
import AuthModal from './AuthModal.jsx';
import ProductDetail from './ProductDetail.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import FirebaseSetup from './FirebaseSetup.jsx';
import Cart from './Cart.jsx';
import Checkout from './Checkout.jsx';
import Watchlist from './Watchlist.jsx';
import AccountSummary from './AccountSummary.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import CartManager from '../managers/CartManager.js';
import WatchlistManager from '../managers/WatchlistManager.js';
import { showToast } from '../utils/simpleToast.js';

// ⭐ NEW: Import the working modal controller
import ProductDetailWrapper from './common/ProductDetailWrapper.jsx';

// ✅ Fallback product list for seeding
const fallbackProducts = [
  {
    id: "p001",
    name: "Nebula Wireless Earbuds",
    price: 89.99,
    image: "/assets/earbuds.png",
    description: "Cosmic sound with galaxy-inspired design.",
    category: "Audio",
  },
  {
    id: "p002",
    name: "Luxe Charging Dock",
    price: 49.99,
    image: "/assets/dock.png",
    description: "Premium magnetic dock with ambient glow.",
    category: "Accessories",
  },
];

function FullApp() {
  // ✅ Seed product data on first visit
  React.useEffect(() => {
    const existing = localStorage.getItem("luxemarket_products");

    if (!existing) {
      console.log("🌟 Seeding fallback product data...");
      localStorage.setItem(
        "luxemarket_products",
        JSON.stringify(fallbackProducts)
      );
    }
  }, []);

  const [currentView, setCurrentView] = React.useState('home');
  const [cartCount, setCartCount] = React.useState(0);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [authModal, setAuthModal] = React.useState({ isOpen: false, isRegister: false });
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [watchlistOpen, setWatchlistOpen] = React.useState(false);
  const [accountSummaryOpen, setAccountSummaryOpen] = React.useState(false);

  React.useEffect(() => {
    const updateCartCount = () => {
      try {
        const count = CartManager.getItemCount();
        setCartCount(count);
      } catch (error) {
        console.error('Cart count error:', error);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'admin') {
        setCurrentView('admin');
      } else if (hash === 'firebase') {
        setCurrentView('firebase');
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // ⭐ NEW: Listen for product card clicks
  React.useEffect(() => {
    const handleOpenProduct = (e) => {
      const id = e.detail.productId;

      const stored = localStorage.getItem("luxemarket_products");
      if (!stored) return;

      try {
        const products = JSON.parse(stored);
        const found = products.find((p) => p.id === id);
        if (found) {
          setSelectedProduct(found);
        }
      } catch (err) {
        console.error("Failed to load product from localStorage", err);
      }
    };

    window.addEventListener("openProduct", handleOpenProduct);
    return () => window.removeEventListener("openProduct", handleOpenProduct);
  }, []);

  const handleOpenAuth = (isRegister = false) => {
    setAuthModal({ isOpen: true, isRegister });
  };

  const handleCloseAuth = () => {
    setAuthModal({ isOpen: false, isRegister: false });
  };

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    handleCloseAuth();
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const handleRegister = (userData) => {
    setCurrentUser(userData);
    handleCloseAuth();
    showToast(`Welcome to LuxeMarket, ${userData.name}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('You have been logged out', 'info');
  };

  const handleCartUpdate = () => {
    const count = CartManager.getItemCount();
    setCartCount(count);
  };

  const handleOpenCart = () => {
    setCartOpen(true);
  };

  const handleCloseCart = () => {
    setCartOpen(false);
  };

  const handleOpenCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setCheckoutOpen(false);
  };

  const handleOrderComplete = (orderNumber) => {
    handleCartUpdate();
    showToast(`Order ${orderNumber} completed successfully!`, 'success');
  };

  const handleOpenWatchlist = () => {
    setWatchlistOpen(true);
  };

  const handleCloseWatchlist = () => {
    setWatchlistOpen(false);
  };

  const handleOpenAccountSummary = () => {
    setAccountSummaryOpen(true);
  };

  const handleCloseAccountSummary = () => {
    setAccountSummaryOpen(false);
  };

  if (currentView === 'admin') {
    return (
      <ErrorBoundary>
        <AdminDashboard />
      </ErrorBoundary>
    );
  }

  if (currentView === 'firebase') {
    return (
      <ErrorBoundary>
        <FirebaseSetup />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <ErrorBoundary>
          <Header
            cartCount={cartCount}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
            onOpenCart={handleOpenCart}
            onOpenWatchlist={handleOpenWatchlist}
            onOpenAccountSummary={handleOpenAccountSummary}
          />
        </ErrorBoundary>

        <main>
          <ErrorBoundary>
            <Hero />
          </ErrorBoundary>
          <ErrorBoundary>
            <FeaturedProductsSection />
          </ErrorBoundary>
        </main>

        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>

        {authModal.isOpen && (
          <ErrorBoundary>
            <AuthModal
              isOpen={authModal.isOpen}
              isRegister={authModal.isRegister}
              onClose={handleCloseAuth}
              onLogin={handleLogin}
              onRegister={handleRegister}
            />
          </ErrorBoundary>
        )}

        {/* ⭐ NEW: Product Detail Modal Controller */}
        <ErrorBoundary>
          <ProductDetailWrapper
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onCartUpdate={handleCartUpdate}
          />
        </ErrorBoundary>

        {cartOpen && (
          <ErrorBoundary>
            <Cart
              isOpen={cartOpen}
              onClose={handleCloseCart}
              onCartUpdate={handleCartUpdate}
              onCheckout={handleOpenCheckout}
            />
          </ErrorBoundary>
        )}

        {checkoutOpen && (
          <ErrorBoundary>
            <Checkout
              isOpen={checkoutOpen}
              onClose={handleCloseCheckout}
              onOrderComplete={handleOrderComplete}
            />
          </ErrorBoundary>
        )}

        {watchlistOpen && (
          <ErrorBoundary>
            <Watchlist
              isOpen={watchlistOpen}
              onClose={handleCloseWatchlist}
            />
          </ErrorBoundary>
        )}

        {accountSummaryOpen && (
          <ErrorBoundary>
            <AccountSummary
              isOpen={accountSummaryOpen}
              onClose={handleCloseAccountSummary}
              currentUser={currentUser}
            />
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default FullApp;