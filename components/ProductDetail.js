function ProductDetail({ product, onAddToCart }) {
    const { addToast } = useToast();
    const isDeal = product.isDailyDeal;
    const finalPrice = isDeal && product.dealPrice ? product.dealPrice : product.price;

    // Helper to get color name safely
    const getColorName = (c) => typeof c === 'string' ? c : c.name;
    const getColorHex = (c) => typeof c === 'string' ? c : c.hex;

    // Initialize with first available options if they exist
    const [selectedColor, setSelectedColor] = React.useState(product.colors && product.colors.length > 0 ? getColorName(product.colors[0]) : null);
    const [selectedSize, setSelectedSize] = React.useState(product.sizes ? product.sizes[0] : null);
    const [quantity, setQuantity] = React.useState(1);

    const [activeImage, setActiveImage] = React.useState(product.image);

    // If we have a gallery, combine main image + gallery images
    // This is the default if no color-specific images are found
    const defaultImages = React.useMemo(() => {
        const imgs = [product.image];
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
                if (!imgs.includes(img)) imgs.push(img);
            });
        }
        return imgs;
    }, [product]);

    // Current images based on selected color
    const currentImages = React.useMemo(() => {
        if (!selectedColor || !product.variantImages) return defaultImages;

        let variantImgs = null;

        // Direct match
        if (product.variantImages[selectedColor]) {
            variantImgs = product.variantImages[selectedColor];
        } else {
            // Case-insensitive match
            const match = Object.keys(product.variantImages).find(
                k => k.toLowerCase() === selectedColor.toLowerCase()
            );
            if (match) {
                variantImgs = product.variantImages[match];
            }
        }

        if (variantImgs) {
            return Array.isArray(variantImgs) ? variantImgs : [variantImgs];
        }

        return defaultImages;
    }, [selectedColor, product, defaultImages]);

    // Effect: reset active image when color changes (to the first image of the new set)
    React.useEffect(() => {
        if (currentImages.length > 0) {
            setActiveImage(currentImages[0]);
        }
    }, [currentImages]);

    const handleImageClick = (img) => {
        setActiveImage(img);

        let targetColor = null;

        // 1. Check explicit variant mappings
        if (product.variantImages) {
            const matchedColorKey = Object.keys(product.variantImages).find(
                color => product.variantImages[color] === img
            );
            if (matchedColorKey) {
                targetColor = matchedColorKey;
            }
        }

        // 2. Fallback: If no mapping found, and this is the main image
        if (!targetColor && img === product.image && product.colors && product.colors.length > 0) {
            targetColor = getColorName(product.colors[0]);
        }

        if (targetColor && product.colors) {
            // Find valid color option
            const availableColor = product.colors.find(
                c => getColorName(c).toLowerCase() === targetColor.toLowerCase()
            );
            if (availableColor) {
                setSelectedColor(getColorName(availableColor));
            }
        }
    };

    const handleAddToCart = () => {
        onAddToCart(product, {
            color: selectedColor,
            size: selectedSize,
            quantity: quantity
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" data-name="product-detail" data-file="components/ProductDetail.js">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="bg-gray-100 p-8 flex flex-col items-center justify-center min-h-[500px] lg:min-h-[700px] relative">
                    <div className="flex-grow flex items-center justify-center w-full mb-6 py-4">
                        <img
                            key={activeImage}
                            src={activeImage}
                            alt={product.name}
                            className="max-w-full max-h-[500px] object-contain mix-blend-multiply transition-all duration-300 animate-[fadeIn_0.3s_ease-out]"
                        />
                    </div>

                    {/* Carousel Thumbnails */}
                    {currentImages.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto max-w-full pb-4 px-2 scrollbar-hide">
                            {currentImages.map((img, index) => (
                                <button
                                    key={`${selectedColor}-${index}`}
                                    onClick={() => handleImageClick(img)}
                                    onMouseEnter={() => handleImageClick(img)}
                                    className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg border-2 overflow-hidden bg-white transition-all shadow-sm ${activeImage === img ? 'border-[var(--primary-color)] ring-2 ring-[var(--primary-color)] ring-opacity-30 scale-105' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-8 lg:p-12 flex flex-col">
                    <div className="mb-2">
                        <a
                            href={`index.html?category=${encodeURIComponent(product.category)}#featured-products`}
                            className="text-sm font-medium text-[var(--primary-color)] tracking-wider uppercase hover:underline"
                        >
                            {product.category}
                        </a>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-baseline gap-2">
                            {isDeal && product.dealPrice ? (
                                <>
                                    <span className="text-3xl font-bold text-red-600">${product.dealPrice.toFixed(2)}</span>
                                    <span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>
                                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                        Save {Math.round(((product.price - product.dealPrice) / product.price) * 100)}%
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-1 border-l pl-4 border-gray-200">
                            <div className="flex text-yellow-400 text-sm">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`icon-star ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`}></div>
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-1">({product.reviews} reviews)</span>
                        </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-8">
                        {product.description || "Experience premium quality with this meticulously crafted item."}
                    </p>

                    <hr className="border-gray-100 mb-8" />

                    {/* Options */}
                    <div className="space-y-6 mb-8">
                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-3">Color</label>
                                <div className="flex items-center gap-3">
                                    {product.colors.map((colorObj) => {
                                        const colorName = getColorName(colorObj);
                                        const colorHex = getColorHex(colorObj);
                                        const isSelected = selectedColor === colorName;

                                        return (
                                            <button
                                                key={colorName}
                                                onClick={() => setSelectedColor(colorName)}
                                                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[var(--primary-color)] ring-2 ring-[var(--primary-color)] ring-offset-2 scale-110' : 'border-gray-200 hover:border-gray-300 hover:scale-105'}`}
                                                title={colorName}
                                            >
                                                <span
                                                    className="w-9 h-9 rounded-full border border-gray-100 shadow-inner relative"
                                                    style={{ backgroundColor: colorHex }}
                                                >
                                                    {/* Optional: Add checkmark for selected white/light colors */}
                                                    {isSelected && ['#ffffff', '#fff', 'white'].includes(colorHex.toLowerCase()) && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="icon-check text-gray-900 text-sm"></div>
                                                        </div>
                                                    )}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Selected: <span className="font-medium text-gray-900 capitalize">{selectedColor}</span></p>
                            </div>
                        )}

                        {/* Sizes */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-900">Size</label>
                                    <button onClick={() => addToast('Size guide coming soon!', 'info')} className="text-sm text-[var(--primary-color)] hover:underline">Size Guide</button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`min-w-[3rem] h-10 px-3 rounded-md border font-medium text-sm transition-all ${selectedSize === size
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Quantity */}
                            <div className="flex items-center border border-gray-300 rounded-md w-max">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="icon-minus text-sm"></div>
                                </button>
                                <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="icon-plus text-sm"></div>
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 btn btn-primary py-3 text-lg shadow-lg shadow-blue-500/20"
                            >
                                <div className="icon-shopping-cart mr-2"></div>
                                Add to Cart - ${(finalPrice * quantity).toFixed(2)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}