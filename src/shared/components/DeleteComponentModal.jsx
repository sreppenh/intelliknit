import React, { useEffect } from 'react';

const DeleteComponentModal = ({ component, onClose, onDelete }) => {
    // Standardized Simple Action Modal Behavior
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);

        // Focus management - focus the primary (delete) button
        setTimeout(() => {
            const deleteButton = document.querySelector('[data-modal-primary]');
            if (deleteButton) {
                deleteButton.focus();
            }
        }, 100);

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    // Handle backdrop click
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-content-light">
                {/* Header with lighter danger treatment */}
                <div className="modal-header-light-danger relative flex items-center justify-center py-4 px-6 rounded-t-2xl bg-red-100">
                    <div className="text-center">
                        <div className="text-2xl mb-2">⚠️</div>
                        <h2 className="text-lg font-semibold">Delete Component?</h2>
                        <p className="text-red-600 text-sm">{component.name}</p>
                    </div>

                    <button
                        onClick={onClose} // replace with your delete modal close handler
                        className="absolute right-3 text-red-600 text-2xl hover:bg-red-200 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                        aria-label="Close Delete Component modal"
                    >
                        ×
                    </button>
                </div>

                {/* Content with light sage background */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <p className="text-wool-600 mb-2">
                            This will permanently delete <strong>{component.name}</strong> and all its steps.
                        </p>
                        <p className="text-wool-500 text-sm">
                            This action cannot be undone.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="stack-sm">
                        {/* Primary action - Delete */}
                        <button
                            onClick={onDelete}
                            data-modal-primary
                            className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-semibold text-base hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <span>🗑️</span>
                            Delete Component
                        </button>

                        {/* Secondary action - Cancel */}
                        <button
                            onClick={onClose}
                            data-modal-cancel
                            className="w-full btn-tertiary"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteComponentModal;