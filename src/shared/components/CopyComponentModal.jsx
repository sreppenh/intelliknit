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

    // Handle Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCopy();
        } else if (e.key === 'Escape') {
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
        <div className="modal-overlay">
            <div className="modal-content">

                {/* Header */}
                <div className="bg-yarn-600 text-white px-6 py-4 rounded-t-2xl">
                    <div className="text-center">
                        <div className="text-2xl mb-2">📋</div>
                        <h2 className="text-lg font-semibold">Copy Component</h2>
                        <p className="text-yarn-100 text-sm">{component.name}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-yarn-50">
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
                            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-yarn-500 focus:ring-0 transition-colors bg-white"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="stack-sm">
                        {/* Primary action - Copy */}
                        <button
                            onClick={handleCopy}
                            disabled={!newName.trim() || newName.trim() === component.name}
                            className="w-full bg-yarn-600 text-white py-3 px-4 rounded-xl font-semibold text-base hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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