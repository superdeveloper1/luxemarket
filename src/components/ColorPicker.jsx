import React from 'react';
import { colorNameToHex, getColorSuggestions, isValidColorName } from '../utils/colorMapper.js';
import { parseColorCombination, generateColorCSS, COMMON_COMBINATIONS, EXOTIC_COMBINATIONS, DISPLAY_MODES } from '../utils/colorCombinations.js';

// Helper functions moved outside component to be stable dependencies
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
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
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

const getLuminance = (r, g, b) => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastRatio = (lum1, lum2) => {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

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
  const [colorType, setColorType] = React.useState('single'); // 'single' or 'combination'
  const [combinationMode, setCombinationMode] = React.useState('split-vertical');
  const [isEyedropperActive, setIsEyedropperActive] = React.useState(false);
  const [eyedropperSupported, setEyedropperSupported] = React.useState(false);
  const [toneAdjustment, setToneAdjustment] = React.useState(0); // -100 to +100 for darker to lighter
  const [savedPalettes, setSavedPalettes] = React.useState([]);
  const [activeComboIndex, setActiveComboIndex] = React.useState(0);
  const [showHarmony, setShowHarmony] = React.useState(false);
  const [harmonyColors, setHarmonyColors] = React.useState([]);
  const [contrastInfo, setContrastInfo] = React.useState({ white: 0, black: 0 });
  const [showPaletteGenerator, setShowPaletteGenerator] = React.useState(false);
  const [generatedPalette, setGeneratedPalette] = React.useState([]);

  // Check if EyeDropper API is supported
  React.useEffect(() => {
    setEyedropperSupported('EyeDropper' in window);
  }, []);

  // Initialize with selectedColor if provided
  React.useEffect(() => {
    if (selectedColor) {
      // Determine if it's a combination or single color
      if (Array.isArray(selectedColor.hex) || selectedColor.combination) {
        setColorType('combination');
        setColorName(selectedColor.name || '');
        setCombinationMode(selectedColor.displayMode || 'split-vertical');
        setActiveComboIndex(0);
      } else {
        setColorType('single');
        setCustomColor(selectedColor.hex || '#FF0000');
        setColorName(selectedColor.name || '');
        // Update RGB and HSV values based on hex
        const rgb = hexToRgb(selectedColor.hex || '#FF0000');
        setRgbValues(rgb);
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        setHue(hsv.h);
        setSaturation(hsv.s);
        setBrightness(hsv.v);
      }
    }
  }, [selectedColor]);

  // Load saved palettes from local storage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('luxemarket_color_presets');
      if (saved) {
        setSavedPalettes(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading color presets:', e);
    }
  }, []);

  // EyeDropper functionality
  const activateEyedropper = async () => {
    if (!eyedropperSupported) {
      alert('EyeDropper API is not supported in this browser. Please use Chrome 95+ or Edge 95+.');
      return;
    }

    try {
      setIsEyedropperActive(true);
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      
      if (result && result.sRGBHex) {
        const hex = result.sRGBHex;
        setCustomColor(hex);
        
        // Update RGB and HSV values
        const rgb = hexToRgb(hex);
        setRgbValues(rgb);
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        setHue(hsv.h);
        setSaturation(hsv.s);
        setBrightness(hsv.v);
        
        setColorName(hex);
      }
    } catch (err) {
      // User cancelled or error occurred
      console.log('EyeDropper cancelled or error:', err);
    } finally {
      setIsEyedropperActive(false);
    }
  };

  // Handle global mouse events for eyedropper mode
  React.useEffect(() => {
    if (!isEyedropperActive) return;

    const handleMouseMove = (e) => {
      // Change cursor to eyedropper icon
      document.body.style.cursor = 'crosshair';
    };

    const handleMouseUp = () => {
      // Reset cursor
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isEyedropperActive]);
  
  const canvasRef = React.useRef(null);
  const hueBarRef = React.useRef(null);

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

  // Update color from HSV with tone adjustment
  React.useEffect(() => {
    let adjustedBrightness = brightness;
    if (toneAdjustment !== 0) {
      // Adjust brightness based on tone adjustment (-100 to +100)
      adjustedBrightness = Math.max(0, Math.min(100, brightness + toneAdjustment));
    }
    const rgb = hsvToRgb(hue, saturation, adjustedBrightness);
    const newHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    if (newHex !== customColor) {
      setCustomColor(newHex);
    }
    setRgbValues(prev => {
      if (prev.r === rgb.r && prev.g === rgb.g && prev.b === rgb.b) return prev;
      return rgb;
    });
  }, [hue, saturation, brightness, toneAdjustment]);

  // Sync picker with active combination color
  React.useEffect(() => {
    if (colorType === 'combination') {
      const combination = parseColorCombination(colorName);
      if (combination.isValid && combination.colors.length > 0) {
        let index = activeComboIndex;
        if (index >= combination.colors.length) {
           index = combination.colors.length - 1;
           setActiveComboIndex(index);
        }
        
        const color = combination.colors[index];
        if (color && color.hex.toLowerCase() !== customColor.toLowerCase()) {
           setCustomColor(color.hex);
           const rgb = hexToRgb(color.hex);
           setRgbValues(rgb);
           const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
           setHue(hsv.h);
           setSaturation(hsv.s);
           setBrightness(hsv.v);
        }
      }
    }
  }, [colorName, activeComboIndex, colorType]);

  // Update combination when picker changes
  React.useEffect(() => {
     if (colorType === 'combination') {
        const combination = parseColorCombination(colorName);
        if (combination.isValid && combination.colors.length > 0) {
           const index = activeComboIndex >= combination.colors.length ? combination.colors.length - 1 : activeComboIndex;
           const currentColor = combination.colors[index];
           
           if (currentColor && currentColor.hex.toLowerCase() !== customColor.toLowerCase()) {
              const newColors = [...combination.colors];
              newColors[index] = { ...newColors[index], hex: customColor, name: customColor };
              const newColorString = newColors.map(c => c.name).join('/');
              setColorName(newColorString);
           }
        }
     }
  }, [customColor]);

  // Generate harmony colors
  React.useEffect(() => {
    if (showHarmony) {
      const rgb = hexToRgb(customColor);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      
      const harmonies = [
        { name: 'Complementary', hue: (hsv.h + 180) % 360 },
        { name: 'Split Comp 1', hue: (hsv.h + 150) % 360 },
        { name: 'Split Comp 2', hue: (hsv.h + 210) % 360 },
        { name: 'Triadic 1', hue: (hsv.h + 120) % 360 },
        { name: 'Triadic 2', hue: (hsv.h + 240) % 360 },
        { name: 'Analogous 1', hue: (hsv.h + 30) % 360 },
        { name: 'Analogous 2', hue: (hsv.h + 330) % 360 },
      ];

      const newHarmonyColors = harmonies.map(h => {
        const newRgb = hsvToRgb(h.hue, hsv.s, hsv.v);
        return {
          name: h.name,
          hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b)
        };
      });
      
      setHarmonyColors(newHarmonyColors);
    }
  }, [customColor, showHarmony]);

  // Calculate contrast
  React.useEffect(() => {
    const rgb = hexToRgb(customColor);
    const lum = getLuminance(rgb.r, rgb.g, rgb.b);
    const whiteContrast = getContrastRatio(lum, 1); // White luminance is 1
    const blackContrast = getContrastRatio(lum, 0); // Black luminance is 0
    setContrastInfo({ white: whiteContrast, black: blackContrast });
  }, [customColor]);

  // Generate palette
  React.useEffect(() => {
    if (showPaletteGenerator) {
      const rgb = hexToRgb(customColor);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      
      const palette = [];
      
      // Base
      palette.push({ name: 'Base', hex: customColor });
      
      // Monochromatic (Tints & Shades)
      // Tint (Lighter/Less Saturated)
      let tintRgb = hsvToRgb(hsv.h, Math.max(0, hsv.s - 30), Math.min(100, hsv.v + 20));
      palette.push({ name: 'Tint', hex: rgbToHex(tintRgb.r, tintRgb.g, tintRgb.b) });
      
      // Shade (Darker)
      let shadeRgb = hsvToRgb(hsv.h, hsv.s, Math.max(0, hsv.v - 30));
      palette.push({ name: 'Shade', hex: rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b) });

      // Analogous (Neighbor)
      let anaRgb = hsvToRgb((hsv.h + 30) % 360, hsv.s, hsv.v);
      palette.push({ name: 'Analogous', hex: rgbToHex(anaRgb.r, anaRgb.g, anaRgb.b) });

      // Complementary (Opposite)
      let compRgb = hsvToRgb((hsv.h + 180) % 360, hsv.s, hsv.v);
      palette.push({ name: 'Comp.', hex: rgbToHex(compRgb.r, compRgb.g, compRgb.b) });
      
      setGeneratedPalette(palette);
    }
  }, [customColor, showPaletteGenerator]);

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
  };

  const handleColorNameSelect = (name) => {
    setColorName(name);
    const hex = colorNameToHex(name);
    setCustomColor(hex);
    setColorSuggestions([]);
  };

  // Predefined color palette
  const colorPalette = [
    { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' },
    { name: 'Gray', hex: '#808080' }, { name: 'Red', hex: '#FF0000' },
    { name: 'Pink', hex: '#FFC0CB' }, { name: 'Orange', hex: '#FFA500' },
    { name: 'Yellow', hex: '#FFFF00' }, { name: 'Green', hex: '#008000' },
    { name: 'Blue', hex: '#0000FF' }, { name: 'Purple', hex: '#800080' },
    { name: 'Brown', hex: '#A52A2A' }, { name: 'Gold', hex: '#FFD700' }
  ];

  const handleColorSelect = (color) => {
    onColorSelect(color);
    setIsOpen(false);
  };

  const handleCustomColorSelect = () => {
    let nameToUse = colorName;
    if (!nameToUse || nameToUse.trim() === '') {
       nameToUse = prompt('Enter a name for this color:') || 'Custom Color';
    }
    onColorSelect({ name: nameToUse, hex: customColor });
    setIsOpen(false);
  };

  const handleRotate = () => {
    if (combinationMode === 'split-vertical') {
      setCombinationMode('split-horizontal');
    } else if (combinationMode === 'split-horizontal') {
      setCombinationMode('split-vertical');
    }
  };

  const handleRandomCombination = () => {
    const count = Math.floor(Math.random() * 2) + 2; // 2 or 3 colors
    const selectedColors = [];
    for (let i = 0; i < count; i++) {
      const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      selectedColors.push(randomColor.name);
    }
    const newColorName = selectedColors.join('/');
    
    const modes = DISPLAY_MODES ? Object.values(DISPLAY_MODES).filter(m => m !== 'single') : ['split-vertical', 'split-horizontal', 'gradient-linear', 'checkerboard'];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    
    setColorName(newColorName);
    setCombinationMode(randomMode);
  };

  const handleSwapColors = () => {
    const combination = parseColorCombination(colorName);
    if (combination.isValid && combination.colors.length > 1) {
      const newColors = [...combination.colors].reverse();
      const newColorString = newColors.map(c => c.name).join('/');
      setColorName(newColorString);
    }
  };

  const savePreset = () => {
    if (!colorName || colorName.trim() === '') {
      alert('Please enter a color name to save this preset');
      return;
    }

    let newPreset;
    if (colorType === 'single') {
      newPreset = {
        name: colorName,
        hex: customColor,
        type: 'single'
      };
    } else {
      const combination = parseColorCombination(colorName);
      if (!combination.isValid) {
        alert('Invalid color combination');
        return;
      }
      newPreset = {
        name: colorName,
        hex: combination.colors.map(c => c.hex),
        displayMode: combinationMode,
        type: 'combination'
      };
    }

    const existingIndex = savedPalettes.findIndex(p => p.name.toLowerCase() === newPreset.name.toLowerCase());
    let updated;
    
    if (existingIndex >= 0) {
      if (!confirm(`A preset named "${newPreset.name}" already exists. Overwrite it?`)) return;
      updated = [...savedPalettes];
      updated[existingIndex] = newPreset;
    } else {
      updated = [...savedPalettes, newPreset];
    }
    
    setSavedPalettes(updated);
    localStorage.setItem('luxemarket_color_presets', JSON.stringify(updated));
  };

  const deletePreset = (e, index) => {
    e.stopPropagation();
    if (confirm('Delete this saved color?')) {
      const updated = savedPalettes.filter((_, i) => i !== index);
      setSavedPalettes(updated);
      localStorage.setItem('luxemarket_color_presets', JSON.stringify(updated));
    }
  };

  const handlePresetSelect = (preset) => {
    if (preset.type === 'single') {
      onColorSelect({ name: preset.name, hex: preset.hex });
    } else {
      const combination = parseColorCombination(preset.name);
      // Use stored hex values to ensure custom colors are preserved
      if (Array.isArray(preset.hex) && combination.colors.length === preset.hex.length) {
          combination.colors.forEach((c, i) => { c.hex = preset.hex[i]; });
      }
      onColorSelect({
        name: preset.name,
        hex: preset.hex,
        combination: combination,
        displayMode: preset.displayMode
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors bg-white"
      >
        <div className="w-6 h-6 rounded border border-gray-300 overflow-hidden">
          {selectedColor ? (
             (Array.isArray(selectedColor.hex) || selectedColor.combination) ? (
                <div
                  style={generateColorCSS(selectedColor.combination || parseColorCombination(selectedColor.name), {
                    width: '100%', height: '100%', mode: selectedColor.displayMode
                  }).style}
                  dangerouslySetInnerHTML={{ __html: generateColorCSS(selectedColor.combination || parseColorCombination(selectedColor.name), { mode: selectedColor.displayMode }).innerHTML }}
                />
             ) : (
                <div style={{ backgroundColor: selectedColor.hex, width: '100%', height: '100%' }} />
             )
          ) : (
             <div className="bg-black w-full h-full" />
          )}
        </div>
        <span className="text-sm">
          {selectedColor?.name || 'Select Color'}
        </span>
        <div className={`icon-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-25" onClick={() => setIsOpen(false)}>
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-96 max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
          {/* Color Type Selection */}
          <div className="mb-4 border-b border-gray-200 pb-3">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setColorType('single')}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  colorType === 'single'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                Single Color
              </button>
              <button
                type="button"
                onClick={() => setColorType('combination')}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  colorType === 'combination'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                Color Combination
              </button>
            </div>
          </div>

          {/* Saved Presets Section */}
          {savedPalettes.filter(p => p.type === colorType).length > 0 && (
            <div className="mb-4 border-b border-gray-200 pb-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">My Saved Colors</h3>
              <div className="grid grid-cols-5 gap-2">
                {savedPalettes.filter(p => p.type === colorType).map((preset, index) => {
                  // Find original index for deletion
                  const originalIndex = savedPalettes.indexOf(preset);
                  return (
                    <div key={index} className="relative group">
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-400 hover:scale-110 transition-all overflow-hidden p-0"
                        title={preset.name}
                      >
                        {preset.type === 'single' ? (
                          <div className="w-full h-full" style={{ backgroundColor: preset.hex }} />
                        ) : (
                          <div
                            style={generateColorCSS({ colors: preset.hex.map(h => ({ hex: h })), mode: preset.displayMode }, { width: '100%', height: '100%' }).style}
                            dangerouslySetInnerHTML={{ __html: generateColorCSS({ colors: preset.hex.map(h => ({ hex: h })), mode: preset.displayMode }).innerHTML }}
                          />
                        )}
                      </button>
                      <button
                        onClick={(e) => deletePreset(e, originalIndex)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                        title="Delete preset"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Single Color Palette */}
          {colorType === 'single' && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Color Palette</h3>
              <div className="grid grid-cols-6 gap-2">
                {colorPalette.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all color-picker-button ${
                      selectedColor?.hex === color.hex 
                        ? 'border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20 scale-110' 
                        : 'border-gray-300 hover:border-gray-400 hover:scale-110'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Color Combination Section */}
          {colorType === 'combination' && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Color Combinations</h3>
              
              {/* LIVE PREVIEW - Moved to top and made sticky */}
              <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                 <span className="text-xs font-medium text-gray-600">Current Preview:</span>
                 {(() => {
                    const combination = parseColorCombination(colorName);
                    if (combination.isValid) {
                      combination.mode = combinationMode; // Apply current mode
                      const css = generateColorCSS(combination, {
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        borderWidth: '2px'
                      });
                      return (
                         <div
                           style={css.style}
                           className={css.className}
                           dangerouslySetInnerHTML={css.innerHTML ? { __html: css.innerHTML } : undefined}
                           title={`${colorName} (${combinationMode})`}
                         />
                      );
                    } else {
                      return <span className="text-xs text-gray-400">Invalid combination</span>;
                    }
                 })()}
              </div>

              {/* Exotic Colors */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Exotic Colors</h4>
                <div className="grid grid-cols-4 gap-2">
                  {EXOTIC_COMBINATIONS.map((combo, index) => {
                    const css = generateColorCSS({ colors: combo.colors, mode: combo.mode }, {
                      width: '100%',
                      height: '32px',
                      borderRadius: '4px'
                    });

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setColorName(combo.name);
                          setCombinationMode(combo.mode);
                          onColorSelect({
                            name: combo.name,
                            hex: combo.colors.map(c => c.hex),
                            combination: { colors: combo.colors, mode: combo.mode, isValid: true },
                            displayMode: combo.mode
                          });
                          setIsOpen(false);
                        }}
                        className="flex flex-col items-center gap-1 p-1 border border-gray-200 rounded hover:border-purple-400 hover:bg-purple-50 transition-all"
                        title={combo.name}
                      >
                        <div
                          style={css.style}
                          className={css.className}
                          dangerouslySetInnerHTML={css.innerHTML ? { __html: css.innerHTML } : undefined}
                        />
                        <span className="text-[10px] text-gray-600 truncate w-full text-center">{combo.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-3">
                {COMMON_COMBINATIONS.map((combo, index) => {
                  const colorName = combo.colors.join('/');
                  const combination = parseColorCombination(colorName);
                  const css = generateColorCSS(combination, {
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%'
                  });

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setColorName(colorName);
                        const parsed = parseColorCombination(colorName);
                        if (parsed.isValid) {
                          onColorSelect({
                            name: colorName,
                            hex: parsed.colors.map(c => c.hex),
                            combination: parsed,
                            displayMode: combinationMode
                          });
                          setIsOpen(false);
                        }
                      }}
                      className="w-8 h-8 border border-gray-300 rounded-full hover:border-gray-400 flex items-center justify-center p-0"
                      title={combo.name}
                    >
                      <div
                        style={css.style}
                        className={css.className}
                        dangerouslySetInnerHTML={css.innerHTML ? { __html: css.innerHTML } : undefined}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Combination Mode Selection */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-gray-700">Display Mode</label>
                  {(combinationMode === 'split-vertical' || combinationMode === 'split-horizontal') && (
                    <button
                      type="button"
                      onClick={handleRotate}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
                      title="Rotate split orientation"
                    >
                      <span className="text-sm">↻</span> Rotate
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(DISPLAY_MODES).map((mode) => {
                    // Create a sample combination for preview with the specific mode
                    const sampleCombination = {
                      colors: [
                        { name: 'red', hex: '#FF0000' },
                        { name: 'blue', hex: '#0000FF' }
                      ],
                      mode: mode
                    };
                    
                    const css = generateColorCSS(sampleCombination, {
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%'
                    });

                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setCombinationMode(mode)}
                        className={`p-2 border rounded text-xs ${
                          combinationMode === mode 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="w-8 h-8 rounded border border-gray-300 mb-1 mx-auto">
                          <div
                            style={css.style}
                            className={css.className}
                            dangerouslySetInnerHTML={css.innerHTML ? { __html: css.innerHTML } : undefined}
                          />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{mode.replace('-', ' ')}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Edit Individual Colors */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-gray-700">Edit Individual Colors</label>
                  <button
                    type="button"
                    onClick={handleSwapColors}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
                    title="Reverse color order"
                  >
                    <span className="text-sm">⇄</span> Swap Order
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(() => {
                    const combination = parseColorCombination(colorName);
                    if (combination.isValid) {
                      return combination.colors.map((color, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveComboIndex(idx)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            activeComboIndex === idx ? 'border-blue-500 ring-2 ring-blue-200 scale-110' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={`Edit ${color.name}`}
                        />
                      ));
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Custom Combination Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-gray-700">Create Custom Combination</label>
                  <button
                    type="button"
                    onClick={handleRandomCombination}
                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-purple-50 transition-colors"
                    title="Generate random combination"
                  >
                    <span className="text-sm">🎲</span> Random
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={colorName}
                    onChange={(e) => handleColorNameChange(e.target.value)}
                    placeholder="e.g., black/orange, red/blue/green"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={savePreset}
                    className="btn btn-secondary text-sm px-3 py-1"
                    title="Save to My Presets"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const combination = parseColorCombination(colorName);
                      if (combination.isValid) {
                        onColorSelect({
                          name: colorName,
                          hex: combination.colors.map(c => c.hex),
                          combination: combination,
                          displayMode: combinationMode
                        });
                        setIsOpen(false);
                      }
                    }}
                    className="btn btn-primary text-sm px-3 py-1"
                  >
                    Add
                  </button>
                </div>

                {/* Color Suggestions */}
                {colorSuggestions.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Color suggestions:</div>
                    <div className="flex flex-wrap gap-1">
                      {colorSuggestions.slice(0, 6).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleColorNameSelect(suggestion)}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">Custom Color</h3>
                {eyedropperSupported && (
                  <button
                    type="button"
                    onClick={activateEyedropper}
                    className={`p-1 rounded hover:bg-gray-100 ${isEyedropperActive ? 'text-blue-600' : 'text-gray-500'}`}
                    title="Pick color from screen"
                  >
                    <div className="icon-eyedropper"></div>
                  </button>
                )}
              </div>
              <div className="flex bg-gray-100 rounded-md p-1">
                {['visual', 'hex', 'rgb', 'name'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setInputMode(mode)}
                    className={`px-2 py-1 text-xs rounded transition-colors uppercase ${
                      inputMode === mode 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Picker */}
            {inputMode === 'visual' && (
              <div className="space-y-3">
                <div className="relative h-32 w-full rounded-lg overflow-hidden cursor-crosshair shadow-inner border border-gray-200">
                  <canvas 
                    ref={canvasRef} 
                    width={350} 
                    height={128}
                    onClick={handleCanvasClick}
                    className="w-full h-full"
                  />
                  <div 
                    className="absolute w-3 h-3 border-2 border-white rounded-full shadow-sm pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: `${saturation}%`, 
                      top: `${100 - brightness}%`,
                      backgroundColor: customColor
                    }}
                  />
                </div>
                <div className="relative h-4 w-full rounded-full overflow-hidden cursor-pointer shadow-inner border border-gray-200">
                  <div 
                    ref={hueBarRef}
                    className="w-full h-full"
                    style={{
                      background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                    }}
                    onClick={handleHueBarClick}
                  />
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white border border-gray-400 pointer-events-none"
                    style={{ left: `${(hue / 360) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Hex Input */}
            {inputMode === 'hex' && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">#</span>
                  <input
                    type="text"
                    value={customColor.replace('#', '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      const hex = '#' + val;
                      setCustomColor(hex);
                      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                        const rgb = hexToRgb(hex);
                        setRgbValues(rgb);
                        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                        setHue(hsv.h);
                        setSaturation(hsv.s);
                        setBrightness(hsv.v);
                      }
                    }}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    maxLength={7}
                  />
                </div>
                <div 
                  className="w-10 h-10 rounded border border-gray-300"
                  style={{ backgroundColor: customColor }}
                />
              </div>
            )}

            {/* RGB Input */}
            {inputMode === 'rgb' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {['r', 'g', 'b'].map(channel => (
                    <div key={channel} className="flex-1">
                      <label className="block text-xs text-gray-500 uppercase mb-1">{channel}</label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgbValues[channel]}
                        onChange={(e) => handleRgbChange(channel, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  ))}
                </div>
                <div 
                  className="h-8 w-full rounded border border-gray-300"
                  style={{ backgroundColor: customColor }}
                />
              </div>
            )}

            {/* Name Input */}
            {inputMode === 'name' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => handleColorNameChange(e.target.value)}
                  placeholder="e.g. Navy Blue"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {colorSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {colorSuggestions.slice(0, 5).map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleColorNameSelect(suggestion)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contrast Checker */}
            <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
               <div className="text-xs font-medium text-gray-700 mb-2">Contrast Checker (WCAG AA)</div>
               <div className="flex gap-4">
                 <div className="flex items-center gap-2 flex-1">
                   <div 
                     className="h-8 flex-1 rounded border flex items-center justify-center text-xs font-medium"
                     style={{ backgroundColor: customColor, color: '#FFFFFF', borderColor: 'rgba(0,0,0,0.1)' }}
                   >
                     White Text
                   </div>
                   <div className="flex flex-col">
                     <span className={`text-xs font-bold ${contrastInfo.white >= 4.5 ? 'text-green-600' : 'text-red-600'}`}>
                       {contrastInfo.white >= 4.5 ? 'Pass' : 'Fail'}
                     </span>
                     <span className="text-[10px] text-gray-500">{contrastInfo.white.toFixed(2)}:1</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 flex-1">
                   <div 
                     className="h-8 flex-1 rounded border flex items-center justify-center text-xs font-medium"
                     style={{ backgroundColor: customColor, color: '#000000', borderColor: 'rgba(0,0,0,0.1)' }}
                   >
                     Black Text
                   </div>
                   <div className="flex flex-col">
                     <span className={`text-xs font-bold ${contrastInfo.black >= 4.5 ? 'text-green-600' : 'text-red-600'}`}>
                       {contrastInfo.black >= 4.5 ? 'Pass' : 'Fail'}
                     </span>
                     <span className="text-[10px] text-gray-500">{contrastInfo.black.toFixed(2)}:1</span>
                   </div>
                 </div>
               </div>
               {contrastInfo.white < 4.5 && contrastInfo.black < 4.5 && (
                 <div className="mt-2 text-orange-600 text-[10px] flex items-center gap-1">
                   <span className="text-xs">⚠️</span> Warning: Low contrast with both black and white text.
                 </div>
               )}
            </div>

            {/* Harmony Suggestions */}
            <div className="mt-4 border-t border-gray-100 pt-3">
               <button 
                 type="button"
                 onClick={() => setShowHarmony(!showHarmony)}
                 className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium"
               >
                 <span className="text-sm">✨</span> {showHarmony ? 'Hide' : 'Show'} Harmony Suggestions
               </button>
               
               {showHarmony && (
                 <div className="mt-2">
                    <p className="text-[10px] text-gray-500 mb-2">Suggestions based on current color:</p>
                    <div className="flex flex-wrap gap-2">
                        {harmonyColors.map((color, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setCustomColor(color.hex);
                              const rgb = hexToRgb(color.hex);
                              setRgbValues(rgb);
                              const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                              setHue(hsv.h);
                              setSaturation(hsv.s);
                              setBrightness(hsv.v);
                            }}
                            className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: color.hex }}
                            title={`${color.name}: ${color.hex}`}
                          />
                        ))}
                    </div>
                 </div>
               )}
            </div>

            {/* Palette Generator */}
            <div className="mt-4 border-t border-gray-100 pt-3">
               <button 
                 type="button"
                 onClick={() => setShowPaletteGenerator(!showPaletteGenerator)}
                 className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
               >
                 <span className="text-sm">🎨</span> {showPaletteGenerator ? 'Hide' : 'Show'} Palette Generator
               </button>
               
               {showPaletteGenerator && (
                 <div className="mt-2">
                    <p className="text-[10px] text-gray-500 mb-2">Generated scheme based on current color:</p>
                    <div className="flex flex-wrap gap-3">
                        {generatedPalette.map((color, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomColor(color.hex);
                                  const rgb = hexToRgb(color.hex);
                                  setRgbValues(rgb);
                                  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                                  setHue(hsv.h);
                                  setSaturation(hsv.s);
                                  setBrightness(hsv.v);
                                }}
                                className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition-transform shadow-sm"
                                style={{ backgroundColor: color.hex }}
                                title={`${color.name}: ${color.hex}`}
                              />
                              <span className="text-[9px] text-gray-500 mt-1">{color.name}</span>
                          </div>
                        ))}
                    </div>
                 </div>
               )}
            </div>

            {/* Add Button */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={savePreset}
                className="btn btn-secondary text-sm px-4 py-2"
                title="Save to My Presets"
              >
                Save Preset
              </button>
              <button
                type="button"
                onClick={handleCustomColorSelect}
                className="btn btn-primary text-sm px-4 py-2"
              >
                Add Custom Color
              </button>
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
        </div>
      )}
    </div>
  );
}

export default ColorPicker;