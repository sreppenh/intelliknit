import React, { useState, useEffect } from 'react';
import { StandardModal } from '../../../../../shared/components/modals/StandardModal';

/**
 * 🪡 NeedlesSection - Live Preview Multi-Add Pattern
 * 
 * Features:
 * - Live preview of all changes (deletions + additions)
 * - Multi-add workflow: add needle → shows immediately → form clears → repeat
 * - "Update Needles" button reflects both deletions and additions
 * - Complete needle management workspace in one modal
 */
const NeedlesSection = ({
    project,
    formData,
    handleInputChange
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [tempNeedles, setTempNeedles] = useState([]); // Live preview state
    const [newNeedle, setNewNeedle] = useState({ size: '', type: '' });

    // Get current needles data
    const needles = formData?.needles || project?.needles || [];

    // Determine if section has content
    const hasContent = needles.length > 0;

    // Initialize temp needles when opening modal
    useEffect(() => {
        if (showEditModal) {
            setTempNeedles([...needles]); // Copy current needles for live editing
            setNewNeedle({ size: '', type: '' });
        }
    }, [showEditModal]);

    // 🎨 Conversational Display Formatting
    const formatNeedleDisplay = (needle) => {
        let display = needle.size || 'Unknown size';
        if (needle.type) {  // ← REMOVED the !== 'straight' condition
            display += ` ${needle.type}`;
        }
        return display;
    };

    // 🔧 Modal Management Functions
    const handleEditClick = () => {
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        // Auto-add any pending needle data before saving
        let finalNeedles = [...tempNeedles];

        // If user has entered needle info but hasn't clicked "Add Another Needle", add it automatically
        if (newNeedle.size && newNeedle.size.trim()) {
            const needleToAdd = {
                size: newNeedle.size,
                type: newNeedle.type || 'straight',
                length: ''
            };
            finalNeedles = [...tempNeedles, needleToAdd];
        }

        // Save the complete needles array
        handleInputChange('needles', finalNeedles);
        setShowEditModal(false);
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
    };

    // 🗑️ Remove needle from temp state (live preview)
    const removeTempNeedle = (index) => {
        setTempNeedles(prev => prev.filter((_, i) => i !== index));
    };

    // ➕ Add needle to temp state (live preview)
    const addTempNeedle = () => {
        if (newNeedle.size && newNeedle.size.trim()) {
            const needleToAdd = {
                size: newNeedle.size,
                type: newNeedle.type || 'straight', // Default to straight if none selected
                length: '' // Always empty now
            };

            setTempNeedles(prev => [...prev, needleToAdd]);
            setNewNeedle({ size: '', type: '' }); // Clear form for next needle
        }
    };

    // 🔧 New needle form handlers
    const updateNewNeedle = (field, value) => {
        setNewNeedle(prev => {
            const updated = { ...prev, [field]: value };
            return updated;
        });
    };

    // Validation for add button
    const canAddNeedle = newNeedle.size && newNeedle.size.trim();

    // Check if there are any changes to save
    const hasChanges = JSON.stringify(tempNeedles) !== JSON.stringify(needles);

    // 📖 Read View - Conversational Display
    if (!showEditModal) {
        return (
            <div
                className="read-mode-section hover:bg-sage-25 active:scale-95 cursor-pointer transition-all duration-200"
                onClick={handleEditClick}
            >
                <div className="details-section-header">
                    <h3 className="section-header-secondary">🪡 Needles</h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>

                {hasContent ? (
                    <div className="text-sm text-wool-700 space-y-1 text-left">
                        {needles.map((needle, index) => (
                            <div key={index} className="py-1">
                                {formatNeedleDisplay(needle)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-wool-500 italic">
                        + Add needle information
                    </div>
                )}
            </div>
        );
    }

    // ✏️ Edit Modal - Live Preview Multi-Add
    return (
        <>
            {/* Background section for read view */}
            <div className="read-mode-section">
                <div className="details-section-header">
                    <h3 className="section-header-secondary">🪡 Needles</h3>
                    <button
                        onClick={handleEditClick}
                        className="details-edit-button"
                        title="Edit needles"
                    >
                        ✏️
                    </button>
                </div>

                {hasContent ? (
                    <div className="text-sm text-wool-700 space-y-1 text-left">
                        {needles.map((needle, index) => (
                            <div key={index} className="py-1">
                                {formatNeedleDisplay(needle)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-wool-500 italic">
                        + Add needle information
                    </div>
                )}
            </div>

            {/* StandardModal - keeping ALL existing content */}
            <StandardModal
                isOpen={showEditModal}
                onClose={handleCancelEdit}
                onConfirm={handleSaveEdit}
                category="complex"
                colorScheme="sage"
                title="🪡 Needles"
                subtitle="Manage your knitting needles"
                showButtons={false}
            >
                {/* Current Needles - Live Preview with Delete */}
                {tempNeedles.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-wool-700 mb-3">Current Needles</h4>
                        <div className="space-y-2">
                            {tempNeedles.map((needle, index) => (
                                <div key={index} className="flex items-center justify-between py-2 px-3 bg-wool-50 rounded-lg border border-wool-200">
                                    <span className="text-sm text-wool-700">
                                        {formatNeedleDisplay(needle)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeTempNeedle(index)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                                        title="Remove this needle"
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add New Needle Section */}
                <div className={`${tempNeedles.length > 0 ? 'border-t border-wool-200 pt-6' : ''}`}>
                    <h4 className="text-sm font-medium text-wool-700 mb-3">Add New Needle</h4>

                    <div className="space-y-4">
                        {/* Size Dropdown */}
                        <div>
                            <label className="form-label">Needle Size</label>
                            <select
                                value={newNeedle.size}
                                onChange={(e) => updateNewNeedle('size', e.target.value)}
                                className="w-full details-input-field"
                                style={{ fontSize: '16px', minHeight: '44px' }}
                            >
                                <option value="">Select size...</option>
                                <option value="US 0 (2mm)">US 0 (2mm)</option>
                                <option value="US 1 (2.25mm)">US 1 (2.25mm)</option>
                                <option value="US 2 (2.75mm)">US 2 (2.75mm)</option>
                                <option value="US 3 (3.25mm)">US 3 (3.25mm)</option>
                                <option value="US 4 (3.5mm)">US 4 (3.5mm)</option>
                                <option value="US 5 (3.75mm)">US 5 (3.75mm)</option>
                                <option value="US 6 (4mm)">US 6 (4mm)</option>
                                <option value="US 7 (4.5mm)">US 7 (4.5mm)</option>
                                <option value="US 8 (5mm)">US 8 (5mm)</option>
                                <option value="US 9 (5.5mm)">US 9 (5.5mm)</option>
                                <option value="US 10 (6mm)">US 10 (6mm)</option>
                                <option value="US 10.5 (6.5mm)">US 10.5 (6.5mm)</option>
                                <option value="US 11 (8mm)">US 11 (8mm)</option>
                                <option value="US 13 (9mm)">US 13 (9mm)</option>
                                <option value="US 15 (10mm)">US 15 (10mm)</option>
                                <option value="US 17 (12mm)">US 17 (12mm)</option>
                                <option value="US 19 (15mm)">US 19 (15mm)</option>
                                <option value="US 35 (19mm)">US 35 (19mm)</option>
                                <option value="US 50 (25mm)">US 50 (25mm)</option>
                            </select>
                        </div>

                        {/* Type Dropdown */}
                        <div>
                            <label className="form-label">Needle Type (optional)</label>
                            <select
                                value={newNeedle.type}
                                onChange={(e) => updateNewNeedle('type', e.target.value)}
                                className="w-full details-input-field"
                            >
                                <option value="">Select type...</option>
                                <option value="circular">Circular</option>
                                <option value="straight">Straight</option>
                                <option value="double pointed">Double Pointed</option>
                                <option value="interchangeable">Interchangeable</option>
                            </select>
                        </div>

                        {/* Add Another Needle Button */}
                        <button
                            onClick={addTempNeedle}
                            disabled={!canAddNeedle}
                            className="w-full btn-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            + Add Another Needle
                        </button>
                    </div>
                </div>

                {/* Action buttons inside content */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleCancelEdit}
                        data-modal-cancel
                        className="flex-1 btn-tertiary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveEdit}
                        data-modal-primary
                        className="flex-1 btn-primary"
                    >
                        Save Changes
                    </button>
                </div>
            </StandardModal>
        </>
    );
};

export default NeedlesSection;