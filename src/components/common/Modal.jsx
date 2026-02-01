import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable Modal Component
 * Handles portals, backdrops, z-index, and scroll locking.
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to call when closing
 * @param {string} title - Optional title for the header
 * @param {boolean} showCloseButton - Whether to show the X button
 * @param {string} maxWidth - Tailwind max-width class (default: max-w-md)
 * @param {children} children - Modal content
 */
const Modal = ({
    isOpen,
    onClose,
    children,
    maxWidth = 'max-w-md',
    zIndex = 50
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (isOpen && e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Lock body scroll
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            // Restore body scroll
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!mounted || !isOpen) return null;

    // Use specific modal root or fallback to body
    const modalRoot = document.getElementById('modal-root') || document.body;

    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center p-4 modal-backdrop"
            style={{ zIndex: 99999 }} // Increase z-index significantly
        >
            {/* Backdrop Layer - Click to Close */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity opacity-100 cursor-pointer"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content - Stop Propagation */}
            <div
                className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out]`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {children}
            </div>
        </div>,
        modalRoot
    );
};

export default Modal;
