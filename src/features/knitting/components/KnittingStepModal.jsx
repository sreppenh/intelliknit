import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Circle, FileText } from 'lucide-react';
import { getFormattedStepDisplay } from '../../../shared/utils/stepDescriptionUtils';
import { getStepPatternName } from '../../../shared/utils/stepDisplayUtils';
import { useStepNavigation } from '../hooks/useStepNavigation';

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

    // Create carousel items (prep cards + step card)
    const createCarouselItems = (step, stepIndex) => {
        const items = [];

        // Extract prep note
        const prepNote = step.prepNote ||
            step.wizardConfig?.prepNote ||
            step.advancedWizardConfig?.prepNote ||
            '';

        // Add prep card if prep note exists
        if (prepNote) {
            items.push({
                type: 'prep',
                stepIndex,
                prepNote,
                id: `prep-${stepIndex}`
            });
        }

        // Add main step card
        items.push({
            type: 'step',
            stepIndex,
            step,
            id: `step-${stepIndex}`
        });

        return items;
    };

    const carouselItems = createCarouselItems(step, stepIndex);

    // Use the navigation hook
    const navigation = useStepNavigation({
        stepIndex,
        totalSteps,
        carouselItems,
        onNavigateStep,
        onToggleCompletion,
        isModalOpen: true
    });

    // Reset flip state when step changes
    useEffect(() => {
        setIsFlipped(false);
    }, [stepIndex]);

    // Get step theme based on pattern type
    const getStepTheme = (step) => {
        const patternName = getStepPatternName(step);

        // Lavender: Setup & Finishing
        if (['Cast On', 'Bind Off', 'Put on Holder', 'Other Ending', 'Pick Up & Knit', 'Continue from Stitches'].includes(patternName)) {
            return {
                cardBg: 'bg-gradient-to-br from-lavender-25 via-white to-lavender-50',
                contentBg: 'bg-lavender-50/30 border-lavender-200/50',
                textPrimary: 'text-lavender-900',
                textSecondary: 'text-lavender-700',
                accent: 'lavender'
            };
        }

        // Yarn: Colorwork & Special Techniques  
        if (['Stripes', 'Fair Isle', 'Intarsia', 'Colorwork'].includes(patternName)) {
            return {
                cardBg: 'bg-gradient-to-br from-yarn-25 via-white to-yarn-50',
                contentBg: 'bg-yarn-50/30 border-yarn-200/50',
                textPrimary: 'text-yarn-900',
                textSecondary: 'text-yarn-700',
                accent: 'yarn'
            };
        }

        // Sage: Main patterns (default)
        return {
            cardBg: 'bg-gradient-to-br from-sage-25 via-white to-sage-50',
            contentBg: 'bg-sage-50/30 border-sage-200/50',
            textPrimary: 'text-sage-900',
            textSecondary: 'text-sage-700',
            accent: 'sage'
        };
    };

    // Get completed theme (wool-based)
    const getCompletedTheme = () => {
        return {
            cardBg: 'bg-gradient-to-br from-wool-100 via-wool-50 to-wool-75',
            contentBg: 'bg-wool-100/50 border-wool-300/50',
            textPrimary: 'text-wool-800',
            textSecondary: 'text-wool-600',
            accent: 'wool'
        };
    };

    const currentItem = navigation.currentItem || carouselItems[0];

    // Extract step data for main step card
    const { description, contextualPatternNotes, contextualConfigNotes, technicalData } =
        getFormattedStepDisplay(step, component.name, project);

    const hasPatternNotes = contextualPatternNotes && contextualPatternNotes.trim().length > 0;
    const hasConfigNotes = contextualConfigNotes && contextualConfigNotes.trim().length > 0;
    const hasBothNotes = hasPatternNotes && hasConfigNotes;

    // Get theme for current step
    const isCompleted = step.completed;
    const theme = isCompleted ? getCompletedTheme() : getStepTheme(step);

    const renderCard = () => {
        if (currentItem.type === 'prep') {
            // Enhanced lavender prep card with subtle texture
            return (
                <div className="flex-1 flex flex-col bg-gradient-to-br from-lavender-50 via-lavender-25 to-white relative overflow-hidden">
                    {/* Subtle texture overlay */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <div className="w-full h-full" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '40px 40px'
                        }} />
                    </div>

                    {/* Floating Navigation Arrows */}
                    {navigation.canGoLeft && (
                        <button
                            onClick={navigation.navigateLeft}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-lavender-600 hover:text-lavender-700 transition-all hover:scale-105"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}

                    {navigation.canGoRight && (
                        <button
                            onClick={navigation.navigateRight}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-lavender-600 hover:text-lavender-700 transition-all hover:scale-105"
                        >
                            <ChevronRight size={20} />
                        </button>
                    )}

                    {/* Prep Card Content */}
                    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-500 text-white flex items-center justify-center mb-6 shadow-lg">
                            <FileText size={28} />
                        </div>
                        <h2 className="text-2xl font-semibold text-lavender-800 mb-4">
                            Preparation
                        </h2>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-lavender-200/50 max-w-sm">
                            <p className="text-lavender-700 text-lg leading-relaxed">
                                "{currentItem.prepNote}"
                            </p>
                        </div>
                        <p className="text-lavender-600 text-sm mt-6 opacity-75">
                            Take your time to prepare, then swipe to continue →
                        </p>
                    </div>
                </div>
            );
        } else {
            // Main Step Card with warm theming
            if (!isFlipped) {
                // Instructions Side with warm theming and texture
                return (
                    <div className={`flex-1 flex flex-col ${theme.cardBg} relative overflow-hidden`}>
                        {/* Subtle texture overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="w-full h-full" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='1' stroke-opacity='0.03'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3Cpath d='M15 15l30 30M45 15L15 45'/%3E%3C/g%3E%3C/svg%3E")`,
                                backgroundSize: '60px 60px'
                            }} />
                        </div>

                        {/* Completion Toggle - Top Left */}
                        <button
                            onClick={navigation.toggleCurrentStepCompletion}
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

                        {/* Floating Navigation Arrows */}
                        {navigation.canGoLeft && (
                            <button
                                onClick={navigation.navigateLeft}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-sage-600 hover:text-sage-700 transition-all hover:scale-105"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}

                        {navigation.canGoRight && (
                            <button
                                onClick={navigation.navigateRight}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-sage-600 hover:text-sage-700 transition-all hover:scale-105"
                            >
                                <ChevronRight size={20} />
                            </button>
                        )}

                        {/* Main Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 mt-12 relative z-10">
                            <div className="space-y-6 text-center">
                                {/* Step Title */}
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

                                {/* Pattern Notes */}
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

                                {/* Technical Data */}
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
            } else {
                // Counter Side with coordinated theming
                return (
                    <div className={`flex-1 flex flex-col items-center justify-center ${theme.cardBg} relative overflow-hidden`}>
                        {/* Subtle pattern overlay for counter */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none">
                            <div className="w-full h-full" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='2' stroke-opacity='0.08'%3E%3Ccircle cx='40' cy='40' r='30'/%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
                                backgroundSize: '80px 80px'
                            }} />
                        </div>

                        {/* Floating Navigation Arrows */}
                        {navigation.canGoLeft && (
                            <button
                                onClick={navigation.navigateLeft}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-sage-600 hover:text-sage-700 transition-all hover:scale-105"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}

                        {navigation.canGoRight && (
                            <button
                                onClick={navigation.navigateRight}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-sage-600 hover:text-sage-700 transition-all hover:scale-105"
                            >
                                <ChevronRight size={20} />
                            </button>
                        )}

                        <div className="text-center px-6 relative z-10">
                            <div className="text-6xl mb-4">🧶</div>
                            <h3 className={`text-xl font-semibold mb-2 ${theme.textPrimary}`}>
                                Row Counter
                            </h3>
                            <p className={`text-sm mb-6 ${theme.textSecondary}`}>
                                Interactive row-by-row tracking coming in MVP2!
                            </p>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                                <div className={`text-3xl font-bold ${theme.textPrimary} mb-2`}>
                                    Row 1
                                </div>
                                <div className={`text-sm ${theme.textSecondary}`}>
                                    Current Progress
                                </div>

                                {/* Mock progress ring */}
                                <div className="mt-4 relative w-16 h-16 mx-auto">
                                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                                        <circle
                                            cx="32" cy="32" r="28"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="text-gray-200"
                                        />
                                        <circle
                                            cx="32" cy="32" r="28"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            className="text-sage-500"
                                            strokeDasharray="176"
                                            strokeDashoffset="140"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-xs font-semibold ${theme.textPrimary}`}>20%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        }
    };

    const modalContent = (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0"
            onClick={onClose}
        >
            <div
                className="relative w-full h-full max-w-md mx-auto bg-white flex flex-col overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={navigation.onTouchStart}
                onTouchMove={navigation.onTouchMove}
                onTouchEnd={navigation.onTouchEnd}
            >
                {/* Header - Clean with just close and context */}
                <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 relative shadow-sm">
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                            Step {stepIndex + 1} of {totalSteps}
                        </div>
                        <div className="text-xs text-gray-500">
                            {component.name}
                        </div>

                        {/* Progress indicator */}
                        <div className="mt-2 flex justify-center">
                            <div className="flex space-x-1">
                                {Array.from({ length: totalSteps }, (_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-1 rounded-full transition-colors ${i === stepIndex
                                                ? 'bg-sage-500'
                                                : i < stepIndex
                                                    ? 'bg-sage-300'
                                                    : 'bg-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Close button - top right */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Card Content */}
                {renderCard()}

                {/* Flip Button - Only show for step cards, not prep cards */}
                {currentItem.type === 'step' && (
                    <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 shadow-sm">
                        <button
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-sage-100 hover:bg-sage-200 text-sage-700 rounded-xl transition-colors font-medium shadow-sm"
                        >
                            <RotateCcw size={18} />
                            <span>{isFlipped ? 'View Instructions' : 'Row Counter'}</span>
                        </button>
                    </div>
                )}

                {/* Transition feedback */}
                {navigation.isTransitioning && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                            <div className="text-sm font-medium text-gray-700">Navigating...</div>
                        </div>
                    </div>
                )}

                {/* Progress Dots - Show carousel position */}
                {carouselItems.length > 1 && (
                    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
                        <div className="flex space-x-2">
                            {carouselItems.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === navigation.currentCarouselIndex
                                            ? 'bg-sage-500'
                                            : 'bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default KnittingStepModal;