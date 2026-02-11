import React from 'react';
import { parseColorCombination, generateColorCSS, getAvailableDisplayModes, COMMON_COMBINATIONS, DISPLAY_MODES } from '../utils/colorCombinations.js';
import { colorNameToHex, getColorSuggestions, isValidColorName } from '../utils/colorMapper.js';

function ColorCombinationPicker({ onColorSelect, selectedColor, onDisplayModeChange, currentDisplayMode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [colorInput, setColorInput] = React.useState('');
  const [colorSuggestions, setColorSuggestions] = React.useState([]);
  const [previewCombination, setPreviewCombination] = React.useState(null);
  const [selectedDisplayMode, setSelectedDisplayMode] = React.useState(currentDisplayMode || DISPLAY_MODES.SPLIT_VERTICAL);
  const [customColors, setCustomColors] = React.useState([]);
  const [newColorInput, setNewColorInput] = React.useState('');

  // Update display mode when parent changes it
  React.useEffect(() => {
    if (currentDisplayMode && currentDisplayMode !== selectedDisplayMode) {
      setSelectedDisplayMode(currentDisplayMode);
    }
  }, [currentDisplayMode]);

  // Update preview when color input changes
  React.useEffect(() => {
    if (colorInput.trim()) {
      const combination = parseColorCombination(colorInput);
      setPreviewCombination(combination);
    } else {
      setPreviewCombination(null);
    }
  }, [colorInput]);

  const handleColorInputChange = (value) => {
    setColorInput(value);
    
    // Get suggestions for color names
    if (value.length > 0) {
      const suggestions = getColorSuggestions(value);
      setColorSuggestions(suggestions);
    } else {
      setColorSuggestions([]);
    }
  };

  const handleColorSelect = (colorName) => {
    setColorInput(colorName);
    setColorSuggestions([]);
  };

  const handleAddCustomColor = () => {
    if (newColorInput.trim() && isValidColorName(newColorInput.trim())) {
      setCustomColors(prev => [...prev, newColorInput.trim()]);
      setNewColorInput('');
    }
  };

  const handleCreateCombination = () => {
    if (colorInput.trim()) {
      const combination = parseColorCombination(colorInput);
      if (combination.isValid) {
        onColorSelect({
          name: colorInput,
          hex: combination.colors.map(c => c.hex),
          combination: combination,
          displayMode: selectedDisplayMode
        });
        setIsOpen(false);
      }
    }
  };

  const handleCommonCombinationSelect = (combination) => {
    const colorName = combination.colors.join('/');
    setColorInput(colorName);
    const parsed = parseColorCombination(colorName);
    setPreviewCombination(parsed);
  };

  const handleDisplayModeChange = (mode) => {
    setSelectedDisplayMode(mode);
    if (onDisplayModeChange) {
      onDisplayModeChange(mode);
    }
  };

  const renderColorPreview = () => {
    if (!previewCombination || !previewCombination.isValid) {
      return (
        <div className="w-16 h-16 border-2 border-gray-300 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
          No Preview
        </div>
      );
    }

    const css = generateColorCSS(previewCombination, {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      borderWidth: '2px',
      borderColor: '#e5e7eb'
    });

    return (
      <div
        style={css.style}
        className={css.className}
        dangerouslySetInnerHTML={css.innerHTML ? { __html: css.innerHTML } : undefined}
      />
    );
  };

  const availableModes = previewCombination && previewCombination.isValid 
    ? getAvailableDisplayModes(previewCombination.colors.length)
    : [DISPLAY_MODES.SINGLE];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors bg-white"
      >
        <div className="w-6 h-6 rounded-full border border-gray-300 overflow-hidden">
          {selectedColor ? (
            <div
              style={generateColorCSS(selectedColor.combination, {
                width: '24px',
                height: '24px',
                borderRadius: '50%'
              }).style}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
          )}
        </div>
        <span className="text-sm">
          {selectedColor?.name || 'Color Combination'}
        </span>
        <div className={`icon-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-96 max-h-[500px] overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Create Color Combination</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={colorInput}
                onChange={(e) => handleColorInputChange(e.target.value)}
                placeholder="e.g., black/orange, red/blue/green, navy/white"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleCreateCombination}
                disabled={!previewCombination || !previewCombination.isValid}
                className="btn btn-primary text-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Color Suggestions */}
            {colorSuggestions.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-600 mb-1">Color suggestions:</div>
                <div className="flex flex-wrap gap-1">
                  {colorSuggestions.slice(0, 8).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleColorSelect(suggestion)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="flex items-center gap-3 mb-3">
              <div className="text-sm font-medium text-gray-700">Preview:</div>
              {renderColorPreview()}
              <div className="text-xs text-gray-500">
                {previewCombination && previewCombination.isValid 
                  ? `${previewCombination.colors.length} color${previewCombination.colors.length > 1 ? 's' : ''}`
                  : 'Enter a color combination'
                }
              </div>
            </div>
          </div>

          {/* Display Mode Selection */}
          {previewCombination && previewCombination.isValid && (
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Display Mode</h3>
              <div className="grid grid-cols-2 gap-2">
                {availableModes.map((mode) => {
                  const combination = parseColorCombination(colorInput);
                  const css = generateColorCSS(combination, {
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%'
                  });
                  
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleDisplayModeChange(mode)}
                      className={`p-2 border rounded-full text-xs ${
                        selectedDisplayMode === mode 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div
                        style={css.style}
                        className={css.className}
                        dangerouslySetInnerHTML={css.innerHTML ? { __html: css.innerHTML } : undefined}
                      />
                      <div className="mt-1 text-xs text-gray-600">
                        {mode.replace('-', ' ')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Common Combinations */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Popular Combinations</h3>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_COMBINATIONS.map((combo, index) => {
                const colorName = combo.colors.join('/');
                const combination = parseColorCombination(colorName);
                const css = generateColorCSS(combination, {
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%'
                });

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleCommonCombinationSelect(combo)}
                    className="p-2 border border-gray-300 rounded-full hover:border-gray-400 text-xs"
                  >
                    <div
                      style={css.style}
                      className={css.className}
                      dangerouslySetInnerHTML={css.innerHTML ? { __html: css.innerHTML } : undefined}
                    />
                    <div className="mt-1 text-xs text-gray-600">{combo.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Custom Colors</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newColorInput}
                onChange={(e) => setNewColorInput(e.target.value)}
                placeholder="Add custom color name"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddCustomColor}
                disabled={!newColorInput.trim() || !isValidColorName(newColorInput.trim())}
                className="btn btn-secondary text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {customColors.map((color, index) => {
                const hex = colorNameToHex(color);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setColorInput(color)}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300 text-xs"
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: hex }}
                    />
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary text-sm px-4 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorCombinationPicker;