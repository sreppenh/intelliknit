import React, { useState, useEffect } from 'react';
import IncrementInput from '../../../../../shared/components/IncrementInput';

/**
 * 🧶 YarnsSection - Ultimate Complex Array Management Pattern
 * 
 * Features:
 * - Complex nested yarn + colors management
 * - Live preview workspace with multi-add workflow
 * - Beautiful conversational display: "Cascade 220 Wool - Heather Grey (3 skeins), Charcoal (2 skeins)"
 * - One-by-one color addition pattern (like needles)
 * - Auto-save pending yarn data
 * - Perfect modal standards compliance
 */
const YarnsSection = ({
    project,
    formData,
    handleInputChange
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [tempYarns, setTempYarns] = useState([]); // Live preview state
    const [newYarn, setNewYarn] = useState({
        name: '',
        colors: [{ color: '', skeins: '' }]
    });

    // Get current yarns data
    const yarns = formData?.yarns || project?.yarns || [];

    // Determine if section has content
    const hasContent = yarns.length > 0;

    // Initialize temp yarns when opening modal
    useEffect(() => {
        if (showEditModal) {
            setTempYarns([...yarns]); // Copy current yarns for live editing
            setNewYarn({
                name: '',
                colors: [{ color: '', skeins: '' }]
            });
        }
    }, [showEditModal]); // REMOVE yarns from dependency - that's causing the loop

    // 🎨 Conversational Display Formatting
    const formatYarnDisplay = (yarn) => {
        if (!yarn.name) return 'Unknown yarn';

        let display = yarn.name;

        if (yarn.colors && yarn.colors.length > 0) {
            const colorStrings = yarn.colors
                .filter(c => c.color && c.color.trim())
                .map(c => {
                    let colorStr = c.color;
                    if (c.skeins && c.skeins.trim()) {
                        colorStr += ` (${c.skeins} skeins)`;
                    }
                    return colorStr;
                });

            if (colorStrings.length > 0) {
                display += ' - ' + colorStrings.join(', ');
            }
        }

        return display;
    };

    // 🔧 Modal Management Functions
    const handleEditClick = () => {
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        // Auto-add any pending yarn data before saving
        let finalYarns = [...tempYarns];

        // If user has entered yarn info but hasn't clicked "Add Another Yarn", add it automatically
        if (newYarn.name && newYarn.name.trim()) {
            const yarnToAdd = {
                name: newYarn.name.trim(),
                colors: newYarn.colors.filter(c => c.color && c.color.trim())
            };
            finalYarns = [...tempYarns, yarnToAdd];
        }

        // Save the complete yarns array
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

    // 🗑️ Remove yarn from temp state (live preview)
    const removeTempYarn = (index) => {
        setTempYarns(prev => prev.filter((_, i) => i !== index));
    };

    // ➕ Add yarn to temp state (live preview)
    const addTempYarn = () => {
        if (newYarn.name && newYarn.name.trim()) {
            const yarnToAdd = {
                name: newYarn.name.trim(),
                colors: newYarn.colors.filter(c => c.color && c.color.trim())
            };

            setTempYarns(prev => [...prev, yarnToAdd]);
            setNewYarn({
                name: '',
                colors: [{ color: '', skeins: '' }]
            }); // Clear form for next yarn
        }
    };

    // 🔧 New yarn form handlers
    const updateNewYarn = (field, value) => {
        setNewYarn(prev => {
            // Ensure we always have a valid object
            const current = prev || { name: '', colors: [{ color: '', skeins: '' }] };
            return {
                name: '',
                colors: [{ color: '', skeins: '' }],
                ...current,
                [field]: value
            };
        });
    };

    // 🎨 Color management within new yarn
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

    // Check if there are any changes to save
    const hasChanges = JSON.stringify(tempYarns) !== JSON.stringify(yarns);

    // 📖 Read View - Conversational Display
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
                            // If yarn has colors, show each yarn-color combo as separate line
                            if (yarn.colors && yarn.colors.length > 0) {
                                return yarn.colors
                                    .filter(c => c.color && c.color.trim())
                                    .map((color, colorIndex) => (
                                        <div key={`${yarnIndex}-${colorIndex}`}>
                                            • {yarn.name}: <span className="text-wool-500">{color.color}{color.skeins && color.skeins.trim() ? ` (${color.skeins} skeins)` : ''}</span>
                                        </div>
                                    ));
                            } else {
                                // Yarn with no colors - show just the yarn name
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

    // ✏️ Edit Modal Overlay - Live Preview Multi-Add with Nested Colors
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
                        {yarns.map((yarn, index) => (
                            <div key={index} className="py-1">
                                {formatYarnDisplay(yarn)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-wool-500 italic">
                        + Add yarn information
                    </div>
                )}
            </div>

            {/* 🎭 Modal Overlay */}
            <div className="modal-overlay" onClick={handleBackdropClick}>
                <div className="modal-content-light max-h-[90vh] overflow-y-auto" style={{ maxWidth: '500px' }}>

                    {/* 📋 Modal Header */}
                    <div className="modal-header-light">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold">🧶 Yarns</h2>
                            <p className="text-sage-600 text-sm">Manage your project yarns</p>
                        </div>
                    </div>

                    {/* 📝 Modal Content */}
                    <div className="p-6">

                        {/* Current Yarns - Live Preview with Delete */}
                        {tempYarns.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-wool-700 mb-3">Current Yarns</h4>
                                <div className="space-y-2">
                                    {tempYarns.map((yarn, yarnIndex) => {
                                        // If yarn has colors, show each yarn-color combo as separate line
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
                                                                // Remove this specific yarn-color combination
                                                                const updatedYarns = tempYarns.map((y, yi) => {
                                                                    if (yi === yarnIndex) {
                                                                        const updatedColors = y.colors.filter((_, ci) => ci !== colorIndex);
                                                                        // If no colors left, remove the yarn entirely
                                                                        return updatedColors.length > 0 ? { ...y, colors: updatedColors } : null;
                                                                    }
                                                                    return y;
                                                                }).filter(Boolean); // Remove null entries
                                                                setTempYarns(updatedYarns);
                                                            }}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                                                            title="Remove this yarn-color combination"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ));
                                        } else {
                                            // Yarn with no colors - show just the yarn name
                                            return (
                                                <div key={yarnIndex} className="flex items-center justify-between py-2 px-3 bg-wool-50 rounded-lg border border-wool-200">
                                                    <span className="text-sm text-wool-700">
                                                        {yarn.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTempYarn(yarnIndex)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                                                        title="Remove this yarn"
                                                    >
                                                        ✕
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
                            <h4 className="text-sm font-medium text-wool-700 mb-3">Add New Yarn</h4>

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
                                                {/* Color name input */}
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
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Skeins input below */}
                                                <div className="ml-4">
                                                    <IncrementInput
                                                        value={parseInt(color.skeins) || 0}
                                                        onChange={(value) => updateNewYarnColor(colorIndex, 'skeins', value.toString())}
                                                        min={0}
                                                        max={50}
                                                        label="skeins"
                                                        size="sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Another Color Button */}
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

                        {/* 🎯 Modal Actions */}
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
                </div>
            </div>
        </>
    );
};

export default YarnsSection;