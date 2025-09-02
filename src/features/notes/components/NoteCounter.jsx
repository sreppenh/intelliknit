// src/features/notes/components/NoteCounter.jsx
import React from 'react';
import { X } from 'lucide-react';
import KnittingStepCounter from '../../knitting/components/modal/KnittingStepCounter';
import { useNotesContext } from '../hooks/useNotesContext';

const NoteCounter = ({ onBack, onGoToLanding }) => {
    const { currentNote, updateNote } = useNotesContext();

    if (!currentNote || !currentNote.components?.[0]?.steps?.[0]) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-sm">
                    <h3 className="text-lg font-medium text-wool-600 mb-2">No pattern to knit</h3>
                    <button onClick={onBack} className="btn-primary btn-sm">← Back</button>
                </div>
            </div>
        );
    }

    const step = currentNote.components[0].steps[0];
    const component = currentNote.components[0];

    const mockProject = {
        id: currentNote.id,
        name: currentNote.name,
        yarns: currentNote.yarns || [],
        gauge: currentNote.gauge || null,
        defaultUnits: currentNote.defaultUnits || 'inches'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] relative">
                {/* Close button */}
                <button
                    onClick={onBack}
                    className="absolute top-4 right-4 z-50 p-2 hover:bg-gray-100 rounded-full"
                >
                    <X size={20} />
                </button>

                {/* Existing KnittingStepCounter */}
                <KnittingStepCounter
                    step={step}
                    component={component}
                    project={mockProject}
                    theme="lavender"
                    progress={{ currentStep: 0, totalSteps: 1 }}
                    stepIndex={0}
                    navigation={{ currentStep: 0, onBack, onGoToLanding }}
                    onToggleCompletion={() => {
                        const updatedStep = { ...step, completed: !step.completed };
                        const updatedNote = {
                            ...currentNote,
                            components: [{ ...component, steps: [updatedStep] }],
                            lastActivityAt: new Date().toISOString()
                        };
                        updateNote(updatedNote);
                    }}
                />
            </div>
        </div>
    );
};

export default NoteCounter;