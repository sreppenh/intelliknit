// src/shared/components/yarns/YarnManagerModal.jsx
import React, { useState, useEffect } from 'react';
import { StandardModal } from '../modals/StandardModal';
import IncrementInput from '../IncrementInput';
import { COLOR_PALETTE_ARRAY as colorPalette } from '../../utils/constants';

/**
 * 🧶 Reusable Yarn Add/Edit Modal
 * Used everywhere: Project Details, Stripes Config, Fair Isle, etc.
 */
const YarnManagerModal = ({
    isOpen,
    onClose,
    onSave,
    existingYarns = [],
    editingYarn = null,
    availableLetters = [],
    autoAssignNextLetter = true,
    showSkeins = true,
    title = null,
    subtitle = null
}) => {
    // Form state
    const [yarnForm, setYarnForm] = useState({
        brand: '',
        color: '',
        colorHex: colorPalette[0].hex,
        letter: '',
        skeins: 1
    });

    // Track changes
    const [hasChanges, setHasChanges] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [conflictPreview, setConflictPreview] = useState(null);

    // Initialize form when editing or adding
    useEffect(() => {
        if (isOpen) {
            if (editingYarn) {
                setYarnForm({
                    brand: editingYarn.brand || '',
                    color: editingYarn.color || '',
                    colorHex: editingYarn.colorHex || colorPalette[0].hex,
                    letter: editingYarn.letter || '',
                    skeins: editingYarn.skeins || 1
                });
            } else if (autoAssignNextLetter) {
                // Auto-assign next available letter
                const unassignedLetter = availableLetters.find(letter =>
                    !existingYarns.some(y => y.letter === letter)
                );
                setYarnForm(prev => ({
                    ...prev,
                    colorHex: colorPalette[0].hex,
                    letter: unassignedLetter || ''
                }));
            }
        }
    }, [isOpen, editingYarn, autoAssignNextLetter, availableLetters, existingYarns]);

    // Check for conflicts
    const checkConflicts = (newYarnData) => {
        if (!newYarnData.letter) return null;

        const conflictYarn = existingYarns.find(y =>
            y.letter === newYarnData.letter &&
            y.id !== editingYarn?.id
        );

        if (conflictYarn) {
            return {
                newYarn: newYarnData,
                conflictYarn: conflictYarn,
                action: 'unassign'
            };
        }

        return null;
    };

    // Handle form changes
    const handleFormChange = (field, value) => {
        const updatedForm = { ...yarnForm, [field]: value };
        setYarnForm(updatedForm);
        setHasChanges(true);

        if (field === 'letter') {
            const conflict = checkConflicts(updatedForm);
            setConflictPreview(conflict);
        }
    };

    // Handle close with unsaved check
    const handleClose = () => {
        if (hasChanges) {
            setShowUnsavedModal(true);
        } else {
            onClose();
            resetForm();
        }
    };

    // Handle confirmed close
    const handleConfirmClose = () => {
        setShowUnsavedModal(false);
        onClose();
        resetForm();
    };

    // Handle save
    const handleSave = () => {
        const yarnData = {
            ...yarnForm,
            id: editingYarn?.id || Date.now()
        };

        onSave({
            yarn: yarnData,
            conflict: conflictPreview
        });

        resetForm();
    };

    // Reset form
    const resetForm = () => {
        setYarnForm({
            brand: '',
            color: '',
            colorHex: colorPalette[0].hex,
            letter: '',
            skeins: 1
        });
        setHasChanges(false);
        setConflictPreview(null);
    };

    return (
        <>
            <StandardModal
                isOpen={isOpen}
                onClose={handleClose}
                onConfirm={handleSave}
                category="input"
                colorScheme="sage"
                title={title || (editingYarn ? 'Edit Yarn' : 'Add New Yarn')}
                subtitle={subtitle || "Configure yarn details and color assignment"}
                primaryButtonText={editingYarn ? 'Save Changes' : 'Add Yarn'}
                secondaryButtonText="Cancel"
                primaryButtonProps={{
                    disabled: !yarnForm.brand?.trim() || !yarnForm.color?.trim() || !yarnForm.colorHex
                }}
            >
                <div className="space-y-4">
                    {/* Brand Name */}
                    <div>
                        <label className="form-label">Brand Name</label>
                        <input
                            data-modal-focus
                            type="text"
                            value={yarnForm.brand}
                            onChange={(e) => handleFormChange('brand', e.target.value)}
                            placeholder="e.g., Cascade Yarns"
                            className="w-full border-2 border-wool-200 rounded-xl px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                        />
                    </div>

                    {/* Color Name */}
                    <div>
                        <label className="form-label">Color Name</label>
                        <input
                            type="text"
                            value={yarnForm.color}
                            onChange={(e) => handleFormChange('color', e.target.value)}
                            placeholder="e.g., Forest Green"
                            className="w-full border-2 border-wool-200 rounded-xl px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="form-label">Color Swatch</label>
                        <div className="grid grid-cols-6 gap-2">
                            {colorPalette.map((color) => (
                                <button
                                    key={color.hex}
                                    type="button"
                                    onClick={() => handleFormChange('colorHex', color.hex)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${yarnForm.colorHex === color.hex
                                        ? 'border-gray-800 scale-110'
                                        : 'border-gray-300 hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                        <div className="mt-2 text-sm text-wool-600">
                            Selected: {colorPalette.find(c => c.hex === yarnForm.colorHex)?.name || 'Custom'}
                        </div>
                    </div>

                    {/* Letter Assignment */}
                    <div>
                        <label className="form-label">Assign to Letter (Optional)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {/* None Button */}
                            <button
                                type="button"
                                onClick={() => handleFormChange('letter', '')}
                                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-center ${yarnForm.letter === ''
                                    ? 'border-sage-500 bg-sage-50 text-sage-700'
                                    : 'border-wool-200 hover:border-wool-300 text-wool-600'
                                    }`}
                            >
                                <div className="font-bold text-lg">—</div>
                                <div className="text-xs mt-1">None</div>
                            </button>

                            {/* Letter Buttons */}
                            {availableLetters.map(letter => {
                                const assignedYarn = existingYarns.find(y => y.letter === letter);
                                const isCurrentYarn = editingYarn && assignedYarn?.id === editingYarn.id;
                                const isSelected = yarnForm.letter === letter;
                                const isOccupied = assignedYarn && !isCurrentYarn;

                                return (
                                    <button
                                        key={letter}
                                        type="button"
                                        onClick={() => handleFormChange('letter', letter)}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all relative text-center ${isSelected
                                            ? 'border-sage-500 bg-sage-50 text-sage-700'
                                            : isOccupied
                                                ? 'border-wool-400 bg-wool-50 text-wool-800'
                                                : 'border-wool-200 hover:border-wool-300 text-wool-600 hover:bg-wool-25'
                                            }`}
                                    >
                                        <div className="font-bold text-lg">{letter}</div>
                                        <div className="text-xs mt-1">
                                            {isSelected ? 'Assign' : isOccupied ? 'In Use' : ''}
                                        </div>

                                        {/* Color dot */}
                                        {(assignedYarn || (isSelected && yarnForm.colorHex)) && (
                                            <div
                                                className="absolute top-1 right-1 w-3 h-3 rounded-full border border-gray-300"
                                                style={{
                                                    backgroundColor: isSelected && yarnForm.colorHex
                                                        ? yarnForm.colorHex
                                                        : (assignedYarn?.colorHex || '#f3f4f6')
                                                }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="text-xs text-wool-500 mt-2">
                            Letters help organize colors in your pattern instructions
                        </div>
                    </div>

                    {/* Number of Skeins (Optional) */}
                    {showSkeins && (
                        <div>
                            <label className="form-label">Number of Skeins</label>
                            <IncrementInput
                                value={yarnForm.skeins}
                                onChange={(value) => handleFormChange('skeins', value)}
                                min={1}
                                max={50}
                                label="skeins"
                                size="sm"
                            />
                        </div>
                    )}

                    {/* Conflict Preview */}
                    {conflictPreview && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="text-sm font-medium text-yellow-800 mb-1">Preview Changes:</div>
                            <div className="text-sm text-yellow-700 space-y-1">
                                <div>✅ {yarnForm.brand} {yarnForm.color} → Letter {yarnForm.letter}</div>
                                <div>⚠️ {conflictPreview.conflictYarn.brand} {conflictPreview.conflictYarn.color} → Unassigned</div>
                            </div>
                        </div>
                    )}
                </div>
            </StandardModal>

            {/* Unsaved Changes Warning */}
            <StandardModal
                isOpen={showUnsavedModal}
                onClose={() => setShowUnsavedModal(false)}
                onConfirm={handleConfirmClose}
                category="warning"
                colorScheme="red"
                title="Discard Changes?"
                subtitle="You have unsaved changes to this yarn"
                primaryButtonText="Discard Changes"
                secondaryButtonText="Keep Editing"
            >
                <p className="text-sm text-gray-700">
                    Are you sure you want to close without saving? Your yarn details will be lost.
                </p>
            </StandardModal>
        </>
    );
};

export default YarnManagerModal;