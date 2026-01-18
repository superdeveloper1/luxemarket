function CategoryManagerModal({ onClose }) {
    const [categories, setCategories] = React.useState([]);
    const [newCategory, setNewCategory] = React.useState('');

    React.useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = () => {
        setCategories(window.CategoryManager.getAll());
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (newCategory.trim()) {
            window.CategoryManager.add(newCategory.trim());
            setNewCategory('');
            loadCategories();
        }
    };

    const handleDelete = (category) => {
        if (confirm(`Are you sure you want to delete category "${category}"?`)) {
            window.CategoryManager.delete(category);
            loadCategories();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">Manage Categories</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <div className="icon-x text-2xl"></div>
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            placeholder="New Category Name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newCategory.trim()}
                            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </form>

                    <div className="space-y-2">
                        <h3 className="font-medium text-gray-700 mb-2">Existing Categories</h3>
                        {categories.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No categories found.</p>
                        ) : (
                            <div className="border rounded-lg divide-y">
                                {categories.map(cat => (
                                    <div key={cat} className="flex justify-between items-center p-3 hover:bg-gray-50">
                                        <span className="font-medium">{cat}</span>
                                        <button
                                            onClick={() => handleDelete(cat)}
                                            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                                            title="Delete Category"
                                        >
                                            <div className="icon-trash text-lg"></div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
