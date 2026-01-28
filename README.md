# Portfolio - LuxeMarket E-commerce Platform

This repository showcases **LuxeMarket**, a full-featured e-commerce application built with React, Vite, and Tailwind CSS.

## 🌐 Live Links

- **Portfolio**: [https://superdeveloper1.github.io/luxemarket/portfolio.html](https://superdeveloper1.github.io/luxemarket/portfolio.html)
- **Resume**: [https://superdeveloper1.github.io/luxemarket/resume.html](https://superdeveloper1.github.io/luxemarket/resume.html)
- **Live Demo**: [https://superdeveloper1.github.io/luxemarket/](https://superdeveloper1.github.io/luxemarket/)

## 📋 About This Project

LuxeMarket is a portfolio project demonstrating modern web development skills including:
- React 18 with hooks and context
- Vite for fast development and optimized builds
- Tailwind CSS for responsive design
- LocalStorage for data persistence
- Complex state management
- Admin dashboard with full CRUD operations

## 🏃 Quick Start

```bash
cd luxemarket/luxemarket-vite
npm install
npm run dev
```

Visit `http://localhost:5173` to see the app.

## 📦 Project Structure

```
luxemarket/luxemarket-vite/     # Main Vite React app
├── src/
│   ├── components/             # React components
│   │   ├── AdminDashboard.jsx  # Admin panel
│   │   ├── FeaturedProducts.jsx # Product grid
│   │   ├── Cart.jsx            # Shopping cart
│   │   ├── Header.jsx          # Navigation
│   │   └── ...
│   ├── managers/               # Business logic
│   │   ├── ProductManager.js   # Product CRUD
│   │   ├── CartManager.js      # Cart operations
│   │   └── CategoryManager.js  # Category management
│   ├── utils/                  # Utilities
│   └── main.jsx                # App entry
├── public/                     # Static assets
└── index.html                  # HTML template
```

## ✨ Features

### Customer Features
- 🛍️ **Product Browsing**: Grid view with image carousel
- 🔍 **Search & Filter**: By category, deals, search term
- 🛒 **Shopping Cart**: Add/remove items, update quantities
- 💳 **Checkout**: Multi-step checkout flow
- 🎨 **Color Variants**: Multiple colors with variant-specific images
- ⭐ **Product Details**: Ratings, reviews, descriptions
- 📱 **Responsive**: Works on all devices

### Admin Features
- ➕ **Product Management**: Add, edit, delete products
- 🏷️ **Category Management**: Create and manage categories
- 🔥 **Daily Deals**: Set discounts with countdown timers
- 🏠 **Home Page Control**: Select and reorder featured products
- 🎨 **Color Manager**: Visual color picker with RGB/Hex
- 🖼️ **Image Management**: Multiple images per product/color
- 📊 **Stock Tracking**: Monitor inventory levels

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **LocalStorage** - Client-side data persistence
- **GitHub Pages** - Deployment

## 🎯 Key Components

- **ProductManager**: Handles all product operations, daily deals, home page ordering
- **CartManager**: Shopping cart with persistence
- **CategoryManager**: Dynamic category system
- **AdminDashboard**: Complete admin interface
- **FeaturedProducts**: Product grid with filtering and pagination

## 📝 Admin Access

Navigate to `/admin` route or click "Admin" in the header to access the admin dashboard.

## 🌐 Deployment

```bash
npm run build
npm run preview  # Test production build
```

Deploy the `dist/` folder to any static hosting service.

## 📄 License

MIT License - Free to use for learning and portfolio purposes.
