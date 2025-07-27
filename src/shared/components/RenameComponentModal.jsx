import React, { useState, useEffect, useRef } from 'react';

const RenameComponentModal = ({ component, onClose, onRename }) => {
    const [newName, setNewName] = useState(component.name);
    const inputRef = useRef(null);

    // Focus and select text when modal opens
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    // Handle Enter and ESC keys
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    // Add backdrop click handler
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    const handleRename = () => {
        const trimmedName = newName.trim();
        if (trimmedName && trimmedName !== component.name) {
            onRename(trimmedName);
        } else {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-content-light">

                {/* Header with lighter treatment */}
                <div className="modal-header-light">
                    <div className="text-center">
                        <div className="text-2xl mb-2">✏️</div>
                        <h2 className="text-lg font-semibold">Rename Component</h2>
                        <p className="text-sage-600 text-sm">{component.name}</p>
                    </div>
                </div>

                {/* Content with light sage background */}
                <div className="p-6">
                    <div className="mb-6">
                        <label className="form-label">
                            Component Name
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter component name"
                            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="stack-sm">
                        {/* Primary action - Rename */}
                        <button
                            onClick={handleRename}
                            disabled={!newName.trim() || newName.trim() === component.name}
                            className="w-full bg-sage-500 text-white py-3 px-4 rounded-xl font-semibold text-base hover:bg-sage-600 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            <span>✏️</span>
                            Rename Component
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

export default RenameComponentModal;