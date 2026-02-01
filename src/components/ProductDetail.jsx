import React from 'react';

function ProductDetail({ product, onClose, currentUser, onOpenAuth, onCartUpdate }) {
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isInWatchlist, setIsInWatchlist] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);

  React.useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0].name);
      }
      setCurrentImageIndex(0);

      // Check if product is in watchlist
      if (window.WatchlistManager) {
        setIsInWatchlist(window.WatchlistManager.isInWatchlist(product.id));
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] modal-overlay modal-backdrop" onClick={onClose}>
        <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
          <p>Product not found</p>
          <button onClick={onClose} className="btn btn-primary mt-4">Close</button>
        </div>
      </div>
    );
  }

  // Get images for current color or default images - handle both simple and enhanced formats
  let currentImages = [];
  if (selectedColor && product.colors) {
    const colorObj = product.colors.find(c => c.name === selectedColor);
    if (colorObj && colorObj.images) {
      currentImages = colorObj.images;
    }
  }
  if (currentImages.length === 0 && product.images) {
    // Handle both enhanced and simple image formats
    currentImages = product.images.map(img => typeof img === 'string' ? img : img.url);
  }
  if (currentImages.length === 0 && product.image) {
    currentImages = [product.image];
  }

  // Create media array that includes both images and video
  const mediaItems = [...currentImages];
  if (product.videoUrl) {
    mediaItems.push({
      type: 'video',
      url: product.videoUrl,
      thumbnail: currentImages[0] || 'https://via.placeholder.com/500x500?text=Video'
    });
  }

  const currentMedia = mediaItems[currentImageIndex];
  const isCurrentVideo = currentMedia && typeof currentMedia === 'object' && currentMedia.type === 'video';

  const nextImage = () => {
    if (mediaItems.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length);
    }
  };

  const prevImage = () => {
    if (mediaItems.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleColorChange = (colorName) => {
    setSelectedColor(colorName);
    setCurrentImageIndex(0);
    // Removed toast message for cleaner UX
  };

  // Keyboard navigation and body scroll lock
  React.useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextImage();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependencies to avoid re-creating the handler

  const handleAddToCart = () => {
    if (!currentUser) {
      // Show a clear message to the user about needing to sign in
      showToast('Please sign in to add items to your cart', 'info');
      onOpenAuth(false); // false = show login form
      return;
    }

    if (product.stock === 0) {
      showToast('This product is out of stock', 'error');
      return;
    }

    if (quantity > product.stock) {
      showToast(`Only ${product.stock} items available`, 'error');
      return;
    }

    try {
      const success = CartManager.add(product.id, quantity);
      if (success) {
        onCartUpdate();
        // Dispatch cart update event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        showToast(`Added ${quantity} ${product.name}${quantity > 1 ? 's' : ''} to cart`, 'success');
      } else {
        showToast('Failed to add item to cart', 'error');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      showToast(error.message || 'Failed to add item to cart', 'error');
    }
  };

  const handleWatchlistToggle = () => {
    if (window.WatchlistManager) {
      const added = window.WatchlistManager.toggleWatchlist(product.id);
      setIsInWatchlist(added);
      showToast(
        added ? `Added ${product.name} to watchlist` : `Removed ${product.name} from watchlist`,
        'success'
      );
    }
  };

  const handleBuyNow = () => {
    if (!currentUser) {
      // Show a clear message to the user about needing to sign in
      showToast('Please sign in to purchase this item', 'info');
      onOpenAuth(true); // true = show register form for new users wanting to buy
      return;
    }

    if (product.stock === 0) {
      showToast('This product is out of stock', 'error');
      return;
    }

    if (quantity > product.stock) {
      showToast(`Only ${product.stock} items available`, 'error');
      return;
    }

    try {
      // Add to cart first
      const success = CartManager.add(product.id, quantity);
      if (success) {
        onCartUpdate();
        // Dispatch cart update event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // Close product detail modal
        onClose();

        // Trigger checkout process
        setTimeout(() => {
          // Dispatch event to open checkout
          window.dispatchEvent(new CustomEvent('openCheckout'));
          showToast(`Proceeding to checkout with ${quantity} ${product.name}${quantity > 1 ? 's' : ''}`, 'success');
        }, 100);
      } else {
        showToast('Failed to add item to cart', 'error');
      }
    } catch (error) {
      console.error('Buy now error:', error);
      showToast(error.message || 'Failed to process purchase', 'error');
    }
  };

  const descriptionThreshold = 200;
  const isDescriptionTooLong = product.description && product.description.length > descriptionThreshold;
  const displayDescription = isDescriptionTooLong && !isDescriptionExpanded
    ? product.description.substring(0, descriptionThreshold) + '...'
    : product.description;

  // Debug: Global click listener to see what's catching the events
  React.useEffect(() => {
    const debugClickListener = (e) => {
      console.log('🌍 GLOBAL CLICK:', e.target);
      console.log('   Classes:', e.target.className);
      // Log z-index of the target
      const zIndex = window.getComputedStyle(e.target).zIndex;
      console.log('   Z-Index:', zIndex);
    };
    // Capture phase listener on window
    window.addEventListener('click', debugClickListener, true);
    return () => window.removeEventListener('click', debugClickListener, true);
  }, []);

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center p-8 overflow-y-auto z-[99999]"
      onClick={(e) => {
        console.log('🎯 BACKDROP CLICKED (React)!');
        onClose();
      }}
      style={{
        pointerEvents: 'auto',
        cursor: 'pointer',
        border: '5px solid red' // VISUAL DEBUG
      }}
    >
      <div
        className="product-modal bg-white rounded-lg max-w-3xl w-full my-8 shadow-2xl relative"
        style={{ maxWidth: 'calc(100vw - 8rem)', maxHeight: 'calc(100vh - 8rem)' }}
        onClick={(e) => {
          console.log('📦 CONTENT CLICKED - stopping propagation');
          // Temporarily commenting out stopPropagation to see if it bubbles to global
          e.stopPropagation();
        }}
      >        {/* Fixed Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
            {mediaItems.length > 1 && (
              <p className="text-xs text-gray-500 mt-1">Use ← → keys or click thumbnails to navigate</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            title="Close (Esc)"
          >
            <div className="icon-x text-2xl"></div>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="space-y-4">
                {/* Main Image/Video Display */}
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                  {isCurrentVideo ? (
                    <video
                      src={currentMedia.url}
                      controls
                      className="w-full h-full object-cover"
                      poster={currentMedia.thumbnail}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={typeof currentMedia === 'string' ? currentMedia : currentMedia?.url || 'https://via.placeholder.com/500x500?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Image/Video Counter */}
                  {mediaItems.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {mediaItems.length}
                      {isCurrentVideo && <span className="ml-1">📹</span>}
                    </div>
                  )}
                </div>

                {/* Thumbnails with images and video */}
                {mediaItems.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {mediaItems.map((media, index) => {
                      const isVideo = typeof media === 'object' && media.type === 'video';
                      const thumbnailSrc = isVideo ? media.thumbnail : (typeof media === 'string' ? media : media.url);

                      return (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          onMouseEnter={() => goToImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden relative transition-all hover:scale-105 ${index === currentImageIndex
                            ? 'border-blue-500 shadow-md'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                          title={isVideo ? 'Play video' : `View image ${index + 1}`}
                        >
                          <img
                            src={thumbnailSrc}
                            alt={isVideo ? 'Video thumbnail' : `View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Video indicator */}
                          {isVideo && (
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                              <div className="w-6 h-6 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                <span className="text-black text-xs">▶</span>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">{product.name}</h1>
                  <div className="text-2xl font-bold text-blue-600 mb-4">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {product.category}
                    </span>
                    {/* Enhanced Availability Status */}
                    {product.stock === 0 ? (
                      <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold border border-red-200 stock-status out-of-stock">
                        ❌ Out of Stock
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold border border-orange-200 stock-status low-stock">
                        ⚠️ Only {product.stock} left
                      </span>
                    ) : (
                      <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-200 stock-status">
                        ✅ In Stock ({product.stock} available)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <div className="text-gray-600 leading-relaxed break-words">
                    {displayDescription}
                  </div>
                  {isDescriptionTooLong && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2 flex items-center gap-1 transition-colors"
                    >
                      {isDescriptionExpanded ? 'Show Less ↑' : 'Show More ↓'}
                    </button>
                  )}
                </div>

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Colors</h3>
                    <div className="space-y-2">
                      {product.colors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => handleColorChange(color.name)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${selectedColor === color.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-gray-400 flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            ></div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium break-words">{color.name}</div>
                              <div className="text-sm text-gray-500">
                                {(color.images || []).length} photos
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video section removed - now integrated with thumbnails */}

                {/* Rating and Reviews */}
                {product.rating && (
                  <div className="flex items-center gap-4 py-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">{product.rating}</span>
                    </div>
                    {product.reviews && (
                      <span className="text-gray-500">({product.reviews} reviews)</span>
                    )}
                  </div>
                )}

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                          disabled={quantity <= 1}
                        >
                          −
                        </button>
                        <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                          disabled={quantity >= product.stock}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">
                        Max: {product.stock}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`w-full py-4 text-lg font-semibold transition-all ${product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'btn btn-primary hover:shadow-lg'
                      }`}
                  >
                    {product.stock === 0
                      ? 'Out of Stock'
                      : !currentUser
                        ? 'Sign In to Add to Cart'
                        : `Add ${quantity} to Cart - $${(product.price * quantity).toFixed(2)}`
                    }
                  </button>

                  {/* Buy Now Button */}
                  {product.stock > 0 && (
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-4 text-lg font-semibold text-white rounded-lg hover:shadow-lg transition-all buy-now-btn"
                    >
                      {!currentUser
                        ? '🚀 Sign In to Buy Now'
                        : `🚀 Buy Now - $${(product.price * quantity).toFixed(2)}`
                      }
                    </button>
                  )}

                  {/* Watchlist Button */}
                  <button
                    onClick={handleWatchlistToggle}
                    className={`w-full py-3 text-base font-medium rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${isInWatchlist
                      ? 'bg-red-50 border-red-500 text-red-600 hover:bg-red-100'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`icon-heart text-lg ${isInWatchlist ? 'fill-current' : ''}`}></div>
                    {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  </button>
                </div>
              </div>
            </div>

            {/* Related Items Section */}
            <RelatedItems
              currentProduct={product}
              onProductClick={async (productId) => {
                // Close current modal and open new product
                try {
                  if (!window.ProductManager) {
                    console.error('ProductManager not initialized');
                    return;
                  }

                  let newProduct;
                  if (window.ProductManager.getByIdAsync) {
                    newProduct = await window.ProductManager.getByIdAsync(productId);
                  } else {
                    newProduct = window.ProductManager.getById(productId);
                  }

                  if (newProduct) {
                    onClose();
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('openProduct', {
                        detail: { productId }
                      }));
                    }, 100);
                  }
                } catch (error) {
                  console.error('Error loading related product:', error);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
