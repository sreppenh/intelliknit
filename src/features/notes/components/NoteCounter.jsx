// src/features/notes/components/NoteCounter.jsx
import React from 'react';
import KnittingStepCounter from '../../knitting/components/modal/KnittingStepCounter';
import { useNotesContext } from '../hooks/useNotesContext';

const NoteCounter = ({ onBack, onGoToLanding }) => {
    const { currentNote } = useNotesContext();

    if (!currentNote || !currentNote.components?.[0]?.steps?.[0]) {
        return (
            <div className="min-h-screen bg-lavender-50 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-wool-600 mb-2">No pattern to knit</h3>
                    <button onClick={onBack} className="btn-primary btn-sm">← Back</button>
                </div>
            </div>
        );
    }

    const step = currentNote.components[0].steps[0];
    const component = currentNote.components[0];

    // Transform note into project-like structure for KnittingStepCounter
    const mockProject = {
        id: currentNote.id,
        name: currentNote.name,
        yarns: currentNote.yarns || [],
        gauge: currentNote.gauge || null,
        defaultUnits: currentNote.defaultUnits || 'inches'
    };

    const mockNavigation = {
        currentStep: 0,
        onBack,
        onGoToLanding
    };

    return (
        <div className="min-h-screen bg-lavender-50">
            <KnittingStepCounter
                step={step}
                component={component}
                project={mockProject}
                theme="lavender"
                progress={{ currentStep: 0, totalSteps: 1 }}
                stepIndex={0}
                navigation={mockNavigation}
                onToggleCompletion={() => {
                    // Handle step completion - mark note step as complete
                    console.log('Note step completed');
                }}
            />
        </div>
    );
};

export default NoteCounter;