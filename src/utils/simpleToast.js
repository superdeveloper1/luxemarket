// Simple toast notification system without React context
let toastContainer = null;

function createToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed bottom-4 right-4 space-y-2 z-50';
    toastContainer.style.pointerEvents = 'none';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'info') {
  const container = createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `bg-white shadow-lg rounded-lg px-4 py-3 border-l-4 transform translate-x-full transition-transform duration-300 ${
    type === 'success' ? 'border-green-500 text-green-800' :
    type === 'error' ? 'border-red-500 text-red-800' :
    type === 'info' ? 'border-blue-500 text-blue-800' : 
    'border-gray-500 text-gray-800'
  }`;
  toast.style.pointerEvents = 'auto';
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(full)';
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

export default { showToast };