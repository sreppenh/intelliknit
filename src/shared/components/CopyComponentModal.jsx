import React, { useState, useEffect, useRef } from 'react';

const CopyComponentModal = ({ component, onClose, onCopy }) => {
    const [newName, setNewName] = useState(`${component.name} Copy`);
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
            handleCopy();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    // Handle backdrop click
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    const handleCopy = () => {
        const trimmedName = newName.trim();
        if (trimmedName && trimmedName !== component.name) {
            onCopy(trimmedName);
        } else {
            onClose();
        }
    };

    return (
        <div className="modal" onClick={handleBackdropClick}>
            <div className="modal-content-light">
                {/* Header with lighter treatment */}
                <div className="modal-header-light relative flex items-center justify-center py-4 px-6 rounded-t-2xl bg-sage-200">
                    <div className="text-center">
                        <div className="text-2xl mb-2">📋</div>
                        <h2 className="text-lg font-semibold">Copy Component</h2>
                        <p className="text-sage-600 text-sm">{component.name}</p>
                    </div>
                    <button
                        onClick={onClose} // replace with your copy modal close handler
                        className="absolute right-3 text-sage-600 text-2xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                        aria-label="Close Copy Component modal"
                    >
                        ×
                    </button>

                </div>

                {/* Content with light sage background */}
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-wool-600 mb-4 text-sm">
                            This will create a copy of <strong>{component.name}</strong> with all its steps.
                        </p>

                        <label className="form-label">
                            New Component Name
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter new component name"
                            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="stack-sm">
                        {/* Primary action - Copy */}
                        <button
                            onClick={handleCopy}
                            disabled={!newName.trim() || newName.trim() === component.name}
                            className="w-full bg-sage-500 text-white py-3 px-4 rounded-xl font-semibold text-base hover:bg-sage-600 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            <span>📋</span>
                            Copy Component
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

export default CopyComponentModal;