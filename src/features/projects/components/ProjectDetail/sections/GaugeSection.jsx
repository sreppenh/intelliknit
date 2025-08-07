import React, { useState, useEffect } from 'react';
import IncrementInput from '../../../../../shared/components/IncrementInput';
import IntelliKnitLogger from '../../../../../shared/utils/ConsoleLogging';

/**
 * ⚖️ GaugeSection - Technical Precision Showcase with Perfect Wizard Integration
 * 
 * Features:
 * - Beautiful conversational gauge display
 * - Increment button precision editing
 * - Dynamic needle integration + ability to add needles
 * - Smart defaults based on units (4" vs 10cm)
 * - Perfect wizard compatibility (maintains exact data structure)
 * - Technical precision with user-friendly UX
 */
const GaugeSection = ({
    project,
    formData,
    handleInputChange
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [tempGaugeData, setTempGaugeData] = useState({});

    // Get current gauge data
    const gauge = formData?.gauge || project?.gauge || {};
    const needles = formData?.needles || project?.needles || [];
    const defaultUnits = formData?.defaultUnits || project?.defaultUnits || 'inches';

    // Determine if section has content
    const hasContent = gauge?.stitchGauge?.stitches || gauge?.rowGauge?.rows;

    // Initialize temp gauge data when opening modal
    useEffect(() => {
        if (showEditModal) {
            // Force proper initialization with defaults
            setTempGaugeData({
                stitchGauge: {
                    stitches: gauge?.stitchGauge?.stitches || 18  // ✅ Default to 18!
                },
                rowGauge: {
                    rows: gauge?.rowGauge?.rows || 24  // ✅ Default to 24!
                },
                needleIndex: gauge?.needleIndex || 0,
                pattern: gauge?.pattern || 'stockinette',
                blockingNotes: gauge?.blockingNotes || gauge?.customPattern || ''
            });
        }
    }, [showEditModal]); // Remove gauge dependency to prevent loops

    // 🎨 Conversational Display Formatting
    const formatGaugeDisplay = () => {
        if (!hasContent) return null;

        const parts = [];
        const unit = defaultUnits === 'cm' ? 'cm' : '"';
        const standardDistance = defaultUnits === 'cm' ? '10' : '4';

        // Stitch gauge (required)
        if (gauge.stitchGauge?.stitches) {
            parts.push(`${gauge.stitchGauge.stitches} sts = ${standardDistance}${unit}`);
        }

        // Row gauge (optional)
        if (gauge.rowGauge?.rows) {
            parts.push(`${gauge.rowGauge.rows} rows = ${standardDistance}${unit}`);
        }

        let display = parts.join(' • ');

        // Pattern context
        if (gauge.pattern && gauge.pattern !== 'stockinette') {
            display += ` in ${gauge.pattern}`;
        } else if (gauge.pattern === 'stockinette') {
            display += ' in stockinette';
        }

        return display;
    };

    // Format needle display for dropdown and display
    const formatNeedleDisplay = (needle) => {
        if (typeof needle === 'string') {
            return needle;
        }
        return `${needle.size || 'Unknown'} ${needle.type || ''} ${needle.length || ''}`.trim();
    };

    // Get needle used for display
    const getNeedleUsedDisplay = () => {
        if (gauge?.needleIndex !== undefined && needles[gauge.needleIndex]) {
            return formatNeedleDisplay(needles[gauge.needleIndex]);
        }
        return null;
    };

    // 🔧 Self-sufficient gauge update handlers (same logic as useDetailsForm)
    const updateGaugeField = (field, value) => {
        const currentGauge = formData?.gauge || project?.gauge || {};

        const updatedGauge = {
            ...currentGauge,
            [field]: value,
            // Special handling for gaugeNotes -> blockingNotes (same as useDetailsForm)
            ...(field === 'gaugeNotes' && {
                blockingNotes: value,
                customPattern: ''
            })
        };

        handleInputChange('gauge', updatedGauge);
    };

    const updateGaugeMeasurement = (gaugeType, field, value) => {
        const currentGauge = formData?.gauge || project?.gauge || {};

        const updatedGauge = {
            ...currentGauge,
            [gaugeType]: {
                ...currentGauge?.[gaugeType],
                [field]: value
            }
        };

        handleInputChange('gauge', updatedGauge);
    };

    // 🔧 Modal Management Functions
    const handleEditClick = () => {
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        const standardMeasurement = defaultUnits === 'cm' ? '10' : '4';

        // Build complete gauge object in one go
        const updatedGauge = {
            ...gauge, // Keep existing gauge data
            stitchGauge: {
                ...gauge?.stitchGauge,
                stitches: tempGaugeData.stitchGauge?.stitches,
                measurement: standardMeasurement
            },
            rowGauge: {
                ...gauge?.rowGauge,
                rows: tempGaugeData.rowGauge?.rows,
                measurement: standardMeasurement
            },
            pattern: tempGaugeData.pattern,
            needleIndex: tempGaugeData.needleIndex,
            blockingNotes: tempGaugeData.blockingNotes,
            customPattern: '' // Clear this when we have blockingNotes
        };

        IntelliKnitLogger.debug('Gauge', 'Saving gauge data', updatedGauge);

        // Single state update
        handleInputChange('gauge', updatedGauge);
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

    // 🔧 Temp gauge form handlers - SIMPLIFIED AND FIXED
    const updateTempGaugeField = (category, field, value) => {
        setTempGaugeData(prev => {
            const newData = {
                ...prev,
                [category]: {
                    ...prev?.[category],
                    [field]: value
                }
            };
            return newData;
        });
    };
    const updateTempGaugeSimple = (field, value) => {
        setTempGaugeData(prev => {
            const updated = { ...prev, [field]: value };
            return updated;
        });
    };

    // Create needle options for dropdown
    const needleOptions = needles.map((needle, index) => ({
        value: index,
        label: formatNeedleDisplay(needle)
    }));

    // 📖 Read View - Conversational Display
    if (!showEditModal) {
        return (
            <div
                className="read-mode-section hover:bg-sage-25 active:scale-95 cursor-pointer transition-all duration-200"
                onClick={handleEditClick}
            >
                <div className="details-section-header">
                    <h3 className="section-header-secondary">⚖️ Gauge</h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>

                {hasContent ? (
                    <div className="text-sm text-wool-700 space-y-1 text-left">
                        <div>{formatGaugeDisplay()}</div>
                        {getNeedleUsedDisplay() && (
                            <div className="text-wool-500">Using {getNeedleUsedDisplay()}</div>
                        )}
                        {gauge?.blockingNotes && (
                            <div className="text-wool-500">{gauge.blockingNotes}</div>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-wool-500 italic">
                        + Add gauge information
                    </div>
                )}
            </div>
        );
    }

    // ✏️ Edit Modal Overlay - Technical Precision with Increment Buttons
    return (
        <>
            {/* Background section for read view */}
            <div className="read-mode-section">
                <div className="details-section-header">
                    <h3 className="section-header-secondary">⚖️ Gauge</h3>
                    <button
                        onClick={handleEditClick}
                        className="details-edit-button"
                        title="Edit gauge"
                    >
                        ✏️
                    </button>
                </div>

                {hasContent ? (
                    <div className="text-sm text-wool-700 space-y-1 text-left">
                        <div>{formatGaugeDisplay()}</div>
                        {getNeedleUsedDisplay() && (
                            <div className="text-wool-500">Using {getNeedleUsedDisplay()}</div>
                        )}
                        {gauge?.blockingNotes && (
                            <div className="text-wool-500">{gauge.blockingNotes}</div>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-wool-500 italic">
                        + Add gauge information
                    </div>
                )}
            </div>

            {/* 🎭 Modal Overlay */}
            <div className="modal-overlay" onClick={handleBackdropClick}>
                <div className="modal-content-light" style={{ maxWidth: '500px' }}>
                    {/* 📋 Modal Header */}
                    <div className="modal-header-light relative flex items-center justify-center py-4 px-6 rounded-t-2xl bg-sage-200">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold">⚖️ Gauge</h2>
                            <p className="text-sage-600 text-sm">Set your knitting gauge</p>
                        </div>

                        <button
                            onClick={handleCancelEdit}  // Replace with your close handler
                            className="absolute right-5 text-sage-600 text-2xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>

                    {/* 📝 Modal Content */}
                    <div className="p-6">
                        <div className="space-y-5">

                            {/* Pattern */}
                            <div>
                                <label className="form-label">Pattern</label>
                                <select
                                    value={tempGaugeData.pattern || 'stockinette'}
                                    onChange={(e) => updateTempGaugeSimple('pattern', e.target.value)}
                                    className="w-full details-input-field"
                                >
                                    <option value="stockinette">Stockinette</option>
                                    <option value="ribbing">Ribbing</option>
                                    <option value="seed">Seed Stitch</option>
                                    <option value="garter">Garter</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>

                            {/* Stitch Gauge - FIXED FORMAT */}
                            <div>
                                <label className="form-label">Stitch Gauge</label>
                                <div className="flex gap-2 items-center">
                                    <IncrementInput
                                        value={tempGaugeData.stitchGauge?.stitches ? parseFloat(tempGaugeData.stitchGauge.stitches) : 18}
                                        onChange={(value) => {
                                            updateTempGaugeField('stitchGauge', 'stitches', value);
                                        }}
                                        min={1}
                                        max={50}
                                        step={0.5}
                                        label="stitches"
                                        size="sm"
                                    />
                                    <span className="text-sm text-wool-600">
                                        stitches in {defaultUnits === 'cm' ? '10 cm' : '4 inches'}
                                    </span>
                                </div>
                            </div>

                            {/* Row Gauge - FIXED FORMAT */}
                            <div>
                                <label className="form-label">Row Gauge</label>
                                <div className="flex gap-2 items-center">
                                    <IncrementInput
                                        value={tempGaugeData.rowGauge?.rows ? parseFloat(tempGaugeData.rowGauge.rows) : 24}
                                        onChange={(value) => updateTempGaugeField('rowGauge', 'rows', value)}
                                        min={1}
                                        max={100}
                                        step={0.5}
                                        label="rows"
                                        size="sm"
                                    />
                                    <span className="text-sm text-wool-600">
                                        rows in {defaultUnits === 'cm' ? '10 cm' : '4 inches'}
                                    </span>
                                </div>
                            </div>

                            {/* Needle Used - MOBILE DROPDOWN FIX */}
                            <div>
                                <label className="form-label">Needle Used</label>
                                <div
                                    className="w-full details-input-field cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                >
                                    <select
                                        value={tempGaugeData.needleIndex || 0}
                                        onChange={(e) => updateTempGaugeSimple('needleIndex', parseInt(e.target.value))}
                                        className="w-full bg-transparent border-none outline-none cursor-pointer"
                                        style={{ fontSize: '16px' }}
                                    >
                                        {needleOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {needles.length === 0 && (
                                    <p className="text-sm text-wool-500 mt-1">
                                        No needles added yet. Add needles in the Needles section first.
                                    </p>
                                )}
                            </div>

                            {/* Gauge Notes */}
                            <div>
                                <label className="form-label">Gauge Notes</label>
                                <input
                                    type="text"
                                    value={tempGaugeData.blockingNotes || ''}
                                    onChange={(e) => updateTempGaugeSimple('blockingNotes', e.target.value)}
                                    placeholder="e.g., after wet blocking, custom stitch pattern details..."
                                    className="w-full details-input-field"
                                />
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

export default GaugeSection;