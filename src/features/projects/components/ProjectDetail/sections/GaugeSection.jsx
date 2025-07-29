import React, { useState, useEffect } from 'react';
import IncrementInput from '../../../../../shared/components/IncrementInput';

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
            // Smart defaults based on units
            const defaultMeasurement = defaultUnits === 'cm' ? '10' : '4';

            // Force proper initialization with defaults
            setTempGaugeData({
                stitchGauge: {
                    stitches: gauge?.stitchGauge?.stitches || '',
                    measurement: gauge?.stitchGauge?.measurement || defaultMeasurement
                },
                rowGauge: {
                    rows: gauge?.rowGauge?.rows || '',
                    measurement: gauge?.rowGauge?.measurement || defaultMeasurement
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

        // Stitch gauge (required)
        if (gauge.stitchGauge?.stitches && gauge.stitchGauge?.measurement) {
            parts.push(`${gauge.stitchGauge.stitches} sts = ${gauge.stitchGauge.measurement}${unit}`);
        }

        // Row gauge (optional)
        if (gauge.rowGauge?.rows && gauge.rowGauge?.measurement) {
            parts.push(`${gauge.rowGauge.rows} rows = ${gauge.rowGauge.measurement}${unit}`);
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

    // 🔧 Modal Management Functions
    const handleEditClick = () => {
        setShowEditModal(true);
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

    const handleSaveEdit = () => {
        // Update each field using our self-sufficient handlers
        // Hardcode measurements to standard values
        const standardMeasurement = defaultUnits === 'cm' ? '10' : '4';

        updateGaugeField('pattern', tempGaugeData.pattern);
        updateGaugeField('needleIndex', tempGaugeData.needleIndex);
        updateGaugeField('gaugeNotes', tempGaugeData.blockingNotes);

        // Update measurements with hardcoded standard distances
        updateGaugeMeasurement('stitchGauge', 'stitches', tempGaugeData.stitchGauge.stitches);
        updateGaugeMeasurement('stitchGauge', 'measurement', standardMeasurement);
        updateGaugeMeasurement('rowGauge', 'rows', tempGaugeData.rowGauge.rows);
        updateGaugeMeasurement('rowGauge', 'measurement', standardMeasurement);

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
        console.log('Updating gauge field:', category, field, 'to:', value);
        setTempGaugeData(prev => {
            const updated = {
                ...prev,
                [category]: {
                    ...prev[category],
                    [field]: value
                }
            };
            console.log('New temp gauge data:', updated);
            return updated;
        });
    };

    const updateTempGaugeSimple = (field, value) => {
        console.log('Updating simple gauge field:', field, 'to:', value);
        setTempGaugeData(prev => ({
            ...prev,
            [field]: value
        }));
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
                        <div className="text-xs text-red-500">DEBUG: Units = {defaultUnits}</div>
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
                    <div className="modal-header-light">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold">⚖️ Gauge</h2>
                            <p className="text-sage-600 text-sm">Set your knitting gauge</p>
                        </div>
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

                            {/* Stitch Gauge */}
                            <div>
                                <label className="form-label">Stitch Gauge</label>
                                <div className="flex gap-3 items-center">
                                    <IncrementInput
                                        value={parseInt(tempGaugeData.stitchGauge?.stitches) || 0}
                                        onChange={(value) => updateTempGaugeField('stitchGauge', 'stitches', value.toString())}
                                        min={1}
                                        max={50}
                                        label="stitches"
                                        size="sm"
                                    />
                                    <span className="text-sm text-wool-600">sts =</span>
                                    <IncrementInput
                                        value={tempGaugeData.stitchGauge?.measurement ? parseFloat(tempGaugeData.stitchGauge.measurement) : (defaultUnits === 'cm' ? 10 : 4)}
                                        onChange={(value) => {
                                            console.log('Current tempGaugeData:', tempGaugeData);
                                            console.log('Current measurement in state:', tempGaugeData.stitchGauge?.measurement);
                                            console.log('Parsed value passed to input:', tempGaugeData.stitchGauge?.measurement ? parseFloat(tempGaugeData.stitchGauge.measurement) : (defaultUnits === 'cm' ? 10 : 4));
                                            console.log('NEW value from increment:', value);
                                            updateTempGaugeField('stitchGauge', 'measurement', value.toString());
                                        }}
                                        min={0.5}
                                        max={20}
                                        step={0.5}
                                        label={defaultUnits === 'cm' ? 'cm' : 'inches'}
                                        size="sm"
                                    />
                                </div>
                            </div>

                            {/* Row Gauge */}
                            <div>
                                <label className="form-label">Row Gauge</label>
                                <div className="flex gap-3 items-center">
                                    <IncrementInput
                                        value={parseInt(tempGaugeData.rowGauge?.rows) || 0}
                                        onChange={(value) => updateTempGaugeField('rowGauge', 'rows', value.toString())}
                                        min={1}
                                        max={100}
                                        label="rows"
                                        size="sm"
                                    />
                                    <span className="text-sm text-wool-600">rows =</span>
                                    <IncrementInput
                                        value={parseFloat(tempGaugeData.rowGauge?.measurement) || (defaultUnits === 'cm' ? 10 : 4)}
                                        onChange={(value) => updateTempGaugeField('rowGauge', 'measurement', value.toString())}
                                        min={0.5}
                                        max={20}
                                        step={0.5}
                                        label={defaultUnits === 'cm' ? 'cm' : 'inches'}
                                        size="sm"
                                    />
                                </div>
                            </div>

                            {/* Needle Used */}
                            <div>
                                <label className="form-label">Needle Used</label>
                                <select
                                    value={tempGaugeData.needleIndex || 0}
                                    onChange={(e) => updateTempGaugeSimple('needleIndex', parseInt(e.target.value))}
                                    className="w-full details-input-field"
                                >
                                    {needleOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {needles.length === 0 && (
                                    <p className="text-sm text-wool-500 mt-1">
                                        No needles added yet. <button onClick={() => window.alert('Go to Needles section to add needles first!')} className="text-sage-600 underline">Add needles first</button>.
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