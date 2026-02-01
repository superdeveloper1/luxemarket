import React from 'react';

// Minimal ProductCard - Only image and name for home page, with daily deals support
function ProductCard({ product, onProductClick }) {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    
    // Get all available images for the product
    const productImages = product.images && product.images.length > 0 
        ? product.images 
        : [product.image || 'https://via.placeholder.com/300x300?text=No+Image'];
    
    const displayImage = productImages[currentImageIndex];

    // Auto-carousel effect - cycle through images every 3 seconds
    React.useEffect(() => {
        if (productImages.length <= 1) return; // No carousel if only one image
        
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                (prevIndex + 1) % productImages.length
            );
        }, 3000); // Change image every 3 seconds
        
        return () => clearInterval(interval);
    }, [productImages.length]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer minimal-product-card"
             onClick={() => onProductClick(product.id)}>
            <div 
                className="relative aspect-square overflow-hidden bg-gray-100 product-image-container"
            >
                <img 
                    src={displayImage} 
                    alt={product.name}
                    className="w-full h-full object-cover product-image transition-opacity duration-500"
                    key={currentImageIndex} // Force re-render for fade effect
                />
                
                {/* Daily Deal Badge */}
                {product.isDailyDeal && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        🔥 {product.discountPercent}% OFF
                    </div>
                )}
                
                {/* Image Indicators - Show dots if multiple images */}
                {productImages.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                        {productImages.map((_, index) => (
                            <div
                                key={index}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                    index === currentImageIndex 
                                        ? 'bg-white w-4' 
                                        : 'bg-white/50'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 product-name-hover line-clamp-2">
                    {product.name}
                </h3>
                <p className="text-xs text-gray-500">{product.category}</p>
                
                {/* Show pricing for daily deals only */}
                {product.isDailyDeal && (
                    <div className="mt-2">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-bold text-red-600">${product.price.toFixed(2)}</span>
                            <span className="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-red-600 font-medium">Daily Deal!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FeaturedProducts({ products, onProductClick }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 home-products-grid">
            {products && products.length > 0 ? products.map(product => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    onProductClick={onProductClick} 
                />
            )) : (
                <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No products available</p>
                </div>
            )}
        </div>
    );
}

function FeaturedProductsSection() {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [categoryFilter, setCategoryFilter] = React.useState('');
    const [showDealsOnly, setShowDealsOnly] = React.useState(false);
    const [showAllProducts, setShowAllProducts] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 12;
    const sectionRef = React.useRef(null);

    const loadProducts = React.useCallback(async () => {
        try {
            setLoading(true);
            setProducts([]); // Clear old products first
            
            if (window.ProductManager) {
                // Wait for products to load from Firebase
                let allProducts;
                if (window.ProductManager.getAllAsync) {
                    console.log('🔥 Loading products from Firebase...');
                    allProducts = await window.ProductManager.getAllAsync();
                    console.log('🔥 Loaded from Firebase:', allProducts.length, 'products');
                    console.log('🔥 First product:', allProducts[0]);
                } else {
                    console.log('⚠️ Using sync method');
                    allProducts = window.ProductManager.getAll();
                }
                
                console.log('📦 Total products available:', allProducts.length);
                
                // Check if products have stock field
                const firstProduct = allProducts[0];
                if (firstProduct && typeof firstProduct.stock === 'undefined') {
                    console.log('⚠️ Products missing stock field, resetting data...');
                    if (window.ProductManager.resetToDefaults) {
                        window.ProductManager.resetToDefaults();
                        allProducts = window.ProductManager.getAll();
                    }
                }
                
                let productsToShow;
                
                // Apply daily deals filter first if active
                if (showDealsOnly) {
                    productsToShow = allProducts.filter(p => p.isDailyDeal || p.dailyDeal);
                    console.log(`🔥 Daily deals filter: ${productsToShow.length} deals found`);
                }
                // Apply category filter if set
                else if (categoryFilter && categoryFilter !== 'All Categories') {
                    productsToShow = allProducts.filter(p => {
                        // Case-insensitive category matching to handle any inconsistencies
                        return p.category && p.category.toLowerCase() === categoryFilter.toLowerCase();
                    });
                    console.log(`🏷️ Filtered by category "${categoryFilter}":`, productsToShow.length, 'products found');
                }
                // Show all products if requested
                else if (showAllProducts) {
                    productsToShow = allProducts;
                    console.log('📋 Showing all products:', productsToShow.length);
                }
                // Default: show home page products (limited to 12)
                else {
                    productsToShow = allProducts.slice(0, 12);
                    console.log('🏠 Home page: Setting', productsToShow.length, 'products');
                }
                
                console.log('🔥 Daily deals found:', productsToShow.filter(p => p.isDailyDeal || p.dailyDeal).length);
                setProducts(productsToShow);
                setCurrentPage(1); // Reset to first page when products change
            } else {
                console.error('❌ ProductManager not found on window');
            }
        } catch (error) {
            console.error('❌ Error loading products:', error);
        } finally {
            setLoading(false);
        }
    }, [categoryFilter, showDealsOnly, showAllProducts]);

    React.useEffect(() => {
        loadProducts();
        
        // Listen for admin updates
        const handleAdminUpdate = () => {
            console.log('🔄 Admin update detected, refreshing home page products...');
            loadProducts();
        };
        
        // Listen for category filter events
        const handleCategoryFilter = (event) => {
            const { category } = event.detail;
            console.log('🏷️ Category filter event received:', category);
            setCategoryFilter(category);
            setShowDealsOnly(false); // Clear deals filter when category is selected
            setShowAllProducts(false); // Clear show all when filtering
            
            // Scroll to products section
            setTimeout(() => {
                if (sectionRef.current) {
                    sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        };
        
        // Listen for daily deals filter events
        const handleDealsFilter = () => {
            console.log('🔥 Daily deals filter event received');
            setShowDealsOnly(true);
            setCategoryFilter(''); // Clear category filter when deals is selected
            setShowAllProducts(false); // Clear show all when filtering
            
            // Scroll to products section
            setTimeout(() => {
                if (sectionRef.current) {
                    sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        };
        
        // Listen for show all products event
        const handleShowAllProducts = () => {
            console.log('📋 Show all products event received');
            setShowAllProducts(true);
            setCategoryFilter('');
            setShowDealsOnly(false);
            
            // Scroll to products section
            setTimeout(() => {
                if (sectionRef.current) {
                    sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        };
        
        window.addEventListener('adminUpdate', handleAdminUpdate);
        window.addEventListener('filterByCategory', handleCategoryFilter);
        window.addEventListener('filterByDeals', handleDealsFilter);
        window.addEventListener('showAllProducts', handleShowAllProducts);
        
        return () => {
            window.removeEventListener('adminUpdate', handleAdminUpdate);
            window.removeEventListener('filterByCategory', handleCategoryFilter);
            window.removeEventListener('filterByDeals', handleDealsFilter);
            window.removeEventListener('showAllProducts', handleShowAllProducts);
        };
    }, [loadProducts]);

    const handleProductClick = (productId) => {
        window.dispatchEvent(new CustomEvent('openProduct', { detail: { productId } }));
    };

    // Calculate pagination
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = products.slice(startIndex, endIndex);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // Scroll to top of products section
        if (sectionRef.current) {
            sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (loading) {
        return (
            <section className="py-16 bg-white" ref={sectionRef}>
                <div className="container-custom">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
                        <p className="text-gray-600">Loading products...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-white featured-products-section featured-products-home" ref={sectionRef} id="products-section">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {showDealsOnly 
                            ? '🔥 Daily Deals' 
                            : categoryFilter && categoryFilter !== 'All Categories' 
                                ? `${categoryFilter} Products` 
                                : showAllProducts
                                    ? 'All Products'
                                    : 'Featured Products'
                        }
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {showDealsOnly
                            ? 'Special discounts available for a limited time!'
                            : categoryFilter && categoryFilter !== 'All Categories'
                                ? `Browse our ${categoryFilter.toLowerCase()} collection`
                                : showAllProducts
                                    ? 'Browse our complete product catalog'
                                    : 'Click on any product to see details, pricing, and purchase options'
                        }
                    </p>
                    {(categoryFilter && categoryFilter !== 'All Categories') || showDealsOnly || showAllProducts ? (
                        <button
                            onClick={() => {
                                setCategoryFilter('');
                                setShowDealsOnly(false);
                                setShowAllProducts(false);
                                setCurrentPage(1);
                            }}
                            className="btn btn-secondary text-sm mb-4"
                        >
                            ← Back to Home
                        </button>
                    ) : null}
                </div>
                
                <div className="home-products-grid">
                    <FeaturedProducts 
                        products={currentProducts} 
                        onProductClick={handleProductClick} 
                    />
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="btn btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ← Previous
                        </button>
                        
                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                        currentPage === page
                                            ? 'bg-[var(--primary-color)] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="btn btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>
                    </div>
                )}
                
                {/* Product Count and Actions */}
                <div className="text-center mt-8">
                    {!showAllProducts && !categoryFilter && !showDealsOnly && (
                        <button 
                            onClick={() => {
                                setShowAllProducts(true);
                                setCategoryFilter('');
                                setShowDealsOnly(false);
                                setCurrentPage(1);
                            }}
                            className="btn btn-primary px-8 py-3 text-lg hover:shadow-lg transition-shadow view-all-btn mr-4"
                        >
                            View All Products
                        </button>
                    )}
                    
                    <p className="text-sm text-gray-500 mt-4">
                        {showDealsOnly
                            ? `Showing ${products.length} daily deals`
                            : categoryFilter && categoryFilter !== 'All Categories'
                                ? `Showing ${startIndex + 1}-${Math.min(endIndex, products.length)} of ${products.length} ${categoryFilter.toLowerCase()} products`
                                : showAllProducts
                                    ? `Showing ${startIndex + 1}-${Math.min(endIndex, products.length)} of ${products.length} products (Page ${currentPage} of ${totalPages})`
                                    : `Showing ${products.length} featured products`
                        }
                    </p>
                </div>
            </div>
        </section>
    );
}

export default FeaturedProductsSection;