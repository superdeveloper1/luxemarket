function Header({ cartCount, isMenuOpen, setIsMenuOpen, currentUser, onOpenAuth, onLogout }) {
    const [categoryOpen, setCategoryOpen] = React.useState(false);
    const { addToast } = useToast();

    // Clicking outside closes the dropdown
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryOpen && !event.target.closest('.category-dropdown-container')) {
                setCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [categoryOpen]);

    const categories = [
        "Electronics", "Fashion", "Furniture", "Accessories",
        "Sporting Goods", "Industrial", "Motors", "Deals"
    ];

    const getCategoryLink = (cat) => `index.html?category=${encodeURIComponent(cat)}#featured-products`;

    const handleComingSoon = (e, feature) => {
        e.preventDefault();
        addToast(`${feature} feature coming soon!`, 'info');
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
                        <a href="index.html?filter=deals#featured-products" className="hover:underline text-[var(--accent-color)] font-medium">Daily Deals</a>
                        <a href="#footer" className="hover:underline">Help & Contact</a>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" onClick={(e) => handleComingSoon(e, 'Shipping selection')} className="hover:underline">Ship to</a>
                        <a href="admin.html" className="hover:underline">Sell</a>
                        <a href="#" onClick={(e) => handleComingSoon(e, 'Watchlist')} className="hover:underline flex items-center gap-1">
                            Watchlist <div className="icon-chevron-down text-[10px]"></div>
                        </a>
                        <div className="relative group cursor-pointer z-50">
                            <span className="hover:underline flex items-center gap-1">
                                My LuxeMarket <div className="icon-chevron-down text-[10px]"></div>
                            </span>
                            <div className="absolute right-0 top-full bg-white border border-gray-200 shadow-lg rounded-b-md p-2 hidden group-hover:block w-32">
                                <a href="#" onClick={(e) => handleComingSoon(e, 'Account Summary')} className="block px-2 py-1 hover:bg-gray-100">Summary</a>
                                <a href="#" onClick={(e) => handleComingSoon(e, 'Recently Viewed')} className="block px-2 py-1 hover:bg-gray-100">Recently Viewed</a>
                                <a href="#" onClick={(e) => handleComingSoon(e, 'Bids/Offers')} className="block px-2 py-1 hover:bg-gray-100">Bids/Offers</a>
                                <a href="#" onClick={(e) => handleComingSoon(e, 'Purchase History')} className="block px-2 py-1 hover:bg-gray-100">Purchase History</a>
                            </div>
                        </div>
                        <a href="#" onClick={(e) => handleComingSoon(e, 'Notifications')} className="hover:text-gray-900 relative" title="Notifications">
                            <div className="icon-bell text-lg"></div>
                        </a>
                        <a href="checkout.html" className="hover:text-gray-900 relative" title="Cart">
                            <div className="icon-shopping-cart text-lg"></div>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform bg-red-600 rounded-full animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="bg-white py-3 border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="container-custom">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-500 hover:text-gray-700 p-1"
                            >
                                <div className={isMenuOpen ? "icon-x text-2xl" : "icon-menu text-2xl"}></div>
                            </button>
                        </div>

                        {/* Logo */}
                        <a href="index.html" className="flex-shrink-0 flex items-center gap-1 group">
                            <div className="icon-shopping-bag text-3xl text-[var(--primary-color)]"></div>
                            <span className="text-2xl font-bold tracking-tighter text-gray-900">
                                Luxe<span className="text-[var(--primary-color)]">Market</span>
                            </span>
                        </a>

                        {/* Shop by Category (Desktop) */}
                        <div className="relative hidden md:block category-dropdown-container">
                            <button
                                onClick={() => setCategoryOpen(!categoryOpen)}
                                className={`text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1 whitespace-nowrap px-2 py-2 rounded-md transition-colors ${categoryOpen ? 'bg-gray-100' : ''}`}
                            >
                                Shop by category <div className={`icon-chevron-down text-xs transition-transform ${categoryOpen ? 'rotate-180' : ''}`}></div>
                            </button>
                            {categoryOpen && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-4 z-50 grid grid-cols-1 gap-2 animate-[fadeIn_0.2s_ease-out]">
                                    {categories.map(cat => (
                                        <a
                                            key={cat}
                                            href={getCategoryLink(cat)}
                                            onClick={() => setCategoryOpen(false)}
                                            className="hover:text-[var(--primary-color)] hover:underline flex items-center gap-2 p-1 rounded hover:bg-gray-50"
                                        >
                                            <div className="icon-chevron-right text-xs text-gray-400"></div>
                                            {cat}
                                        </a>
                                    ))}
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <a href="index.html#featured-products" className="font-bold hover:underline block p-1">See all categories</a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Bar */}
                        <div className="flex-grow flex items-center max-w-4xl mx-auto">
                            <div className="flex-grow flex border-2 border-gray-300 rounded-full hover:border-gray-400 focus-within:border-[var(--primary-color)] transition-colors h-10 md:h-11 relative bg-gray-100">
                                <div className="pl-3 flex items-center text-gray-400">
                                    <div className="icon-search text-gray-500"></div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for anything"
                                    className="flex-grow px-3 bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-500 w-full"
                                />
                                {/* Category Select inside Search (Desktop) */}
                                <div className="hidden md:flex items-center border-l border-gray-300 px-3">
                                    <select className="bg-transparent text-gray-600 text-sm focus:outline-none cursor-pointer max-w-[120px] truncate">
                                        <option>All Categories</option>
                                        {categories.map(cat => <option key={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button className="btn btn-primary rounded-full px-6 ml-2 h-10 md:h-11 text-base font-semibold min-w-[100px] hidden md:block hover:shadow-md transition-shadow">
                                Search
                            </button>
                        </div>

                        <a href="#" onClick={(e) => handleComingSoon(e, 'Advanced Search')} className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap hidden lg:block">Advanced</a>

                        {/* Mobile Cart Icon */}
                        <a href="checkout.html" className="md:hidden relative text-gray-600">
                            <div className="icon-shopping-cart text-2xl"></div>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className="border-b border-gray-200 bg-white hidden md:block">
                <div className="container-custom">
                    <nav className="flex items-center justify-center gap-6 py-2 text-[13px] text-gray-600">
                        <a href="index.html" className="hover:text-[var(--primary-color)] font-medium border-b-2 border-transparent hover:border-[var(--primary-color)] pb-1 transition-colors">Home</a>
                        <a href="#" onClick={(e) => handleComingSoon(e, 'Saved Items')} className="hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] border-b-2 border-transparent pb-1 transition-colors flex items-center gap-1">
                            <div className="icon-heart text-xs"></div> Saved
                        </a>
                        {categories.slice(0, 6).map(cat => (
                            <a key={cat} href={getCategoryLink(cat)} className="hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] border-b-2 border-transparent pb-1 transition-colors">{cat}</a>
                        ))}
                        <a href="admin.html" className="text-[var(--primary-color)] hover:underline flex items-center gap-1 ml-4 border-l pl-4 border-gray-300">
                            <div className="icon-shield-check text-xs"></div> Admin Panel
                        </a>
                    </nav>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-200 shadow-xl absolute w-full z-50 max-h-[80vh] overflow-y-auto">
                    <div className="p-4 flex flex-col space-y-4">
                        <div className="font-bold text-lg mb-2 flex justify-between items-center">
                            Categories
                            <button onClick={() => setIsMenuOpen(false)} className="text-gray-400"><div className="icon-x text-xl"></div></button>
                        </div>
                        {categories.map(cat => (
                            <a key={cat} href={getCategoryLink(cat)} className="text-gray-700 py-1 border-b border-gray-50 pl-2">{cat}</a>
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

                        <a href="admin.html" className="text-[var(--primary-color)] font-medium py-1 mt-2 pl-2">Admin Dashboard</a>
                    </div>
                </div>
            )}
        </header>
    );
}