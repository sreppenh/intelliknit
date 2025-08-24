import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { getFormattedStepDisplay } from '../../../shared/utils/stepDescriptionUtils';
import { PrepNoteDisplay, AfterNoteDisplay } from '../../../shared/components/PrepStepSystem';

const KnittingStepModal = ({
    step,
    stepIndex,
    component,
    project,
    totalSteps,
    onClose,
    onToggleCompletion,
    onNavigateStep
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Swipe detection
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isRightSwipe && stepIndex > 0) {
            onNavigateStep(-1);
        }
        if (isLeftSwipe && stepIndex < totalSteps - 1) {
            onNavigateStep(1);
        }
    };

    // Extract step data
    const { description, contextualPatternNotes, contextualConfigNotes, technicalData } =
        getFormattedStepDisplay(step, component.name, project);

    const prepNote = step.prepNote ||
        step.wizardConfig?.prepNote ||
        step.advancedWizardConfig?.prepNote ||
        '';

    const afterNote = step.afterNote ||
        step.wizardConfig?.afterNote ||
        step.advancedWizardConfig?.afterNote ||
        '';

    const hasPatternNotes = contextualPatternNotes && contextualPatternNotes.trim().length > 0;
    const hasConfigNotes = contextualConfigNotes && contextualConfigNotes.trim().length > 0;
    const hasBothNotes = hasPatternNotes && hasConfigNotes;

    const modalContent = (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0"
            onClick={onClose}
        >
            <div
                className="relative w-full h-full max-w-md mx-auto bg-white flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Header - Fixed */}
                <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Navigation */}
                        <button
                            onClick={() => onNavigateStep(-1)}
                            disabled={stepIndex === 0}
                            className={`p-2 rounded-full ${stepIndex === 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                                } transition-colors`}
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Step Info */}
                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                                Step {stepIndex + 1} of {totalSteps}
                            </div>
                            <div className="text-xs text-gray-500">
                                {component.name}
                            </div>
                        </div>

                        {/* Navigation */}
                        <button
                            onClick={() => onNavigateStep(1)}
                            disabled={stepIndex === totalSteps - 1}
                            className={`p-2 rounded-full ${stepIndex === totalSteps - 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                                } transition-colors`}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Card Container - Flippable */}
                <div className="flex-1 flex flex-col min-h-0">
                    {!isFlipped ? (
                        /* Detail Side */
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Prep Note - if exists */}
                            {prepNote && (
                                <div className="flex-shrink-0 mx-4 mt-4">
                                    <PrepNoteDisplay
                                        note={prepNote}
                                        className="border-l-4 border-lavender-400 bg-lavender-50"
                                    />
                                </div>
                            )}

                            {/* Main Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto px-4 py-4">
                                <div className="space-y-4">
                                    {/* Step Title */}
                                    <div className="text-center">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                            {description}
                                        </h2>

                                        {/* Completion Toggle */}
                                        <button
                                            onClick={() => onToggleCompletion(stepIndex)}
                                            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-full transition-colors"
                                        >
                                            {step.completed ? (
                                                <>
                                                    <CheckCircle2 size={20} className="text-sage-500" />
                                                    <span className="text-sm font-medium text-sage-700">Completed</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Circle size={20} className="text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-600">Mark Complete</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Pattern Notes */}
                                    {(hasPatternNotes || hasConfigNotes) && (
                                        <div className="bg-sage-50 rounded-xl p-4 border border-sage-200">
                                            <h3 className="text-sm font-semibold text-sage-800 mb-3">Instructions</h3>

                                            {hasPatternNotes && (
                                                <div className="text-sm text-sage-700 whitespace-pre-line mb-3">
                                                    {contextualPatternNotes}
                                                </div>
                                            )}

                                            {hasBothNotes && (
                                                <div className="border-t border-sage-300 my-3 opacity-30" />
                                            )}

                                            {hasConfigNotes && (
                                                <div className="text-sm text-sage-700 whitespace-pre-line">
                                                    {contextualConfigNotes}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Technical Data */}
                                    {technicalData && (
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <h3 className="text-sm font-semibold text-gray-800 mb-2">Details</h3>
                                            <div className="text-sm text-gray-600">
                                                {technicalData}
                                            </div>
                                        </div>
                                    )}

                                    {/* After Note - if exists */}
                                    {afterNote && (
                                        <div className="mt-4">
                                            <AfterNoteDisplay
                                                note={afterNote}
                                                className="border-l-4 border-sage-400 bg-sage-50"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Counter Side - MVP2 Placeholder */
                        <div className="flex-1 flex items-center justify-center bg-yarn-50">
                            <div className="text-center px-6">
                                <div className="text-6xl mb-4">🧶</div>
                                <h3 className="text-xl font-semibold text-yarn-800 mb-2">Row Counter</h3>
                                <p className="text-yarn-600 text-sm mb-4">
                                    Interactive row-by-row tracking coming in MVP2!
                                </p>
                                <div className="bg-white rounded-xl p-4 border-2 border-yarn-300">
                                    <div className="text-2xl font-bold text-yarn-800">Row 1</div>
                                    <div className="text-sm text-yarn-600 mt-1">Current Progress</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Flip Button - Fixed at bottom */}
                    <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3">
                        <button
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-sage-100 hover:bg-sage-200 text-sage-700 rounded-xl transition-colors font-medium"
                        >
                            <RotateCcw size={18} />
                            <span>{isFlipped ? 'View Instructions' : 'Row Counter'}</span>
                        </button>
                    </div>
                </div>

                {/* Swipe Indicator */}
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                        ← Swipe to navigate →
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default KnittingStepModal;