import React from 'react';

function AuthModal({ isOpen, isRegister = false, onClose, onLogin }) {
    const [isRegistering, setIsRegistering] = React.useState(isRegister);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    });

    // Update isRegistering when isRegister prop changes
    React.useEffect(() => {
        setIsRegistering(isRegister);
    }, [isRegister]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock authentication
        const user = {
            name: isRegistering ? formData.name : (formData.email.split('@')[0] || 'User'),
            email: formData.email
        };

        // Save mock session
        sessionStorage.setItem('luxemarket_user', JSON.stringify(user));

        onLogin(user);
        onClose();
        setFormData({ name: '', email: '', password: '' });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] animate-[fadeIn_0.2s_ease-out] modal-overlay modal-backdrop" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative m-4" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <div className="icon-x text-xl"></div>
                </button>

                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-[var(--primary-color)] mb-4">
                            <div className="icon-user text-2xl"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isRegistering ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {isRegistering
                                ? 'Create an account to complete your purchase'
                                : 'Sign in to add items to cart and checkout'
                            }
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegistering && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="w-full btn btn-primary py-2.5 mt-2">
                            {isRegistering ? 'Register' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500">
                            {isRegistering ? 'Already have an account?' : 'New to LuxeMarket?'}
                        </span>
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-[var(--primary-color)] font-medium hover:underline ml-1"
                        >
                            {isRegistering ? 'Sign In' : 'Create account'}
                        </button>
                    </div>

                    {/* Demo User Option */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => {
                                const demoUser = {
                                    name: 'Demo User',
                                    email: 'demo@luxemarket.com'
                                };
                                sessionStorage.setItem('luxemarket_user', JSON.stringify(demoUser));
                                onLogin(demoUser);
                                onClose();
                            }}
                            className="w-full text-sm text-gray-600 hover:text-gray-800 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            🚀 Continue as Demo User (for testing)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AuthModal;