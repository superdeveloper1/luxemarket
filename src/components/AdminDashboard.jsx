import React from 'react';
import { showToast } from '../utils/simpleToast.js';
import CategoryManager from '../managers/CategoryManager.js';
import ColorManager from './ColorManager.jsx';
import EnhancedImageManager from './EnhancedImageManager.jsx';
import ConfirmationModal from './ConfirmationModal.jsx';
import ProductPreview from './ProductPreview.jsx';
// import DataManagementPanel from './DataManagementPanel.jsx';

// Daily Deals Manager Component
function DailyDealsManager({ products, onUpdate }) {
  const [dailyDeals, setDailyDeals] = React.useState([]);
  const [selectedProduct, setSelectedProduct] = React.useState('');
  const [discountPercent, setDiscountPercent] = React.useState(20);

  React.useEffect(() => {
    loadDailyDeals();
  }, []);

  const loadDailyDeals = () => {
    const deals = ProductManager.getDailyDeals();
    setDailyDeals(deals);
  };

  const addToDailyDeals = () => {
    if (!selectedProduct || discountPercent <= 0) {
      showToast('Please select a product and enter a valid discount', 'error');
      return;
    }

    ProductManager.addToDailyDeals(parseInt(selectedProduct), discountPercent);
    loadDailyDeals();
    onUpdate();
    setSelectedProduct('');
    setDiscountPercent(20);
    showToast('Product added to daily deals!', 'success');
    
    // Notify home page to refresh
    window.dispatchEvent(new CustomEvent('adminUpdate'));
  };

  const removeFromDailyDeals = (productId) => {
    ProductManager.removeFromDailyDeals(productId);
    loadDailyDeals();
    onUpdate();
    showToast('Product removed from daily deals', 'success');
    
    // Notify home page to refresh
    window.dispatchEvent(new CustomEvent('adminUpdate'));
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg shadow mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="icon-tag text-2xl text-red-600"></div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Deals Management</h2>
          <p className="text-gray-600">Add special discounts to featured products</p>
        </div>
      </div>

      {/* Add New Deal */}
      <div className="bg-white p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Add Product to Daily Deals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a product...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
            <input
              type="number"
              min="1"
              max="90"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addToDailyDeals}
              className="w-full btn bg-red-600 text-white hover:bg-red-700 py-2 px-4 rounded-md"
            >
              Add to Daily Deals
            </button>
          </div>
        </div>
      </div>

      {/* Current Daily Deals */}
      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Current Daily Deals ({dailyDeals.length})</h3>
        {dailyDeals.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No daily deals active</p>
        ) : (
          <div className="space-y-3">
            {dailyDeals.map(deal => {
              const product = products.find(p => p.id === deal.productId);
              if (!product) return null;
              
              const discountAmount = product.price * (deal.discountPercent / 100);
              const salePrice = product.price - discountAmount;
              
              return (
                <div key={deal.productId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">${salePrice.toFixed(2)}</span>
                        <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
                        <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {deal.discountPercent}% OFF
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromDailyDeals(deal.productId)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Remove from daily deals"
                  >
                    <div className="icon-trash text-lg"></div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Home Page Manager Component
function HomePageManager({ products, onUpdate }) {
  const [homePageProducts, setHomePageProducts] = React.useState([]);
  const [availableProducts, setAvailableProducts] = React.useState([]);
  const [draggedIndex, setDraggedIndex] = React.useState(null);
  const [draggedFrom, setDraggedFrom] = React.useState(null); // 'home' or 'available'

  React.useEffect(() => {
    loadHomePageProducts();
  }, [products]);

  const loadHomePageProducts = () => {
    const homeProducts = ProductManager.getHomePageProducts();
    setHomePageProducts(homeProducts);
    
    // Get products not on home page
    const homeProductIds = new Set(homeProducts.map(p => p.id));
    const available = products.filter(p => !homeProductIds.has(p.id));
    setAvailableProducts(available);
    
    console.log('🏠 Home page products:', homeProducts.length);
    console.log('📦 Available products:', available.length);
  };

  const handleDragStart = (e, index, from) => {
    setDraggedIndex(index);
    setDraggedFrom(from);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnHome = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null) return;

    if (draggedFrom === 'home') {
      // Reordering within home page
      if (draggedIndex === dropIndex) return;
      ProductManager.reorderHomePageProducts(draggedIndex, dropIndex);
    } else {
      // Adding from available to home page
      const productToAdd = availableProducts[draggedIndex];
      if (homePageProducts.length >= 12) {
        showToast('Home page can only have 12 products', 'error');
        setDraggedIndex(null);
        setDraggedFrom(null);
        return;
      }
      
      // Add to home page at specific position
      const newHomeProducts = [...homePageProducts];
      newHomeProducts.splice(dropIndex, 0, productToAdd);
      
      // Save to localStorage
      const homeProductIds = newHomeProducts.map(p => p.id);
      localStorage.setItem('luxemarket_homepage_order', JSON.stringify(homeProductIds));
    }
    
    loadHomePageProducts();
    onUpdate();
    setDraggedIndex(null);
    setDraggedFrom(null);
    showToast('Home page updated!', 'success');
    
    // Notify home page to refresh
    window.dispatchEvent(new CustomEvent('adminUpdate'));
  };

  const addToHomePage = (product) => {
    if (homePageProducts.length >= 12) {
      showToast('Home page can only have 12 products', 'error');
      return;
    }
    
    const newHomeProducts = [...homePageProducts, product];
    const homeProductIds = newHomeProducts.map(p => p.id);
    localStorage.setItem('luxemarket_homepage_order', JSON.stringify(homeProductIds));
    
    loadHomePageProducts();
    onUpdate();
    showToast(`"${product.name}" added to home page`, 'success');
    window.dispatchEvent(new CustomEvent('adminUpdate'));
  };

  const removeFromHomePage = (index) => {
    const newHomeProducts = homePageProducts.filter((_, i) => i !== index);
    const homeProductIds = newHomeProducts.map(p => p.id);
    localStorage.setItem('luxemarket_homepage_order', JSON.stringify(homeProductIds));
    
    loadHomePageProducts();
    onUpdate();
    showToast('Product removed from home page', 'success');
    window.dispatchEvent(new CustomEvent('adminUpdate'));
  };

  const resetToDefault = () => {
    localStorage.removeItem('luxemarket_homepage_order');
    loadHomePageProducts();
    onUpdate();
    showToast('Reset to default order', 'success');
    window.dispatchEvent(new CustomEvent('adminUpdate'));
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="icon-home text-2xl text-blue-600"></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Home Page Product Manager</h2>
            <p className="text-gray-600">Select and arrange products for the home page (max 12)</p>
          </div>
        </div>
        <button
          onClick={resetToDefault}
          className="btn btn-secondary px-4 py-2 text-sm"
        >
          Reset to Default
        </button>
      </div>

      {/* Current Home Page Products */}
      <div className="bg-white p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
          <span>Current Home Page Products ({homePageProducts.length}/12)</span>
          {homePageProducts.length < 12 && (
            <span className="text-sm text-orange-600 font-normal">
              ⚠️ Add {12 - homePageProducts.length} more product{12 - homePageProducts.length !== 1 ? 's' : ''}
            </span>
          )}
        </h3>
        
        {homePageProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-3">🏠</div>
            <p className="text-gray-500 font-medium">No products on home page</p>
            <p className="text-gray-400 text-sm">Add products from the list below</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {homePageProducts.map((product, index) => (
              <div
                key={product.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index, 'home')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnHome(e, index)}
                className={`relative bg-white border-2 rounded-lg overflow-hidden cursor-move transition-all group ${
                  draggedIndex === index && draggedFrom === 'home' ? 'border-blue-500 opacity-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="aspect-square bg-gray-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <div className="absolute top-2 left-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  {product.isDailyDeal && (
                    <div className="absolute top-10 left-2 bg-red-600 text-white px-1 py-0.5 rounded text-xs font-bold">
                      🔥 {product.discountPercent}%
                    </div>
                  )}
                  <button
                    onClick={() => removeFromHomePage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Remove from home page"
                  >
                    ×
                  </button>
                  <h4 className="text-xs font-semibold text-gray-900 line-clamp-2">{product.name}</h4>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4 text-center">
          💡 Drag and drop to reorder • Click × to remove
        </p>
      </div>

      {/* Available Products */}
      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          Available Products ({availableProducts.length})
        </h3>
        
        {availableProducts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">All products are on the home page</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {availableProducts.map((product, index) => (
              <div
                key={product.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index, 'available')}
                className={`relative bg-white border-2 rounded-lg overflow-hidden cursor-move transition-all group ${
                  draggedIndex === index && draggedFrom === 'available' ? 'border-green-500 opacity-50' : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="aspect-square bg-gray-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <button
                    onClick={() => addToHomePage(product)}
                    disabled={homePageProducts.length >= 12}
                    className="absolute top-2 right-2 w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title={homePageProducts.length >= 12 ? 'Home page is full' : 'Add to home page'}
                  >
                    +
                  </button>
                  <h4 className="text-xs font-semibold text-gray-900 line-clamp-2">{product.name}</h4>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4 text-center">
          💡 Drag to home page section above or click + to add
        </p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [products, setProducts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [categoryFilter, setCategoryFilter] = React.useState('All Categories');
  const [form, setForm] = React.useState({
    name: "",
    price: "",
    category: "",
    image: "",
    images: [],
    description: "",
    videoUrl: "",
    colors: [],
    sizes: "",
    rating: 4.0,
    reviews: 0,
    stock: 0
  });
  const [imageInput, setImageInput] = React.useState("");
  const [useEnhancedImages, setUseEnhancedImages] = React.useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState({
    isOpen: false,
    product: null
  });
  const [categoryDeleteConfirmation, setCategoryDeleteConfirmation] = React.useState({
    isOpen: false,
    categoryName: null
  });
  const [showPreview, setShowPreview] = React.useState(true);
  const [showGoToTop, setShowGoToTop] = React.useState(false);

  React.useEffect(() => {
    refreshData();
  }, []);

  // Show/hide go to top button based on scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      setShowGoToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const refreshData = async () => {
    try {
      if (!window.ProductManager) {
        console.error('ProductManager not initialized');
        return;
      }
      
      // Use the same method as front page to ensure consistency
      let allProducts;
      if (window.ProductManager.getAllWithDeals) {
        allProducts = window.ProductManager.getAllWithDeals();
      } else if (window.ProductManager.getAllAsync) {
        allProducts = await window.ProductManager.getAllAsync();
      } else {
        allProducts = window.ProductManager.getAll();
      }
      
      setProducts(allProducts);
      setCategories(CategoryManager.getAll());
      
      // Notify other components about admin updates
      window.dispatchEvent(new CustomEvent('adminUpdate'));
    } catch (error) {
      console.error('Error refreshing data:', error);
      showToast('Failed to load products', 'error');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Real-time preview update - memoized to prevent flickering
  const previewProduct = React.useMemo(() => {
    return {
      ...form,
      price: parseFloat(form.price) || 0,
      rating: parseFloat(form.rating) || 4.0,
      reviews: parseInt(form.reviews) || 0,
      stock: parseInt(form.stock) || 0
    };
  }, [form]);

  const handleColorChange = React.useCallback((colors) => {
    setForm(prev => ({ ...prev, colors }));
  }, []);

  const handleImageUpdate = React.useCallback((newImages) => {
    setForm(prev => ({ 
      ...prev, 
      images: newImages,
      image: newImages.length > 0 ? (typeof newImages[0] === 'string' ? newImages[0] : newImages[0].url) : prev.image
    }));
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      category: "",
      image: "",
      images: [],
      description: "",
      videoUrl: "",
      colors: [],
      sizes: "",
      rating: 4.0,
      reviews: 0,
      stock: 0
    });
    setImageInput("");
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!window.ProductManager) {
        console.error('ProductManager not initialized');
        return;
      }
      
      // Parse sizes array
      const sizesArray = form.sizes ? form.sizes.split(',').map(size => size.trim()).filter(size => size) : [];

      // Convert enhanced images back to simple URLs for compatibility
      let imageUrls = [];
      if (form.images && form.images.length > 0) {
        imageUrls = form.images.map(img => typeof img === 'string' ? img : img.url);
      } else if (form.image.trim()) {
        imageUrls = [form.image.trim()];
      }

      const payload = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        category: form.category.trim(),
        image: form.image.trim() || (imageUrls.length > 0 ? imageUrls[0] : ''),
        images: imageUrls,
        enhancedImages: form.images, // Store enhanced images with angle info
        description: form.description.trim(),
        videoUrl: form.videoUrl.trim(),
        colors: form.colors,
        sizes: sizesArray,
        rating: parseFloat(form.rating) || 4.0,
        reviews: parseInt(form.reviews) || 0,
        stock: parseInt(form.stock) || 0
      };

      if (editingProduct) {
        await window.ProductManager.update(editingProduct.id, payload);
        showToast("Product updated successfully", "success");
      } else {
        await window.ProductManager.add(payload);
        showToast("Product added successfully", "success");
      }

      CategoryManager.syncWithProducts();
      await refreshData();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Failed to save product', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    
    // Convert arrays back to strings for form editing
    const sizesString = product.sizes ? product.sizes.join(', ') : '';
    
    // Use enhanced images if available, otherwise convert simple URLs
    let imagesToEdit = [];
    if (product.enhancedImages && product.enhancedImages.length > 0) {
      imagesToEdit = product.enhancedImages;
    } else if (product.images && product.images.length > 0) {
      imagesToEdit = product.images.map((url, index) => ({
        id: `img-${index}-${Date.now()}`,
        url: url,
        angle: index === 0 ? 'front' : 'other',
        description: ''
      }));
    }
    
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      images: imagesToEdit,
      description: product.description,
      videoUrl: product.videoUrl || "",
      colors: product.colors || [],
      sizes: sizesString,
      rating: product.rating || 4.0,
      reviews: product.reviews || 0,
      stock: product.stock || 0
    });

    // Scroll to the form section smoothly
    setTimeout(() => {
      const formSection = document.getElementById('product-form-section');
      if (formSection) {
        formSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        
        // Add a subtle highlight effect
        formSection.classList.add('highlight-form');
        setTimeout(() => {
          formSection.classList.remove('highlight-form');
        }, 2000);
      }
    }, 100);
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput("");
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = (id) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setDeleteConfirmation({
        isOpen: true,
        product: product
      });
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.product) {
      try {
        if (!window.ProductManager) {
          console.error('ProductManager not initialized');
          return;
        }
        
        await window.ProductManager.delete(deleteConfirmation.product.id);
        CategoryManager.syncWithProducts();
        await refreshData();
        showToast(`"${deleteConfirmation.product.name}" deleted successfully`, "success");
        
        // If we were editing this product, clear the form
        if (editingProduct && editingProduct.id === deleteConfirmation.product.id) {
          resetForm();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast("Error deleting product", "error");
      }
    }
    setDeleteConfirmation({ isOpen: false, product: null });
  };

  const handleAddCategory = () => {
    const name = prompt("Enter new category name:");
    if (!name) return;

    if (CategoryManager.add(name)) {
      showToast("Category added successfully", "success");
      refreshData();
    } else {
      showToast("Category already exists", "error");
    }
  };

  const handleDeleteCategory = (name) => {
    setCategoryDeleteConfirmation({
      isOpen: true,
      categoryName: name
    });
  };

  const confirmDeleteCategory = () => {
    if (categoryDeleteConfirmation.categoryName) {
      CategoryManager.delete(categoryDeleteConfirmation.categoryName);
      refreshData();
      showToast(`Category "${categoryDeleteConfirmation.categoryName}" deleted successfully`, "success");
    }
    setCategoryDeleteConfirmation({ isOpen: false, categoryName: null });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 admin-header rounded-lg flex items-center justify-center admin-icon">
              <div className="icon-chart-line text-2xl text-white"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your products, categories, and store settings</p>
            </div>
          </div>
          <a 
            href="index.html" 
            className="btn btn-secondary flex items-center gap-2"
          >
            <div className="icon-arrow-left text-sm"></div>
            Back to Store
          </a>
        </div>

        {/* Add/Edit Product Form */}
        <div id="product-form-section" className="bg-white p-6 rounded-lg shadow mb-8 transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="icon-tools text-lg text-[var(--primary-color)]"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`btn text-sm flex items-center gap-2 ${showPreview ? 'btn-primary' : 'btn-secondary'}`}
              >
                <div className="icon-eye text-xs"></div>
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              {editingProduct && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    showToast('Edit cancelled', 'info');
                  }}
                  className="btn btn-secondary text-sm"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Enter product name" 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input 
                name="price" 
                type="number" 
                step="0.01" 
                value={form.price} 
                onChange={handleChange} 
                placeholder="0.00" 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input 
                name="stock" 
                type="number" 
                min="0" 
                value={form.stock} 
                onChange={handleChange} 
                placeholder="0" 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent" 
                required 
              />
              <p className="text-xs text-gray-500 mt-1">Number of items available for sale</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="flex gap-2">
                <input 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  placeholder="Enter or select category" 
                  className="flex-1 border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent" 
                  list="category-list" 
                  required 
                />
                <button
                  type="button"
                  onClick={() => {
                    const newCategory = form.category.trim();
                    if (newCategory && !categories.includes(newCategory)) {
                      CategoryManager.add(newCategory);
                      refreshData();
                      showToast(`Category "${newCategory}" added`, "success");
                    }
                  }}
                  className="btn btn-secondary px-4 whitespace-nowrap"
                  title="Add this category if it doesn't exist"
                >
                  + Add
                </button>
              </div>
              <datalist id="category-list">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL</label>
              <input 
                name="image" 
                value={form.image} 
                onChange={handleChange} 
                placeholder="https://example.com/image.jpg" 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent" 
              />
              {form.image && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Main Image Preview</p>
                  <img 
                    src={form.image} 
                    alt="Main product image preview" 
                    className="w-24 h-24 object-cover rounded border hover:border-[var(--primary-color)] transition-colors"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
              
              {/* Toggle between simple and enhanced image management */}
              <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useEnhancedImages"
                    checked={useEnhancedImages}
                    onChange={(e) => setUseEnhancedImages(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="useEnhancedImages" className="text-sm font-medium text-gray-700">
                    Enhanced Image Management
                  </label>
                </div>
                <div className="text-xs text-gray-500">
                  {useEnhancedImages ? '📷 Manage angles & descriptions' : '🖼️ Simple image list'}
                </div>
              </div>

              {useEnhancedImages ? (
                <EnhancedImageManager
                  images={form.images}
                  onUpdate={handleImageUpdate}
                  title="Product Images"
                />
              ) : (
                <>
                  <div className="flex gap-2 mb-2">
                    <input 
                      value={imageInput} 
                      onChange={(e) => setImageInput(e.target.value)} 
                      placeholder="https://example.com/additional-image.jpg" 
                      className="flex-1 border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent" 
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="btn btn-secondary px-4 whitespace-nowrap"
                    >
                      Add Image
                    </button>
                  </div>
                  
                  {/* Image Grid */}
                  {form.images.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-2xl mb-2">📷</div>
                      <p className="text-gray-500 text-sm">No additional images yet</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Additional Images ({form.images.length})</p>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {form.images.map((img, index) => {
                          const imageUrl = typeof img === 'string' ? img : img.url;
                          return (
                            <div
                              key={`${imageUrl}-${index}`}
                              className="relative group"
                            >
                              <img
                                src={imageUrl}
                                alt={`Image ${index + 1}`}
                                className="w-full h-20 object-cover rounded border hover:border-[var(--primary-color)] transition-colors"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/80x80?text=Error';
                                }}
                              />
                              
                              {/* Delete button - larger and always visible on hover */}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 transform"
                                title="Delete image"
                              >
                                🗑️
                              </button>
                              
                              {/* Position indicator */}
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b">
                                #{index + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">Add multiple images showing different angles of the product</p>
                </>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (Optional)</label>
              <input 
                name="videoUrl" 
                value={form.videoUrl} 
                onChange={handleChange} 
                placeholder="https://example.com/video.mp4" 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent" 
              />
              <p className="text-xs text-gray-500 mt-1">Add a video URL for product demonstrations</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Colors</label>
              <ColorManager 
                colors={form.colors}
                onChange={handleColorChange}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma-separated)</label>
              <input 
                name="sizes" 
                value={form.sizes} 
                onChange={handleChange} 
                placeholder="S, M, L, XL or 7, 8, 9, 10, 11, 12" 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent" 
              />
              <p className="text-xs text-gray-500 mt-1">Enter sizes separated by commas</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                placeholder="Enter product description" 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent" 
                rows="3" 
              />
            </div>
            
            <div className="md:col-span-2 flex gap-4">
              <button type="submit" className="btn btn-primary px-6 py-3">
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
              {editingProduct && (
                <button type="button" onClick={resetForm} className="btn btn-secondary px-6 py-3">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Product Preview */}
        <ProductPreview 
          product={previewProduct} 
          isVisible={showPreview && (form.name || form.image || form.description || form.colors.length > 0)}
        />

        {/* Categories Management */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="icon-palette text-lg text-green-600"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
            </div>
            <button onClick={handleAddCategory} className="btn btn-primary">
              Add Category
            </button>
          </div>
          <div className="flex gap-3 flex-wrap">
            {categories.map(cat => (
              <div key={cat} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <span className="text-gray-700">{cat}</span>
                <button 
                  onClick={() => handleDeleteCategory(cat)} 
                  className="text-red-500 hover:text-red-700 font-bold"
                  title="Delete category"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="icon-database text-lg text-purple-600"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Products ({categoryFilter === 'All Categories' ? products.length : products.filter(p => p.category === categoryFilter).length})
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
              >
                <option value="All Categories">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const formSection = document.getElementById('product-form-section');
                  if (formSection) {
                    formSection.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start',
                      inline: 'nearest'
                    });
                  }
                }}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <div className="icon-arrow-up text-xs"></div>
                Jump to Form
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products
              .filter(product => categoryFilter === 'All Categories' || product.category === categoryFilter)
              .map(product => (
              <div 
                key={product.id} 
                className={`border rounded-lg overflow-hidden hover:shadow-md transition-all ${
                  editingProduct && editingProduct.id === product.id 
                    ? 'border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20 bg-blue-50/30' 
                    : 'border-gray-200'
                }`}
              >
                <div className="aspect-square overflow-hidden bg-gray-100 relative">
                  {editingProduct && editingProduct.id === product.id && (
                    <div className="absolute top-2 left-2 bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full font-medium">
                      Editing
                    </div>
                  )}
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <div className="mb-1">
                    {product.isDailyDeal ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">${product.price.toFixed(2)}</span>
                        <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                        <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {product.discountPercent}% OFF
                        </span>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-[var(--primary-color)]">${product.price.toFixed(2)}</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                  
                  {/* Stock Information - Admin Only */}
                  <div className="mb-2">
                    {product.stock === 0 ? (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Out of Stock (0)
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                        Low Stock ({product.stock})
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        In Stock ({product.stock})
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
                  {product.videoUrl && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 mb-4">
                      <div className="icon-play text-xs"></div>
                      <span>Video available</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(product)} 
                      className={`btn flex-1 text-sm ${
                        editingProduct && editingProduct.id === product.id
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      {editingProduct && editingProduct.id === product.id ? 'Editing...' : 'Edit'}
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)} 
                      className="btn bg-red-600 hover:bg-red-700 text-white flex-1 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {products.filter(product => categoryFilter === 'All Categories' || product.category === categoryFilter).length === 0 && (
            <div className="text-center py-12">
              <div className="icon-shopping-bag text-4xl text-gray-300 mx-auto mb-3"></div>
              <p className="text-gray-500">No products found. Add your first product above.</p>
            </div>
          )}
        </div>

        {/* Daily Deals Management */}
        <DailyDealsManager products={products} onUpdate={refreshData} />

        {/* Home Page Product Ordering */}
        <HomePageManager products={products} onUpdate={refreshData} />

        {/* Data Management Panel - Temporarily disabled */}
        {/* <DataManagementPanel /> */}

      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, product: null })}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        confirmText="Delete Product"
        cancelText="Keep Product"
        type="danger"
        itemDetails={deleteConfirmation.product ? {
          name: deleteConfirmation.product.name,
          price: deleteConfirmation.product.price,
          category: deleteConfirmation.product.category,
          image: deleteConfirmation.product.image,
          reviews: deleteConfirmation.product.reviews
        } : null}
      />

      {/* Category Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={categoryDeleteConfirmation.isOpen}
        onClose={() => setCategoryDeleteConfirmation({ isOpen: false, categoryName: null })}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryDeleteConfirmation.categoryName}"?`}
        confirmText="Delete Category"
        cancelText="Keep Category"
        type="warning"
      />

      {/* Go to Top Button */}
      {showGoToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
          title="Go to top"
        >
          <div className="icon-arrow-up text-lg group-hover:animate-bounce"></div>
        </button>
      )}
    </div>
  );
}

export default AdminDashboard;