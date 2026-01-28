import React from 'react';

function RelatedItems({ currentProduct, onProductClick }) {
    const [relatedProducts, setRelatedProducts] = React.useState([]);

    React.useEffect(() => {
        if (!currentProduct || !window.ProductManager) return;

        // Get products from the same category
        const allProducts = window.ProductManager.getAll();
        const related = allProducts
            .filter(p => 
                p.id !== currentProduct.id && // Exclude current product
                p.category === currentProduct.category // Same category
            )
            .slice(0, 4); // Limit to 4 items

        setRelatedProducts(related);
    }, [currentProduct]);

    if (!relatedProducts || relatedProducts.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
                Related Products
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map(product => (
                    <div
                        key={product.id}
                        onClick={() => onProductClick(product.id)}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    >
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <img
                                src={product.images?.[0] || product.image || 'https://via.placeholder.com/200'}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <div className="p-3">
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                {product.name}
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-[var(--primary-color)]">
                                    ${product.price.toFixed(2)}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <div className="icon-star text-yellow-400 fill-current text-[10px]"></div>
                                    {product.rating}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RelatedItems;