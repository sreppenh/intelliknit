// src/shared/components/CopyComponentModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { InputModal } from './StandardModal';

const CopyComponentModal = ({ component, onClose, onCopy }) => {
    const [newName, setNewName] = useState(`${component?.name || ''} Copy`);
    const inputRef = useRef(null);

    // Update name when component changes
    useEffect(() => {
        if (component?.name) {
            setNewName(`${component.name} Copy`);
        }
    }, [component]);

    // Focus and select text when modal opens
    useEffect(() => {
        if (component && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
                inputRef.current.select();
            }, 100);
        }
    }, [component]);

    // Handle Enter and ESC keys
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCopy();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleCopy = () => {
        const trimmedName = newName.trim();
        if (trimmedName && trimmedName !== component?.name) {
            onCopy(trimmedName);
        } else {
            onClose();
        }
    };

    if (!component) return null;

    return (
        <InputModal
            isOpen={!!component}
            onClose={onClose}
            onConfirm={handleCopy}
            title="Copy Component"
            subtitle={component.name}
            icon="📋"
            primaryButtonText="Copy Component"
            secondaryButtonText="Cancel"
            showButtons={false} // Custom buttons for validation
        >
            <div>
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

            {/* Custom buttons with validation */}
            <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 btn-tertiary">
                    Cancel
                </button>
                <button
                    onClick={handleCopy}
                    disabled={!newName.trim() || newName.trim() === component.name}
                    className="flex-1 btn-primary disabled:bg-wool-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <span>📋</span>
                    Copy Component
                </button>
            </div>
        </InputModal>
    );
};

export default CopyComponentModal;