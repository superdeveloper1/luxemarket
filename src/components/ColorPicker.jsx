import React from 'react';
import { colorNameToHex, getColorSuggestions, isValidColorName } from '../utils/colorMapper.js';

function ColorPicker({ onColorSelect, selectedColor }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [customColor, setCustomColor] = React.useState('#FF0000');
  const [rgbValues, setRgbValues] = React.useState({ r: 255, g: 0, b: 0 });
  const [inputMode, setInputMode] = React.useState('visual'); // 'visual', 'hex', 'rgb', or 'name'
  const [colorName, setColorName] = React.useState('');
  const [colorSuggestions, setColorSuggestions] = React.useState([]);
  const [hue, setHue] = React.useState(0);
  const [saturation, setSaturation] = React.useState(100);
  const [brightness, setBrightness] = React.useState(100);
  
  const canvasRef = React.useRef(null);
  const hueBarRef = React.useRef(null);

  // Helper functions for color conversion
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r, g, b) => {
    const toHex = (n) => {
      const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hsvToRgb = (h, s, v) => {
    s = s / 100;
    v = v / 100;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  const rgbToHsv = (r, g, b) => {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff !== 0) {
      if (max === r) h = 60 * (((g - b) / diff) % 6);
      else if (max === g) h = 60 * (((b - r) / diff) + 2);
      else if (max === b) h = 60 * (((r - g) / diff) + 4);
    }
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : (diff / max) * 100;
    const v = max * 100;

    return { h, s, v };
  };

  // Draw color gradient canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Draw saturation-brightness gradient
    const baseColor = hsvToRgb(hue, 100, 100);
    
    // Create horizontal gradient (saturation)
    for (let x = 0; x < width; x++) {
      const sat = (x / width) * 100;
      
      // Create vertical gradient (brightness)
      for (let y = 0; y < height; y++) {
        const bright = 100 - (y / height) * 100;
        const rgb = hsvToRgb(hue, sat, bright);
        
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue]);

  // Update color from HSV
  React.useEffect(() => {
    const rgb = hsvToRgb(hue, saturation, brightness);
    setRgbValues(rgb);
    setCustomColor(rgbToHex(rgb.r, rgb.g, rgb.b));
  }, [hue, saturation, brightness]);

  // Update hex when RGB values change
  const updateHexFromRgb = (newRgb) => {
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setCustomColor(hex);
    
    // Update HSV values
    const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setBrightness(hsv.v);
  };

  const handleRgbChange = (component, value) => {
    const numValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newRgb = { ...rgbValues, [component]: numValue };
    setRgbValues(newRgb);
    updateHexFromRgb(newRgb);
  };

  // Handle canvas click
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const sat = (x / canvas.width) * 100;
    const bright = 100 - (y / canvas.height) * 100;

    setSaturation(sat);
    setBrightness(bright);
  };

  // Handle hue bar click
  const handleHueBarClick = (e) => {
    const bar = hueBarRef.current;
    if (!bar) return;

    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newHue = (x / rect.width) * 360;

    setHue(newHue);
  };

  // Handle color name input
  const handleColorNameChange = (value) => {
    setColorName(value);
    
    // Get suggestions
    if (value.length > 0) {
      const suggestions = getColorSuggestions(value);
      setColorSuggestions(suggestions);
    } else {
      setColorSuggestions([]);
    }
    
    // Try to convert to hex if valid
    if (isValidColorName(value)) {
      const hex = colorNameToHex(value);
      setCustomColor(hex);
    }
  };

  const handleColorNameSelect = (name) => {
    setColorName(name);
    const hex = colorNameToHex(name);
    setCustomColor(hex);
    setColorSuggestions([]);
  };

  // Predefined color palette with RGB-friendly colors
  const colorPalette = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Light Gray', hex: '#D3D3D3' },
    { name: 'Dark Gray', hex: '#404040' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Dark Red', hex: '#DC2626' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Hot Pink', hex: '#FF69B4' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Dark Orange', hex: '#FF8C00' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Lime', hex: '#00FF00' },
    { name: 'Green', hex: '#008000' },
    { name: 'Forest Green', hex: '#228B22' },
    { name: 'Teal', hex: '#008080' },
    { name: 'Cyan', hex: '#00FFFF' },
    { name: 'Sky Blue', hex: '#87CEEB' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Indigo', hex: '#4B0082' },
    { name: 'Violet', hex: '#8B00FF' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Magenta', hex: '#FF00FF' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Tan', hex: '#D2B48C' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Maroon', hex: '#800000' },
    { name: 'Olive', hex: '#808000' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Coral', hex: '#FF7F50' },
    // Additional RGB-friendly colors
    { name: 'Crimson', hex: '#DC143C' },
    { name: 'Turquoise', hex: '#40E0D0' },
    { name: 'Salmon', hex: '#FA8072' },
    { name: 'Khaki', hex: '#F0E68C' },
    { name: 'Plum', hex: '#DDA0DD' },
    { name: 'Orchid', hex: '#DA70D6' },
    { name: 'Steel Blue', hex: '#4682B4' },
    { name: 'Slate Gray', hex: '#708090' }
  ];

  const handleColorSelect = (color) => {
    onColorSelect(color);
    setIsOpen(false);
  };

  const handleCustomColorSelect = () => {
    const colorName = prompt('Enter a name for this color:') || 'Custom Color';
    onColorSelect({ name: colorName, hex: customColor });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors bg-white"
      >
        <div 
          className="w-6 h-6 rounded border border-gray-300"
          style={{ backgroundColor: selectedColor?.hex || '#000000' }}
        ></div>
        <span className="text-sm">
          {selectedColor?.name || 'Select Color'}
        </span>
        <div className={`icon-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-80">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Color Palette</h3>
            <div className="grid grid-cols-10 gap-2">
              {colorPalette.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded border-2 transition-all color-picker-button ${
                    selectedColor?.hex === color.hex 
                      ? 'border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20 scale-110' 
                      : 'border-gray-300 hover:border-gray-400 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={`${color.name} (${color.hex}) - RGB(${hexToRgb(color.hex).r}, ${hexToRgb(color.hex).g}, ${hexToRgb(color.hex).b})`}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Custom Color</h3>
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  type="button"
                  onClick={() => setInputMode('visual')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    inputMode === 'visual' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  VISUAL
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('hex')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    inputMode === 'hex' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  HEX
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('rgb')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    inputMode === 'rgb' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  RGB
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('name')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    inputMode === 'name' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  NAME
                </button>
              </div>
            </div>

            {inputMode === 'visual' ? (
              <div className="space-y-4">
                {/* Color Gradient Canvas */}
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={200}
                    onClick={handleCanvasClick}
                    className="w-full h-48 rounded-lg border-2 border-gray-300 cursor-crosshair"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {/* Color Picker Indicator */}
                  <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full pointer-events-none shadow-lg"
                    style={{
                      left: `${saturation}%`,
                      top: `${100 - brightness}%`,
                      transform: 'translate(-50%, -50%)',
                      boxShadow: '0 0 0 1px black'
                    }}
                  />
                </div>

                {/* Hue Bar */}
                <div className="relative">
                  <div
                    ref={hueBarRef}
                    onClick={handleHueBarClick}
                    className="w-full h-8 rounded-lg cursor-pointer border-2 border-gray-300"
                    style={{
                      background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                    }}
                  />
                  {/* Hue Indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white border border-gray-800 pointer-events-none rounded-full"
                    style={{
                      left: `${(hue / 360) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                </div>

                {/* Color Preview and RGB Inputs */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="icon-eyedropper text-2xl text-gray-600"></div>
                    <div 
                      className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-inner"
                      style={{ backgroundColor: customColor }}
                    />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 text-center">R</label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgbValues.r}
                        onChange={(e) => handleRgbChange('r', e.target.value)}
                        className="w-full px-2 py-2 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 text-center">G</label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgbValues.g}
                        onChange={(e) => handleRgbChange('g', e.target.value)}
                        className="w-full px-2 py-2 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 text-center">B</label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgbValues.b}
                        onChange={(e) => handleRgbChange('b', e.target.value)}
                        className="w-full px-2 py-2 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-mono text-gray-600">
                    {customColor.toUpperCase()}
                  </div>
                  <button
                    type="button"
                    onClick={handleCustomColorSelect}
                    className="btn btn-primary text-sm px-4 py-2"
                  >
                    Add Color
                  </button>
                </div>
              </div>
            ) : inputMode === 'hex' ? (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleCustomColorSelect}
                  className="btn btn-primary text-xs px-3 py-1"
                >
                  Add
                </button>
              </div>
            ) : inputMode === 'rgb' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-12 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: customColor }}
                  ></div>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">R</label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgbValues.r}
                        onChange={(e) => handleRgbChange('r', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">G</label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgbValues.g}
                        onChange={(e) => handleRgbChange('g', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">B</label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgbValues.b}
                        onChange={(e) => handleRgbChange('b', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 flex-1">
                    RGB({rgbValues.r}, {rgbValues.g}, {rgbValues.b}) = {customColor}
                  </div>
                  <button
                    type="button"
                    onClick={handleCustomColorSelect}
                    className="btn btn-primary text-xs px-3 py-1"
                  >
                    Add Color
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-12 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: customColor }}
                  ></div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={colorName}
                      onChange={(e) => handleColorNameChange(e.target.value)}
                      placeholder="Type color name (e.g., red, blue, emerald)"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                    {colorSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto z-10">
                        {colorSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleColorNameSelect(suggestion)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                          >
                            <div 
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: colorNameToHex(suggestion) }}
                            ></div>
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 flex-1">
                    {colorName ? `"${colorName}" = ${customColor}` : 'Enter a color name'}
                  </div>
                  <button
                    type="button"
                    onClick={handleCustomColorSelect}
                    disabled={!colorName}
                    className="btn btn-primary text-xs px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Color
                  </button>
                </div>
              </div>
            )}
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

export default ColorPicker;