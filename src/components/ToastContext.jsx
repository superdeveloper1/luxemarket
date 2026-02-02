import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-[20000]">
        {toasts.map(toast => (
          <div key={toast.id} className={`bg-white shadow-md rounded px-4 py-2 border-l-4 ${toast.type === 'success' ? 'border-green-500' :
            toast.type === 'error' ? 'border-red-500' :
              toast.type === 'info' ? 'border-blue-500' : 'border-gray-500'
            }`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}