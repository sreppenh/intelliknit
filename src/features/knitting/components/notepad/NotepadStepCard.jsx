// 📱 NOTEPAD WRAPPER - Standalone step tracking
// NotepadCardWrapper.jsx
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import KnittingStepCard from '../modal/KnittingStepCardWrapper';
import { getModalTheme } from '../modal/KnittingModalTheme';
import { useKnittingProgress } from '../../hooks/useKnittingProgress';

const NotepadCardWrapper = ({
    step,
    onClose,
    onDuplicate,
    layout = 'compact',
    className = ''
}) => {
    const [viewMode, setViewMode] = useState('instructions');

    // Use progress hook for individual step tracking
    const progress = useKnittingProgress(`notepad-${step.id}`, 'single', [step]);
    const theme = getModalTheme(step);
    const isCompleted = progress.isStepCompleted(0);

    return (
        <div className={`relative bg-white rounded-xl shadow-lg border-2 border-gray-200 ${className}`}>
            {/* Header with controls */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <span className="text-sm font-medium text-gray-700">
                    Ad-hoc Step
                </span>
                <div className="flex gap-2">
                    {onDuplicate && (
                        <button
                            onClick={() => onDuplicate(step)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                            title="Duplicate step"
                        >
                            <Plus size={16} />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Card content */}
            <div className="p-0">
                <KnittingStepCard
                    step={step}
                    component={null}
                    project={null}
                    isCompleted={isCompleted}
                    theme={theme}
                    viewMode={viewMode}
                    onToggleCompletion={() => progress.toggleStepCompletion(0)}
                    onViewModeChange={setViewMode}
                    progress={progress}
                    layout={layout}
                    showCompletionToggle={true}
                    showViewToggle={true}
                />
            </div>

            {/* Progress indicator */}
            <div className="absolute top-2 right-2 z-30">
                <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-sage-500' : 'bg-gray-300'
                    }`} />
            </div>
        </div>
    );
};

export default NotepadCardWrapper;