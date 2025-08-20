// src/shared/components/RenameComponentModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { InputModal } from './StandardModal';

const RenameComponentModal = ({ component, onClose, onRename }) => {
    const [newName, setNewName] = useState(component?.name || '');
    const inputRef = useRef(null);

    // Update name when component changes
    useEffect(() => {
        if (component?.name) {
            setNewName(component.name);
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
            handleRename();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleRename = () => {
        const trimmedName = newName.trim();
        if (trimmedName && trimmedName !== component?.name) {
            onRename(trimmedName);
        } else {
            onClose();
        }
    };

    if (!component) return null;

    return (
        <InputModal
            isOpen={!!component}
            onClose={onClose}
            onConfirm={handleRename}
            title="Rename Component"
            subtitle={component.name}
            icon="✏️"
            primaryButtonText="Rename Component"
            secondaryButtonText="Cancel"
            showButtons={false} // We'll use custom buttons for validation
        >
            <div>
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

            {/* Custom buttons with validation */}
            <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 btn-tertiary">
                    Cancel
                </button>
                <button
                    onClick={handleRename}
                    disabled={!newName.trim() || newName.trim() === component.name}
                    className="flex-1 btn-primary disabled:bg-wool-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <span>✏️</span>
                    Rename Component
                </button>
            </div>
        </InputModal>
    );
};

export default RenameComponentModal;