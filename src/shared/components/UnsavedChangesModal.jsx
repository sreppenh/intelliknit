// src/shared/components/UnsavedChangesModal.jsx
import React, { useEffect } from 'react';

const UnsavedChangesModal = ({
    isOpen,
    onConfirmExit,
    onCancel,
    title = "You have unsaved changes",
    message = "Are you sure you want to exit without saving?"
}) => {
    // Handle ESC key
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            // Focus management - focus the exit button (user-initiated action)
            setTimeout(() => {
                const exitButton = document.querySelector('[data-modal-exit]');
                if (exitButton) {
                    exitButton.focus();
                }
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onCancel]);

    // Handle backdrop click
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onCancel();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-content">
                {/* Header */}
                <div className="bg-yarn-600 text-white px-6 py-4 rounded-t-2xl relative flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl mb-2">🐸</div>
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <p className="text-yarn-100 text-sm">Time to frog your work?</p>
                    </div>
                    <button
                        onClick={onCancel} // replace with your unsaved changes modal close handler
                        className="absolute right-3 text-yarn-100 text-2xl hover:bg-yarn-500 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                        aria-label="Close Unsaved Changes modal"
                    >
                        ×
                    </button>

                </div>

                {/* Content */}
                <div className="p-6 bg-yarn-50">
                    <div className="text-center mb-6">
                        <p className="text-wool-600 mb-2">
                            {message}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="stack-sm">
                        {/* Primary action - Exit Without Saving */}
                        <button
                            onClick={onConfirmExit}
                            data-modal-exit
                            className="w-full btn-danger flex items-center justify-center gap-2"
                        >
                            Exit Without Saving
                        </button>

                        {/* Secondary action - Stay */}
                        <button
                            onClick={onCancel}
                            className="w-full btn-primary"
                        >
                            Stay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnsavedChangesModal;