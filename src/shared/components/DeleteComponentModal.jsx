import React from 'react';

const DeleteComponentModal = ({ component, onClose, onDelete }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">

                {/* Header */}
                <div className="bg-red-500 text-white px-6 py-4 rounded-t-2xl">
                    <div className="text-center">
                        <div className="text-2xl mb-2">⚠️</div>
                        <h2 className="text-lg font-semibold">Delete Component?</h2>
                        <p className="text-red-100 text-sm">{component.name}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-yarn-50">
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
                            className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-semibold text-base hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <span>🗑️</span>
                            Delete Component
                        </button>

                        {/* Secondary action - Cancel */}
                        <button
                            onClick={onClose}
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