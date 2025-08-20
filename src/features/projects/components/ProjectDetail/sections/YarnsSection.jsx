import React, { useState, useEffect } from 'react';
import IncrementInput from '../../../../../shared/components/IncrementInput';
import { StandardModal } from '../../../../../shared/components/modals/StandardModal';

/**
 * 🧶 YarnsSection - Restored Working Overlay
 * 
 * Back to the original beautiful functional overlay with fixed styling
 */
const YarnsSection = ({
    project,
    formData,
    handleInputChange
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [tempYarns, setTempYarns] = useState([]);
    const [newYarn, setNewYarn] = useState({
        name: '',
        colors: [{ color: '', skeins: '1' }]
    });


    // Get current yarns data
    const yarns = formData?.yarns || project?.yarns || [];

    // Determine if section has content
    const hasContent = yarns.length > 0;

    // Initialize temp yarns when opening modal
    useEffect(() => {
        if (showEditModal) {
            setTempYarns([...yarns]);
            setNewYarn({
                name: '',
                colors: [{ color: '', skeins: '1' }]
            });
        }
    }, [showEditModal]);

    // Modal Management Functions
    const handleEditClick = () => {
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        let finalYarns = [...tempYarns];

        // ✅ FIXED: Always add the current newYarn if it has content
        if (newYarn.name && newYarn.name.trim()) {
            const yarnToAdd = {
                name: newYarn.name.trim(),
                // ✅ FIXED: Don't filter colors here - include all with color names
                colors: newYarn.colors.filter(c => c.color && c.color.trim()).map(c => ({
                    color: c.color.trim(),
                    skeins: c.skeins || '' // Keep empty string if no skeins specified
                }))
            };
            finalYarns = [...tempYarns, yarnToAdd];
        }

        handleInputChange('yarns', finalYarns);
        setShowEditModal(false);
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
    };

    // Handle ESC key and backdrop click
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showEditModal) {
                handleCancelEdit();
            }
        };

        if (showEditModal) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showEditModal]);

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            handleCancelEdit();
        }
    };

    // Remove yarn from temp state
    const removeTempYarn = (index) => {
        setTempYarns(prev => prev.filter((_, i) => i !== index));
    };

    // Add yarn to temp state
    const addTempYarn = () => {
        if (newYarn.name && newYarn.name.trim()) {
            const yarnToAdd = {
                name: newYarn.name.trim(),
                colors: newYarn.colors.filter(c => c.color && c.color.trim())
            };

            setTempYarns(prev => [...prev, yarnToAdd]);
            setNewYarn({
                name: '',
                colors: [{ color: '', skeins: '1' }]
            });
        }
    };

    // New yarn form handlers
    const updateNewYarn = (field, value) => {
        setNewYarn(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Color management within new yarn
    const updateNewYarnColor = (colorIndex, field, value) => {
        setNewYarn(prev => ({
            ...prev,
            colors: prev.colors.map((color, index) =>
                index === colorIndex ? { ...color, [field]: value } : color
            )
        }));
    };

    const addNewYarnColor = () => {
        setNewYarn(prev => ({
            ...prev,
            colors: [...prev.colors, { color: '', skeins: '' }]
        }));
    };

    const removeNewYarnColor = (colorIndex) => {
        setNewYarn(prev => ({
            ...prev,
            colors: prev.colors.filter((_, index) => index !== colorIndex)
        }));
    };

    // Validation for add button
    const canAddYarn = newYarn.name && newYarn.name.trim();

    // Read View - Conversational Display
    if (!showEditModal) {
        return (
            <div
                className="read-mode-section hover:bg-sage-25 active:scale-95 cursor-pointer transition-all duration-200"
                onClick={handleEditClick}
            >
                <div className="details-section-header">
                    <h3 className="section-header-secondary">🧶 Yarns</h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>

                {hasContent ? (
                    <div className="text-sm text-wool-700 space-y-1 text-left">
                        {yarns.map((yarn, yarnIndex) => {
                            if (yarn.colors && yarn.colors.length > 0) {
                                return yarn.colors
                                    .filter(c => c.color && c.color.trim())
                                    .map((color, colorIndex) => {

                                        const skeinText = color.skeins && color.skeins.trim() !== ''
                                            ? ` (${color.skeins} ${parseInt(color.skeins) === 1 ? 'skein' : 'skeins'})`
                                            : '';

                                        return (
                                            <div key={`${yarnIndex}-${colorIndex}`}>
                                                • {yarn.name}: <span className="text-wool-500">{color.color}{skeinText}</span>
                                            </div>
                                        );
                                    });
                            } else {
                                return (
                                    <div key={yarnIndex}>
                                        • <span className="text-wool-500">{yarn.name}</span>
                                    </div>
                                );
                            }
                        })}
                    </div>
                ) : (
                    <div className="text-sm text-wool-500 italic">
                        + Add yarn information
                    </div>
                )}
            </div>
        );
    }

    // Edit Modal - Live Preview Multi-Add with Nested Colors
    return (
        <>
            {/* Background section for read view */}
            <div className="read-mode-section">
                <div className="details-section-header">
                    <h3 className="section-header-secondary">🧶 Yarns</h3>
                    <button
                        onClick={handleEditClick}
                        className="details-edit-button"
                        title="Edit yarns"
                    >
                        ✏️
                    </button>
                </div>

                {hasContent ? (
                    <div className="text-sm text-wool-700 space-y-1 text-left">
                        {yarns.map((yarn, index) => {
                            if (yarn.colors && yarn.colors.length > 0) {
                                const colorTexts = yarn.colors
                                    .filter(c => c.color && c.color.trim())
                                    .map(c => {
                                        // ✅ FIXED: Same logic for consistent display
                                        const skeinText = c.skeins && c.skeins.trim() !== ''
                                            ? ` (${c.skeins} ${parseInt(c.skeins) === 1 ? 'skein' : 'skeins'})`
                                            : '';
                                        return c.color + skeinText;
                                    });

                                return (
                                    <div key={index} className="py-1">
                                        {yarn.name}{colorTexts.length > 0 ? ' - ' + colorTexts.join(', ') : ''}
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={index} className="py-1">
                                        {yarn.name}
                                    </div>
                                );
                            }
                        })}
                    </div>
                ) : (
                    <div className="text-sm text-wool-500 italic">
                        + Add yarn information
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
                title="🧶 Yarns"
                subtitle="Manage your project yarns"
                showButtons={false}
            >

                {/* Modal Content - EXACT SAME as before */}
                <div>

                    {/* Current Yarns - Live Preview with Delete */}
                    {tempYarns.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-wool-700 mb-3">Current Yarns</h4>
                            <div className="space-y-2">
                                {tempYarns.map((yarn, yarnIndex) => {
                                    if (yarn.colors && yarn.colors.length > 0) {
                                        return yarn.colors
                                            .filter(c => c.color && c.color.trim())
                                            .map((color, colorIndex) => (
                                                <div key={`${yarnIndex}-${colorIndex}`} className="flex items-center justify-between py-2 px-3 bg-wool-50 rounded-lg border border-wool-200">
                                                    <span className="text-sm text-wool-700">
                                                        {yarn.name}: {color.color}{color.skeins && color.skeins.trim() ? ` (${color.skeins} skeins)` : ''}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updatedYarns = tempYarns.map((y, yi) => {
                                                                if (yi === yarnIndex) {
                                                                    const updatedColors = y.colors.filter((_, ci) => ci !== colorIndex);
                                                                    return updatedColors.length > 0 ? { ...y, colors: updatedColors } : null;
                                                                }
                                                                return y;
                                                            }).filter(Boolean);
                                                            setTempYarns(updatedYarns);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            ));
                                    } else {
                                        return (
                                            <div key={yarnIndex} className="flex items-center justify-between py-2 px-3 bg-wool-50 rounded-lg border border-wool-200">
                                                <span className="text-sm text-wool-700">
                                                    {yarn.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTempYarn(yarnIndex)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    )}

                    {/* Add New Yarn Section */}
                    <div className={`${tempYarns.length > 0 ? 'border-t border-wool-200 pt-6' : ''}`}>

                        <div className="space-y-4">
                            {/* Yarn Name Input */}
                            <div>
                                <label className="form-label">Yarn Name</label>
                                <input
                                    type="text"
                                    value={newYarn.name}
                                    onChange={(e) => updateNewYarn('name', e.target.value)}
                                    placeholder="e.g., Cascade 220 Wool"
                                    className="w-full details-input-field"
                                />
                            </div>

                            {/* Colors Section */}
                            <div>
                                <label className="form-label">Colors & Skeins</label>
                                <div className="space-y-2">
                                    {newYarn.colors.map((color, colorIndex) => (
                                        <div key={colorIndex} className="space-y-2">
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={color.color}
                                                    onChange={(e) => updateNewYarnColor(colorIndex, 'color', e.target.value)}
                                                    placeholder="Color name"
                                                    className="flex-1 details-input-field text-sm"
                                                />
                                                {newYarn.colors.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewYarnColor(colorIndex)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                                                    >
                                                        ❌
                                                    </button>
                                                )}
                                            </div>

                                            <div className="ml-4">
                                                <IncrementInput
                                                    value={parseInt(color.skeins) || 0}
                                                    onChange={(value) => updateNewYarnColor(colorIndex, 'skeins', value.toString())}
                                                    min={1}
                                                    max={50}
                                                    label="skeins"
                                                    size="sm"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addNewYarnColor}
                                        className="text-sm text-sage-600 hover:text-sage-700 font-medium"
                                    >
                                        + Add Another Color
                                    </button>
                                </div>
                            </div>

                            {/* Add Another Yarn Button */}
                            <button
                                onClick={addTempYarn}
                                disabled={!canAddYarn}
                                className="w-full btn-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                + Add Another Yarn
                            </button>
                        </div>
                    </div>

                    {/* Action buttons back inside content */}
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
                </div>
            </StandardModal>
        </>
    );
};

export default YarnsSection;