function ProductCard({ product, addToCart }) {
    const { addToast } = useToast();
    const isDeal = product.isDailyDeal;
    const finalPrice = isDeal && product.dealPrice ? product.dealPrice : product.price;

    return (
        <div className="card flex flex-col h-full group overflow-hidden relative" data-name="product-card" data-file="components/ProductCard.js">
            <div className="relative pt-[100%] overflow-hidden bg-gray-100">
                <a href={`product.html?id=${product.id}`}>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </a>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {isDeal && (
                        <span className="bg-[var(--accent-color)] text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                            DAILY DEAL
                        </span>
                    )}
                    {product.price > 200 && !isDeal && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                            SALE
                        </span>
                    )}
                </div>

                {/* Overlay Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToast(`${product.name} added to wishlist!`, 'success');
                        }}
                        className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                        title="Add to Wishlist"
                    >
                        <div className="icon-heart text-sm"></div>
                    </button>
                    <a href={`product.html?id=${product.id}`} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-[var(--primary-color)] transition-colors" title="Quick View">
                        <div className="icon-eye text-sm"></div>
                    </a>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <a
                    href={`index.html?category=${encodeURIComponent(product.category)}#featured-products`}
                    className="text-xs text-gray-500 mb-1 hover:text-[var(--primary-color)] hover:underline"
                >
                    {product.category}
                </a>
                <a href={`product.html?id=${product.id}`} className="text-gray-900 font-semibold text-lg mb-1 line-clamp-2 hover:text-[var(--primary-color)] cursor-pointer">
                    {product.name}
                </a>

                <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`icon-star ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`}></div>
                        ))}
                    </div>
                    <span className="text-xs text-gray-400 ml-2">({product.reviews})</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        {isDeal && product.dealPrice ? (
                            <>
                                <span className="text-lg font-bold text-red-600">${product.dealPrice.toFixed(2)}</span>
                                <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                        )}
                    </div>

                    <a
                        href={`product.html?id=${product.id}`}
                        className="w-10 h-10 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center hover:bg-[var(--primary-color)] hover:text-white transition-all duration-300"
                    >
                        <div className="icon-arrow-right text-lg"></div>
                    </a>
                </div>
            </div>
        </div>
    );
}