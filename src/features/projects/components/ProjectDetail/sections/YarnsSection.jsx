import React, { useState, useEffect } from 'react';
import IncrementInput from '../../../../../shared/components/IncrementInput';
import { StandardModal } from '../../../../../shared/components/modals/StandardModal';

/**
 * 🧶 YarnsSection - FIXED VERSION with working interactions
 */
const YarnsSection = ({
    project,
    formData,
    handleInputChange
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [tempYarns, setTempYarns] = useState([]);
    const [tempColorCount, setTempColorCount] = useState(2);
    const [tempColorMapping, setTempColorMapping] = useState({});
    const [newYarn, setNewYarn] = useState({
        name: '',
        colors: [{ color: '', skeins: '1' }]
    });

    // Get current data with proper fallbacks
    const yarns = formData?.yarns || project?.yarns || [];
    const colorCount = formData?.colorCount || project?.colorCount || 2;
    const colorMapping = formData?.colorMapping || project?.colorMapping || {};

    // Determine if section has content
    const hasContent = yarns.length > 0 || colorCount > 2 || Object.keys(colorMapping).length > 0;

    // ✅ FIX: Only initialize temp data once when modal opens, ignore prop changes during editing
    useEffect(() => {
        if (showEditModal) {
            console.log('🔧 Initializing modal with:', { yarns, colorCount, colorMapping });
            setTempYarns([...yarns]);
            setTempColorCount(colorCount);
            setTempColorMapping({ ...colorMapping });
            setNewYarn({
                name: '',
                colors: [{ color: '', skeins: '1' }]
            });
        }
        // ✅ CRITICAL: Remove dependencies to prevent resets during editing
    }, [showEditModal]); // Only depend on modal open/close, not the data

    // Modal Management Functions
    const handleEditClick = () => {
        console.log('🎯 Opening yarn edit modal');
        // ✅ FIX: Initialize temp state here to avoid dependency issues
        setTempYarns([...yarns]);
        setTempColorCount(colorCount);
        setTempColorMapping({ ...colorMapping });
        setNewYarn({
            name: '',
            colors: [{ color: '', skeins: '1' }]
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        console.log('💾 Saving yarn changes:', { tempYarns, tempColorCount, tempColorMapping });

        let finalYarns = [...tempYarns];

        // Add the current newYarn if it has content
        if (newYarn.name && newYarn.name.trim()) {
            const yarnToAdd = {
                name: newYarn.name.trim(),
                colors: newYarn.colors.filter(c => c.color && c.color.trim()).map(c => ({
                    color: c.color.trim(),
                    skeins: c.skeins || ''
                }))
            };
            finalYarns = [...tempYarns, yarnToAdd];
        }

        // ✅ FIX: Use the original handleInputChange pattern
        handleInputChange('yarns', finalYarns);
        handleInputChange('colorCount', tempColorCount);
        handleInputChange('colorMapping', tempColorMapping);

        setShowEditModal(false);
    };

    const handleCancelEdit = () => {
        console.log('❌ Canceling yarn edit');
        setShowEditModal(false);
    };

    // ✅ FIX: Color count handler with proper logging
    const handleColorCountChange = (newCount) => {
        console.log('🎨 Changing color count from', tempColorCount, 'to', newCount);
        setTempColorCount(newCount);
    };

    // ✅ FIX: Remove yarn with proper index handling
    const removeTempYarn = (yarnIndex, colorIndex = null) => {
        console.log('🗑️ Removing yarn:', yarnIndex, 'color:', colorIndex);

        if (colorIndex !== null) {
            // Remove specific color from yarn
            const updatedYarns = tempYarns.map((yarn, yi) => {
                if (yi === yarnIndex) {
                    const updatedColors = yarn.colors.filter((_, ci) => ci !== colorIndex);
                    return updatedColors.length > 0 ? { ...yarn, colors: updatedColors } : null;
                }
                return yarn;
            }).filter(Boolean);
            setTempYarns(updatedYarns);
        } else {
            // Remove entire yarn
            setTempYarns(prev => prev.filter((_, i) => i !== yarnIndex));
        }
    };

    // ✅ FIX: Add yarn handler
    const addTempYarn = (e) => {
        e.preventDefault();
        console.log('➕ Adding yarn:', newYarn);

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
            colors: [...prev.colors, { color: '', skeins: '1' }]
        }));
    };

    const removeNewYarnColor = (colorIndex) => {
        if (newYarn.colors.length > 1) {
            setNewYarn(prev => ({
                ...prev,
                colors: prev.colors.filter((_, index) => index !== colorIndex)
            }));
        }
    };

    // ✅ FIX: Color mapping handlers with proper logging
    const updateColorMapping = (letter, yarnColor) => {
        console.log('🔤 Mapping color', letter, 'to', yarnColor);
        setTempColorMapping(prev => ({
            ...prev,
            [letter]: yarnColor
        }));
    };

    const removeColorMapping = (letter) => {
        console.log('🗑️ Removing color mapping for', letter);
        setTempColorMapping(prev => {
            const newMapping = { ...prev };
            delete newMapping[letter];
            return newMapping;
        });
    };

    // Get all available yarn colors for mapping
    const getAllYarnColors = () => {
        const allColors = [];
        tempYarns.forEach(yarn => {
            if (yarn.colors && yarn.colors.length > 0) {
                yarn.colors.forEach(color => {
                    if (color.color && color.color.trim()) {
                        allColors.push(`${yarn.name} - ${color.color}`);
                    }
                });
            } else if (yarn.name) {
                allColors.push(yarn.name);
            }
        });
        return allColors;
    };

    // Generate letter array based on color count
    const getColorLetters = () => {
        return Array.from({ length: tempColorCount }, (_, i) => String.fromCharCode(65 + i));
    };

    // Validation for add button
    const canAddYarn = newYarn.name && newYarn.name.trim();

    // ✅ FIX: Read View - Left aligned, proper spacing
    if (!showEditModal) {
        return (
            <div
                className="read-mode-section hover:bg-sage-25 active:scale-95 cursor-pointer transition-all duration-200"
                onClick={handleEditClick}
            >
                <div className="details-section-header">
                    <h3 className="section-header-secondary">🧶 Yarns & Colors</h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>

                <div className="space-y-3 text-left">
                    {/* Color Count */}
                    <div className="text-sm text-wool-700">
                        <strong>Colors in project:</strong> {colorCount}
                    </div>

                    {/* Color Mapping */}
                    {Object.keys(colorMapping).length > 0 && (
                        <div className="text-sm text-wool-700">
                            <strong>Color mapping:</strong>
                            <div className="ml-4 mt-1 space-y-1">
                                {Object.entries(colorMapping).map(([letter, yarnColor]) => (
                                    <div key={letter}>• Color {letter} = {yarnColor}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Yarn Details */}
                    {yarns.length > 0 ? (
                        <div className="text-sm text-wool-700">
                            <strong>Yarn details:</strong>
                            <div className="ml-4 mt-1 space-y-1">
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
                        </div>
                    ) : (
                        <div className="text-sm text-wool-500 italic">
                            + Add yarn details
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ✅ FIX: Edit Modal - Left aligned, working interactions
    return (
        <>
            {/* Background section for read view */}
            <div className="read-mode-section">
                <div className="details-section-header">
                    <h3 className="section-header-secondary">🧶 Yarns & Colors</h3>
                    <button
                        onClick={handleEditClick}
                        className="details-edit-button"
                        title="Edit yarns and colors"
                    >
                        ✏️
                    </button>
                </div>
                <div className="text-sm text-wool-500 italic">
                    {hasContent ? 'Click to edit' : '+ Add yarn and color information'}
                </div>
            </div>

            <StandardModal
                isOpen={showEditModal}
                onClose={handleCancelEdit}
                onConfirm={handleSaveEdit}
                category="complex"
                colorScheme="sage"
                title="🧶 Yarns & Colors"
                subtitle="Manage yarns and color mapping"
                showButtons={false}
            >
                {/* ✅ FIX: Left-aligned container */}
                <div className="text-left space-y-6">
                    {/* ✅ FIX: Color Count Section with working IncrementInput */}
                    <div>
                        <label className="form-label">Colors in Project</label>
                        <IncrementInput
                            value={tempColorCount}
                            onChange={handleColorCountChange}
                            label="colors in this project"
                            unit="colors"
                            min={1}
                            max={12}
                            size="default"
                        />
                        <div className="form-help">
                            How many different colors will this project use?
                        </div>
                    </div>

                    {/* ✅ FIX: Color Mapping Section with debugging */}
                    {tempColorCount > 0 && (
                        <div>
                            <label className="form-label">Color Mapping (Optional)</label>
                            <div className="space-y-3">
                                {getColorLetters().map(letter => {
                                    const availableColors = getAllYarnColors();
                                    const currentMapping = tempColorMapping[letter] || '';

                                    console.log(`🔤 Letter ${letter}:`, { currentMapping, availableColors: availableColors.length });

                                    return (
                                        <div key={letter} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sm font-bold text-sage-700 flex-shrink-0">
                                                {letter}
                                            </div>
                                            <span className="text-sm text-wool-600 flex-shrink-0">=</span>
                                            <select
                                                value={currentMapping}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    console.log(`🔄 Mapping ${letter} to:`, value);
                                                    if (value) {
                                                        updateColorMapping(letter, value);
                                                    } else {
                                                        removeColorMapping(letter);
                                                    }
                                                }}
                                                className="flex-1 border-2 border-wool-200 rounded-xl px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white min-w-0"
                                                style={{
                                                    minHeight: '40px',
                                                    fontSize: '14px',
                                                    lineHeight: '1.2'
                                                }}
                                            >
                                                <option value="">Choose color for {letter}...</option>
                                                {availableColors.map((color, index) => (
                                                    <option key={`${letter}-${index}`} value={color}>
                                                        {color}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="form-help">
                                Map color letters (A, B, C...) to specific yarns for stripe patterns
                            </div>

                            {/* ✅ DEBUG: Show current mapping state */}
                            <div className="text-xs text-wool-400 mt-2 font-mono">
                                Debug: {JSON.stringify(tempColorMapping)}
                            </div>
                        </div>
                    )}

                    {/* ✅ FIX: Current Yarns Section with working delete buttons */}
                    {tempYarns.length > 0 && (
                        <div>
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
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            removeTempYarn(yarnIndex, colorIndex);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors flex-shrink-0"
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        removeTempYarn(yarnIndex);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors flex-shrink-0"
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

                    {/* ✅ FIX: Add New Yarn Section */}
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
                                    className="w-full border-2 border-wool-200 rounded-xl px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
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
                                                    className="flex-1 border-2 border-wool-200 rounded-xl px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                                                />
                                                {newYarn.colors.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            removeNewYarnColor(colorIndex);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors flex-shrink-0"
                                                    >
                                                        ❌
                                                    </button>
                                                )}
                                            </div>

                                            <div className="ml-4">
                                                <IncrementInput
                                                    value={parseInt(color.skeins) || 1}
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

                            {/* ✅ FIX: Add Another Yarn Button */}
                            <button
                                type="button"
                                onClick={addTempYarn}
                                disabled={!canAddYarn}
                                className="w-full btn-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                + Add Another Yarn
                            </button>
                        </div>
                    </div>

                    {/* ✅ FIX: Action buttons */}
                    <div className="flex gap-3 pt-4 border-t border-wool-200">
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