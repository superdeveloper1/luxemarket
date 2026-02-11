# Enhanced Color Combination System

## Overview

The Enhanced Color Combination System is a powerful color parsing and visualization system that allows your app to translate any color combination (like "black/orange" or "red/blue/green") into sophisticated visual representations with multiple display modes.

## Features

### 🎨 **Advanced Color Parsing**
- Parse complex color combinations using `/`, ` and `, ` & `, or ` + ` separators
- Support for 1, 2, 3, or more colors in a single combination
- Automatic color name to hex code conversion
- Fallback to default colors for invalid names

### 🌈 **Multiple Display Modes**
- **Single**: Solid color fill
- **Split Vertical**: Vertical color bands
- **Split Horizontal**: Horizontal color bands  
- **Split Diagonal**: Diagonal color stripes
- **Gradient Linear**: Smooth linear gradient
- **Gradient Radial**: Radial gradient effect
- **Checkerboard**: Checkerboard pattern
- **Concentric**: Concentric circle pattern

### 🎯 **Smart Mode Selection**
- Automatic mode selection based on color count
- Manual mode switching for customization
- Context-aware display mode suggestions

### 🔧 **Developer-Friendly API**
- Simple JavaScript functions for parsing and rendering
- React components for easy integration
- CSS generation for custom styling
- Backward compatibility with existing color systems

## Quick Start

### Basic Usage

```javascript
import { parseColorCombination, generateColorCSS, DISPLAY_MODES } from './utils/colorCombinations.js';

// Parse a color combination
const combination = parseColorCombination('black/orange');
console.log(combination);
// {
//   colors: [
//     { name: 'black', hex: '#000000' },
//     { name: 'orange', hex: '#FFA500' }
//   ],
//   isValid: true,
//   mode: 'split-vertical'
// }

// Generate CSS for display
const css = generateColorCSS(combination, {
  width: '100px',
  height: '100px',
  borderRadius: '50%'
});

console.log(css.css);
// "width: 100px; height: 100px; display: flex; border-radius: 50%; border: 2px solid #ffffff;"
```

### React Integration

```jsx
import { ColorDisplay, ColorSwatch } from './components/ColorDisplay.jsx';

function MyComponent() {
  return (
    <div>
      {/* Basic color display */}
      <ColorDisplay 
        colorName="red/blue/green" 
        size="large" 
        showLabel={true}
      />
      
      {/* Color swatch with interaction */}
      <ColorSwatch 
        colorName="black/orange" 
        size="medium"
        showName={true}
        showCount={true}
        onClick={(name, combination, mode) => {
          console.log('Selected:', name, combination, mode);
        }}
      />
    </div>
  );
}
```

## Supported Color Names

The system includes 100+ color names mapped to hex codes:

### Basic Colors
- `black`, `white`, `red`, `green`, `blue`, `yellow`, `cyan`, `magenta`

### Extended Colors  
- `orange`, `pink`, `brown`, `beige`, `tan`, `khaki`, `gold`, `bronze`, `copper`

### Shades and Variations
- `crimson`, `scarlet`, `ruby`, `cherry`, `rose`, `coral`, `salmon`, `tomato`
- `azure`, `cobalt`, `sapphire`, `indigo`, `turquoise`, `sky`, `royal`, `midnight`
- `emerald`, `jade`, `forest`, `mint`, `sage`, `chartreuse`
- `amber`, `mustard`, `lemon`, `cream`, `ivory`, `peach`, `apricot`
- `violet`, `lavender`, `plum`, `mauve`, `lilac`, `orchid`
- `chocolate`, `coffee`, `mocha`, `chestnut`, `mahogany`, `walnut`, `oak`
- `charcoal`, `slate`, `ash`, `smoke`, `pearl`, `platinum`
- `steel`, `iron`, `titanium`, `chrome`
- `sand`, `stone`, `clay`, `earth`, `moss`, `grass`, `leaf`
- `burgundy`, `wine`, `champagne`, `taupe`, `nude`, `blush`, `marigold`, `denim`

## Display Modes

### Single Color
For single colors or when you want a solid fill.

```javascript
const combination = parseColorCombination('red');
const css = generateColorCSS(combination, { mode: 'single' });
```

### Split Vertical
Perfect for 2-color combinations like team colors.

```javascript
const combination = parseColorCombination('red/blue');
const css = generateColorCSS(combination, { mode: 'split-vertical' });
```

### Split Horizontal
Alternative split for different layouts.

```javascript
const css = generateColorCSS(combination, { mode: 'split-horizontal' });
```

### Split Diagonal
Dynamic diagonal stripe effect.

```javascript
const css = generateColorCSS(combination, { mode: 'split-diagonal' });
```

### Gradient Linear
Smooth gradient transitions.

```javascript
const combination = parseColorCombination('red/blue/green');
const css = generateColorCSS(combination, { mode: 'gradient-linear' });
```

### Gradient Radial
Radial gradient from center.

```javascript
const css = generateColorCSS(combination, { mode: 'gradient-radial' });
```

### Checkerboard
Patterned effect for multiple colors.

