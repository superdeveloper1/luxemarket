import React from 'react';
import ColorPicker from './ColorPicker.jsx';
import { parseColorCombination, generateColorCSS, DISPLAY_MODES } from '../utils/colorCombinations.js';

function ColorManager({ colors, onChange }) {
  const [colorList, setColorList] = React.useState(colors || []);
  const [editingIndex, setEditingIndex] = React.useState(-1);
  const [editingHexIndex, setEditingHexIndex] = React.useState(-1);
  const [newColorName, setNewColorName] = React.useState('');
  const [newColorHex, setNewColorHex] = React.useState('#000000');
  const [imageInput, setImageInput] = React.useState('');
  const [editingColor, setEditingColor] = React.useState(null);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [editModalIndex, setEditModalIndex] = React.useState(-1);

  // Update parent when colors change - use useCallback to prevent infinite loops
  React.useEffect(() => {
    onChange(colorList);
  }, [colorList]); // Remove onChange from dependencies to prevent infinite loops

  // Update local state when props change
  React.useEffect(() => {
    if (JSON.stringify(colors) !== JSON.stringify(colorList)) {
      setColorList(colors || []);
    }
  }, [colors]);

  const addColor = (colorData) => {
    const newColor = {
      name: colorData.name,
      hex: colorData.hex,
      images: [],
      displayMode: colorData.displayMode
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

  const handleManualAdd = () => {
    if (!newColorName.trim()) {
      alert('Please enter a color name');
      return;
    }

    addColor({
      name: newColorName.trim(),
      hex: newColorHex,
      displayMode: 'single'
    });

    setNewColorName('');
    setNewColorHex('#000000');
  };

  // Handle editing existing color with ColorPicker
  const handleEditColor = (updatedColor) => {
    if (editingColor && editModalIndex >= 0) {
      // Update the existing color
      setColorList(prev => prev.map((color, i) =>
        i === editModalIndex ? { ...color, ...updatedColor } : color
      ));
      setShowColorPicker(false);
      setEditingColor(null);
      setEditModalIndex(-1);
    } else {
      // Add new color
      addColor(updatedColor);
    }
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

      {/* Quick Add Custom Color */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Add Custom Color</h4>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Color Name</label>
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="e.g. Midnight Sparkle"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Color Hex</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-1 bg-white"
              />
              <input
                type="text"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-24 px-2 py-2 border border-gray-300 rounded text-sm font-mono uppercase"
                maxLength={7}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualAdd}
            className="btn btn-primary px-4 py-2 text-sm h-10"
          >
            Add Color
          </button>
        </div>
      </div>

      {/* Enhanced ColorPicker Modal for Editing */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Color: {editingColor?.name || 'New Color'}
              </h3>
              <button
                onClick={() => {
                  setShowColorPicker(false);
                  setEditingColor(null);
                  setEditModalIndex(-1);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <ColorPicker
                onColorSelect={handleEditColor}
                selectedColor={editingColor}
              />
            </div>
          </div>
        </div>
      )}

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
                  {/* Color Swatch - Enhanced Editable with ColorPicker */}
                  {editingHexIndex === index ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateColor(index, 'hex', e.target.value)}
                        className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
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
                        className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => {
                          setEditingColor(color);
                          setEditModalIndex(index);
                          setShowColorPicker(true);
                        }}
                        title="Click to edit color with advanced picker"
                      ></div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingColor(color);
                          setEditModalIndex(index);
                          setShowColorPicker(true);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit color
                      </button>
                    </div>
                  )}

                  {/* Enhanced Color Preview with Combination Support */}
                  <div className="flex items-center gap-2">
                    {/* Parse and display color combination if it exists */}
                    {/* Parse and display color combination if it exists */}
                    {(() => {
                      // Check if it's explicitly a combination based on hex data (custom names)
                      if (Array.isArray(color.hex) && color.hex.length > 1) {
                        const combination = {
                          colors: color.hex.map(h => ({ name: '', hex: h })),
                          mode: color.displayMode || 'split-vertical',
                          isValid: true
                        };
                        const css = generateColorCSS(combination, {
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%'
                        });
                        return (
                          <div
                            style={css.style}
                            className={css.className}
                            dangerouslySetInnerHTML={css.innerHTML ? { __html: css.innerHTML } : undefined}
                          />
                        );
                      }

                      const combination = parseColorCombination(color.name);
                      if (color.displayMode) {
                        combination.mode = color.displayMode;
                      }
                      if (combination.isValid && combination.colors.length > 1) {
                        // Use stored hex values for combinations if available
                        if (color.hex && Array.isArray(color.hex) && color.hex.length === combination.colors.length) {
                          combination.colors.forEach((c, i) => c.hex = color.hex[i]);
                        }

                        const css = generateColorCSS(combination, {
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%'
                        });
                        return (
                          <div
                            style={css.style}
                            className={css.className}
                            dangerouslySetInnerHTML={css.innerHTML ? { __html: css.innerHTML } : undefined}
                          />
                        );
                      } else {
                        return (
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                        );
                      }
                    })()}

                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{color.name}</span>
                      <span className="text-sm text-gray-500">{color.hex}</span>
                    </div>
                  </div>

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
                    <button
                      type="button"
                      onClick={() => setEditingIndex(index)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit name
                    </button>
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