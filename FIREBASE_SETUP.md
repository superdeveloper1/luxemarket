# Firebase Setup Guide

Complete guide to set up Firebase for LuxeMarket.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `luxemarket` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

## Step 2: Register Your Web App

1. In Firebase Console, click the **Web icon** (`</>`)
2. Enter app nickname: `LuxeMarket Web`
3. Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. **Copy the Firebase configuration** (you'll need this next)

## Step 3: Configure Firebase in Your App

1. Open `src/firebase/config.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 4: Set Up Firestore Database

1. In Firebase Console, go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location (choose closest to your users)
5. Click **"Enable"**

### Security Rules (Test Mode - Development Only)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Security Rules (Production - Recommended)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - anyone can read, only admins can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Carts - users can only access their own cart
    match /carts/{cartId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    
    // Orders - users can only access their own orders
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       request.auth.token.admin == true;
    }
  }
}
```

## Step 5: Enable Authentication (Optional)

1. In Firebase Console, go to **"Authentication"**
2. Click **"Get started"**
3. Enable sign-in methods:
   - **Email/Password** (recommended)
   - **Google** (optional)
   - **Anonymous** (for guest users)

## Step 6: Migrate Your Products to Firebase

1. Make sure your Firebase config is set up (Step 3)
2. Open your app in the browser
3. Open browser console (F12)
4. Run the migration command:

```javascript
await migrateToFirebase()
```

This will upload all your products from localStorage to Firebase!

## Step 7: Test Firebase Connection

Open browser console and test:

```javascript
// Import services (if not already available)
import productService from './src/firebase/services/productService';

// Get all products
const products = await productService.getAll();
console.log('Products:', products);

// Add a test product
const newProduct = await productService.create({
  name: 'Test Product',
  price: 99.99,
  category: 'Electronics',
  description: 'Test description',
  image: 'https://via.placeholder.com/300'
});
console.log('Created:', newProduct);
```

## Firebase Services Available

### Product Service
```javascript
import productService from './firebase/services/productService';

// Get all products
await productService.getAll()

// Get by ID
await productService.getById(productId)

// Get by category
await productService.getByCategory('Electronics')

// Get featured
await productService.getFeatured()

// Search
await productService.search('headphones')

// Create
await productService.create({ name: 'Product', price: 99.99, ... })

// Update
await productService.update(productId, { price: 79.99 })

// Delete
await productService.delete(productId)
```

### Cart Service
```javascript
import cartService from './firebase/services/cartService';

// Add to cart
await cartService.addItem(userId, productId, quantity)

// Get cart
await cartService.getCart(userId)

// Update quantity
await cartService.updateQuantity(cartItemId, newQuantity)

// Remove item
await cartService.removeItem(cartItemId)

// Clear cart
await cartService.clearCart(userId)
```

### Order Service
```javascript
import orderService from './firebase/services/orderService';

// Create order from cart
await orderService.createFromCart(userId, shippingInfo, paymentInfo)

// Get user orders
await orderService.getByUserId(userId)

// Update order status
await orderService.updateStatus(orderId, 'shipped')
```

## React Hooks

```javascript
import { useProducts, useCart, useOrders } from './hooks/useFirebase';

function MyComponent() {
  const { products, loading, error } = useProducts();
  const { cart, addItem, removeItem } = useCart(userId);
  const { orders } = useOrders(userId);
  
  // Use the data...
}
```

## Firestore Collections Structure

```
luxemarket/
├── products/
│   ├── {productId}
│   │   ├── name: string
│   │   ├── price: number
│   │   ├── category: string
│   │   ├── description: string
│   │   ├── image: string
│   │   ├── images: array
│   │   ├── colors: array
│   │   ├── sizes: array
│   │   ├── rating: number
│   │   ├── reviews: number
│   │   ├── stock: number
│   │   ├── featured: boolean
│   │   ├── dailyDeal: boolean
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
├── carts/
│   ├── {cartItemId}
│   │   ├── userId: string
│   │   ├── productId: string
│   │   ├── quantity: number
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
└── orders/
    ├── {orderId}
    │   ├── userId: string
    │   ├── items: array
    │   ├── total: number
    │   ├── status: string
    │   ├── shippingInfo: object
    │   ├── paymentInfo: object
    │   ├── createdAt: timestamp
    │   └── updatedAt: timestamp
```

## Troubleshooting

### "Firebase not configured" error
- Make sure you replaced the config in `src/firebase/config.js`
- Check that all values are correct (no "YOUR_" placeholders)

### "Permission denied" error
- Check Firestore security rules
- Make sure you're in test mode for development
- Verify user is authenticated if using production rules

### Products not showing
- Run migration: `await migrateToFirebase()`
- Check Firestore console to see if data exists
- Check browser console for errors

### CORS errors
- Make sure your domain is authorized in Firebase Console
- Check Firebase Hosting settings

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Configure Firestore
3. ✅ Migrate products
4. 🔄 Integrate with your app components
5. 🔄 Add authentication
6. 🔄 Deploy to Firebase Hosting

## Cost Estimate (Free Tier)

Firebase Free Tier includes:
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Authentication**: Unlimited users
- **Hosting**: 10GB storage, 360MB/day transfer

This is more than enough for development and small production apps!

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guides](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)
