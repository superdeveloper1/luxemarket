import React from 'react';

function ProductPreview({ product, isVisible }) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState(null);

  // Stable effect to avoid flickering
  React.useEffect(() => {
    if (product?.colors?.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0].name);
    }
  }, [product?.colors?.length, selectedColor]);

  // Reset image index when color changes
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  if (!isVisible || !product) {
    return null;
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

  const currentImage = currentImages[currentImageIndex] || 'https://via.placeholder.com/400x400?text=No+Image';

  const handleColorChange = (colorName) => {
    setSelectedColor(colorName);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (currentImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
    }
  };

  const prevImage = () => {
    if (currentImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const descriptionThreshold = 150;
  const isDescriptionTooLong = product.description && product.description.length > descriptionThreshold;
  const displayDescription = isDescriptionTooLong && !isDescriptionExpanded
    ? product.description.substring(0, descriptionThreshold) + '...'
    : product.description;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8 border-l-4 border-blue-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-lg">👁️</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Product Preview</h3>
          <p className="text-sm text-gray-600">Live preview of how this product will appear</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media Section */}
        <div className="space-y-4">
          {/* Main Image Display */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative border-2 border-blue-200">
            <img
              src={currentImage}
              alt={`${product.name} - ${selectedColor || 'default'}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
              }}
            />

            {/* Navigation arrows - always visible */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
                >
                  →
                </button>

                {/* Image counter */}
                <div className="absolute top-3 right-3 bg-black bg-opacity-80 text-white text-lg px-4 py-2 rounded">
                  {currentImageIndex + 1} / {currentImages.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {currentImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {currentImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${index === currentImageIndex
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <img
                    src={image}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Manual Test Buttons */}
          {currentImages.length > 1 && (
            <div className="flex gap-2 justify-center">
              <button onClick={prevImage} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                ← PREV
              </button>
              <button onClick={nextImage} className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                NEXT →
              </button>
              <button onClick={() => goToImage(0)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                FIRST
              </button>
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name || 'Product Name'}</h1>
            <div className="text-2xl font-bold text-blue-600 mb-3">
              ${product.price ? product.price.toFixed(2) : '0.00'}
            </div>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {product.category || 'No Category'}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <div className="text-gray-600 leading-relaxed break-words">
              {displayDescription}
            </div>
            {isDescriptionTooLong && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-1 flex items-center gap-1 transition-colors"
              >
                {isDescriptionExpanded ? 'Show Less ↑' : 'Show More ↓'}
              </button>
            )}
          </div>

          {/* Simple Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Colors ({product.colors.length})
              </h3>
              <div className="space-y-2">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorChange(color.name)}
                    className={`w-full p-3 rounded-md border-2 text-left ${selectedColor === color.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-400"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <div>
                        <div className="font-medium">{color.name}</div>
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

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-lg font-semibold text-blue-600">{currentImages.length}</div>
              <div className="text-sm text-gray-600">Images</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-lg font-semibold text-purple-600">{product.colors?.length || 0}</div>
              <div className="text-sm text-gray-600">Colors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductPreview);