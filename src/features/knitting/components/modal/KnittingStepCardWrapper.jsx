// 🎯 CORE REUSABLE CARD - Works in any context
// KnittingStepCardWrapper.jsx
import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { getFormattedStepDisplay } from '../../../../shared/utils/stepDescriptionUtils';
import KnittingStepCounter from './KnittingStepCounter';

const KnittingStepCard = ({
    // Core step data
    step,
    component,
    project,

    // Context & state
    isCompleted,
    theme,
    viewMode = 'instructions', // 'instructions' | 'counter'

    // Actions (provided by wrapper)
    onToggleCompletion,
    onViewModeChange,

    // Layout options (wrapper controls these)
    showCompletionToggle = true,
    showViewToggle = true,
    layout = 'full', // 'full' | 'compact' | 'minimal'

    onShowGaugeCard,  // ADD THIS PROP

    // Progress integration (optional for notepad mode)
    progress = null
}) => {
    const { description, contextualPatternNotes, contextualConfigNotes, technicalData } =
        getFormattedStepDisplay(step, component?.name, project);

    const hasPatternNotes = contextualPatternNotes?.trim().length > 0;
    const hasConfigNotes = contextualConfigNotes?.trim().length > 0;
    const hasBothNotes = hasPatternNotes && hasConfigNotes;

    if (viewMode === 'counter') {
        return (
            <KnittingStepCounter  // ✅ Use your existing component
                step={step}
                component={component}
                project={project}
                theme={theme}
                progress={progress}
                navigation={{ currentStep: 0 }} // Simple navigation object
                onShowGaugeCard={onShowGaugeCard}
            />
        );
    }

    // Instructions view
    return (
        <div className={`flex flex-col ${theme.cardBg} relative overflow-hidden ${getLayoutClasses(layout)}`}>
            {/* Texture overlay */}
            {layout === 'full' && (
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='1' stroke-opacity='0.03'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3Cpath d='M15 15l30 30M45 15L15 45'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }} />
                </div>
            )}

            {/* Completion toggle - positioned by wrapper */}
            {showCompletionToggle && (
                <button
                    onClick={onToggleCompletion}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm shadow-sm border transition-all hover:scale-105 ${getCompletionTogglePosition(layout)}`}
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
            )}

            {/* Content - responsive to layout */}
            <div className={getContentClasses(layout)}>
                <div className={getContentSpacing(layout)}>
                    {/* Step title */}
                    <div className={getTitleSpacing(layout)}>
                        <h2 className={`font-semibold ${getTitleSize(layout)} ${theme.textPrimary} ${isCompleted ? 'line-through opacity-75' : ''}`}>
                            {description}
                        </h2>
                    </div>

                    {/* Pattern notes - only show in full/compact layouts */}
                    {layout !== 'minimal' && (hasPatternNotes || hasConfigNotes) && (
                        <div className={`${theme.contentBg} backdrop-blur-sm rounded-xl p-4 border text-left shadow-sm`}>
                            <h3 className={`text-sm font-semibold mb-3 ${theme.textPrimary}`}>
                                Instructions
                            </h3>

                            {hasPatternNotes && (
                                <div className={`text-sm whitespace-pre-line mb-2 ${theme.textSecondary}`}>
                                    {contextualPatternNotes}
                                </div>
                            )}

                            {hasBothNotes && (
                                <div className="border-t my-2 opacity-30 border-sage-300" />
                            )}

                            {hasConfigNotes && (
                                <div className={`text-sm whitespace-pre-line ${theme.textSecondary}`}>
                                    {contextualConfigNotes}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Technical data - only in full layout */}
                    {layout === 'full' && technicalData && (
                        <div className={`${theme.contentBg} backdrop-blur-sm rounded-xl p-3 border shadow-sm`}>
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

            {/* View toggle - positioned by wrapper */}
            {showViewToggle && (
                <div className={getViewTogglePosition(layout)}>
                    <button
                        onClick={() => onViewModeChange?.(viewMode === 'instructions' ? 'counter' : 'instructions')}
                        className="flex items-center justify-center gap-2 py-2 px-4 bg-sage-100 hover:bg-sage-200 text-sage-700 rounded-lg transition-colors font-medium shadow-sm text-sm"
                    >
                        <span>{viewMode === 'instructions' ? 'Counter' : 'Instructions'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// Layout utility functions
const getLayoutClasses = (layout) => {
    switch (layout) {
        case 'full': return 'rounded-2xl min-h-[400px]';
        case 'compact': return 'rounded-xl min-h-[200px]';
        case 'minimal': return 'rounded-lg min-h-[100px]';
        default: return 'rounded-2xl min-h-[400px]';
    }
};

const getCompletionTogglePosition = (layout) => {
    switch (layout) {
        case 'full': return 'absolute top-4 left-4 z-20';
        case 'compact': return 'absolute top-3 left-3 z-20';
        case 'minimal': return 'absolute top-2 right-2 z-20';
        default: return 'absolute top-4 left-4 z-20';
    }
};

const getContentClasses = (layout) => {
    switch (layout) {
        case 'full': return 'flex-1 overflow-y-auto px-6 py-6 mt-12 relative z-10';
        case 'compact': return 'flex-1 overflow-y-auto px-4 py-4 mt-10 relative z-10';
        case 'minimal': return 'flex-1 px-3 py-3 mt-8 relative z-10';
        default: return 'flex-1 overflow-y-auto px-6 py-6 mt-12 relative z-10';
    }
};

const getContentSpacing = (layout) => {
    switch (layout) {
        case 'full': return 'space-y-6 text-center';
        case 'compact': return 'space-y-4 text-center';
        case 'minimal': return 'space-y-2 text-left';
        default: return 'space-y-6 text-center';
    }
};

const getTitleSpacing = (layout) => {
    switch (layout) {
        case 'full': return 'mb-8';
        case 'compact': return 'mb-4';
        case 'minimal': return 'mb-2';
        default: return 'mb-8';
    }
};

const getTitleSize = (layout) => {
    switch (layout) {
        case 'full': return 'text-2xl mb-2';
        case 'compact': return 'text-xl mb-1';
        case 'minimal': return 'text-lg';
        default: return 'text-2xl mb-2';
    }
};

const getViewTogglePosition = (layout) => {
    switch (layout) {
        case 'full': return 'absolute bottom-4 right-4';
        case 'compact': return 'absolute bottom-3 right-3';
        case 'minimal': return 'absolute top-2 left-2';
        default: return 'absolute bottom-4 right-4';
    }
};

export default KnittingStepCard;
