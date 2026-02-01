import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import Firebase database
import './firebase/config.js'
import FirebaseProductManager from './managers/FirebaseProductManager.js'

// Import other managers
import './managers/CartManager.js'
import './managers/CategoryManager.js'
import './utils/watchlist.js'

// Force cache refresh on load
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
}

// Clear ALL local storage to force fresh data
if (typeof Storage !== 'undefined') {
  localStorage.removeItem('luxemarket_products');
  localStorage.removeItem('luxemarket_daily_deals');
  localStorage.removeItem('luxemarket_homepage_order');
  sessionStorage.clear();
}

// Initialize Firebase and make it available globally
window.ProductManager = {
    getAll: () => FirebaseProductManager.getAllSync(),
    getById: (id) => FirebaseProductManager.getByIdSync(id),
    getByCategory: (cat) => FirebaseProductManager.getByCategorySync(cat),
    getFeatured: () => FirebaseProductManager.getFeaturedSync(),
    getDailyDeals: () => FirebaseProductManager.getDailyDealsSync(),
    getAllWithDeals: () => FirebaseProductManager.getAllSync(), // Add missing method
    // Async methods
    getAllAsync: () => FirebaseProductManager.getAll(),
    getByIdAsync: (id) => FirebaseProductManager.getById(id),
    add: (product) => FirebaseProductManager.add(product),
    update: (id, updates) => FirebaseProductManager.update(id, updates),
    delete: (id) => FirebaseProductManager.remove(id),
    refresh: () => FirebaseProductManager.refresh()
};

console.log('🔥 Firebase ProductManager initialized');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
