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

// Migration: Clear old corrupted data once to fix "incognito only" issues
const M_KEY = 'luxemarket_data_reset_v5';
if (typeof Storage !== 'undefined') {
  if (!localStorage.getItem(M_KEY)) {
    console.log('🧹 LuxeMarket: Running AGGRESSIVE one-time data cleanup (v5)...');

    // Clear every single key that starts with luxemarket
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('luxemarket')) {
        localStorage.removeItem(key);
      }
    });

    // Clear session storage too
    sessionStorage.clear();

    // Delete IndexedDB database if it exists
    if (typeof indexedDB !== 'undefined') {
      indexedDB.deleteDatabase('LuxeMarketDB');
      console.log('🗑️ IndexedDB: LuxeMarketDB scheduled for deletion');
    }

    // Clear Cache API
    if ('caches' in window) {
      caches.keys().then(names => {
        for (let name of names) caches.delete(name);
      });
      console.log('🗑️ Cache API: All caches scheduled for deletion');
    }

    // Set migration key BEFORE reload to avoid loops
    localStorage.setItem(MIGRATION_KEY, 'done');

    console.log('✅ Data cleared. Forcing refresh for a clean session...');
    window.location.reload();
  }
}

// Ensure the products cache is cleared on every load to force Firebase sync
if (typeof Storage !== 'undefined') {
  localStorage.removeItem('luxemarket_products');
}

// Force service worker unregistration for regular window users
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}
// Initialize Firebase and make it available globally
window.ProductManager = {
  getAll: () => FirebaseProductManager.getAllSync(),
  getById: (id) => FirebaseProductManager.getByIdSync(id),
  getByCategory: (cat) => FirebaseProductManager.getByCategorySync(cat),
  getFeatured: () => FirebaseProductManager.getFeaturedSync(),
  // Updated getDailyDeals with safe parsing
  getDailyDeals: () => {
    try {
      const localDeals = localStorage.getItem('luxemarket_daily_deals');
      let deals = [];
      if (localDeals) {
        deals = JSON.parse(localDeals);
      } else {
        deals = FirebaseProductManager.getDailyDealsSync().map(p => ({ productId: p.id, discountPercent: p.discountPercent || 20 }));
      }

      if (!Array.isArray(deals)) deals = [];

      // De-duplicate by productId to prevent the "x4" count issue if data is corrupted
      const uniqueDealsMap = new Map();
      deals.forEach(deal => {
        if (deal && deal.productId) {
          uniqueDealsMap.set(deal.productId.toString(), deal);
        }
      });
      return Array.from(uniqueDealsMap.values());
    } catch (e) {
      console.error("❌ Error parsing daily deals:", e);
      return [];
    }
  },
  getAllWithDeals: () => {
    const products = FirebaseProductManager.getAllSync();
    const deals = window.ProductManager.getDailyDeals();
    return products.map(product => {
      const deal = deals.find(d => d.productId == product.id);
      if (deal) {
        const discountAmount = product.price * (deal.discountPercent / 100);
        return {
          ...product,
          originalPrice: product.price,
          price: product.price - discountAmount,
          discountPercent: deal.discountPercent,
          isDailyDeal: true
        };
      }
      return product;
    });
  },
  // Add missing methods for Admin Dashboard
  addToDailyDeals: (productId, discountPercent) => {
    const deals = window.ProductManager.getDailyDeals();
    const existingIndex = deals.findIndex(deal => deal.productId == productId);
    const dealData = {
      productId: productId,
      discountPercent: Math.max(0, Math.min(90, discountPercent)),
      addedDate: new Date().toISOString()
    };
    if (existingIndex >= 0) deals[existingIndex] = dealData;
    else deals.push(dealData);
    localStorage.setItem('luxemarket_daily_deals', JSON.stringify(deals));
    return true;
  },
  removeFromDailyDeals: (productId) => {
    const deals = window.ProductManager.getDailyDeals();
    const filtered = deals.filter(deal => deal.productId != productId);
    localStorage.setItem('luxemarket_daily_deals', JSON.stringify(filtered));
    return true;
  },
  getHomePageOrder: () => {
    try {
      const order = localStorage.getItem('luxemarket_homepage_order');
      return order ? JSON.parse(order) : [];
    } catch (e) {
      console.error("❌ Error parsing homepage order:", e);
      return [];
    }
  },
  getHomePageProducts: (limit = 12, passedProducts = null) => {
    const customOrder = window.ProductManager.getHomePageOrder();
    const allWithDeals = passedProducts || window.ProductManager.getAllWithDeals();

    if (customOrder.length > 0) {
      const ordered = [];
      customOrder.forEach(id => {
        const p = allWithDeals.find(item => item.id == id);
        if (p) ordered.push(p);
      });

      // Fallback: If custom order returns nothing (e.g. invalid IDs), show all
      if (ordered.length > 0) {
        return ordered.slice(0, limit);
      }
    }
    return allWithDeals.slice(0, limit);
  },
  reorderHomePageProducts: (fromIndex, toIndex) => {
    const currentOrder = window.ProductManager.getHomePageOrder();
    const allProducts = FirebaseProductManager.getAllSync();
    let workingOrder = currentOrder.length > 0 ? [...currentOrder] : allProducts.slice(0, 12).map(p => p.id);
    const [movedItem] = workingOrder.splice(fromIndex, 1);
    workingOrder.splice(toIndex, 0, movedItem);
    localStorage.setItem('luxemarket_homepage_order', JSON.stringify(workingOrder));
    return workingOrder;
  },
  // Async methods
  getAllAsync: () => FirebaseProductManager.getAll(),
  getAllWithDealsAsync: async () => {
    const products = await FirebaseProductManager.getAll();
    const deals = window.ProductManager.getDailyDeals();
    return products.map(product => {
      const deal = deals.find(d => d.productId == product.id);
      if (deal) {
        const discountAmount = product.price * (deal.discountPercent / 100);
        return {
          ...product,
          originalPrice: product.price,
          price: product.price - discountAmount,
          discountPercent: deal.discountPercent,
          isDailyDeal: true
        };
      }
      return product;
    });
  },
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
