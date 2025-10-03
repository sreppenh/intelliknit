// src/features/knitting/components/modal/KnittingStepInstructions.jsx
import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { getFormattedStepDisplay } from '../../../../shared/utils/stepDescriptionUtils';
import { isLengthBasedStep } from '../../../../shared/utils/gaugeUtils';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { getHelpGuide } from '../../../../shared/data/KnittingHelpGuides';

const KnittingStepInstructions = ({
    step,
    component,
    project,
    theme,
    progress,
    navigation
}) => {
    const { description, contextualPatternNotes, contextualColorNotes, contextualConfigNotes, technicalData } =
        getFormattedStepDisplay(step, component.name, project);

    const isCompleted = step.completed || false;
    const hasPatternNotes = contextualPatternNotes?.trim().length > 0;
    const hasColorNotes = contextualColorNotes?.trim().length > 0;
    const hasConfigNotes = contextualConfigNotes?.trim().length > 0;

    const [helpExpanded, setHelpExpanded] = useState(false);

    // Get help guide based on step pattern/method
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;
    const pattern = stitchPattern?.pattern;
    const method = stitchPattern?.method;

    const helpTopic = (() => {
        if (!pattern) return null;

        // Cast On methods
        if (pattern === 'Cast On') {
            if (method === 'provisional') return 'provisional_cast_on';
            if (method === 'judy') return 'magic_cast_on';
            if (method === 'garter_tab') return 'garter_tab_cast_on';
        }

        // Bind Off methods
        if (pattern === 'Bind Off') {
            if (method === 'three_needle') return 'three_needle_bindoff';
            if (method === 'sewn') return 'sewn_bindoff';
            if (method === 'stretchy') return 'jssbo_bindoff';  // NEW
            if (method === 'picot') return 'picot_bindoff';     // NEW
        }

        // Pick Up & Knit
        if (pattern === 'Pick Up & Knit') return 'pick_up_knit';

        // Attach to Piece
        if (pattern === 'Attach to Piece' && method === 'kitchener_stitch') return 'kitchener_stitch';

        // Structure patterns (NEW!)
        if (pattern === 'Brioche') return 'brioche_help';
        if (pattern === 'Lace') return 'lace_help';
        if (pattern === 'Cable') return 'cable_help';

        return null;
    })();

    const helpGuide = helpTopic ? getHelpGuide(helpTopic) : null;



    return (
        <div className={`flex-1 flex flex-col ${theme.cardBg} relative overflow-hidden`}>
            {/* Texture overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='1' stroke-opacity='0.03'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3Cpath d='M15 15l30 30M45 15L15 45'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }} />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 mt-6 relative z-10">
                <div className="space-y-6 text-center">

                    {/* Step title */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className={`w-4 h-4 rounded-full border-2 ${isCompleted
                                ? 'bg-sage-500 border-sage-600'
                                : 'bg-yarn-400 border-yarn-500'
                                }`} />
                            <span className={`text-sm font-semibold ${isCompleted ? 'text-sage-700' : 'text-yarn-700'}`}>
                                {isCompleted ? 'Complete' : (() => {
                                    const storageKey = `row-counter-${project?.id}-${component?.id}-${navigation.currentStep}`;
                                    const rowState = JSON.parse(localStorage.getItem(storageKey) || '{}');
                                    const currentRow = rowState.currentRow || 1;

                                    if (isLengthBasedStep(step)) {
                                        return `Row ${currentRow}`;
                                    }

                                    const totalRows = step.totalRows || 1;
                                    return `Row ${currentRow} of ${totalRows}`;
                                })()}
                            </span>
                        </div>
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
                    {(hasPatternNotes || hasColorNotes || hasConfigNotes) && (
                        <div className={`${theme.contentBg} backdrop-blur-sm rounded-2xl p-6 border text-left shadow-sm`}>
                            <h3 className={`text-sm font-semibold mb-4 ${theme.textPrimary}`}>
                                Instructions
                            </h3>

                            {hasPatternNotes && (
                                <div className={`text-sm whitespace-pre-line mb-3 ${theme.textSecondary}`}>
                                    {contextualPatternNotes}
                                </div>
                            )}

                            {hasPatternNotes && hasColorNotes && (
                                <div className="border-t my-3 opacity-30 border-sage-300" />
                            )}

                            {hasColorNotes && (
                                <div className={`text-sm whitespace-pre-line mb-3 ${theme.textSecondary}`}>
                                    {contextualColorNotes}
                                </div>
                            )}

                            {(hasPatternNotes || hasColorNotes) && hasConfigNotes && (
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

                    {/* Help Guide */}
                    {helpGuide && (
                        <div className={`${theme.contentBg} backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden`}>
                            <button
                                onClick={() => setHelpExpanded(!helpExpanded)}
                                className={`w-full px-4 py-3 flex items-center justify-between ${theme.textPrimary} hover:bg-white/50 transition-colors`}
                            >
                                <div className="flex items-center gap-2">
                                    <HelpCircle size={18} className="text-lavender-500" />
                                    <span className="text-sm font-semibold">{helpGuide.title}</span>
                                </div>
                                {helpExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {helpExpanded && (
                                <div className="px-4 pb-4 space-y-3 text-sm border-t border-white/20 text-left">
                                    {Object.entries(helpGuide).map(([key, value]) => {
                                        if (key === 'title' || key === 'tips' || !value) return null;

                                        if (Array.isArray(value)) {
                                            return (
                                                <div key={key}>
                                                    <div className="font-semibold text-lavender-700 mb-1 capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                    </div>
                                                    <ol className="list-decimal list-inside space-y-1 text-wool-600">
                                                        {value.map((item, i) => <li key={i}>{item}</li>)}
                                                    </ol>
                                                </div>
                                            );
                                        } else if (typeof value === 'string') {
                                            return (
                                                <div key={key} className="bg-lavender-50 border border-lavender-200 rounded-lg p-2 text-center">
                                                    <span className="text-lavender-700 font-medium italic">{value}</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}

                                    {helpGuide.tips && (
                                        <div className="bg-yarn-50 border border-yarn-200 rounded-lg p-3">
                                            <div className="font-semibold text-yarn-700 mb-1">Tips:</div>
                                            <ul className="space-y-1 text-yarn-600 text-xs">
                                                {helpGuide.tips.map((tip, i) => <li key={i}>• {tip}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}



                </div>
            </div>
        </div>
    );
};

export default KnittingStepInstructions;