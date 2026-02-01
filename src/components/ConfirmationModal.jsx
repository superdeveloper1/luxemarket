import { createPortal } from 'react-dom';

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // "danger", "warning", "info"
  itemDetails = null
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'icon-triangle-alert',
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          icon: 'icon-triangle-alert',
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          border: 'border-yellow-200'
        };
      case 'info':
        return {
          icon: 'icon-info-circle',
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
          border: 'border-blue-200'
        };
      default:
        return {
          icon: 'icon-triangle-alert',
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-[99999] animate-[fadeIn_0.2s_ease-out]" style={{ isolation: 'isolate' }} onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`p-6 border-b ${styles.border}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
              <div className={`${styles.icon} text-2xl ${styles.iconColor}`}></div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
          </div>
        </div>

        {/* Item Details */}
        {itemDetails && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {itemDetails.image && (
                <img
                  src={itemDetails.image}
                  alt={itemDetails.name}
                  className="w-16 h-16 object-cover rounded border"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                  }}
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{itemDetails.name}</h4>
                {itemDetails.price && (
                  <p className="text-sm text-gray-600">${itemDetails.price.toFixed(2)}</p>
                )}
                {itemDetails.category && (
                  <p className="text-xs text-gray-500">{itemDetails.category}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="icon-triangle-alert text-yellow-500 text-lg mt-0.5"></div>
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">This action cannot be undone.</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>The product will be permanently removed from your store</li>
                <li>All associated images and data will be deleted</li>
                <li>This product will no longer appear in search results</li>
                {itemDetails?.reviews > 0 && (
                  <li>All customer reviews ({itemDetails.reviews}) will be lost</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="btn btn-secondary px-6 py-2"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`btn px-6 py-2 ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmationModal;