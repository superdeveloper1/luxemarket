const ToastContext = React.createContext();

function ToastProvider({ children }) {
    const [toasts, setToasts] = React.useState([]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-lg shadow-lg flex items-center justify-between animate-[fadeIn_0.3s_ease-out] ${toast.type === 'success' ? 'bg-gray-900 text-white' :
                                toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={
                                toast.type === 'success' ? 'icon-circle-check text-xl' :
                                    toast.type === 'error' ? 'icon-circle-alert text-xl' : 'icon-info text-xl'
                            }></div>
                            <span className="text-sm font-medium">{toast.message}</span>
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-80 hover:opacity-100">
                            <div className="icon-x text-sm"></div>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// Custom hook to use toast
const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Make globally available
window.ToastProvider = ToastProvider;
window.useToast = useToast;
window.ToastContext = ToastContext;