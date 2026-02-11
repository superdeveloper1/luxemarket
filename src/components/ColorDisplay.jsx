import React from 'react';
import { parseColorCombination, generateColorCSS, DISPLAY_MODES } from '../utils/colorCombinations.js';

function ColorDisplay({ 
  colorName, 
  displayMode, 
  size = 'medium', 
  className = '',
  showLabel = true,
  onClick = null,
  tooltip = null 
}) {
  const [combination, setCombination] = React.useState(null);
  const [css, setCss] = React.useState(null);

  React.useEffect(() => {
    if (colorName) {
      const parsed = parseColorCombination(colorName);
      setCombination(parsed);
      
      if (parsed.isValid) {
        const generatedCss = generateColorCSS(parsed, {
          width: size === 'small' ? '24px' : size === 'large' ? '48px' : '32px',
          height: size === 'small' ? '24px' : size === 'large' ? '48px' : '32px',
          borderRadius: '50%',
          borderWidth: '2px',
          borderColor: '#ffffff'
        });
        setCss(generatedCss);
      } else {
        setCss(null);
      }
    }
  }, [colorName, size]);

  if (!colorName || !combination || !combination.isValid) {
    return (
      <div 
        className={`color-display-invalid ${size} ${className}`}
        style={{
          width: size === 'small' ? '24px' : size === 'large' ? '48px' : '32px',
          height: size === 'small' ? '24px' : size === 'large' ? '48px' : '32px',
          borderRadius: '50%',
          border: '2px solid #e5e7eb',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 'small' ? '10px' : size === 'large' ? '14px' : '12px',
          color: '#9ca3af'
        }}
        title={tooltip || "Invalid color combination"}
      >
        ❌
      </div>
    );
  }

  const handleClick = () => {
    if (onClick) {
      onClick(colorName, combination, displayMode || combination.mode);
    }
  };

  const baseClasses = `color-display ${size} ${className} ${
    onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''
  }`;

  const title = tooltip || `${colorName} (${combination.colors.length} color${combination.colors.length > 1 ? 's' : ''})`;

  if (css.innerHTML) {
    return (
      <div
        className={baseClasses}
        style={css.style}
        onClick={handleClick}
        title={title}
        dangerouslySetInnerHTML={{ __html: css.innerHTML }}
      />
    );
  }

  return (
    <div
      className={baseClasses}
      style={css.style}
      onClick={handleClick}
      title={title}
    />
  );
}

// Enhanced color swatch component with multiple display options
function ColorSwatch({ 
  colorName, 
  displayMode, 
  size = 'medium', 
  showName = true, 
  showCount = true,
  onClick = null,
  className = ''
}) {
  const [combination, setCombination] = React.useState(null);

  React.useEffect(() => {
    if (colorName) {
      const parsed = parseColorCombination(colorName);
      setCombination(parsed);
    }
  }, [colorName]);

  if (!colorName || !combination || !combination.isValid) {
    return (
      <div className={`color-swatch-invalid ${size} ${className}`}>
        <div className="color-display-invalid" style={{ width: '24px', height: '24px' }}>❌</div>
        <span className="color-name text-xs text-gray-500">Invalid</span>
      </div>
    );
  }

  const handleClick = () => {
    if (onClick) {
      onClick(colorName, combination, displayMode || combination.mode);
    }
  };

  return (
    <div className={`color-swatch ${size} ${className} ${onClick ? 'cursor-pointer' : ''}`} onClick={handleClick}>
      <ColorDisplay 
        colorName={colorName}
        displayMode={displayMode}
        size={size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium'}
        className="color-swatch-display"
      />
      {showName && (
        <div className="color-name text-xs font-medium mt-1 text-center">
          {colorName}
        </div>
      )}
      {showCount && (
        <div className="color-count text-xs text-gray-500 text-center">
          {combination.colors.length} color{combination.colors.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

// Color combination selector with mode switching
function ColorCombinationSelector({ 
  colorName, 
  onColorChange, 
  onDisplayModeChange,
  availableModes = null,
  className = ''
}) {
  const [combination, setCombination] = React.useState(null);
  const [currentDisplayMode, setCurrentDisplayMode] = React.useState(null);

  React.useEffect(() => {
    if (colorName) {
      const parsed = parseColorCombination(colorName);
      setCombination(parsed);
      setCurrentDisplayMode(parsed.mode);
    }
  }, [colorName]);

  const handleModeChange = (mode) => {
    setCurrentDisplayMode(mode);
    if (onDisplayModeChange) {
      onDisplayModeChange(mode);
    }
  };

  if (!colorName || !combination || !combination.isValid) {
    return (
      <div className={`color-combination-selector ${className}`}>
        <div className="text-sm text-gray-500">Invalid color combination</div>
      </div>
    );
  }

  const modes = availableModes || getAvailableModes(combination.colors.length);

  return (
    <div className={`color-combination-selector ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <ColorDisplay 
          colorName={colorName}
          displayMode={currentDisplayMode}
          size="large"
          className="border-2 border-gray-300"
        />
        <div>
          <div className="font-semibold">{colorName}</div>
          <div className="text-sm text-gray-600">
            {combination.colors.length} color{combination.colors.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Display:</span>
        <div className="flex gap-1">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleModeChange(mode)}
              className={`p-1 rounded border ${
                currentDisplayMode === mode ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              title={mode.replace('-', ' ')}
            >
              <ColorDisplay 
                colorName={colorName}
                displayMode={mode}
                size="small"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to get available modes for a color count
function getAvailableModes(colorCount) {
  if (colorCount === 1) return [DISPLAY_MODES.SINGLE];
  if (colorCount === 2) return [
    DISPLAY_MODES.SINGLE,
    DISPLAY_MODES.SPLIT_VERTICAL,
    DISPLAY_MODES.SPLIT_HORIZONTAL,
    DISPLAY_MODES.SPLIT_DIAGONAL,
    DISPLAY_MODES.GRADIENT_LINEAR
  ];
  if (colorCount === 3) return [
    DISPLAY_MODES.SINGLE,
    DISPLAY_MODES.GRADIENT_LINEAR,
    DISPLAY_MODES.GRADIENT_RADIAL,
    DISPLAY_MODES.CHECKERBOARD
  ];
  return [
    DISPLAY_MODES.SINGLE,
    DISPLAY_MODES.CHECKERBOARD,
    DISPLAY_MODES.GRADIENT_LINEAR,
    DISPLAY_MODES.GRADIENT_RADIAL
  ];
}

export { ColorDisplay, ColorSwatch, ColorCombinationSelector };
export default ColorDisplay;