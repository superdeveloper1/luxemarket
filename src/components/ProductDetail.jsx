import React from 'react';
import RelatedItems from './RelatedItems.jsx';
import CartManager from '../managers/CartManager.js';
import { showToast } from '../utils/simpleToast.js';
import ThreeDViewer from './ThreeDViewer.jsx';
import { parseColorCombination, generateColorCSS, DISPLAY_MODES } from '../utils/colorCombinations.js';

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

      if (window.WatchlistManager) {
        setIsInWatchlist(window.WatchlistManager.has(product.id));
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] modal-overlay modal-backdrop"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      >
        <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
          <p>Product not found</p>
          <button onClick={onClose} className="btn btn-primary mt-4">Close</button>
        </div>
      </div>
    );
  }

  // Build image list
  let currentImages = [];
  if (selectedColor && product.colors) {
    const colorObj = product.colors.find(c => c.name === selectedColor);
    if (colorObj && colorObj.images) currentImages = colorObj.images;
  }
  if (currentImages.length === 0 && product.images) {
    currentImages = product.images.map(img => typeof img === 'string' ? img : img.url);
  }
  if (currentImages.length === 0 && product.image) {
    currentImages = [product.image];
  }

  // Build media array
  const mediaItems = [...currentImages];

  if (product.videoUrl) {
    mediaItems.push({
      type: 'video',
      url: product.videoUrl,
      thumbnail: currentImages[0] || 'https://via.placeholder.com/500x500?text=Video'
    });
  }

  // Only add 3D model if we have a valid, working modelUrl
  // Skip broken Supabase URLs and undefined values
  if (
    product.modelUrl &&
    product.modelUrl.trim() !== '' &&
    !product.modelUrl.includes('supabase.co') && // Skip broken Supabase URLs
    product.modelUrl.startsWith('http') // Must be a valid HTTP URL
  ) {
    mediaItems.push({
      type: 'model',
      url: product.modelUrl,
      thumbnail: product.modelImage || currentImages[0] || 'https://via.placeholder.com/500x500?text=3D'
    });
  }

  const currentMedia = mediaItems[currentImageIndex];
  const isCurrentVideo = currentMedia && typeof currentMedia === 'object' && currentMedia.type === 'video';
  const isCurrentModel = currentMedia && typeof currentMedia === 'object' && currentMedia.type === 'model';

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

  // Keyboard navigation + scroll lock
  React.useEffect(() => {
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
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mediaItems.length, onClose]);

  const handleAddToCart = () => {
    if (!currentUser) {
      showToast('Please sign in to add items to your cart', 'info');
      onOpenAuth(false);
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
      const added = window.WatchlistManager.toggle(product);
      setIsInWatchlist(added);
      showToast(
        added ? `Added ${product.name} to watchlist` : `Removed ${product.name} from watchlist`,
        'success'
      );
    }
  };

  const handleBuyNow = () => {
    if (!currentUser) {
      showToast('Please sign in to purchase this item', 'info');
      onOpenAuth(true);
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
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        onClose();

        setTimeout(() => {
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
  const displayDescription =
    isDescriptionTooLong && !isDescriptionExpanded
      ? product.description.substring(0, descriptionThreshold) + '...'
      : product.description;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
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

        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* LEFT SIDE — MEDIA */}
              <div className="space-y-4">

                {/* Main Media */}
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-50 relative">
                  {isCurrentVideo ? (
                    <video
                      src={currentMedia.url}
                      controls
                      className="w-full h-full object-cover"
                      poster={currentMedia.thumbnail}
                    />
                  ) : isCurrentModel ? (
                    <ThreeDViewer modelUrl={currentMedia.url} className="bg-slate-50" />
                  ) : (
                    <img
                      src={
                        typeof currentMedia === "string"
                          ? currentMedia
                          : currentMedia?.url ||
                          "https://via.placeholder.com/500x500?text=No+Image"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {mediaItems.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {mediaItems.length}
                      {isCurrentVideo && <span className="ml-1">📹</span>}
                      {isCurrentModel && <span className="ml-1">🧊</span>}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {mediaItems.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {mediaItems.map((media, index) => {
                      const isVideo = typeof media === 'object' && media.type === 'video';
                      const isModel = typeof media === 'object' && media.type === 'model';
                      const thumbnailSrc =
                        isVideo || isModel
                          ? media.thumbnail
                          : typeof media === 'string'
                            ? media
                            : media.url;

                      return (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          onMouseEnter={() => goToImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden relative transition-all hover:scale-105 ${index === currentImageIndex
                            ? 'border-blue-500 shadow-md'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                          title={isVideo ? 'Play video' : isModel ? 'View 3D Model' : `View image ${index + 1}`}
                        >
                          <img
                            src={thumbnailSrc}
                            alt={isVideo ? 'Video thumbnail' : isModel ? '3D Model thumbnail' : `View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {(isVideo || isModel) && (
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                              <div className="w-6 h-6 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                <span className="text-black text-xs">{isVideo ? '▶' : '🧊'}</span>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT SIDE — PRODUCT INFO */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">{product.name}</h1>
                  <div className="text-2xl font-bold text-blue-600 mb-4">
                    ${product.price ? product.price.toFixed(2) : '0.00'}
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {product.category}
                    </span>

                    {product.stock === 0 ? (
                      <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold border border-red-200">
                        ❌ Out of Stock
                      </span>
                    ) : (
                      <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-200">
                        ✔ In Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Color ({product.colors.length})
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {product.colors.map((color, index) => {
                        // Parse the color combination using the new system
                        const combination = parseColorCombination(color.name);
                        
                        if (color.displayMode) {
                          combination.mode = color.displayMode;
                        }
                        
                        // Use stored hex values if available (overrides name parsing)
                        if (color.hex) {
                          if (Array.isArray(color.hex) && combination.colors.length === color.hex.length) {
                              combination.colors.forEach((c, i) => { c.hex = color.hex[i]; });
                          } else if (typeof color.hex === 'string' && combination.colors.length === 1) {
                              combination.colors[0].hex = color.hex;
                          }
                        }
                        
                        if (!combination.isValid) {
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedColor(color.name)}
                              className={`relative group ${
                                selectedColor === color.name 
                                  ? 'ring-2 ring-blue-500 scale-105' 
                                  : 'hover:scale-105'
                              }`}
                              title={color.name}
                            >
                              <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">?</span>
                              </div>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {color.name}
                              </span>
                            </button>
                          );
                        }

                        // Generate CSS for the color combination
                        const css = generateColorCSS(combination, {
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          borderWidth: '2px',
                          borderColor: selectedColor === color.name ? '#3b82f6' : '#e5e7eb'
                        });

                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(color.name)}
                            className={`relative group transition-all rounded-full ${
                              selectedColor === color.name 
                                ? 'ring-2 ring-blue-500 scale-105 shadow-lg' 
                                : 'hover:scale-105 hover:shadow-md'
                            }`}
                            title={`${color.name} (${combination.colors.length} color${combination.colors.length > 1 ? 's' : ''})`}
                          >
                            <div
                              style={css.style}
                              className={css.className}
                              dangerouslySetInnerHTML={css.innerHTML ? { __html: css.innerHTML } : undefined}
                            />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              {color.name}
                              <div className="text-xs text-gray-300 mt-1">
                                {combination.colors.length} color{combination.colors.length > 1 ? 's' : ''}
                              </div>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-20 border border-gray-300 rounded-lg p-2"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                  >
                    Buy Now
                  </button>
                </div>

                {/* Watchlist */}
                <button
                  onClick={handleWatchlistToggle}
                  className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  {isInWatchlist ? '★ Remove from Watchlist' : '☆ Add to Watchlist'}
                </button>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-bold mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{displayDescription}</p>
                  {isDescriptionTooLong && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-blue-600 font-medium mt-2"
                    >
                      {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Related Items - Full Width */}
            <RelatedItems
              currentProduct={product}
              onProductClick={(relatedProductId) => {
                try {
                  window.dispatchEvent(new CustomEvent('openProduct', { detail: { productId: relatedProductId } }));
                } catch (error) {
                  console.error('Error loading related product:', error);
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(ProductDetail);