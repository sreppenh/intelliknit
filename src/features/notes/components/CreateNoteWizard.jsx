/**
 * Create Note Wizard - Full screen note creation using existing patterns
 * Reuses SegmentedControl, yarn management, and form validation
 */

import React, { useState } from 'react';
import PageHeader from '../../../shared/components/PageHeader';
import SegmentedControl from '../../../shared/components/SegmentedControl';
import IncrementInput from '../../../shared/components/IncrementInput';
import { useNotesContext } from '../hooks/useNotesContext';

const CreateNoteWizard = ({ onBack, onGoToLanding, onNoteCreated }) => {
    const { createNote } = useNotesContext();

    const [noteData, setNoteData] = useState({
        name: '',
        textNotes: '',
        startingStitches: 40,
        construction: 'flat',
        numberOfColors: 1,
        yarns: [],
        gauge: null,
        needleInfo: '',
        units: 'inches'
    });

    // Handle field updates
    const updateField = (field, value) => {
        setNoteData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Validation
    const canSave = () => {
        return noteData.name.trim() && noteData.startingStitches > 0;
    };

    // Create the note
    const handleCreateNote = async () => {
        if (!canSave()) return;

        // Generate yarn placeholders based on number of colors
        const yarnPlaceholders = [];
        for (let i = 0; i < noteData.numberOfColors; i++) {
            const letter = String.fromCharCode(65 + i); // A, B, C, etc.
            yarnPlaceholders.push({
                letter,
                brand: '',
                color: '',
                colorHex: '#f3f4f6'
            });
        }

        // Create minimal project-like structure
        const newNote = {
            name: noteData.name.trim(),
            textNotes: noteData.textNotes.trim(),
            startingStitches: parseInt(noteData.startingStitches),
            construction: noteData.construction,
            numberOfColors: noteData.numberOfColors,
            yarns: noteData.yarns.length > 0 ? noteData.yarns : yarnPlaceholders,
            gauge: noteData.gauge,
            needleInfo: noteData.needleInfo.trim(),
            defaultUnits: noteData.units,

            // Single component structure
            components: [{
                id: `comp_${Date.now()}`,
                name: 'Pattern',
                construction: noteData.construction,
                startingStitches: parseInt(noteData.startingStitches),
                steps: []
            }]
        };

        const createdNote = await createNote(newNote);
        if (createdNote && onNoteCreated) {
            onNoteCreated(createdNote);
        }
    };

    return (
        <div className="min-h-screen bg-lavender-50">
            <div className="app-container bg-white min-h-screen shadow-lg">

                {/* Page Header with lavender theme */}
                <PageHeader
                    useBranding={true}
                    onHome={onGoToLanding}
                    compact={true}
                    onBack={onBack}
                    showCancelButton={true}
                    onCancel={onBack}
                />

                <div className="p-6 space-y-6">

                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-lavender-700 mb-2 flex items-center gap-3">
                            📝 Create Note
                        </h1>
                        <p className="text-lavender-600">
                            Set up a quick note for pattern testing, swatches, or experiments
                        </p>
                    </div>

                    {/* Basic Information */}
                    <div className="bg-lavender-50 rounded-xl p-6 border-2 border-lavender-200">
                        <h2 className="text-lg font-semibold text-lavender-700 mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            {/* Note Name */}
                            <div>
                                <label className="form-label">Note Name</label>
                                <input
                                    type="text"
                                    value={noteData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="e.g., Fair Isle Swatch, Gauge Test"
                                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-lavender-500 focus:ring-0 transition-colors bg-white"
                                    maxLength={100}
                                />
                            </div>

                            {/* Text Notes (Optional) */}
                            <div>
                                <label className="form-label">
                                    Text Notes
                                    <span className="text-wool-500 text-sm font-normal ml-1">(optional)</span>
                                </label>
                                <textarea
                                    value={noteData.textNotes}
                                    onChange={(e) => updateField('textNotes', e.target.value)}
                                    placeholder="Optional notes about what you're testing or trying..."
                                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-lavender-500 focus:ring-0 transition-colors bg-white resize-none"
                                    rows={2}
                                    maxLength={200}
                                />
                            </div>

                            {/* Starting Stitches */}
                            <div>
                                <label className="form-label">Starting Stitches</label>
                                <IncrementInput
                                    value={noteData.startingStitches}
                                    onChange={(value) => updateField('startingStitches', value)}
                                    min={1}
                                    max={500}
                                    className="w-full"
                                />
                                <div className="text-xs text-wool-500 mt-1">
                                    How many stitches will you cast on or start with?
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Construction & Setup */}
                    <div className="bg-white rounded-xl p-6 border-2 border-wool-200">
                        <h2 className="text-lg font-semibold text-wool-700 mb-4">Construction & Setup</h2>

                        <div className="space-y-4">
                            {/* Construction Type - Use SegmentedControl */}
                            <SegmentedControl.Construction
                                value={noteData.construction}
                                onChange={(value) => updateField('construction', value)}
                            />

                            {/* Number of Colors */}
                            <div>
                                <label className="form-label">Number of Colors</label>
                                <IncrementInput
                                    value={noteData.numberOfColors}
                                    onChange={(value) => updateField('numberOfColors', value)}
                                    min={1}
                                    max={10}
                                    className="w-full"
                                />
                                <div className="text-xs text-wool-500 mt-1">
                                    For single color patterns, use 1. For colorwork, select how many colors you'll use.
                                </div>
                            </div>

                            {/* Color Preview */}
                            {noteData.numberOfColors > 1 && (
                                <div className="bg-lavender-50 border border-lavender-200 rounded-lg p-3">
                                    <div className="text-sm text-lavender-700">
                                        <strong>Color defaults:</strong> {Array.from({ length: noteData.numberOfColors }, (_, i) =>
                                            `Color ${String.fromCharCode(65 + i)}`
                                        ).join(', ')}
                                    </div>
                                    <div className="text-xs text-lavender-600 mt-1">
                                        You can specify actual yarn details in the optional section below
                                    </div>
                                </div>
                            )}

                            {/* Units */}
                            <SegmentedControl.Units
                                value={noteData.units}
                                onChange={(value) => updateField('units', value)}
                            />
                        </div>
                    </div>

                    {/* Optional Details */}
                    <div className="bg-wool-50 rounded-xl p-6 border-2 border-wool-200">
                        <h2 className="text-lg font-semibold text-wool-700 mb-2">
                            Optional Details
                            <span className="text-wool-500 text-sm font-normal ml-2">
                                (helps create a better reference)
                            </span>
                        </h2>

                        <div className="space-y-4">
                            {/* Yarn Management - TODO: Integrate existing yarn modals */}
                            {noteData.numberOfColors > 1 && (
                                <div>
                                    <label className="form-label">
                                        Yarn Details
                                        <span className="text-wool-500 text-sm font-normal ml-1">(optional)</span>
                                    </label>
                                    <div className="bg-yarn-50 border border-yarn-200 rounded-lg p-4">
                                        <div className="text-sm text-yarn-700 mb-2">
                                            Yarn management integration coming next
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-secondary btn-sm"
                                            disabled
                                        >
                                            Add Yarn Details
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Needle Information */}
                            <div>
                                <label className="form-label">
                                    Needle Information
                                    <span className="text-wool-500 text-sm font-normal ml-1">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={noteData.needleInfo}
                                    onChange={(e) => updateField('needleInfo', e.target.value)}
                                    placeholder="e.g., US 6, 3.75mm circular"
                                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-lavender-500 focus:ring-0 transition-colors bg-white"
                                    maxLength={50}
                                />
                            </div>

                            {/* Gauge Information - TODO: Integrate existing gauge components */}
                            <div>
                                <label className="form-label">
                                    Gauge Information
                                    <span className="text-wool-500 text-sm font-normal ml-1">(optional)</span>
                                </label>
                                <div className="bg-yarn-50 border border-yarn-200 rounded-lg p-4">
                                    <div className="text-sm text-yarn-700 mb-2">
                                        Gauge management integration coming next
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-secondary btn-sm"
                                        disabled
                                    >
                                        Add Gauge Information
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onBack}
                            className="flex-1 btn-tertiary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateNote}
                            disabled={!canSave()}
                            className="flex-2 bg-lavender-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-lavender-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                            style={{ flexGrow: 2 }}
                        >
                            Create Note
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateNoteWizard;