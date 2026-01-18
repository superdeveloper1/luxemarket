# LuxeMarket E-Commerce Project

## Overview
A modern, responsive e-commerce frontend built with React and TailwindCSS.

## Project Structure
- `index.html`: Entry point (Home Page)
- `product.html`: Product Detail Page
- `checkout.html`: Shopping Cart and Checkout Page
- `admin.html`: Admin Dashboard
- `app.js`: Main logic for Home Page
- `product-app.js`: Main logic for Product Detail Page
- `checkout-app.js`: Main logic for Checkout Page
- `admin-app.js`: Main logic for Admin Dashboard
- `utils/`: Helper files
  - `data.js`: Data manager with LocalStorage persistence for Products
  - `cart.js`: Cart manager with LocalStorage persistence
- `components/`: Reusable UI components
  - `Header.js`: Navigation and cart indicator
  - `Hero.js`: Landing carousel
  - `ProductCard.js`: Individual product display
  - `ProductDetail.js`: Full product view
  - `FeaturedProducts.js`: Product grid wrapper
  - `CheckoutFlow.js`: Multi-step checkout process (Cart, Shipping, Payment)
  - `AuthModal.js`: Sign In / Register modal
  - `Toast.js`: Notification system
  - `AdminProductForm.js`: Modal form for adding/editing products
  - `Newsletter.js`: Subscription form
  - `Footer.js`: Site footer

## Features
- **Admin Dashboard**: Manage products (Add, Edit, Delete, Daily Deals).
- **Product Carousel**: View multiple images per product on detail page.
- **Shopping Cart**: Persistent cart with quantity management.
- **Checkout**: Multi-step secure checkout simulation.
- **Authentication**: User registration and login simulation.
- **Notifications**: Non-intrusive toast notifications for user actions.

## Maintenance Rules
- Update this README when adding new major features or changing directory structure.
- Check `trickle/assets` when adding new external images.