import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import managers to make them available globally
import './managers/ProductManager.js'
import './managers/CartManager.js'
import './managers/CategoryManager.js'
import './utils/watchlist.js'

// Import data manager for auto-save functionality (temporarily disabled for debugging)
// import './utils/dataManager.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
