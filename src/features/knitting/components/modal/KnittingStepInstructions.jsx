// src/features/knitting/components/modal/KnittingStepInstructions.jsx
import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { getFormattedStepDisplay } from '../../../../shared/utils/stepDescriptionUtils';

const KnittingStepInstructions = ({
    step,
    component,
    project,
    theme,
    progress,
    navigation
}) => {
    const { description, contextualPatternNotes, contextualConfigNotes, technicalData } =
        getFormattedStepDisplay(step, component.name, project);

    const isCompleted = progress.isStepCompleted(navigation.currentStep);
    const hasPatternNotes = contextualPatternNotes?.trim().length > 0;
    const hasConfigNotes = contextualConfigNotes?.trim().length > 0;
    const hasBothNotes = hasPatternNotes && hasConfigNotes;

    return (
        <div className={`flex-1 flex flex-col ${theme.cardBg} relative overflow-hidden`}>
            {/* Texture overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='1' stroke-opacity='0.03'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3Cpath d='M15 15l30 30M45 15L15 45'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }} />
            </div>

            {/* Completion toggle */}
            <button
                onClick={() => progress.toggleStepCompletion(navigation.currentStep)}
                className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm shadow-sm border transition-all hover:scale-105"
            >
                {isCompleted ? (
                    <>
                        <CheckCircle2 size={16} className="text-sage-500" />
                        <span className="text-xs font-medium text-sage-700">Done</span>
                    </>
                ) : (
                    <>
                        <Circle size={16} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-600">Mark Done</span>
                    </>
                )}
            </button>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 mt-12 relative z-10">
                <div className="space-y-6 text-center">
                    {/* Step title */}
                    <div className="mb-8">
                        <h2 className={`text-2xl font-semibold mb-2 ${theme.textPrimary} ${isCompleted ? 'line-through opacity-75' : ''}`}>
                            {description}
                        </h2>
                        {!hasPatternNotes && !hasConfigNotes && !technicalData && (
                            <div className="mt-4 text-sage-500 opacity-60">
                                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Pattern notes */}
                    {(hasPatternNotes || hasConfigNotes) && (
                        <div className={`${theme.contentBg} backdrop-blur-sm rounded-2xl p-6 border text-left shadow-sm`}>
                            <h3 className={`text-sm font-semibold mb-4 ${theme.textPrimary}`}>
                                Instructions
                            </h3>

                            {hasPatternNotes && (
                                <div className={`text-sm whitespace-pre-line mb-3 ${theme.textSecondary}`}>
                                    {contextualPatternNotes}
                                </div>
                            )}

                            {hasBothNotes && (
                                <div className="border-t my-3 opacity-30 border-sage-300" />
                            )}

                            {hasConfigNotes && (
                                <div className={`text-sm whitespace-pre-line ${theme.textSecondary}`}>
                                    {contextualConfigNotes}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Technical data */}
                    {technicalData && (
                        <div className={`${theme.contentBg} backdrop-blur-sm rounded-2xl p-4 border shadow-sm`}>
                            <h3 className={`text-sm font-semibold mb-2 ${theme.textPrimary}`}>
                                Details
                            </h3>
                            <div className={`text-sm ${theme.textSecondary}`}>
                                {technicalData}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KnittingStepInstructions;