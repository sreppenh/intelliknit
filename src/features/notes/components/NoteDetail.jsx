/**
 * NoteDetail - Redesigned with clean sections and proper modal editing
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNotesContext } from '../hooks/useNotesContext';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';
import PageHeader from '../../../shared/components/PageHeader';
import StandardModal from '../../../shared/components/modals/StandardModal';
import SegmentedControl from '../../../shared/components/SegmentedControl';
import IncrementInput from '../../../shared/components/IncrementInput';
import { getFormattedStepDisplay } from '../../../shared/utils/stepDescriptionUtils';
import NoteCounter from './NoteCounter';

const NoteDetail = ({ onBack, onGoToLanding, onEditSteps }) => {
    const { currentNote, updateNote, deleteNote } = useNotesContext();

    // All useState declarations first
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showKnittingModal, setShowKnittingModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showColorsModal, setShowColorsModal] = useState(false);
    const [showDeleteInstructionModal, setShowDeleteInstructionModal] = useState(false);
    const [detailsForm, setDetailsForm] = useState({});
    const [colorsForm, setColorsForm] = useState({});
    const [editingColorIndex, setEditingColorIndex] = useState(null);

    // Color palette - same as CreateNoteWizard
    const colorPalette = [
        // Reds
        { name: 'Cherry', hex: '#dc2626' },
        { name: 'Burgundy', hex: '#7f1d1d' },
        { name: 'Dusty Rose', hex: '#be185d' },
        // Oranges  
        { name: 'Coral', hex: '#f97316' },
        { name: 'Rust', hex: '#c2410c' },
        { name: 'Peach', hex: '#fed7aa' },
        // Yellows
        { name: 'Sunshine', hex: '#eab308' },
        { name: 'Mustard', hex: '#a16207' },
        { name: 'Cream', hex: '#fef3c7' },
        // Greens
        { name: 'Sage', hex: '#4a8a4a' },
        { name: 'Forest', hex: '#166534' },
        { name: 'Mint', hex: '#6ee7b7' },
        // Blues
        { name: 'Sky', hex: '#3b82f6' },
        { name: 'Navy', hex: '#1e3a8a' },
        { name: 'Teal', hex: '#0891b2' },
        // Purples
        { name: 'Lavender', hex: '#9b7cb6' },
        { name: 'Plum', hex: '#7c3aed' },
        { name: 'Violet', hex: '#a855f7' },
        // Pinks
        { name: 'Blush', hex: '#fda4af' },
        { name: 'Magenta', hex: '#ec4899' },
        { name: 'Rose', hex: '#f472b6' },
        // Neutrals
        { name: 'Charcoal', hex: '#374151' },
        { name: 'Stone', hex: '#78716c' },
        { name: 'Silver', hex: '#d1d5db' },
        { name: 'Ivory', hex: '#fffbeb' },
        { name: 'White', hex: '#ffffff' },
        { name: 'Black', hex: '#000000' }
    ];

    // Get note info - moved up to be available for hooks
    const hasStep = currentNote?.components?.[0]?.steps?.length > 0;
    const step = hasStep ? currentNote.components[0].steps[0] : null;
    const hasYarns = currentNote?.yarns?.length > 0 && currentNote.yarns.some(y => y.colorHex);
    const hasGauge = currentNote?.gauge?.stitchGauge || currentNote?.gauge?.rowGauge;


    // Add function to refresh progress from localStorage
    const refreshRowProgress = () => {
        if (!rowProgressKey) return;

        try {
            const item = localStorage.getItem(rowProgressKey);
            const newProgress = item ? JSON.parse(item) : { currentRow: 0 };
            setRowProgress(newProgress);
        } catch (error) {
            console.warn('Error reading row progress:', error);
        }
    };


    // Row progress tracking - matches StepCounter localStorage pattern
    const rowProgressKey = hasStep && step && currentNote ?
        `row-counter-${currentNote.id}-${currentNote.components[0].id}-0` :
        null;

    const [rowProgress, setRowProgress] = useState(() => {
        if (!rowProgressKey) return { currentRow: 0 };

        try {
            const item = localStorage.getItem(rowProgressKey);
            return item ? JSON.parse(item) : { currentRow: 0 };
        } catch (error) {
            return { currentRow: 0 };
        }
    });

    // Right after the rowProgressKey definition, add this:
    console.log('Row Progress Debug:', {
        hasStep,
        stepExists: !!step,
        currentNoteId: currentNote?.id,
        componentId: currentNote?.components?.[0]?.id,
        rowProgressKey,
        rowProgress,
        allLocalStorageKeys: Object.keys(localStorage).filter(key => key.includes('row-counter'))
    });



    // All useEffect hooks - BEFORE any early returns
    useEffect(() => {
        if (showDetailsModal && currentNote) {
            setDetailsForm({
                description: currentNote.textNotes || '',
                defaultUnits: currentNote.defaultUnits || 'inches',
                construction: currentNote.construction || 'flat',
                needleInfo: currentNote.needleInfo || '',
                gauge: currentNote.gauge ? {
                    stitchGauge: {
                        stitches: currentNote.gauge.stitchGauge?.stitches || ''
                    },
                    rowGauge: {
                        rows: currentNote.gauge.rowGauge?.rows || ''
                    },
                    blockingNotes: currentNote.gauge.blockingNotes || ''
                } : {
                    stitchGauge: { stitches: '' },
                    rowGauge: { rows: '' },
                    blockingNotes: ''
                }
            });
        }
    }, [showDetailsModal, currentNote]);

    useEffect(() => {
        if (showColorsModal && currentNote) {
            setColorsForm({
                numberOfColors: currentNote.numberOfColors || 1,
                yarns: [...(currentNote.yarns || [])]
            });
            setEditingColorIndex(null);
        }
    }, [showColorsModal, currentNote]);



    // Helper functions
    const getProgressDisplay = useMemo(() => {
        if (!hasStep || !step) return null;

        const currentRow = rowProgress?.currentRow || 0;
        const totalRows = step.totalRows || 0;

        if (currentRow >= totalRows && totalRows > 0) {
            return {
                text: "Instruction completed",
                className: "text-sage-600 font-medium",
                icon: "✓"
            };
        }

        if (totalRows > 0) {
            return {
                text: `Completed ${currentRow} of ${totalRows} rows`,
                className: "text-wool-600",
                icon: null
            };
        }

        return {
            text: `Completed ${currentRow} rows`,
            className: "text-wool-600",
            icon: null
        };
    }, [hasStep, step, rowProgress]);

    const getKnittingButtonConfig = useMemo(() => {
        if (!hasStep || !step) {
            return {
                text: "Configure Instruction",
                action: () => onEditSteps(0),
                className: "btn-primary btn-sm"
            };
        }



        const currentRow = rowProgress?.currentRow || 0;
        const totalRows = step.totalRows || 0;

        if (currentRow >= totalRows && totalRows > 0) {
            return {
                text: "Review Instruction",
                action: handleStartKnitting,
                className: "btn-secondary btn-sm"
            };
        }

        if (currentRow > 0) {
            return {
                text: "Resume Knitting",
                action: handleStartKnitting,
                className: "btn-primary btn-sm"
            };
        }

        return {
            text: "Start Knitting",
            action: handleStartKnitting,
            className: "btn-primary btn-sm"
        };
    }, [hasStep, step, rowProgress, onEditSteps]);

    const handleColorSelect = (colorIndex, selectedColor) => {
        const updatedYarns = [...colorsForm.yarns];
        updatedYarns[colorIndex] = {
            ...updatedYarns[colorIndex],
            color: selectedColor.name,
            colorHex: selectedColor.hex
        };
        setColorsForm(prev => ({ ...prev, yarns: updatedYarns }));
        setEditingColorIndex(null);
    };

    // Early return AFTER all hooks
    if (!currentNote) {
        return (
            <div className="min-h-screen bg-lavender-50 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-wool-600 mb-2">Note not found</h3>
                    <button onClick={onBack} className="btn-primary btn-sm">← Back to Notes</button>
                </div>
            </div>
        );
    }

    // Handle delete note
    const handleDeleteNote = async () => {
        const success = await deleteNote(currentNote.id);
        if (success) {
            onBack();
        }
        setShowDeleteModal(false);
    };

    // Handle delete instruction
    const handleDeleteInstruction = async () => {
        if (!currentNote || !hasStep) return;

        // Clear row progress
        if (rowProgressKey) {
            localStorage.removeItem(rowProgressKey);
        }

        // Remove the step from the note
        const updatedNote = {
            ...currentNote,
            components: [{
                ...currentNote.components[0],
                steps: []
            }]
        };

        await updateNote(updatedNote);
        setShowDeleteInstructionModal(false);
    };

    // Handle start knitting
    function handleStartKnitting() {
        setShowKnittingModal(true);
    }

    const handleCloseKnittingModal = () => {
        setShowKnittingModal(false);
        // Refresh progress display after modal closes
        setTimeout(refreshRowProgress, 100);
    };

    // Details modal handlers
    const handleDetailsEdit = () => {
        setShowDetailsModal(true);
    };

    const handleDetailsSave = () => {
        const standardMeasurement = detailsForm.defaultUnits === 'cm' ? '10' : '4';

        // Build gauge object only if user entered something
        let updatedGauge = null;
        if (detailsForm.gauge.stitchGauge.stitches ||
            detailsForm.gauge.rowGauge.rows ||
            detailsForm.gauge.blockingNotes) {

            updatedGauge = {
                stitchGauge: detailsForm.gauge.stitchGauge.stitches ? {
                    stitches: parseFloat(detailsForm.gauge.stitchGauge.stitches),
                    measurement: standardMeasurement
                } : null,
                rowGauge: detailsForm.gauge.rowGauge.rows ? {
                    rows: parseFloat(detailsForm.gauge.rowGauge.rows),
                    measurement: standardMeasurement
                } : null,
                blockingNotes: detailsForm.gauge.blockingNotes || null
            };

            // Remove null values
            updatedGauge = Object.fromEntries(
                Object.entries(updatedGauge).filter(([_, v]) => v !== null)
            );
        }

        updateNote({
            ...currentNote,
            textNotes: detailsForm.description.trim(),
            defaultUnits: detailsForm.defaultUnits,
            construction: detailsForm.construction,
            needleInfo: detailsForm.needleInfo.trim() || null,
            gauge: updatedGauge
        });

        setShowDetailsModal(false);
    };

    const handleDetailsCancel = () => {
        setShowDetailsModal(false);
    };

    // Colors modal handlers
    const handleColorsEdit = () => {
        setShowColorsModal(true);
    };

    const handleColorsSave = () => {
        const newNumberOfColors = colorsForm.numberOfColors;
        let updatedYarns = [...colorsForm.yarns];

        // Adjust yarns array to match new color count
        if (newNumberOfColors > updatedYarns.length) {
            // Add new color slots
            for (let i = updatedYarns.length; i < newNumberOfColors; i++) {
                updatedYarns.push({
                    letter: String.fromCharCode(65 + i),
                    brand: '',
                    color: `Color ${String.fromCharCode(65 + i)}`,
                    colorHex: '#f3f4f6' // Default gray
                });
            }
        } else if (newNumberOfColors < updatedYarns.length) {
            // Remove excess colors
            updatedYarns = updatedYarns.slice(0, newNumberOfColors);
        }

        updateNote({
            ...currentNote,
            numberOfColors: newNumberOfColors,
            yarns: updatedYarns
        });

        setShowColorsModal(false);
        setEditingColorIndex(null);
    };

    const handleColorsCancel = () => {
        setShowColorsModal(false);
        setEditingColorIndex(null);
    };

    // Form update handlers
    const updateDetailsForm = (field, value) => {
        setDetailsForm(prev => ({ ...prev, [field]: value }));
    };

    const updateDetailsGaugeForm = (category, field, value) => {
        setDetailsForm(prev => ({
            ...prev,
            gauge: {
                ...prev.gauge,
                [category]: {
                    ...prev.gauge[category],
                    [field]: value
                }
            }
        }));
    };

    const updateColorsForm = (field, value) => {
        setColorsForm(prev => ({ ...prev, [field]: value }));
    };

    // Format gauge display
    const formatGaugeDisplay = () => {
        if (!hasGauge) return null;

        const parts = [];
        const unit = currentNote.defaultUnits === 'cm' ? 'cm' : '"';
        const standardDistance = currentNote.defaultUnits === 'cm' ? '10' : '4';

        if (currentNote.gauge.stitchGauge?.stitches) {
            parts.push(`${currentNote.gauge.stitchGauge.stitches} sts = ${standardDistance}${unit}`);
        }

        if (currentNote.gauge.rowGauge?.rows) {
            parts.push(`${currentNote.gauge.rowGauge.rows} rows = ${standardDistance}${unit}`);
        }

        return parts.join(' • ');
    };

    return (
        <div className="min-h-screen bg-lavender-50">
            <div className="app-container bg-lavender-50 min-h-screen shadow-lg">
                <PageHeader
                    useBranding={true}
                    onHome={onGoToLanding}
                    compact={true}
                    onBack={onBack}
                    showCancelButton={true}
                    onCancel={onBack}
                />

                {/* Simplified Header */}
                <div className="px-6 py-4 bg-white border-b border-wool-100">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-wool-700 mb-1">{currentNote.name}</h1>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="btn-tertiary btn-sm text-red-600 hover:bg-red-50"
                            title="Delete note"
                        >
                            🗑️
                        </button>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="p-6 space-y-4">

                    {/* Instruction Section - Mobile Optimized */}
                    {hasStep ? (
                        <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-lavender-200">
                            {/* Compact Header - Single Line */}
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-wool-700">🧶 Instruction</h3>
                                <button
                                    onClick={() => setShowDeleteInstructionModal(true)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>

                            {/* Step Description */}
                            <div className="text-left mb-3">
                                {(() => {
                                    const { description, contextualPatternNotes, contextualConfigNotes } =
                                        getFormattedStepDisplay(step, "Instruction", currentNote);

                                    return (
                                        <div className="space-y-2">
                                            <div className="font-medium text-wool-700 text-base">{description}</div>
                                            {contextualPatternNotes && (
                                                <div className="text-sm text-wool-600 whitespace-pre-line bg-lavender-50 p-3 rounded-lg">
                                                    {contextualPatternNotes}
                                                </div>
                                            )}
                                            {contextualConfigNotes && (
                                                <div className="text-sm text-wool-600 italic">
                                                    {contextualConfigNotes}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Progress + Action Row */}
                            <div className="flex items-center justify-between gap-3">
                                {getProgressDisplay && (
                                    <div className="text-sm flex-1">
                                        {getProgressDisplay.icon && <span className="mr-1">{getProgressDisplay.icon}</span>}
                                        <span className={getProgressDisplay.className}>{getProgressDisplay.text}</span>
                                    </div>
                                )}
                                <button
                                    onClick={getKnittingButtonConfig.action}
                                    className="btn-primary btn-sm flex-shrink-0"
                                >
                                    {getKnittingButtonConfig.text}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-wool-200">
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <h3 className="text-lg font-semibold text-wool-700 mb-2">🧶 Instruction</h3>
                                    <p className="text-wool-500">No instruction configured yet</p>
                                </div>
                                <button onClick={() => onEditSteps(0)} className="btn-primary btn-sm flex-shrink-0">
                                    Configure
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Details Section */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-wool-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-wool-700 text-left">📝 Details</h3>
                            <button onClick={handleDetailsEdit} className="details-edit-button">
                                ✏️
                            </button>
                        </div>

                        <div className="space-y-2 text-left text-sm">
                            {/* Description */}
                            {currentNote.textNotes ? (
                                <div>
                                    <span className="font-medium text-wool-700">Description: </span>
                                    <span className="text-wool-600">{currentNote.textNotes}</span>
                                </div>
                            ) : (
                                <div className="text-wool-500 italic">No description</div>
                            )}

                            {/* Units */}
                            <div>
                                <span className="font-medium text-wool-700">Measured in: </span>
                                <span className="text-wool-600">
                                    {currentNote.defaultUnits === 'cm' ? 'Centimeters' : 'Inches'}
                                </span>
                            </div>

                            {/* Construction */}
                            <div>
                                <span className="font-medium text-wool-700">Construction: </span>
                                <span className="text-wool-600">
                                    {currentNote.construction === 'round' ? 'In the round' : 'Flat knitting'}
                                </span>
                            </div>

                            {/* Needles */}
                            <div>
                                <span className="font-medium text-wool-700">Needles: </span>
                                <span className="text-wool-600">
                                    {currentNote.needleInfo || 'Not specified'}
                                </span>
                            </div>

                            {/* Gauge */}
                            {hasGauge ? (
                                <div>
                                    <span className="font-medium text-wool-700">Gauge: </span>
                                    <span className="text-wool-600">{formatGaugeDisplay()}</span>
                                    {currentNote.gauge?.blockingNotes && (
                                        <div className="ml-4 text-wool-500 italic">
                                            {currentNote.gauge.blockingNotes}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <span className="font-medium text-wool-700">Gauge: </span>
                                    <span className="text-wool-500">Not set</span>
                                </div>
                            )}

                            {/* Creation Date */}
                            <div>
                                <span className="font-medium text-wool-700">Created: </span>
                                <span className="text-wool-600">
                                    {new Date(currentNote.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Colors Section */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-wool-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-wool-700 text-left">🎨 Colors</h3>
                            <button onClick={handleColorsEdit} className="details-edit-button">
                                ✏️
                            </button>
                        </div>

                        <div className="space-y-3 text-left">
                            <div>
                                <span className="text-sm font-medium text-wool-700">
                                    {currentNote.numberOfColors || 1} colors in project
                                </span>
                            </div>

                            {hasYarns && (
                                <div className="space-y-2">
                                    {currentNote.yarns.filter(y => y.colorHex).map((yarn, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div
                                                className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
                                                style={{ backgroundColor: yarn.colorHex }}
                                            />
                                            <span className="text-sm text-wool-700">
                                                Color {yarn.letter}
                                                {yarn.color && yarn.color !== `Color ${yarn.letter}` && (
                                                    <span className="text-wool-500 ml-1">({yarn.color})</span>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <StandardModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteNote}
                category="warning"
                colorScheme="red"
                title="Delete Note?"
                subtitle={`"${currentNote.name}" will be permanently deleted. This cannot be undone.`}
                primaryButtonText="Delete Note"
                secondaryButtonText="Cancel"
                icon="🗑️"
            />

            {/* Delete Instruction Confirmation Modal */}
            <StandardModal
                isOpen={showDeleteInstructionModal}
                onClose={() => setShowDeleteInstructionModal(false)}
                onConfirm={handleDeleteInstruction}
                category="warning"
                colorScheme="red"
                title="Delete Instruction?"
                subtitle="This will remove the knitting instruction and clear any progress. This cannot be undone."
                primaryButtonText="Delete Instruction"
                secondaryButtonText="Cancel"
                icon="🗑️"
            />

            {/* Details Edit Modal */}
            <StandardModal
                isOpen={showDetailsModal}
                onClose={handleDetailsCancel}
                onConfirm={handleDetailsSave}
                category="complex"
                colorScheme="sage"
                title="📝 Note Details"
                subtitle="Update note information"
                showButtons={false}
            >
                <div className="space-y-5">
                    {/* Description */}
                    <div>
                        <label className="form-label">Description</label>
                        <textarea
                            value={detailsForm.description || ''}
                            onChange={(e) => updateDetailsForm('description', e.target.value)}
                            placeholder="What are you testing or working on?"
                            className="w-full details-input-field resize-none"
                            rows={3}
                            maxLength={200}
                        />
                        <div className="text-xs text-wool-500 mt-1">
                            {200 - (detailsForm.description?.length || 0)} characters remaining
                        </div>
                    </div>

                    {/* Units */}
                    <SegmentedControl.Units
                        value={detailsForm.defaultUnits}
                        onChange={(value) => updateDetailsForm('defaultUnits', value)}
                    />

                    {/* Construction */}
                    <SegmentedControl.Construction
                        value={detailsForm.construction}
                        onChange={(value) => updateDetailsForm('construction', value)}
                    />

                    {/* Needle Information */}
                    <div>
                        <label className="form-label">Needle Information</label>
                        <input
                            type="text"
                            value={detailsForm.needleInfo || ''}
                            onChange={(e) => updateDetailsForm('needleInfo', e.target.value)}
                            placeholder="e.g., US 8, 5.0mm"
                            className="w-full details-input-field"
                            maxLength={50}
                        />
                    </div>

                    {/* Gauge Section */}
                    <div>
                        <label className="form-label">Gauge (Optional)</label>

                        {/* Stitch Gauge */}
                        <div className="mb-3">
                            <div className="flex gap-2 items-center">
                                <IncrementInput
                                    value={detailsForm.gauge?.stitchGauge?.stitches || ''}
                                    onChange={(value) => updateDetailsGaugeForm('stitchGauge', 'stitches', value)}
                                    min={1}
                                    max={50}
                                    step={0.5}
                                    label="stitches"
                                    size="sm"
                                    allowEmpty={true}
                                />
                                <span className="text-sm text-wool-600">
                                    stitches in {detailsForm.defaultUnits === 'cm' ? '10 cm' : '4 inches'}
                                </span>
                            </div>
                        </div>

                        {/* Row Gauge */}
                        <div className="mb-3">
                            <div className="flex gap-2 items-center">
                                <IncrementInput
                                    value={detailsForm.gauge?.rowGauge?.rows || ''}
                                    onChange={(value) => updateDetailsGaugeForm('rowGauge', 'rows', value)}
                                    min={1}
                                    max={100}
                                    step={0.5}
                                    label="rows"
                                    size="sm"
                                    allowEmpty={true}
                                />
                                <span className="text-sm text-wool-600">
                                    rows in {detailsForm.defaultUnits === 'cm' ? '10 cm' : '4 inches'}
                                </span>
                            </div>
                        </div>

                        {/* Gauge Notes */}
                        <input
                            type="text"
                            value={detailsForm.gauge?.blockingNotes || ''}
                            onChange={(e) => updateDetailsGaugeForm('blockingNotes', '', e.target.value)}
                            placeholder="e.g., after wet blocking, custom stitch pattern details..."
                            className="w-full details-input-field"
                        />
                    </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleDetailsCancel}
                        className="flex-1 btn-tertiary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDetailsSave}
                        className="flex-1 btn-primary"
                    >
                        Save Changes
                    </button>
                </div>
            </StandardModal>

            {/* Colors Edit Modal */}
            <StandardModal
                isOpen={showColorsModal}
                onClose={handleColorsCancel}
                onConfirm={handleColorsSave}
                category="complex"
                colorScheme="sage"
                title="🎨 Colors"
                subtitle="Edit colors and number of colors"
                showButtons={false}
            >
                <div className="space-y-5">
                    {/* Number of Colors */}
                    <div>
                        <label className="form-label">Number of Colors</label>
                        <IncrementInput
                            value={colorsForm.numberOfColors || 1}
                            onChange={(value) => {
                                const updatedYarns = [...(colorsForm.yarns || [])];

                                // Adjust yarns array immediately for preview
                                if (value > updatedYarns.length) {
                                    // Add new color slots
                                    for (let i = updatedYarns.length; i < value; i++) {
                                        updatedYarns.push({
                                            letter: String.fromCharCode(65 + i),
                                            brand: '',
                                            color: `Color ${String.fromCharCode(65 + i)}`,
                                            colorHex: '#f3f4f6'
                                        });
                                    }
                                } else if (value < updatedYarns.length) {
                                    // Remove excess colors
                                    updatedYarns.splice(value);
                                }

                                setColorsForm(prev => ({
                                    ...prev,
                                    numberOfColors: value,
                                    yarns: updatedYarns
                                }));
                            }}
                            min={1}
                            max={26}
                            className="w-full"
                        />
                        <div className="text-xs text-wool-500 mt-2">
                            Colors will be labeled A, B, C, etc. in patterns.
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="form-label">Colors</label>
                        <div className="space-y-3">
                            {Array.from({ length: colorsForm.numberOfColors || 1 }, (_, i) => {
                                const yarn = colorsForm.yarns?.[i] || {
                                    letter: String.fromCharCode(65 + i),
                                    brand: '',
                                    color: `Color ${String.fromCharCode(65 + i)}`,
                                    colorHex: '#f3f4f6'
                                };

                                return (
                                    <div key={i} className="border-2 border-wool-200 rounded-lg p-3">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div
                                                className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                                                style={{ backgroundColor: yarn.colorHex }}
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-wool-700">
                                                    Color {yarn.letter}
                                                </div>
                                                <div className="text-xs text-wool-500">
                                                    {yarn.color}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEditingColorIndex(editingColorIndex === i ? null : i)}
                                                className="ml-auto btn-tertiary btn-sm"
                                            >
                                                {editingColorIndex === i ? 'Cancel' : 'Change'}
                                            </button>
                                        </div>

                                        {/* Inline Color Picker */}
                                        {editingColorIndex === i && (
                                            <div className="border-t border-wool-200 pt-3 mt-3">
                                                <div className="grid grid-cols-6 gap-2">
                                                    {colorPalette.map((color) => (
                                                        <button
                                                            key={color.hex}
                                                            type="button"
                                                            onClick={() => handleColorSelect(i, color)}
                                                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-105 ${yarn.colorHex === color.hex
                                                                ? 'border-sage-500 ring-2 ring-sage-300'
                                                                : 'border-gray-300 hover:border-gray-500'
                                                                }`}
                                                            style={{ backgroundColor: color.hex }}
                                                            title={color.name}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="text-xs text-wool-500 mt-2 text-center">
                                                    Click any color to select it
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleColorsCancel}
                        className="flex-1 btn-tertiary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleColorsSave}
                        className="flex-1 btn-primary"
                    >
                        Save Changes
                    </button>
                </div>
            </StandardModal>

            {/* Knitting Modal */}
            {showKnittingModal && hasStep && (
                <NoteCounter
                    onBack={handleCloseKnittingModal}
                    onGoToLanding={onGoToLanding}
                />
            )}
        </div>
    );
};

export default NoteDetail;