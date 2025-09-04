import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useActiveContext } from '../../../shared/hooks/useActiveContext';
import { useKnittingProgress } from '../../knitting/hooks/useKnittingProgress';
import { getModalTheme } from '../../knitting/components/modal/KnittingModalTheme';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';
import { StandardModal } from '../../../shared/components/modals/StandardModal';
import KnittingStepCounter from '../../knitting/components/modal/KnittingStepCounter';
import KnittingStepInstructions from '../../knitting/components/modal/KnittingStepInstructions';

/**
 * NoteCounter - Knitting modal for notes using StandardModal
 * Specialized knitting modal with lavender theme for notepad context
 */
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

    // Early return if no note or step - now using StandardModal
    if (!currentNote || !step) {
        return (
            <StandardModal
                isOpen={true}
                onClose={onBack}
                category="complex"
                colorScheme="knitting"
                showButtons={false}
                className="max-w-sm"
            >
                <div className="text-center py-8">
                    <div className="text-sm font-medium text-lavender-900 mb-4">No pattern to knit</div>
                    <p className="text-sm text-wool-500 mb-6">
                        This note doesn't have a knitting pattern yet.
                    </p>
                    <button onClick={onBack} className="btn-primary w-full">
                        ← Back to Note
                    </button>
                </div>
            </StandardModal>
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
                    onClose={onBack}
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

    // Main knitting modal using StandardModal - clean white background like project version
    return (
        <StandardModal
            isOpen={true}
            onClose={onBack}
            category="complex"
            colorScheme="lavender"  // Clean white background, not lavender
            showButtons={false}
            className="knitting-modal-content"
            allowBackdropClick={true}
            title={currentNote.name}
            subtitle="Notepad Mode"
        >
            {/* Match project knitting modal design - clean white header */}
            <div className="flex flex-col overflow-hidden shadow-2xl -m-6">

                {/* Clean Knitting Header - matches project version styling */}
                <div className="knitting-modal-header">
                    <button
                        onClick={onBack}
                        className="absolute -top-6 -right-6 z-30 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm border border-gray-200"
                    >
                        <X size={18} />
                    </button>

                </div>

                {/* Main content - exact match to original */}
                {renderContent()}

                {/* Clean Knitting Footer - matches project version with notepad styling */}
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
        </StandardModal>
    );
};

export default NoteCounter;