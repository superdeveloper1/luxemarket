function AdminApp() {
    const [products, setProducts] = React.useState([]);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');

    // Initial load
    React.useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        setProducts(window.ProductManager.getAll());
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            window.ProductManager.delete(id);
            refreshData();
        }
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleSave = (product) => {
        try {
            window.ProductManager.save(product);
            setIsFormOpen(false);
            refreshData();
            console.log("Product saved successfully");
        } catch (error) {
            console.error("Failed to save product:", error);
            alert("Failed to save product. See console for details.");
        }
    };

    const handleMove = (index, direction) => {
        const newProducts = [...products];
        const newIndex = index + direction;

        if (newIndex >= 0 && newIndex < newProducts.length) {
            // Swap items
            [newProducts[index], newProducts[newIndex]] = [newProducts[newIndex], newProducts[index]];
            setProducts(newProducts);
            window.ProductManager.reorder(newProducts);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                            <div className="icon-layout-dashboard text-white text-lg"></div>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="index.html" className="text-sm font-medium text-gray-500 hover:text-[var(--primary-color)] flex items-center gap-1">
                            <div className="icon-external-link text-xs"></div> View Site
                        </a>
                        <button
                            onClick={() => setIsCategoryManagerOpen(true)}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
                        >
                            Manage Categories
                        </button>
                        <button
                            onClick={handleAddNew}
                            className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-[var(--primary-hover)] transition-colors"
                        >
                            <div className="icon-plus text-base"></div> Add Product
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-medium">Total Products</h3>
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 icon-package"></div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{products.length}</div>
                    </div>
                    {/* Placeholder Stats */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-medium">Total Revenue</h3>
                            <div className="p-2 bg-green-50 rounded-lg text-green-600 icon-dollar-sign"></div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">$12,450</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 font-medium">Orders</h3>
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600 icon-shopping-bag"></div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">145</div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] w-64"
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400 icon-search text-sm"></div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                    <th className="px-6 py-3 font-semibold">Product</th>
                                    <th className="px-6 py-3 font-semibold">Category</th>
                                    <th className="px-6 py-3 font-semibold">Price</th>
                                    <th className="px-6 py-3 font-semibold">Stock</th>
                                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.filter(p => {
                                    if (!searchTerm) return true;
                                    const lowerTerm = searchTerm.toLowerCase();
                                    return p.name.toLowerCase().includes(lowerTerm) ||
                                        p.category.toLowerCase().includes(lowerTerm) ||
                                        (p.id && p.id.toString().includes(lowerTerm));
                                }).map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={product.image} alt="" className="w-10 h-10 rounded-md object-cover bg-gray-100 border border-gray-200" />
                                                <div className="font-medium text-gray-900">{product.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            ${(product.price || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5 text-green-600">
                                                <div className="icon-circle-check text-xs"></div>
                                                In Stock
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="flex flex-col gap-1 mr-2 border-r pr-2 border-gray-100">
                                                    <button
                                                        onClick={() => handleMove(products.indexOf(product), -1)}
                                                        disabled={products.indexOf(product) === 0}
                                                        className={`p-1 rounded hover:bg-gray-100 transition-colors ${products.indexOf(product) === 0 ? 'text-gray-300' : 'text-gray-500'}`}
                                                        title="Move Up"
                                                    >
                                                        <div className="icon-chevron-up text-xs"></div>
                                                    </button>
                                                    <button
                                                        onClick={() => handleMove(products.indexOf(product), 1)}
                                                        disabled={products.indexOf(product) === products.length - 1}
                                                        className={`p-1 rounded hover:bg-gray-100 transition-colors ${products.indexOf(product) === products.length - 1 ? 'text-gray-300' : 'text-gray-500'}`}
                                                        title="Move Down"
                                                    >
                                                        <div className="icon-chevron-down text-xs"></div>
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-1.5 text-gray-500 hover:text-[var(--primary-color)] hover:bg-blue-50 rounded-md transition-colors"
                                                >
                                                    <div className="icon-pencil text-sm"></div>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    <div className="icon-trash text-sm"></div>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No products found. Add one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {isFormOpen && (
                <AdminProductForm
                    product={editingProduct}
                    onSave={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}

            {isCategoryManagerOpen && (
                <CategoryManagerModal
                    onClose={() => setIsCategoryManagerOpen(false)}
                />
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminApp />);