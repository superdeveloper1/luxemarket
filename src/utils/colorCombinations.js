// ===============================
// Advanced Color Combination System
// Handles complex color combinations and visual representations
// ===============================

import { colorNameToHex, isValidColorName } from './colorMapper.js';

/**
 * Color combination display modes
 */
export const DISPLAY_MODES = {
    SPLIT_VERTICAL: 'split-vertical',
    SPLIT_HORIZONTAL: 'split-horizontal', 
    SPLIT_DIAGONAL: 'split-diagonal',
    GRADIENT_LINEAR: 'gradient-linear',
    GRADIENT_RADIAL: 'gradient-radial',
    CHECKERBOARD: 'checkerboard',
    CONCENTRIC: 'concentric',
    SINGLE: 'single'
};

const EXOTIC_PRESETS = {
    'galaxy': { 
        colors: [
            { name: 'Black', hex: '#000000' }, 
            { name: 'Indigo', hex: '#4B0082' }, 
            { name: 'BlueViolet', hex: '#8A2BE2' }
        ], 
        mode: DISPLAY_MODES.GRADIENT_RADIAL 
    },
    'blue water': { 
        colors: [
            { name: 'Navy', hex: '#000080' }, 
            { name: 'Blue', hex: '#0000FF' }, 
            { name: 'Cyan', hex: '#00FFFF' }
        ], 
        mode: DISPLAY_MODES.GRADIENT_LINEAR 
    },
    'purple clouds': { 
        colors: [
            { name: 'Indigo', hex: '#4B0082' }, 
            { name: 'Orchid', hex: '#DA70D6' }, 
            { name: 'Lavender', hex: '#E6E6FA' }
        ], 
        mode: DISPLAY_MODES.CONCENTRIC 
    },
    'sunset': {
        colors: [
            { name: 'OrangeRed', hex: '#FF4500' },
            { name: 'DarkOrange', hex: '#FF8C00' },
            { name: 'Gold', hex: '#FFD700' }
        ],
        mode: DISPLAY_MODES.GRADIENT_LINEAR
    }
};

/**
 * Parse color combination string into individual colors
 * Supports formats like: "red/blue", "black/orange/gold", "navy/white"
 */
export function parseColorCombination(colorName) {
    if (!colorName || typeof colorName !== 'string') {
        return { colors: [], isValid: false, error: 'Invalid color name' };
    }

    // Clean and normalize the input
    const normalized = colorName.trim().toLowerCase();
    
    // Check exotic presets
    if (EXOTIC_PRESETS[normalized]) {
        return {
            colors: JSON.parse(JSON.stringify(EXOTIC_PRESETS[normalized].colors)),
            isValid: true,
            mode: EXOTIC_PRESETS[normalized].mode
        };
    }
    
    // Check if it's a single color
    if (!normalized.includes('/') && !normalized.includes(' and ')) {
        const hex = colorNameToHex(normalized);
        if (hex !== '#000000' || isValidColorName(normalized)) {
            return {
                colors: [{ name: colorName, hex }],
                isValid: true,
                mode: DISPLAY_MODES.SINGLE
            };
        }
        return { colors: [], isValid: false, error: 'Color not found' };
    }

    // Parse combination
    const separators = ['/', ' and ', ' & ', ' + '];
    let parts = [normalized];
    
    // Find the separator used
    const separator = separators.find(sep => normalized.includes(sep));
    if (separator) {
        parts = normalized.split(separator).map(p => p.trim()).filter(p => p.length > 0);
    }

    // Convert each part to hex
    const colorObjects = parts.map(part => {
        const hex = colorNameToHex(part);
        return {
            name: part,
            hex: hex === '#000000' && !isValidColorName(part) ? '#CCCCCC' : hex
        };
    });

    return {
        colors: colorObjects,
        isValid: colorObjects.length > 0,
        mode: getDisplayMode(colorObjects.length)
    };
}

/**
 * Determine the best display mode based on number of colors
 */
function getDisplayMode(colorCount) {
    switch (colorCount) {
        case 1:
            return DISPLAY_MODES.SINGLE;
        case 2:
            return DISPLAY_MODES.SPLIT_VERTICAL; // Default for 2 colors
        case 3:
            return DISPLAY_MODES.GRADIENT_LINEAR; // Default for 3 colors
        default:
            return DISPLAY_MODES.CHECKERBOARD; // Default for 4+ colors
    }
}

/**
 * Generate CSS for different color combination display modes
 */
export function generateColorCSS(colorCombination, options = {}) {
    const { colors, mode } = colorCombination;
    
    if (!colors || colors.length === 0) {
        return { css: '', className: '' };
    }

    const {
        width = '100%',
        height = '100%',
        borderRadius = '4px',
        borderWidth = '2px',
        borderColor = '#ffffff'
    } = options;

    const baseStyle = {
        width,
        height,
        borderRadius,
        border: `${borderWidth} solid ${borderColor}`,
        overflow: 'hidden',
        boxSizing: 'border-box'
    };

    switch (mode) {
        case DISPLAY_MODES.SINGLE:
            return {
                css: `
                    width: ${width};
                    height: ${height};
                    background-color: ${colors[0].hex};
                    border-radius: ${borderRadius};
                    border: ${borderWidth} solid ${borderColor};
                    overflow: hidden;
                `,
                style: {
                    ...baseStyle,
                    backgroundColor: colors[0].hex
                },
                className: 'color-single'
            };

        case DISPLAY_MODES.SPLIT_VERTICAL:
            const verticalWidth = `${100 / colors.length}%`;
            return {
                css: `
                    width: ${width};
                    height: ${height};
                    display: grid;
                    grid-template-columns: repeat(${colors.length}, 1fr);
                    border-radius: ${borderRadius};
                    border: ${borderWidth} solid ${borderColor};
                    overflow: hidden;
                `,
                style: {
                    ...baseStyle,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${colors.length}, 1fr)`
                },
                className: 'color-split-vertical',
                innerHTML: colors.map((color, index) => `
                    <div style="
                        height: 100%;
                        width: 100%;
                        background-color: ${color.hex};
                        border-right: ${index < colors.length - 1 ? `1px solid ${borderColor}` : 'none'};
                        box-sizing: border-box;
                    "></div>
                `).join('')
            };

        case DISPLAY_MODES.SPLIT_HORIZONTAL:
            const horizontalHeight = `${100 / colors.length}%`;
            return {
                css: `
                    width: ${width};
                    height: ${height};
                    display: grid;
                    grid-template-rows: repeat(${colors.length}, 1fr);
                    border-radius: ${borderRadius};
                    border: ${borderWidth} solid ${borderColor};
                    overflow: hidden;
                `,
                style: {
                    ...baseStyle,
                    display: 'grid',
                    gridTemplateRows: `repeat(${colors.length}, 1fr)`
                },
                className: 'color-split-horizontal',
                innerHTML: colors.map((color, index) => `
                    <div style="
                        height: 100%;
                        width: 100%;
                        background-color: ${color.hex};
                        border-bottom: ${index < colors.length - 1 ? `1px solid ${borderColor}` : 'none'};
                        box-sizing: border-box;
                    "></div>
                `).join('')
            };

        case DISPLAY_MODES.SPLIT_DIAGONAL:
            return {
                css: `
                    width: ${width};
                    height: ${height};
                    background: repeating-linear-gradient(
                        45deg,
                        ${colors.map((color, index) => `${color.hex} ${index * (100 / colors.length)}%, ${color.hex} ${(index + 1) * (100 / colors.length)}%`).join(', ')}
                    );
                    border-radius: ${borderRadius};
                    border: ${borderWidth} solid ${borderColor};
                    overflow: hidden;
                `,
                style: {
                    ...baseStyle,
                    background: `repeating-linear-gradient(45deg, ${colors.map((color, index) => `${color.hex} ${index * (100 / colors.length)}%, ${color.hex} ${(index + 1) * (100 / colors.length)}%`).join(', ')})`
                },
                className: 'color-split-diagonal'
            };

        case DISPLAY_MODES.GRADIENT_LINEAR:
            const linearColors = colors.map((color, index) => `${color.hex} ${(index / (colors.length - 1)) * 100}%`).join(', ');
            return {
                css: `
                    width: ${width};
                    height: ${height};
                    background: linear-gradient(90deg, ${linearColors});
                    border-radius: ${borderRadius};
                    border: ${borderWidth} solid ${borderColor};
                    overflow: hidden;
                `,
                style: {
                    ...baseStyle,
                    background: `linear-gradient(90deg, ${linearColors})`
                },
                className: 'color-gradient-linear'
            };

        case DISPLAY_MODES.GRADIENT_RADIAL:
            const radialColors = colors.map((color, index) => `${color.hex} ${(index / colors.length) * 100}%`).join(', ');
            return {
                css: `
                    width: ${width};
                    height: ${height};
                    background: radial-gradient(circle, ${radialColors});
                    border-radius: ${borderRadius};
                    border: ${borderWidth} solid ${borderColor};
                    overflow: hidden;
                `,
                style: {
                    ...baseStyle,
                    background: `radial-gradient(circle, ${radialColors})`
                },
                className: 'color-gradient-radial'
            };

        case DISPLAY_MODES.CHECKERBOARD:
            return {
                css: `
                    width: ${width};
                    height: ${height};
                    background-image: 
                        ${colors.map((color, index) => `
                            linear-gradient(45deg, 
                                ${color.hex} 25%, 
                                transparent 25%, 
                                transparent 75%, 
                                ${color.hex} 75%
                            )
                        `).join(', ')};
                    background-size: ${Math.max(20, 100 / Math.sqrt(colors.length))}px ${Math.max(20, 100 / Math.sqrt(colors.length))}px;
                    background-position: ${colors.map((_, index) => `
                        ${index * 10}px ${index * 10}px
                    `).join(', ')};
                    border-radius: ${borderRadius};
                    border: ${borderWidth} solid ${borderColor};
                    overflow: hidden;
                `,
                style: {
                    ...baseStyle,
                    backgroundImage: colors.map((color, index) => `linear-gradient(45deg, ${color.hex} 25%, transparent 25%, transparent 75%, ${color.hex} 75%)`).join(', '),
                    backgroundSize: `${Math.max(20, 100 / Math.sqrt(colors.length))}px ${Math.max(20, 100 / Math.sqrt(colors.length))}px`,
                    backgroundPosition: colors.map((_, index) => `${index * 10}px ${index * 10}px`).join(', ')
                },
                className: 'color-checkerboard'
            };

        case DISPLAY_MODES.CONCENTRIC:
            return {
                css: `
                    width: ${width};
                    height: ${height};
                    background: radial-gradient(circle, 
                        ${colors.map((color, index) => `${color.hex} ${(index / colors.length) * 100}%`).join(', ')}
                    );
                    border-radius: ${borderRadius};
                    border: ${borderWidth} solid ${borderColor};
                    overflow: hidden;
                `,
                style: {
                    ...baseStyle,
                    background: `radial-gradient(circle, ${colors.map((color, index) => `${color.hex} ${(index / colors.length) * 100}%`).join(', ')})`
                },
                className: 'color-concentric'
            };

        default:
            return {
                css: `
                    width: ${width};
                    height: ${height};
                    background-color: ${colors[0].hex};
                    border-radius: ${borderRadius};
                    border: ${borderWidth} solid ${borderColor};
                    overflow: hidden;
                `,
                style: {
                    ...baseStyle,
                    backgroundColor: colors[0].hex
                },
                className: 'color-single'
            };
    }
}

/**
 * Get suggested display mode for a color combination
 */
export function getSuggestedDisplayMode(colorCount) {
    if (colorCount === 1) return DISPLAY_MODES.SINGLE;
    if (colorCount === 2) return DISPLAY_MODES.SPLIT_VERTICAL;
    if (colorCount === 3) return DISPLAY_MODES.GRADIENT_LINEAR;
    return DISPLAY_MODES.CHECKERBOARD;
}

/**
 * Generate a color combination preview element
 */
export function createColorPreview(colorName, options = {}) {
    const combination = parseColorCombination(colorName);
    if (!combination.isValid) {
        return {
            element: null,
            error: combination.error
        };
    }

    const css = generateColorCSS(combination, options);
    
    // Create a preview element
    const element = document.createElement('div');
    element.style.cssText = css.css;
    element.className = css.className;
    
    if (css.innerHTML) {
        element.innerHTML = css.innerHTML;
    }

    return {
        element,
        combination,
        css
    };
}

/**
 * Get all available display modes for a color combination
 */
export function getAvailableDisplayModes(colorCount) {
    const modes = Object.values(DISPLAY_MODES);
    
    if (colorCount === 1) {
        return [DISPLAY_MODES.SINGLE];
    } else if (colorCount === 2) {
        return [
            DISPLAY_MODES.SINGLE,
            DISPLAY_MODES.SPLIT_VERTICAL,
            DISPLAY_MODES.SPLIT_HORIZONTAL,
            DISPLAY_MODES.SPLIT_DIAGONAL,
            DISPLAY_MODES.GRADIENT_LINEAR
        ];
    } else if (colorCount === 3) {
        return [
            DISPLAY_MODES.SINGLE,
            DISPLAY_MODES.GRADIENT_LINEAR,
            DISPLAY_MODES.GRADIENT_RADIAL,
            DISPLAY_MODES.CHECKERBOARD
        ];
    } else {
        return [
            DISPLAY_MODES.SINGLE,
            DISPLAY_MODES.CHECKERBOARD,
            DISPLAY_MODES.GRADIENT_LINEAR,
            DISPLAY_MODES.GRADIENT_RADIAL
        ];
    }
}

/**
 * Common color combinations for quick selection
 */
export const COMMON_COMBINATIONS = [
    { name: 'Black/Orange', colors: ['black', 'orange'] },
    { name: 'Red/Blue', colors: ['red', 'blue'] },
    { name: 'Navy/White', colors: ['navy', 'white'] },
    { name: 'Gold/Black', colors: ['gold', 'black'] },
    { name: 'Green/White', colors: ['green', 'white'] },
    { name: 'Purple/Gold', colors: ['purple', 'gold'] },
    { name: 'Red/White/Blue', colors: ['red', 'white', 'blue'] },
    { name: 'Black/White', colors: ['black', 'white'] },
    { name: 'Blue/Green', colors: ['blue', 'green'] },
    { name: 'Pink/Gold', colors: ['pink', 'gold'] }
];

export const EXOTIC_COMBINATIONS = Object.keys(EXOTIC_PRESETS).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    ...EXOTIC_PRESETS[key]
}));

export default {
    parseColorCombination,
    generateColorCSS,
    createColorPreview,
    getAvailableDisplayModes,
    getSuggestedDisplayMode,
    DISPLAY_MODES,
    COMMON_COMBINATIONS,
    EXOTIC_COMBINATIONS
};