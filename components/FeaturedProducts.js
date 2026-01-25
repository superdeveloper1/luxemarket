function FeaturedProducts({ products, addToCart }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3" data-name="featured-products" data-file="components/FeaturedProducts.js">
            {products.map(product => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
        </div>
    );
}