// src/shared/components/DeleteStepModal.jsx
import React, { useEffect } from 'react';

const DeleteStepModal = ({ step, onClose, onDelete }) => {
    // Handle ESC key and focus management (Simple Action Modal pattern)
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);

        // Focus the delete button on open (destructive action gets focus)
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

    const handleDelete = () => {
        onDelete();
        onClose();
    };

    return (
        <div className="modal" onClick={handleBackdropClick}>
            <div className="modal-content">
                {/* Header with danger styling */}
                <div className="bg-red-500 text-white px-6 py-4 rounded-t-2xl relative flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl mb-2">🗑️</div>
                        <h2 className="text-lg font-semibold">Delete Step?</h2>
                        <p className="text-red-100 text-sm">This action cannot be undone</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute right-3 top-3 text-red-100 text-2xl hover:bg-red-600 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                        aria-label="Close delete step modal"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-yarn-50">
                    <div className="text-center mb-6">
                        <p className="text-wool-600 mb-2">
                            Are you sure you want to delete this step?
                        </p>
                        <div className="bg-wool-100 rounded-lg p-3 border border-wool-200">
                            <p className="text-sm font-medium text-wool-700">
                                "{step?.description}"
                            </p>
                        </div>
                        <p className="text-wool-500 text-sm mt-2">
                            This action cannot be undone.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="stack-sm">
                        {/* Primary action - Delete */}
                        <button
                            onClick={handleDelete}
                            data-modal-primary
                            className="w-full btn-danger flex items-center justify-center gap-2"
                        >
                            <span>🗑️</span>
                            Delete Step
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

export default DeleteStepModal;