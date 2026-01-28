// ===============================
// Color Name to Hex Mapper
// Converts color names to hex codes
// ===============================

const colorMap = {
    // Basic colors
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'green': '#00FF00',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    
    // Common colors
    'gray': '#808080',
    'grey': '#808080',
    'silver': '#C0C0C0',
    'maroon': '#800000',
    'olive': '#808000',
    'lime': '#00FF00',
    'aqua': '#00FFFF',
    'teal': '#008080',
    'navy': '#000080',
    'fuchsia': '#FF00FF',
    'purple': '#800080',
    
    // Extended colors
    'orange': '#FFA500',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'beige': '#F5F5DC',
    'tan': '#D2B48C',
    'khaki': '#F0E68C',
    'gold': '#FFD700',
    'bronze': '#CD7F32',
    'copper': '#B87333',
    'brass': '#B5A642',
    
    // Shades of red
    'crimson': '#DC143C',
    'scarlet': '#FF2400',
    'ruby': '#E0115F',
    'cherry': '#DE3163',
    'rose': '#FF007F',
    'coral': '#FF7F50',
    'salmon': '#FA8072',
    'tomato': '#FF6347',
    
    // Shades of blue
    'azure': '#007FFF',
    'cobalt': '#0047AB',
    'sapphire': '#0F52BA',
    'indigo': '#4B0082',
    'turquoise': '#40E0D0',
    'sky': '#87CEEB',
    'royal': '#4169E1',
    'midnight': '#191970',
    
    // Shades of green
    'emerald': '#50C878',
    'jade': '#00A86B',
    'forest': '#228B22',
    'mint': '#98FF98',
    'sage': '#9DC183',
    'olive': '#808000',
    'chartreuse': '#7FFF00',
    
    // Shades of yellow/orange
    'amber': '#FFBF00',
    'mustard': '#FFDB58',
    'lemon': '#FFF700',
    'cream': '#FFFDD0',
    'ivory': '#FFFFF0',
    'peach': '#FFE5B4',
    'apricot': '#FBCEB1',
    
    // Shades of purple
    'violet': '#8F00FF',
    'lavender': '#E6E6FA',
    'plum': '#DDA0DD',
    'mauve': '#E0B0FF',
    'lilac': '#C8A2C8',
    'orchid': '#DA70D6',
    
    // Shades of brown
    'chocolate': '#D2691E',
    'coffee': '#6F4E37',
    'mocha': '#967969',
    'chestnut': '#954535',
    'mahogany': '#C04000',
    'walnut': '#773F1A',
    'oak': '#806517',
    
    // Shades of gray
    'charcoal': '#36454F',
    'slate': '#708090',
    'ash': '#B2BEB5',
    'smoke': '#738276',
    'pearl': '#EAE0C8',
    'platinum': '#E5E4E2',
    
    // Metallic
    'steel': '#71797E',
    'iron': '#4C4646',
    'titanium': '#878681',
    'chrome': '#C0C0C0',
    
    // Nature colors
    'sand': '#C2B280',
    'stone': '#8D8D8D',
    'clay': '#B66A50',
    'earth': '#8B4513',
    'moss': '#8A9A5B',
    'grass': '#7CFC00',
    'leaf': '#228B22',
    'sky blue': '#87CEEB',
    'ocean': '#006994',
    'sea': '#2E8B57',
    
    // Fashion colors
    'burgundy': '#800020',
    'wine': '#722F37',
    'champagne': '#F7E7CE',
    'taupe': '#483C32',
    'nude': '#E3BC9A',
    'blush': '#DE5D83',
    'marigold': '#EAA221',
    'denim': '#1560BD',
    'charcoal gray': '#36454F',
    'off white': '#FAF9F6',
};

/**
 * Convert color name to hex code
 * @param {string} colorName - The color name to convert
 * @returns {string} - Hex code or original input if not found
 */
export function colorNameToHex(colorName) {
    if (!colorName) return '#000000';
    
    // If already a hex code, return it
    if (colorName.startsWith('#')) {
        return colorName;
    }
    
    // If RGB format, return as is
    if (colorName.startsWith('rgb')) {
        return colorName;
    }
    
    // Convert to lowercase and trim
    const normalized = colorName.toLowerCase().trim();
    
    // Check direct match
    if (colorMap[normalized]) {
        return colorMap[normalized];
    }
    
    // Try to find partial match
    const partialMatch = Object.keys(colorMap).find(key => 
        normalized.includes(key) || key.includes(normalized)
    );
    
    if (partialMatch) {
        return colorMap[partialMatch];
    }
    
    // Default to black if no match found
    console.warn(`Color "${colorName}" not found, using black`);
    return '#000000';
}

/**
 * Get all available color names
 * @returns {Array} - Array of color names
 */
export function getAvailableColors() {
    return Object.keys(colorMap).sort();
}

/**
 * Check if a color name exists
 * @param {string} colorName - The color name to check
 * @returns {boolean} - True if color exists
 */
export function isValidColorName(colorName) {
    if (!colorName) return false;
    const normalized = colorName.toLowerCase().trim();
    return colorMap.hasOwnProperty(normalized);
}

/**
 * Get color suggestions based on partial input
 * @param {string} partial - Partial color name
 * @returns {Array} - Array of matching color names
 */
export function getColorSuggestions(partial) {
    if (!partial) return [];
    const normalized = partial.toLowerCase().trim();
    return Object.keys(colorMap)
        .filter(color => color.includes(normalized))
        .sort()
        .slice(0, 10); // Limit to 10 suggestions
}

export default {
    colorNameToHex,
    getAvailableColors,
    isValidColorName,
    getColorSuggestions
};