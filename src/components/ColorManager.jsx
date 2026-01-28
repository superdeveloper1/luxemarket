import React from 'react';
import ColorPicker from './ColorPicker.jsx';

function ColorManager({ colors, onChange }) {
  const [colorList, setColorList] = React.useState(colors || []);
  const [editingIndex, setEditingIndex] = React.useState(-1);
  const [editingHexIndex, setEditingHexIndex] = React.useState(-1);
  const [newColorName, setNewColorName] = React.useState('');
  const [imageInput, setImageInput] = React.useState('');

  // Update parent when colors change - use useCallback to prevent infinite loops
  React.useEffect(() => {
    onChange(colorList);
  }, [colorList]); // Remove onChange from dependencies to prevent infinite loops

  // Update local state when props change
  React.useEffect(() => {
    setColorList(colors || []);
  }, [colors]);

  const addColor = (colorData) => {
    const newColor = {
      name: colorData.name,
      hex: colorData.hex,
      images: []
    };
    setColorList(prev => [...prev, newColor]);
  };

  const updateColor = (index, field, value) => {
    setColorList(prev => prev.map((color, i) => 
      i === index ? { ...color, [field]: value } : color
    ));
  };

  const removeColor = (index) => {
    setColorList(prev => prev.filter((_, i) => i !== index));
  };

  const addImageToColor = (colorIndex) => {
    if (imageInput.trim()) {
      setColorList(prev => prev.map((color, i) => 
        i === colorIndex 
          ? { ...color, images: [...(color.images || []), imageInput.trim()] }
          : color
      ));
      setImageInput('');
    }
  };

  const removeImageFromColor = (colorIndex, imageIndex) => {
    setColorList(prev => prev.map((color, i) => 
      i === colorIndex 
        ? { ...color, images: color.images.filter((_, imgI) => imgI !== imageIndex) }
        : color
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Product Colors</h3>
        <ColorPicker 
          onColorSelect={addColor}
          selectedColor={null}
        />
      </div>

      {colorList.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="icon-palette text-3xl text-gray-400 mx-auto mb-2"></div>
          <p className="text-gray-500">No colors added yet</p>
          <p className="text-sm text-gray-400">Use the color picker above to add colors</p>
        </div>
      ) : (
        <div className="space-y-3">
          {colorList.map((color, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  {/* Color Swatch - Editable */}
                  {editingHexIndex === index ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateColor(index, 'hex', e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color.hex}
                        onChange={(e) => updateColor(index, 'hex', e.target.value)}
                        onBlur={() => setEditingHexIndex(-1)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingHexIndex(-1)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm w-24 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                        placeholder="#000000"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setEditingHexIndex(-1)}
                        className="text-xs text-green-600 hover:text-green-800"
                      >
                        ✓ Done
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => setEditingHexIndex(index)}
                        title="Click to edit color"
                      ></div>
                      <button
                        type="button"
                        onClick={() => setEditingHexIndex(index)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit color
                      </button>
                    </div>
                  )}
                  
                  {/* Color Name - Editable */}
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => updateColor(index, 'name', e.target.value)}
                      onBlur={() => setEditingIndex(-1)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingIndex(-1)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{color.name}</span>
                      <span className="text-sm text-gray-500">{color.hex}</span>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(index)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit name
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <div className="icon-trash text-sm"></div>
                  Remove
                </button>
              </div>

              {/* Color-specific images */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Images for {color.name} ({(color.images || []).length})
                  </label>
                </div>
                
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://example.com/color-image.jpg"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => addImageToColor(index)}
                    className="btn btn-secondary text-sm px-3 py-2"
                  >
                    Add Image
                  </button>
                </div>

                {/* Color Images Grid */}
                {(color.images || []).length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-2xl mb-2">📷</div>
                    <p className="text-gray-500 text-sm">No images for {color.name} yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-2">
                    {(color.images || []).map((imageUrl, imgIndex) => (
                      <div
                        key={`${imageUrl}-${imgIndex}`}
                        className="relative group"
                      >
                        <img
                          src={imageUrl}
                          alt={`${color.name} - Image ${imgIndex + 1}`}
                          className="w-full h-20 object-cover rounded border hover:border-[var(--primary-color)] transition-colors"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80?text=Error';
                          }}
                        />
                        
                        {/* Delete button - larger and always visible on hover */}
                        <button
                          type="button"
                          onClick={() => removeImageFromColor(index, imgIndex)}
                          className="absolute top-1 right-1 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 transform"
                          title="Delete image"
                        >
                          🗑️
                        </button>
                        
                        {/* Position indicator */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b">
                          #{imgIndex + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
        <strong>Tip:</strong> Each color can have its own set of images. When customers select a color, 
        they'll see the images specific to that color variant. Hover over images to see the delete button.
      </div>
    </div>
  );
}

export default ColorManager;