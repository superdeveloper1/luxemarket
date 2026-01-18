function AuthModal({ isOpen, onClose, onLogin }) {
    const [isRegistering, setIsRegistering] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock authentication
        const user = {
            name: isRegistering ? formData.name : (formData.email.split('@')[0] || 'User'),
            email: formData.email
        };
        
        // Save mock session
        localStorage.setItem('luxemarket_user', JSON.stringify(user));
        
        onLogin(user);
        onClose();
        setFormData({ name: '', email: '', password: '' });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
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
                            {isRegistering ? 'Join us for exclusive deals' : 'Sign in to continue shopping'}
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
                                    onChange={e => setFormData({...formData, name: e.target.value})}
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
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input 
                                type="password" 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
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
                </div>
            </div>
        </div>
    );
}