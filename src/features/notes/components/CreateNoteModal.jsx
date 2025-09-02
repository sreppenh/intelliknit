/**
 * Create Note Modal - Multi-step note setup modal
 * Collects all note info upfront before step creation
 */

import React, { useState } from 'react';
import StandardModal from '../../../shared/components/modals/StandardModal';
import IncrementInput from '../../../shared/components/IncrementInput';

const CreateNoteModal = ({
    isOpen,
    onClose,
    onCreateNote
}) => {
    const [step, setStep] = useState(1);
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

    // Reset form when modal closes
    const handleClose = () => {
        setStep(1);
        setNoteData({
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
        onClose();
    };

    // Handle form field updates
    const updateField = (field, value) => {
        setNoteData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Generate yarn placeholders based on number of colors
    const generateYarnPlaceholders = () => {
        const yarns = [];
        for (let i = 0; i < noteData.numberOfColors; i++) {
            const letter = String.fromCharCode(65 + i); // A, B, C, etc.
            yarns.push({
                letter,
                brand: '',
                color: '',
                colorHex: '#f3f4f6'
            });
        }
        return yarns;
    };

    // Handle yarn field updates
    const updateYarn = (yarnIndex, field, value) => {
        const updatedYarns = [...noteData.yarns];
        updatedYarns[yarnIndex] = {
            ...updatedYarns[yarnIndex],
            [field]: value
        };
        setNoteData(prev => ({
            ...prev,
            yarns: updatedYarns
        }));
    };

    // Create the note with proper structure
    const handleCreateNote = () => {
        // Create minimal project-like structure
        const newNote = {
            name: noteData.name.trim(),
            textNotes: noteData.textNotes.trim(),
            isNote: true,
            startingStitches: parseInt(noteData.startingStitches),
            construction: noteData.construction,
            numberOfColors: noteData.numberOfColors,
            yarns: noteData.yarns.filter(y => y.brand.trim() || y.color.trim()), // Only include filled yarns
            gauge: noteData.gauge,
            needleInfo: noteData.needleInfo.trim(),
            defaultUnits: noteData.units,

            // Single component structure (like a minimal project)
            components: [{
                id: `comp_${Date.now()}`,
                name: 'Pattern',
                construction: noteData.construction,
                startingStitches: parseInt(noteData.startingStitches),
                steps: []
            }]
        };

        onCreateNote(newNote);
        handleClose();
    };

    // Validation
    const canProceed = () => {
        if (step === 1) {
            return noteData.name.trim() && noteData.startingStitches > 0;
        }
        if (step === 2) {
            return noteData.numberOfColors > 0;
        }
        return true; // Step 3 is optional
    };

    const canCreate = () => {
        return noteData.name.trim() && noteData.startingStitches > 0 && noteData.numberOfColors > 0;
    };

    // Render step content
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Name *</label>
                            <input
                                type="text"
                                value={noteData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="e.g., Fair Isle Swatch, Gauge Test"
                                className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-lavender-500 focus:ring-0 transition-colors bg-white"
                                data-modal-focus
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <label className="form-label">Description</label>
                            <textarea
                                value={noteData.textNotes}
                                onChange={(e) => updateField('textNotes', e.target.value)}
                                placeholder="Optional notes about what you're testing or trying..."
                                className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-lavender-500 focus:ring-0 transition-colors bg-white resize-none"
                                rows={2}
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <label className="form-label">Starting Stitches *</label>
                            <IncrementInput
                                value={noteData.startingStitches}
                                onChange={(value) => updateField('startingStitches', value)}
                                min={1}
                                max={500}
                                className="w-full"
                            />
                            <div className="text-xs text-wool-500 mt-1">
                                How many stitches will you start with?
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Construction Type</label>
                            <div className="flex gap-3">
                                <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${noteData.construction === 'flat'
                                    ? 'border-lavender-500 bg-lavender-50 text-lavender-700'
                                    : 'border-wool-200 bg-white text-wool-600 hover:border-lavender-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="construction"
                                        value="flat"
                                        checked={noteData.construction === 'flat'}
                                        onChange={(e) => updateField('construction', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <div className="text-xl mb-1">↔️</div>
                                        <div className="font-medium">Flat</div>
                                        <div className="text-xs">Back and forth</div>
                                    </div>
                                </label>

                                <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${noteData.construction === 'round'
                                    ? 'border-lavender-500 bg-lavender-50 text-lavender-700'
                                    : 'border-wool-200 bg-white text-wool-600 hover:border-lavender-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="construction"
                                        value="round"
                                        checked={noteData.construction === 'round'}
                                        onChange={(e) => updateField('construction', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <div className="text-xl mb-1">🔄</div>
                                        <div className="font-medium">Round</div>
                                        <div className="text-xs">In the round</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Number of Colors *</label>
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

                        <div className="bg-lavender-50 border-2 border-lavender-200 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-lavender-700 mb-2">💡 Color Defaults</h4>
                            <div className="text-sm text-lavender-600">
                                {noteData.numberOfColors === 1 ? (
                                    "Your pattern will use a single color."
                                ) : (
                                    `Your pattern will default to: ${Array.from({ length: noteData.numberOfColors }, (_, i) =>
                                        `Color ${String.fromCharCode(65 + i)}`
                                    ).join(', ')}. You can add specific yarn details on the next step.`
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 3:
                // Initialize yarns if not already set
                if (noteData.yarns.length !== noteData.numberOfColors) {
                    updateField('yarns', generateYarnPlaceholders());
                }

                return (
                    <div className="space-y-4">
                        <div className="text-center text-sm text-wool-600 mb-4">
                            These details are optional but help create a better reference for your note.
                        </div>

                        {/* Yarns section - only if multiple colors */}
                        {noteData.numberOfColors > 1 && (
                            <div>
                                <label className="form-label">Yarn Details (Optional)</label>
                                <div className="space-y-3">
                                    {noteData.yarns.map((yarn, index) => (
                                        <div key={yarn.letter} className="flex gap-3 p-3 bg-wool-50 rounded-lg border border-wool-200">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-wool-300 flex items-center justify-center font-bold text-wool-700">
                                                {yarn.letter}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    value={yarn.brand}
                                                    onChange={(e) => updateYarn(index, 'brand', e.target.value)}
                                                    placeholder="Brand (optional)"
                                                    className="w-full border border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-lavender-500 focus:ring-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={yarn.color}
                                                    onChange={(e) => updateYarn(index, 'color', e.target.value)}
                                                    placeholder="Color name (optional)"
                                                    className="w-full border border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-lavender-500 focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Needle info */}
                        <div>
                            <label className="form-label">Needle Information (Optional)</label>
                            <input
                                type="text"
                                value={noteData.needleInfo}
                                onChange={(e) => updateField('needleInfo', e.target.value)}
                                placeholder="e.g., US 6, 3.75mm circular"
                                className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-lavender-500 focus:ring-0 transition-colors bg-white"
                                maxLength={50}
                            />
                        </div>

                        {/* Units toggle */}
                        <div>
                            <label className="form-label">Measurement Units</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => updateField('units', 'inches')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${noteData.units === 'inches'
                                        ? 'bg-lavender-500 text-white shadow-sm'
                                        : 'text-wool-600 hover:text-lavender-600 border border-wool-200'
                                        }`}
                                >
                                    🇺🇸 Inches
                                </button>

                                <button
                                    type="button"
                                    onClick={() => updateField('units', 'cm')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${noteData.units === 'cm'
                                        ? 'bg-lavender-500 text-white shadow-sm'
                                        : 'text-wool-600 hover:text-lavender-600 border border-wool-200'
                                        }`}
                                >
                                    🇪🇺 Centimeters
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Step titles
    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Basic Information';
            case 2: return 'Colors Setup';
            case 3: return 'Optional Details';
            default: return '';
        }
    };

    return (
        <StandardModal
            isOpen={isOpen}
            onClose={handleClose}
            category="complex"
            colorScheme="lavender"
            title={`📝 Create Note - ${getStepTitle()}`}
            subtitle={step === 1 ? "Set up your note basics" : step === 2 ? "Configure color settings" : "Add optional yarn and needle info"}
            showButtons={false}
            focusSelector="[data-modal-focus]"
        >
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-6">
                {[1, 2, 3].map((stepNum) => (
                    <React.Fragment key={stepNum}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${stepNum === step
                            ? 'bg-lavender-500 text-white'
                            : stepNum < step
                                ? 'bg-lavender-300 text-white'
                                : 'bg-wool-200 text-wool-500'
                            }`}>
                            {stepNum}
                        </div>
                        {stepNum < 3 && (
                            <div className={`w-8 h-0.5 transition-colors ${stepNum < step ? 'bg-lavender-300' : 'bg-wool-200'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step content */}
            {renderStepContent()}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
                <button
                    onClick={step === 1 ? handleClose : () => setStep(step - 1)}
                    className="flex-1 btn-tertiary"
                >
                    {step === 1 ? 'Cancel' : 'Back'}
                </button>

                {step < 3 ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        disabled={!canProceed()}
                        className="flex-1 btn-primary"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleCreateNote}
                        disabled={!canCreate()}
                        className="flex-1 btn-primary"
                    >
                        Create Note
                    </button>
                )}
            </div>

            {/* Skip option for step 3 */}
            {step === 3 && (
                <div className="text-center mt-3">
                    <button
                        onClick={handleCreateNote}
                        disabled={!canCreate()}
                        className="text-sm text-lavender-600 hover:text-lavender-700 underline"
                    >
                        Skip details and create note
                    </button>
                </div>
            )}
        </StandardModal>
    );
};

export default CreateNoteModal;