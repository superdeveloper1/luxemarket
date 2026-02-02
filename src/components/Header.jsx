import React from 'react';
import { showToast } from '../utils/simpleToast.js';

function Header({ cartCount, isMenuOpen, setIsMenuOpen, currentUser, onOpenAuth, onLogout, onOpenCart, onOpenWatchlist, onOpenAccountSummary }) {
    // All state declarations at the top
    const [categoryOpen, setCategoryOpen] = React.useState(false);
    const [categories, setCategories] = React.useState([
        "Electronics", "Fashion", "Furniture", "Accessories"
    ]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchCategory, setSearchCategory] = React.useState('All Categories');
    const [searchSuggestions, setSearchSuggestions] = React.useState([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    // Refs
    const dropdownRef = React.useRef(null);
    const searchRef = React.useRef(null);

    // Clicking outside closes the dropdowns
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            // Category Dropdown
            if (categoryOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCategoryOpen(false);
            }
            // Search Suggestions
            if (showSuggestions && searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [categoryOpen, showSuggestions]);

    // Dynamic Category Loading
    React.useEffect(() => {
        // Load initial
        if (window.CategoryManager) {
            setCategories(window.CategoryManager.getAll());
        }

        // Listen for storage changes to update categories across tabs
        const handleStorage = (e) => {
            if (e.key === 'luxemarket_categories' && window.CategoryManager) {
                setCategories(window.CategoryManager.getAll());
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const getCategoryLink = (cat) => `/#featured-products?category=${encodeURIComponent(cat)}`;

    const handleCategoryClick = (e, category) => {
        e.preventDefault();
        setCategoryOpen(false);

        // Update search category and trigger search
        setSearchCategory(category);
        setSearchTerm('');

        // Navigate to home page with category filter
        window.location.hash = 'products-section';

        // Dispatch event to filter products by category
        window.dispatchEvent(new CustomEvent('filterByCategory', {
            detail: { category }
        }));
    };

    // Sync search state from URL on mount
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search');
        const category = params.get('category');
        if (search) setSearchTerm(search);
        if (category) setSearchCategory(category);
    }, []);

    // Update suggestions when searchTerm changes
    React.useEffect(() => {
        if (searchTerm && searchTerm.trim().length > 0) {
            const allProducts = window.ProductManager ? window.ProductManager.getAll() : [];
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = allProducts.filter(p => {
                // Search in name, description, and category (case-insensitive)
                const matchesSearch = p.name.toLowerCase().includes(lowerTerm) ||
                    p.description.toLowerCase().includes(lowerTerm) ||
                    p.category.toLowerCase().includes(lowerTerm);

                // If a specific category is selected, also filter by category (case-insensitive)
                // But if searching for a category name, show all results for that category
                const matchesCategory = searchCategory === 'All Categories' ||
                    p.category.toLowerCase() === searchCategory.toLowerCase() ||
                    p.category.toLowerCase().includes(lowerTerm);

                return matchesSearch && matchesCategory;
            }).slice(0, 5); // Limit to 5 suggestions
            setSearchSuggestions(filtered);
        } else {
            setSearchSuggestions([]);
        }
    }, [searchTerm, searchCategory]);

    const handleSearch = (term, cat) => {
        try {
            // Handle arguments: if passed as event handler or undefined, use state
            // If called from button with no args, term is event - handle that
            let actualTerm = searchTerm;
            let actualCat = searchCategory;

            // If term is a string, use it. If it's an event (object), ignore it and use state.
            if (typeof term === 'string') {
                actualTerm = term;
            }

            // If cat is a string, use it.
            if (typeof cat === 'string') {
                actualCat = cat;
            }

            // Special case for clearing search if explicitly passed empty string
            if (term === '') {
                actualTerm = '';
            }

            let url = 'index.html?';
            const params = [];

            // Check if actualTerm is valid
            if (actualTerm && typeof actualTerm === 'string' && actualTerm.trim()) {
                params.push(`search=${encodeURIComponent(actualTerm.trim())}`);
            }

            // If category is provided and not 'All'
            if (actualCat && typeof actualCat === 'string' && actualCat !== 'All Categories') {
                params.push(`category=${encodeURIComponent(actualCat)}`);
            }

            const finalUrl = url + params.join('&') + '#featured-products';

            // Update URL without page reload
            if (window.history.pushState) {
                window.history.pushState({}, '', finalUrl);
            }

            // Dispatch category filter event if category is selected
            if (actualCat && actualCat !== 'All Categories') {
                window.dispatchEvent(new CustomEvent('filterByCategory', {
                    detail: { category: actualCat }
                }));
            }

            setShowSuggestions(false);
        } catch (error) {
            console.error('Search error:', error);
            showToast('Search failed: ' + error.message, 'error');
        }
    };

    const handleProductSelect = (product) => {
        // Navigate to product detail by triggering the product click
        setShowSuggestions(false);
        setSearchTerm('');

        // Dispatch a custom event to open the product detail
        window.dispatchEvent(new CustomEvent('openProduct', { detail: { productId: product.id } }));
    };

    const handleComingSoon = (e, feature) => {
        e.preventDefault();
        showToast(`${feature} feature coming soon!`, 'info');
    };

    const handleFeatureClick = (e, action) => {
        e.preventDefault();
        action();
    };

    return (
        <header className="font-sans text-sm" data-name="header" data-file="components/Header.js">
            {/* Top Utility Bar */}
            <div className="bg-white border-b border-gray-200 py-1 hidden md:block">
                <div className="container-custom flex justify-between items-center text-xs text-gray-600">
                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <span className="flex items-center gap-1">
                                Hi, <span className="font-bold text-gray-800">{currentUser.name}</span>!
                                <button onClick={onLogout} className="text-blue-600 hover:underline ml-1">Sign out</button>
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                Hi! <button onClick={() => onOpenAuth(false)} className="text-blue-600 hover:underline">Sign in</button> or <button onClick={() => onOpenAuth(true)} className="text-blue-600 hover:underline">register</button>
                            </span>
                        )}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                // Filter by daily deals
                                window.dispatchEvent(new CustomEvent('filterByDeals'));
                            }}
                            className="hover:underline text-[var(--accent-color)] font-medium cursor-pointer bg-transparent border-none"
                        >
                            Daily Deals
                        </button>
                        <a href="#footer" className="hover:underline">Help & Contact</a>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" onClick={(e) => handleComingSoon(e, 'Shipping selection')} className="hover:underline">Ship to</a>
                        <a href="#admin" className="hover:underline flex items-center gap-1">
                            <div className="icon-store text-xs"></div>
                            Sell
                        </a>
                        <a href="#" onClick={(e) => handleFeatureClick(e, onOpenWatchlist)} className="hover:underline flex items-center gap-1">
                            Watchlist <div className="icon-chevron-down text-[10px]"></div>
                        </a>
                        <div className="relative group cursor-pointer z-[50]">
                            <span className="hover:underline flex items-center gap-1">
                                My LuxeMarket <div className="icon-chevron-down text-[10px]"></div>
                            </span>
                            <div className="absolute right-0 top-full bg-white border border-gray-200 shadow-lg rounded-b-md p-2 hidden group-hover:block w-40">
                                <button onClick={onOpenAccountSummary} className="block w-full text-left px-2 py-1 hover:bg-gray-100">Summary</button>
                                <a href="#" onClick={(e) => handleComingSoon(e, 'Recently Viewed')} className="block px-2 py-1 hover:bg-gray-100">Recently Viewed</a>
                                <a href="#" onClick={(e) => handleComingSoon(e, 'Bids/Offers')} className="block px-2 py-1 hover:bg-gray-100">Bids/Offers</a>
                                <a href="#" onClick={(e) => handleComingSoon(e, 'Purchase History')} className="block px-2 py-1 hover:bg-gray-100">Purchase History</a>
                            </div>
                        </div>
                        <a href="#" onClick={(e) => handleComingSoon(e, 'Notifications')} className="hover:text-gray-900 relative" title="Notifications">
                            <div className="icon-bell text-lg"></div>
                        </a>
                        <button onClick={onOpenCart} className="hover:text-gray-900 relative cart-button" title="Cart">
                            <div className="icon-shopping-cart text-lg"></div>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform bg-red-600 rounded-full cart-count-badge">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="bg-white py-3 border-b border-gray-200 sticky top-0 z-[10] shadow-sm">
                <div className="container-custom">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-gray-600 hover:text-gray-900"
                        >
                            <div className="icon-menu text-2xl"></div>
                        </button>

                        {/* Logo */}
                        <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }} className="flex-shrink-0 flex items-center gap-1 group">
                            <div className="icon-shopping-bag text-3xl text-[var(--primary-color)]"></div>
                            <span className="text-2xl font-bold tracking-tighter text-gray-900">
                                Luxe<span className="text-[var(--primary-color)]">Market</span>
                            </span>
                        </a>

                        {/* Shop by Category (Desktop) */}
                        <div ref={dropdownRef} className="relative hidden md:block">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCategoryOpen(!categoryOpen);
                                }}
                                className={`text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1 whitespace-nowrap px-2 py-2 rounded-md transition-colors ${categoryOpen ? 'bg-gray-100' : ''}`}
                            >
                                Shop by category <div className={`icon-chevron-down text-xs transition-transform ${categoryOpen ? 'rotate-180' : ''}`}></div>
                            </button>
                            {categoryOpen && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-4 z-[20] grid grid-cols-1 gap-2 animate-[fadeIn_0.2s_ease-out] category-dropdown">
                                    {categories.map(cat => (
                                        <a
                                            key={cat}
                                            href={getCategoryLink(cat)}
                                            onClick={(e) => handleCategoryClick(e, cat)}
                                            className="hover:text-[var(--primary-color)] hover:underline flex items-center gap-2 p-1 rounded hover:bg-gray-50"
                                        >
                                            <div className="icon-chevron-right text-xs text-gray-400"></div>
                                            {cat}
                                        </a>
                                    ))}
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <a href="#featured-products" className="font-bold hover:underline block p-1">See all categories</a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Bar */}
                        <div ref={searchRef} className="flex-grow flex items-center max-w-4xl mx-auto relative">
                            <div className="flex-grow flex border-2 border-gray-300 rounded-full hover:border-gray-400 focus-within:border-[var(--primary-color)] transition-colors h-10 md:h-11 relative bg-gray-100">
                                <div className="pl-3 flex items-center text-gray-400">
                                    <div className="icon-search text-gray-500"></div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for anything"
                                    className="flex-grow px-3 bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-500 w-full"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    onFocus={() => setShowSuggestions(true)}
                                />
                                {/* Category Select inside Search (Desktop) */}
                                <div className="hidden md:flex items-center border-l border-gray-300 px-3">
                                    <select
                                        value={searchCategory}
                                        onChange={(e) => {
                                            const newCat = e.target.value;
                                            setSearchCategory(newCat);
                                        }}
                                        className="bg-transparent text-gray-600 text-sm focus:outline-none cursor-pointer max-w-[120px] truncate"
                                    >
                                        <option value="All Categories">All Categories</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSearch()}
                                className="btn btn-primary rounded-full px-6 ml-2 h-10 md:h-11 text-base font-semibold min-w-[100px] hidden md:block hover:shadow-md transition-shadow"
                            >
                                Search
                            </button>

                            {/* Search Suggestions Dropdown */}
                            {showSuggestions && searchTerm.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden max-h-[70vh] overflow-y-auto z-[30] animate-[fadeIn_0.2s_ease-out] search-dropdown">
                                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Suggested Products</span>
                                        <span className="text-xs text-gray-400">{searchSuggestions.length} results</span>
                                    </div>
                                    {searchSuggestions.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {searchSuggestions.map(product => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => handleProductSelect(product)}
                                                    className="flex items-center gap-4 p-4 hover:bg-blue-50/50 transition-all group w-full text-left"
                                                >
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 group-hover:scale-105 transition-transform">
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <div className="text-sm font-bold text-gray-900 truncate mb-0.5">{product.name}</div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">{product.category}</span>
                                                            <div className="flex text-yellow-400 text-[10px]">
                                                                <div className="icon-star fill-current"></div>
                                                                <span className="text-gray-400 ml-1 font-medium">{product.rating}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-base font-black text-[var(--primary-color)]">
                                                        ${product.price ? product.price.toFixed(2) : '0.00'}
                                                    </div>
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => handleSearch()}
                                                className="w-full text-center py-4 text-sm text-[var(--primary-color)] font-bold hover:bg-blue-50 transition-colors bg-white border-t border-gray-100 flex items-center justify-center gap-2"
                                            >
                                                <span>View all results for "{searchTerm}"</span>
                                                <div className="icon-arrow-right text-sm"></div>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center">
                                            <div className="icon-search text-gray-200 text-5xl mb-4 mx-auto"></div>
                                            <p className="text-gray-500 font-medium">No products found for "{searchTerm}"</p>
                                            <p className="text-xs text-gray-400 mt-1">Try different keywords or categories</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <a href="#" onClick={(e) => handleComingSoon(e, 'Advanced Search')} className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap hidden lg:block">Advanced</a>

                        {/* Mobile Cart Icon */}
                        <button onClick={onOpenCart} className="md:hidden relative text-gray-600 cart-button">
                            <div className="icon-shopping-cart text-2xl"></div>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full cart-count-badge">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className="border-b border-gray-200 bg-white hidden md:block">
                <div className="container-custom">
                    <nav className="flex items-center justify-center gap-6 py-2 text-[13px] text-gray-600">
                        <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }} className="hover:text-[var(--primary-color)] font-medium border-b-2 border-transparent hover:border-[var(--primary-color)] pb-1 transition-colors">Home</a>
                        <a href="#" onClick={(e) => handleFeatureClick(e, onOpenWatchlist)} className="hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] border-b-2 border-transparent pb-1 transition-colors flex items-center gap-1">
                            <div className="icon-heart text-xs"></div> Saved
                        </a>
                        {categories.slice(0, 6).map(cat => (
                            <a
                                key={cat}
                                href={getCategoryLink(cat)}
                                onClick={(e) => handleCategoryClick(e, cat)}
                                className="hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] border-b-2 border-transparent pb-1 transition-colors"
                            >
                                {cat}
                            </a>
                        ))}
                        <a href="#admin" className="text-[var(--primary-color)] hover:underline flex items-center gap-1 ml-4 border-l pl-4 border-gray-300">
                            <div className="icon-cog text-xs"></div> Admin
                        </a>
                    </nav>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-200 shadow-xl absolute top-full left-0 right-0 z-[20] max-h-[80vh] overflow-y-auto">
                    <div className="p-4 flex flex-col space-y-4">
                        <div className="font-bold text-lg mb-2 flex justify-between items-center">
                            Categories
                            <button onClick={() => setIsMenuOpen(false)} className="text-gray-400"><div className="icon-x text-xl"></div></button>
                        </div>
                        {categories.map(cat => (
                            <a
                                key={cat}
                                href={getCategoryLink(cat)}
                                onClick={(e) => handleCategoryClick(e, cat)}
                                className="text-gray-700 py-1 border-b border-gray-50 pl-2"
                            >
                                {cat}
                            </a>
                        ))}
                        <div className="font-bold text-lg mt-4 mb-2">My Account</div>

                        {currentUser ? (
                            <>
                                <div className="text-gray-700 py-1 pl-2">Hi, {currentUser.name}</div>
                                <button onClick={onLogout} className="text-left text-gray-700 py-1 pl-2">Sign Out</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { setIsMenuOpen(false); onOpenAuth(false); }} className="text-left text-gray-700 py-1 pl-2">Sign In</button>
                                <button onClick={() => { setIsMenuOpen(false); onOpenAuth(true); }} className="text-left text-gray-700 py-1 pl-2">Register</button>
                            </>
                        )}

                        <a href="#admin" className="text-[var(--primary-color)] font-medium py-1 mt-2 pl-2 flex items-center gap-2">
                            <div className="icon-database text-sm"></div>
                            Admin Dashboard
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
export default Header;