```javascript
const combination = parseColorCombination('red/blue/green/yellow');
const css = generateColorCSS(combination, { mode: 'checkerboard' });
```

### Concentric
Circular gradient effect.

```javascript
const css = generateColorCSS(combination, { mode: 'concentric' });
```

## API Reference

### Core Functions

#### `parseColorCombination(colorName)`
Parses a color combination string into individual color objects.

**Parameters:**
- `colorName` (string): The color combination string

**Returns:**
```javascript
{
  colors: Array<{name: string, hex: string}>,
  isValid: boolean,
  mode: string,
  error?: string
}
```

#### `generateColorCSS(colorCombination, options)`
Generates CSS for displaying a color combination.

**Parameters:**
- `colorCombination` (object): Result from parseColorCombination
- `options` (object): Display options
  - `width` (string): Width (default: '100%')
  - `height` (string): Height (default: '100%')
  - `borderRadius` (string): Border radius (default: '4px')
  - `borderWidth` (string): Border width (default: '2px')
  - `borderColor` (string): Border color (default: '#ffffff')

**Returns:**
```javascript
{
  css: string,
  className: string,
  innerHTML?: string
}
```

#### `getAvailableDisplayModes(colorCount)`
Returns available display modes for a given color count.

**Parameters:**
- `colorCount` (number): Number of colors in combination

**Returns:**
- Array of available mode strings

### React Components

#### `ColorDisplay`
Basic color combination display component.

**Props:**
- `colorName` (string): The color combination
- `displayMode` (string): Display mode (optional)
- `size` (string): Size ('small', 'medium', 'large')
- `className` (string): Additional CSS classes
- `showLabel` (boolean): Show label (default: true)
- `onClick` (function): Click handler
- `tooltip` (string): Tooltip text

#### `ColorSwatch`
Interactive color swatch with hover effects.

**Props:**
- `colorName` (string): The color combination
- `displayMode` (string): Display mode (optional)
- `size` (string): Size ('small', 'medium', 'large')
- `showName` (boolean): Show color name
- `showCount` (boolean): Show color count
- `onClick` (function): Click handler
- `className` (string): Additional CSS classes

#### `ColorCombinationSelector`
Full-featured selector with mode switching.

**Props:**
- `colorName` (string): The color combination
- `onColorChange` (function): Color change handler
- `onDisplayModeChange` (function): Mode change handler
- `availableModes` (array): Available modes (optional)
- `className` (string): Additional CSS classes

## Integration Examples

### Product Catalog
```jsx
// In your product listing component
function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="color-options">
        {product.colors.map((color, index) => (
          <ColorSwatch
            key={index}
            colorName={color.name}
            size="small"
            showName={true}
            showCount={true}
            onClick={(name, combination, mode) => {
              setSelectedColor(name);
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### Color Picker Modal
```jsx
function ColorPickerModal({ isOpen, onClose, onColorSelect }) {
  const [colorInput, setColorInput] = React.useState('');
  const [selectedMode, setSelectedMode] = React.useState('split-vertical');

  const handleColorSelect = () => {
    const combination = parseColorCombination(colorInput);
    if (combination.isValid) {
      onColorSelect({
        name: colorInput,
        combination: combination,
        displayMode: selectedMode
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <input
        value={colorInput}
        onChange={(e) => setColorInput(e.target.value)}
        placeholder="Enter color combination (e.g., black/orange)"
      />
      
      <div className="mode-selector">
        {getAvailableDisplayModes(parseColorCombination(colorInput).colors.length).map(mode => (
          <button
            key={mode}
            onClick={() => setSelectedMode(mode)}
            className={selectedMode === mode ? 'active' : ''}
          >
            {mode.replace('-', ' ')}
          </button>
        ))}
      </div>

      <ColorDisplay
        colorName={colorInput}
        displayMode={selectedMode}
        size="large"
      />

      <button onClick={handleColorSelect}>Add Color</button>
    </Modal>
  );
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Opera 47+

## Performance

The system is optimized for performance:
- Minimal DOM manipulation
- Efficient CSS generation
- Lazy loading of complex patterns
- Memory-efficient color parsing

## Backward Compatibility

The enhanced system maintains full backward compatibility with your existing color system:
- Existing single-color functionality continues to work
- Current color names and hex codes are preserved
- No breaking changes to existing APIs

## Testing

A comprehensive test page is available at `test-color-combinations.html` that demonstrates:
- All display modes
- Color combination parsing
- Interactive mode switching
- Common color combinations
- Error handling

## Future Enhancements

Planned features include:
- Custom color pattern definitions
- Animation support for transitions
- Accessibility improvements
- Dark mode support
- Color accessibility checking
- Export functionality for design tools

## Contributing

To contribute to the color combination system:

1. Add new color names to the `colorNameToHex` mapping
2. Implement new display modes in `generateColorCSS`
3. Update the `getDisplayMode` function for automatic mode selection
4. Add tests to the demo page
5. Update this documentation

## License

This enhanced color combination system is part of the LuxeMarket project and follows the same licensing terms.