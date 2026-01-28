import React from 'react';

function EnhancedImageManager({ images, onUpdate, title = "Product Images" }) {
  const [newImageUrl, setNewImageUrl] = React.useState("");
  const [newImageAngle, setNewImageAngle] = React.useState("front");

  // Predefined angle options
  const angleOptions = [
    { value: "front", label: "Front View", icon: "👁️" },
    { value: "back", label: "Back View", icon: "🔄" },
    { value: "left", label: "Left Side", icon: "⬅️" },
    { value: "right", label: "Right Side", icon: "➡️" },
    { value: "top", label: "Top View", icon: "⬆️" },
    { value: "bottom", label: "Bottom View", icon: "⬇️" },
    { value: "detail", label: "Detail Shot", icon: "🔍" },
    { value: "lifestyle", label: "Lifestyle", icon: "🏠" },
    { value: "packaging", label: "Packaging", icon: "📦" },
    { value: "other", label: "Other", icon: "📷" }
  ];

  // Convert simple string array to enhanced image objects if needed - stable IDs
  const enhancedImages = React.useMemo(() => {
    if (!images || images.length === 0) return [];
    
    return images.map((img, index) => {
      if (typeof img === 'string') {
        // Convert old format to new format with stable ID
        return {
          id: `img-${index}-${img.slice(-10)}`, // Use part of URL for stable ID
          url: img,
          angle: index === 0 ? 'front' : 'other',
          description: ''
        };
      }
      return img;
    });
  }, [images]);

  const addImage = () => {
    if (!newImageUrl.trim()) return;

    const newImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: newImageUrl.trim(),
      angle: newImageAngle,
      description: ''
    };

    const updatedImages = [...enhancedImages, newImage];
    onUpdate(updatedImages);
    setNewImageUrl("");
    setNewImageAngle("front");
  };

  const removeImage = (imageId) => {
    const updatedImages = enhancedImages.filter(img => img.id !== imageId);
    onUpdate(updatedImages);
  };

  const updateImageAngle = (imageId, newAngle) => {
    const updatedImages = enhancedImages.map(img => 
      img.id === imageId ? { ...img, angle: newAngle } : img
    );
    onUpdate(updatedImages);
  };

  const updateImageDescription = (imageId, description) => {
    const updatedImages = enhancedImages.map(img => 
      img.id === imageId ? { ...img, description } : img
    );
    onUpdate(updatedImages);
  };



  const getAngleInfo = (angle) => {
    return angleOptions.find(opt => opt.value === angle) || angleOptions.find(opt => opt.value === 'other');
  };

  // Group images by angle for better organization
  const imagesByAngle = React.useMemo(() => {
    const grouped = {};
    enhancedImages.forEach(img => {
      if (!grouped[img.angle]) {
        grouped[img.angle] = [];
      }
      grouped[img.angle].push(img);
    });
    return grouped;
  }, [enhancedImages]);

  return (
    <div className="space-y-6">
      {/* Add New Image Section */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-lg">📷</span>
          Add New Image
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Angle/View</label>
            <select
              value={newImageAngle}
              onChange={(e) => setNewImageAngle(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {angleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={addImage}
            disabled={!newImageUrl.trim()}
            className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Image
          </button>
          
          {newImageUrl && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <img 
                src={newImageUrl} 
                alt="Preview" 
                className="w-8 h-8 object-cover rounded border"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span>Preview</span>
            </div>
          )}
        </div>
      </div>

      {/* Images Display */}
      {enhancedImages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-3">📷</div>
          <p className="text-gray-500 font-medium">No images added yet</p>
          <p className="text-gray-400 text-sm">Add images with different angles to showcase your product</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>🖼️</span>
              {title} ({enhancedImages.length})
            </h3>
          </div>

          {/* All Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {enhancedImages.map((image, index) => {
              const angleInfo = getAngleInfo(image.angle);
              
              return (
                <div
                  key={image.id}
                  className="relative group transition-all duration-200 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-square overflow-hidden bg-gray-100 relative">
                    <img
                      src={image.url}
                      alt={`${angleInfo.label} view`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x200?text=Error';
                      }}
                    />
                    
                    {/* Position indicator */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">
                      #{index + 1}
                    </div>
                    
                    {/* Delete button - Always visible on hover */}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg text-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 transform"
                      title="Delete image"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  {/* Image Info */}
                  <div className="p-3 space-y-2">
                    {/* Angle Selector */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">View Angle</label>
                      <select
                        value={image.angle}
                        onChange={(e) => updateImageAngle(image.id, e.target.value)}
                        className="w-full border border-gray-300 p-1 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        {angleOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.icon} {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description (Optional)</label>
                      <input
                        type="text"
                        value={image.description || ''}
                        onChange={(e) => updateImageDescription(image.id, e.target.value)}
                        placeholder="e.g., Close-up of texture"
                        className="w-full border border-gray-300 p-1 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Images by Angle Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <span>📊</span>
              Images by Angle
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {Object.entries(imagesByAngle).map(([angle, imgs]) => {
                const angleInfo = getAngleInfo(angle);
                return (
                  <div key={angle} className="bg-white p-2 rounded border text-center">
                    <div className="text-lg mb-1">{angleInfo.icon}</div>
                    <div className="font-medium text-gray-700">{angleInfo.label}</div>
                    <div className="text-gray-500">{imgs.length} image{imgs.length !== 1 ? 's' : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-800 mb-1 flex items-center gap-2">
              <span>💡</span>
              Pro Tips
            </h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• The first image will be used as the main product image</li>
              <li>• Add multiple angles to give customers a complete view</li>
              <li>• Use descriptive angles like "Front View", "Detail Shot", etc.</li>
              <li>• Hover over images to see the large delete button</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(EnhancedImageManager);