# LuxeMarket Database

IndexedDB implementation using Dexie.js for client-side data persistence.

## Features

- **IndexedDB** - Modern browser database with better performance than localStorage
- **Automatic Migration** - Migrates existing localStorage data on first load
- **Type-safe Repositories** - Clean API for database operations
- **Backup & Restore** - Export/import database as JSON
- **React Hooks** - Easy integration with React components

## Database Schema

### Tables

- **products** - Product catalog
- **categories** - Product categories
- **cart** - Shopping cart items
- **orders** - Customer orders
- **orderItems** - Order line items
- **users** - User accounts
- **watchlist** - Saved products
- **settings** - App settings

## Usage

### Using Repositories (Recommended)

```javascript
import ProductRepository from './db/repositories/ProductRepository';
import CartRepository from './db/repositories/CartRepository';
import OrderRepository from './db/repositories/OrderRepository';

// Products
const products = await ProductRepository.findAll();
const featured = await ProductRepository.findFeatured();
const product = await ProductRepository.create({
  name: 'New Product',
  price: 99.99,
  category: 'Electronics'
});

// Cart
await CartRepository.addItem(productId, quantity);
const cart = await CartRepository.getCartWithProducts();
await CartRepository.updateQuantity(itemId, 2);
await CartRepository.clear();

// Orders
const order = await OrderRepository.createFromCart(userId, shippingInfo, paymentInfo);
const orders = await OrderRepository.findByUserId(userId);
await OrderRepository.updateStatus(orderId, 'shipped');
```

### Using React Hooks

```javascript
import { useProducts, useCart, useOrders } from './hooks/useDatabase';

function MyComponent() {
  const { products, loading, error, refresh } = useProducts();
  const { cart, addItem, removeItem, clearCart } = useCart();
  const { orders } = useOrders(userId);

  // Use the data...
}
```

### Direct Database Access

```javascript
import db from './db/database';

// Query products
const products = await db.products.toArray();
const electronics = await db.products.where('category').equals('Electronics').toArray();

// Add to cart
await db.cart.add({
  productId: 1,
  quantity: 2,
  addedAt: new Date()
});

// Create order
const orderId = await db.orders.add({
  userId: 1,
  total: 299.99,
  status: 'pending',
  createdAt: new Date()
});
```

## Database Management

### Backup

```javascript
import db from './db/database';

// Create backup (downloads JSON file)
await db.createBackup();
```

### Restore

```javascript
// Restore from backup file
const backupData = JSON.parse(fileContent);
await db.restoreFromBackup(backupData);
```

### Clear All Data

```javascript
await db.clearAll();
```

### Reset & Reseed

```javascript
import { resetDatabase } from './db/seedData';

await resetDatabase();
```

### Get Stats

```javascript
const stats = await db.getStats();
console.log(stats);
// { products: 10, categories: 5, cart: 3, orders: 2, ... }
```

## Browser Console Commands

The database is available globally as `window.LuxeMarketDB`:

```javascript
// View all products
await LuxeMarketDB.products.toArray()

// Get database stats
await LuxeMarketDB.getStats()

// Create backup
await LuxeMarketDB.createBackup()

// Clear all data
await LuxeMarketDB.clearAll()
```

## Migration from localStorage

The database automatically migrates data from localStorage on first load:
- `luxemarket_products` → `products` table
- `luxemarket_categories` → `categories` table
- `luxemarket_cart` → `cart` table

Migration runs once and sets a flag in the settings table.

## Development

### Seed Data

Initial seed data is in `seedData.js`. Modify it to add more sample data.

### Adding New Tables

1. Update schema in `database.js`:
```javascript
this.version(2).stores({
  // existing tables...
  newTable: '++id, field1, field2'
});
```

2. Create repository in `repositories/NewTableRepository.js`

3. Add seed data if needed

## Performance Tips

- Use indexes for frequently queried fields
- Use `bulkAdd` for multiple inserts
- Use transactions for related operations
- Limit query results with `.limit()`
- Use `.count()` instead of `.toArray().length`

## Troubleshooting

### Clear IndexedDB in Browser

Chrome DevTools → Application → Storage → IndexedDB → LuxeMarketDB → Delete

### View Database Contents

Chrome DevTools → Application → Storage → IndexedDB → LuxeMarketDB → Expand tables

### Check Migration Status

```javascript
const migrated = await LuxeMarketDB.settings.get('migrated');
console.log(migrated);
```
