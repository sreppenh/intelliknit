// src/features/notes/components/NoteCounter.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw } from 'lucide-react';
import { useActiveContext } from '../../../shared/hooks/useActiveContext';
import { useKnittingProgress } from '../../knitting/hooks/useKnittingProgress';
import { getModalTheme } from '../../knitting/components/modal/KnittingModalTheme';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';
import KnittingStepCounter from '../../knitting/components/modal/KnittingStepCounter';
import KnittingStepInstructions from '../../knitting/components/modal/KnittingStepInstructions';

const NoteCounter = ({ onBack, onGoToLanding }) => {
    const { currentProject: currentNote, updateProject: updateNote } = useActiveContext('notepad');

    // View mode (instructions vs counter)
    const [viewMode, setViewMode] = useLocalStorage(
        `notepad-view-mode-${currentNote?.id}`,
        'counter' // Default to counter for notepad mode
    );

    // Extract step data (with fallback for hooks)
    const step = currentNote?.components?.[0]?.steps?.[0] || null;
    const component = currentNote?.components?.[0] || null;
    const totalSteps = component?.steps?.length || 1;

    // Progress tracking (must be called before any early returns)
    const progress = useKnittingProgress(
        step ? `notepad-${step.id}` : 'notepad-fallback',
        'single',
        step ? [step] : []
    );

    // Theme (force lavender for notepad context)
    const theme = getModalTheme(step || {}, 'notepad');

    // Early return if no note or step
    if (!currentNote || !step) {
        return createPortal(
            <div className="modal" onClick={onBack}>
                <div
                    className="modal-content flex flex-col overflow-hidden shadow-2xl max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="knitting-modal-header">
                        <button
                            onClick={onBack}
                            className="absolute -top-6 -right-6 z-30 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm border border-gray-200"
                        >
                            <X size={18} />
                        </button>
                        <div className="text-center">
                            <div className="text-sm font-medium text-lavender-900">No pattern to knit</div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center">
                            <p className="text-sm text-wool-500 mb-4">
                                This note doesn't have a knitting pattern yet.
                            </p>
                            <button onClick={onBack} className="btn-primary w-full">
                                ← Back to Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // Navigation object (simplified for notepad - no multi-step navigation)
    const navigation = {
        currentStep: 0,
        totalSteps: totalSteps,
        canGoLeft: false, // No navigation for single-step notes
        canGoRight: false,
        isTransitioning: false
    };

    // Create notepad-optimized project and step
    const notepadProject = {
        ...currentNote,
        isNotepadMode: true // Flag for KnittingStepCounter to check
    };

    const notepadStep = {
        ...step,
        disableRowSettings: true // Flag to disable Row 1 Settings
    };

    // Auto-save completion state
    const handleToggleCompletion = () => {
        const isCompleted = progress.isStepCompleted(0);
        progress.toggleStepCompletion(0);

        // Update note with completion state and timestamp
        const updatedStep = { ...step, completed: !isCompleted };
        const updatedNote = {
            ...currentNote,
            components: [{ ...component, steps: [updatedStep] }],
            lastActivityAt: new Date().toISOString()
        };
        updateNote(updatedNote);
    };

    // Render content based on view mode
    const renderContent = () => {
        if (viewMode === 'counter') {
            return (
                <KnittingStepCounter
                    step={notepadStep}
                    component={component}
                    project={notepadProject}
                    theme={theme}
                    progress={progress}
                    stepIndex={0}
                    navigation={navigation}
                    onToggleCompletion={handleToggleCompletion}
                />
            );
        }

        return (
            <KnittingStepInstructions
                step={notepadStep}
                component={component}
                project={notepadProject}
                theme={theme}
                progress={progress}
                navigation={navigation}
            />
        );
    };

    return createPortal(
        <div className="modal" onClick={onBack}>
            <div
                className="modal-content flex flex-col overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - following KnittingStepModal pattern */}
                <div className="knitting-modal-header">
                    <button
                        onClick={onBack}
                        className="absolute -top-6 -right-6 z-30 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm border border-gray-200"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center justify-between">
                        {/* Spacers for centering (no navigation arrows for single-step notes) */}
                        <div style={{ width: '48px' }} />

                        <div className="text-center flex-1 px-2">
                            <div className="text-sm font-medium text-lavender-900 mb-1">
                                {currentNote.name}
                            </div>
                            <div className="text-xs text-lavender-600">
                                Notepad Mode
                            </div>
                        </div>

                        <div style={{ width: '48px' }} />
                    </div>
                </div>

                {/* Main content */}
                {renderContent()}

                {/* Footer with view toggle - following KnittingStepModal pattern */}
                <div className="knitting-modal-footer">
                    <button
                        onClick={() => setViewMode(viewMode === 'instructions' ? 'counter' : 'instructions')}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-colors font-medium shadow-sm bg-lavender-100 hover:bg-lavender-200 text-lavender-700 border border-lavender-300"
                    >
                        <RotateCcw size={18} />
                        <span>
                            {viewMode === 'instructions' ? 'Switch to Counter' : 'Back to Instructions'}
                        </span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NoteCounter;