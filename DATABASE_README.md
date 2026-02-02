# LuxeMarket Database Setup

Your app now has **two database options**:

## 1. IndexedDB (Local - Already Working) ✅

**What it is:** Browser-based database that stores data locally on each user's device.

**Status:** Already integrated and working!

**Pros:**
- ✅ Works offline
- ✅ Fast performance
- ✅ No setup required
- ✅ Free

**Cons:**
- ❌ Data is local to each user's browser
- ❌ Products not shared between users
- ❌ Data lost if browser cache cleared

**Use case:** Personal projects, demos, offline apps

---

## 2. Firebase (Cloud - Needs Setup) 🔥

**What it is:** Google's cloud database that stores data online and shares it with all users.

**Status:** Installed but needs configuration

**Pros:**
- ✅ All users see the same products
- ✅ Real-time sync across devices
- ✅ Data persists forever
- ✅ Free tier available
- ✅ Scalable

**Cons:**
- ⚠️ Requires Firebase account setup
- ⚠️ Needs internet connection

**Use case:** Production apps, e-commerce sites, multi-user apps

---

## Quick Start

### Option A: Keep Using IndexedDB (No Setup)
Your app already works with IndexedDB! Products are stored locally in each user's browser.

### Option B: Switch to Firebase (Recommended for Production)

1. **Go to Firebase Setup Page**
   - Click "🔥 Firebase" in the navigation bar
   - Or visit: `http://localhost:5173/#firebase`

2. **Follow the 4-step setup wizard:**
   - Create Firebase project
   - Enable Firestore
   - Update config file
   - Migrate your products

3. **Done!** All users will now see the same products.

---

## File Structure

```
src/
├── db/                          # IndexedDB (Local)
│   ├── database.js             # Database setup
│   ├── repositories/           # Data access layer
│   └── seedData.js            # Sample data
│
├── firebase/                    # Firebase (Cloud)
│   ├── config.js              # Firebase credentials (UPDATE THIS!)
│   ├── services/              # Firebase services
│   │   ├── productService.js  # Product operations
│   │   ├── cartService.js     # Cart operations
│   │   └── orderService.js    # Order operations
│   └── migrate.js             # Migration tool
│
└── hooks/
    ├── useDatabase.js         # IndexedDB hooks
    └── useFirebase.js         # Firebase hooks
```

---

## Which Should You Use?

### Use IndexedDB if:
- Building a demo or personal project
- Don't need to share data between users
- Want offline functionality
- Don't want to set up a backend

### Use Firebase if:
- Building a real e-commerce site
- Need all users to see the same products
- Want real-time updates
- Need user authentication
- Planning to scale

---

## Need Help?

- **IndexedDB Guide:** See `src/db/README.md`
- **Firebase Guide:** See `FIREBASE_SETUP.md`
- **Setup Page:** Visit `http://localhost:5173/#firebase`

---

## Current Status

✅ **IndexedDB:** Working and active
⏳ **Firebase:** Installed, needs configuration

Your app currently uses **IndexedDB** by default. To switch to Firebase, complete the setup at `#firebase`.
