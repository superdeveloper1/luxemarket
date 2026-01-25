function AdminProductForm({ product, onSave, onCancel }) {
    // Default initial state
    const [formData, setFormData] = React.useState({
        name: '',
        price: '',
        category: '',
        image: '',
        description: '',
        sizes: '',
        isDailyDeal: false,
        dealPrice: '',
        video: '',
        ...product
    });

    // Dynamic state for complex fields
    const [galleryUrls, setGalleryUrls] = React.useState(['']);
    const [variantMappings, setVariantMappings] = React.useState([{ color: '', urls: [''] }]);
    // Color Palette: array of { name: 'Red', hex: '#FF0000' }
    const [colorPalette, setColorPalette] = React.useState([{ name: '', hex: '#000000' }]);
    const [availableCategories, setAvailableCategories] = React.useState([]);

    React.useEffect(() => {
        setAvailableCategories(window.CategoryManager.getAll());
    }, []);

    React.useEffect(() => {
        if (product) {
            // Setup Gallery
            const existingGallery = product.images
                ? product.images.filter(img => img !== product.image) // Exclude main image if duplicate
                : [];
            setGalleryUrls(existingGallery.length > 0 ? existingGallery : ['']);

            // Setup Variants
            if (product.variantImages) {
                const mappings = Object.entries(product.variantImages).map(([key, val]) => ({
                    color: key,
                    urls: Array.isArray(val) ? val : [val]
                }));
                setVariantMappings(mappings.length > 0 ? mappings : [{ color: '', urls: [''] }]);
            }

            // Setup Color Palette
            if (product.colors && product.colors.length > 0) {
                // Check if colors are strings or objects
                if (typeof product.colors[0] === 'object') {
                    setColorPalette(product.colors);
                } else {
                    // Normalize old strings
                    const normalized = product.colors.map(c => ({
                        name: c,
                        hex: '#374151' // Default if not found
                    }));
                    setColorPalette(normalized);
                }
            } else {
                setColorPalette([{ name: '', hex: '#000000' }]);
            }

            setFormData({
                ...product,
                sizes: product.sizes ? product.sizes.join(', ') : '',
                dealPrice: product.dealPrice || ''
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Gallery Handlers
    const handleGalleryChange = (index, value) => {
        const newUrls = [...galleryUrls];
        newUrls[index] = value;
        setGalleryUrls(newUrls);
    };

    const addGalleryField = () => setGalleryUrls([...galleryUrls, '']);
    const removeGalleryField = (index) => {
        const newUrls = galleryUrls.filter((_, i) => i !== index);
        setGalleryUrls(newUrls.length ? newUrls : ['']);
    };

    // Variant Mapping Handlers
    const handleVariantChange = (vIndex, field, value) => {
        const newMappings = [...variantMappings];
        newMappings[vIndex][field] = value;
        setVariantMappings(newMappings);
    };

    const handleVariantUrlChange = (vIndex, uIndex, value) => {
        const newMappings = [...variantMappings];
        newMappings[vIndex].urls[uIndex] = value;
        setVariantMappings(newMappings);
    };

    const addVariantUrlField = (vIndex) => {
        const newMappings = [...variantMappings];
        newMappings[vIndex].urls.push('');
        setVariantMappings(newMappings);
    };

    const removeVariantUrlField = (vIndex, uIndex) => {
        const newMappings = [...variantMappings];
        newMappings[vIndex].urls = newMappings[vIndex].urls.filter((_, i) => i !== uIndex);
        if (newMappings[vIndex].urls.length === 0) newMappings[vIndex].urls = [''];
        setVariantMappings(newMappings);
    };

    const addVariantField = () => setVariantMappings([...variantMappings, { color: '', urls: [''] }]);
    const removeVariantField = (index) => {
        const newMappings = variantMappings.filter((_, i) => i !== index);
        setVariantMappings(newMappings.length ? newMappings : [{ color: '', urls: [''] }]);
    };

    // Color Palette Handlers
    const handleColorChange = (index, field, value) => {
        const newPalette = [...colorPalette];
        newPalette[index][field] = value;
        setColorPalette(newPalette);
    };

    const addColorField = () => setColorPalette([...colorPalette, { name: '', hex: '#000000' }]);
    const removeColorField = (index) => {
        const newPalette = colorPalette.filter((_, i) => i !== index);
        setColorPalette(newPalette.length ? newPalette : [{ name: '', hex: '#000000' }]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            alert("Please fill in Name and Price");
            return;
        }

        // Process gallery images
        const cleanGallery = galleryUrls.map(u => u.trim()).filter(Boolean);
        const finalImages = [formData.image, ...cleanGallery];
        const uniqueImages = [...new Set(finalImages)];

        // Process variant mapping
        const variantImages = {};
        variantMappings.forEach(item => {
            const cleanUrls = item.urls.map(u => u.trim()).filter(Boolean);
            if (item.color.trim() && cleanUrls.length > 0) {
                variantImages[item.color.trim()] = cleanUrls;
            }
        });

        // Process color palette
        const finalColors = colorPalette.filter(c => c.name.trim() !== '');

        const priceVal = parseFloat(formData.price);

        const submission = {
            ...formData,
            id: product ? Number(product.id) : undefined,
            price: isNaN(priceVal) ? 0 : priceVal,
            dealPrice: formData.isDailyDeal && formData.dealPrice ? parseFloat(formData.dealPrice) : null,
            colors: finalColors, // Save as array of objects
            sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
            images: uniqueImages,
            variantImages: variantImages
        };

        console.log("Submitting product:", submission);
        onSave(submission);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <div className="icon-x text-2xl"></div>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                step="0.01"
                                required
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Daily Deal Toggle */}
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                id="isDailyDeal"
                                name="isDailyDeal"
                                checked={formData.isDailyDeal}
                                onChange={handleChange}
                                className="w-4 h-4 text-[var(--primary-color)] rounded border-gray-300 focus:ring-[var(--primary-color)]"
                            />
                            <label htmlFor="isDailyDeal" className="font-semibold text-gray-900 select-none cursor-pointer">Set as Daily Deal</label>
                        </div>

                        {formData.isDailyDeal && (
                            <div className="ml-6 animate-[fadeIn_0.2s_ease-out]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Price ($)</label>
                                <input
                                    type="number"
                                    name="dealPrice"
                                    step="0.01"
                                    value={formData.dealPrice}
                                    onChange={handleChange}
                                    placeholder="Enter discounted price"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                        >
                            <option value="">Select Category</option>
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (Optional)</label>
                        <input
                            type="url"
                            name="video"
                            placeholder="https://www.youtube.com/embed/..."
                            value={formData.video || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Accepts YouTube embeds or direct video links.</p>
                    </div>

                    {/* Image Management Section */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="icon-image text-gray-500"></div>
                            <h3 className="font-semibold text-gray-900">Image Gallery</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL (Required)</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    name="image"
                                    required
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none bg-white"
                                />
                                {formData.image && (
                                    <img
                                        src={formData.image}
                                        alt="Main Preview"
                                        className="w-10 h-10 rounded-md object-cover border border-gray-200 bg-gray-100 flex-shrink-0"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
                            <div className="space-y-3">
                                {galleryUrls.map((url, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={url}
                                            onChange={(e) => handleGalleryChange(index, e.target.value)}
                                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none bg-white"
                                        />
                                        {url && (
                                            <img
                                                src={url}
                                                alt={`Gallery ${index + 1}`}
                                                className="w-10 h-10 rounded-md object-cover border border-gray-200 bg-gray-100 flex-shrink-0"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryField(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                            title="Remove image"
                                        >
                                            <div className="icon-trash text-lg"></div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addGalleryField}
                                className="mt-3 text-sm text-[var(--primary-color)] font-medium flex items-center gap-1 hover:underline"
                            >
                                <div className="icon-plus text-xs"></div> Add another image
                            </button>
                        </div>
                    </div>

                    {/* COLOR PALETTE SECTION */}
                    <div className="bg-purple-50 p-5 rounded-lg border border-purple-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="icon-palette text-purple-600"></div>
                            <h3 className="font-semibold text-gray-900">Color Palette</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Define available colors and their visual representation.</p>

                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase">
                                <div className="col-span-6">Name</div>
                                <div className="col-span-4">Display Color</div>
                                <div className="col-span-2"></div>
                            </div>
                            {colorPalette.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-6">
                                        <input
                                            type="text"
                                            placeholder="Color Name (e.g. Navy)"
                                            value={item.name}
                                            onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                                        />
                                    </div>
                                    <div className="col-span-4 flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={item.hex}
                                            onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                                            className="h-9 w-12 p-0.5 border border-gray-300 rounded bg-white cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-500 font-mono hidden sm:block">{item.hex}</span>
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeColorField(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                                        >
                                            <div className="icon-trash text-lg"></div>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addColorField}
                            className="mt-3 text-sm text-purple-600 font-medium flex items-center gap-1 hover:underline"
                        >
                            <div className="icon-plus text-xs"></div> Add Color
                        </button>
                    </div>

                    {/* Variant Mapping Section */}
                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <div className="icon-layers text-blue-600"></div>
                                <h3 className="font-semibold text-gray-900">Variant Images</h3>
                            </div>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Optional</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Link specific colors to images so the photo updates when a user selects a color.</p>

                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase">
                                <div className="col-span-4">Color Name</div>
                                <div className="col-span-7">Specific Image URL</div>
                                <div className="col-span-1"></div>
                            </div>
                            {variantMappings.map((mapping, vIndex) => (
                                <div key={vIndex} className="bg-white p-4 rounded-md border border-blue-100 space-y-3 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeVariantField(vIndex)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove this color variant"
                                    >
                                        <div className="icon-x text-xs"></div>
                                    </button>

                                    <div className="flex gap-4 items-center">
                                        <div className="w-1/3">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Color Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Black"
                                                value={mapping.color}
                                                list={`color-suggestions-${vIndex}`}
                                                onChange={(e) => handleVariantChange(vIndex, 'color', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                            />
                                            <datalist id={`color-suggestions-${vIndex}`}>
                                                {colorPalette.filter(c => c.name).map(c => (
                                                    <option key={c.name} value={c.name} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className="flex-grow">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Images for this color</label>
                                            <div className="space-y-2">
                                                {mapping.urls.map((url, uIndex) => (
                                                    <div key={uIndex} className="flex gap-2">
                                                        <input
                                                            type="url"
                                                            placeholder="https://..."
                                                            value={url}
                                                            onChange={(e) => handleVariantUrlChange(vIndex, uIndex, e.target.value)}
                                                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                        />
                                                        {url && (
                                                            <img
                                                                src={url}
                                                                alt={`Variant ${mapping.color} ${uIndex + 1}`}
                                                                className="w-10 h-10 rounded-md object-cover border border-gray-200 bg-gray-100 flex-shrink-0"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariantUrlField(vIndex, uIndex)}
                                                            className="p-2 text-gray-400 hover:text-red-500"
                                                        >
                                                            <div className="icon-trash"></div>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addVariantUrlField(vIndex)}
                                                className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline"
                                            >
                                                <div className="icon-plus text-[10px]"></div> Add Image Angle
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addVariantField}
                            className="mt-3 text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline"
                        >
                            <div className="icon-plus text-xs"></div> Add Mapping
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Sizes (comma separated)</label>
                        <input
                            type="text"
                            name="sizes"
                            placeholder="S, M, L, XL"
                            value={formData.sizes}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-[var(--primary-color)] rounded-md hover:bg-[var(--primary-hover)] shadow-sm"
                        >
                            Save Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}