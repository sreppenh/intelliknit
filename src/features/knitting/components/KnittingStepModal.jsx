import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Circle, FileText } from 'lucide-react';
import { getFormattedStepDisplay } from '../../../shared/utils/stepDescriptionUtils';

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
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

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

    // Reset carousel when step changes
    useEffect(() => {
        setCurrentCarouselIndex(0);
        setIsFlipped(false);
    }, [stepIndex]);

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

        // Handle carousel navigation within current step
        if (isRightSwipe && currentCarouselIndex > 0) {
            setCurrentCarouselIndex(currentCarouselIndex - 1);
            return;
        }
        if (isLeftSwipe && currentCarouselIndex < carouselItems.length - 1) {
            setCurrentCarouselIndex(currentCarouselIndex + 1);
            return;
        }

        // Handle step navigation
        if (isRightSwipe && currentCarouselIndex === 0 && stepIndex > 0) {
            onNavigateStep(-1);
        }
        if (isLeftSwipe && currentCarouselIndex === carouselItems.length - 1 && stepIndex < totalSteps - 1) {
            onNavigateStep(1);
        }
    };

    const handleArrowClick = (direction) => {
        if (direction === 'left') {
            if (currentCarouselIndex > 0) {
                setCurrentCarouselIndex(currentCarouselIndex - 1);
            } else if (stepIndex > 0) {
                onNavigateStep(-1);
            }
        } else {
            if (currentCarouselIndex < carouselItems.length - 1) {
                setCurrentCarouselIndex(currentCarouselIndex + 1);
            } else if (stepIndex < totalSteps - 1) {
                onNavigateStep(1);
            }
        }
    };

    // Safety check - ensure carousel index is valid and get current item
    const safeCarouselIndex = Math.min(currentCarouselIndex, carouselItems.length - 1);
    const currentItem = carouselItems[safeCarouselIndex];

    // Sync carousel index if it's out of bounds
    useEffect(() => {
        if (currentCarouselIndex >= carouselItems.length && carouselItems.length > 0) {
            setCurrentCarouselIndex(0);
        }
    }, [currentCarouselIndex, carouselItems.length]);
    const canGoLeft = currentCarouselIndex > 0 || stepIndex > 0;
    const canGoRight = currentCarouselIndex < carouselItems.length - 1 || stepIndex < totalSteps - 1;

    // Safety check - if no current item, return loading state
    if (!currentItem) {
        return createPortal(
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-6">
                    <div className="text-center">Loading step...</div>
                </div>
            </div>,
            document.body
        );
    }

    // Extract step data for main step card
    const { description, contextualPatternNotes, contextualConfigNotes, technicalData } =
        getFormattedStepDisplay(step, component.name, project);

    const hasPatternNotes = contextualPatternNotes && contextualPatternNotes.trim().length > 0;
    const hasConfigNotes = contextualConfigNotes && contextualConfigNotes.trim().length > 0;
    const hasBothNotes = hasPatternNotes && hasConfigNotes;

    const renderCard = () => {
        if (currentItem.type === 'prep') {
            // Prep Card - Lavender themed
            return (
                <div className="flex-1 flex flex-col bg-lavender-50 relative overflow-hidden">
                    {/* Floating Navigation Arrows */}
                    {canGoLeft && (
                        <button
                            onClick={() => handleArrowClick('left')}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}

                    {canGoRight && (
                        <button
                            onClick={() => handleArrowClick('right')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    )}

                    {/* Prep Card Content */}
                    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-lavender-400 text-white flex items-center justify-center mb-6 shadow-lg">
                            <FileText size={28} />
                        </div>
                        <h2 className="text-2xl font-semibold text-lavender-800 mb-3">
                            Preparation
                        </h2>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-lavender-200 max-w-sm">
                            <p className="text-lavender-700 text-lg leading-relaxed">
                                "{currentItem.prepNote}"
                            </p>
                        </div>
                        <p className="text-lavender-600 text-sm mt-6">
                            Take your time to prepare, then swipe to continue →
                        </p>
                    </div>
                </div>
            );
        } else {
            // Main Step Card
            const isCompleted = step.completed;
            const cardTheme = isCompleted
                ? 'bg-wool-50' // Completed cards use wool theme
                : 'bg-white';
            const textTheme = isCompleted
                ? 'text-wool-700'
                : 'text-gray-900';

            if (!isFlipped) {
                // Instructions Side
                return (
                    <div className={`flex-1 flex flex-col ${cardTheme} relative overflow-hidden`}>
                        {/* Completion Toggle - Top Left */}
                        <button
                            onClick={() => onToggleCompletion(stepIndex)}
                            className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 shadow-sm border transition-all"
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
                        {canGoLeft && (
                            <button
                                onClick={() => handleArrowClick('left')}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}

                        {canGoRight && (
                            <button
                                onClick={() => handleArrowClick('right')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        )}

                        {/* Main Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 mt-12">
                            <div className="space-y-6 text-center">
                                {/* Step Title */}
                                <div>
                                    <h2 className={`text-2xl font-semibold mb-2 ${textTheme} ${isCompleted ? 'line-through opacity-75' : ''}`}>
                                        {description}
                                    </h2>
                                </div>

                                {/* Pattern Notes */}
                                {(hasPatternNotes || hasConfigNotes) && (
                                    <div className={`${isCompleted ? 'bg-wool-100 border-wool-300' : 'bg-sage-50 border-sage-200'} rounded-xl p-6 border text-left`}>
                                        <h3 className={`text-sm font-semibold mb-4 ${isCompleted ? 'text-wool-800' : 'text-sage-800'}`}>
                                            Instructions
                                        </h3>

                                        {hasPatternNotes && (
                                            <div className={`text-sm whitespace-pre-line mb-3 ${isCompleted ? 'text-wool-700' : 'text-sage-700'}`}>
                                                {contextualPatternNotes}
                                            </div>
                                        )}

                                        {hasBothNotes && (
                                            <div className={`border-t my-3 opacity-30 ${isCompleted ? 'border-wool-300' : 'border-sage-300'}`} />
                                        )}

                                        {hasConfigNotes && (
                                            <div className={`text-sm whitespace-pre-line ${isCompleted ? 'text-wool-700' : 'text-sage-700'}`}>
                                                {contextualConfigNotes}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Technical Data */}
                                {technicalData && (
                                    <div className={`${isCompleted ? 'bg-wool-100 border-wool-200' : 'bg-gray-50 border-gray-200'} rounded-xl p-4 border`}>
                                        <h3 className={`text-sm font-semibold mb-2 ${isCompleted ? 'text-wool-800' : 'text-gray-800'}`}>
                                            Details
                                        </h3>
                                        <div className={`text-sm ${isCompleted ? 'text-wool-600' : 'text-gray-600'}`}>
                                            {technicalData}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            } else {
                // Counter Side - MVP2 Placeholder
                return (
                    <div className={`flex-1 flex flex-col items-center justify-center ${isCompleted ? 'bg-wool-50' : 'bg-yarn-50'} relative`}>
                        {/* Floating Navigation Arrows */}
                        {canGoLeft && (
                            <button
                                onClick={() => handleArrowClick('left')}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}

                        {canGoRight && (
                            <button
                                onClick={() => handleArrowClick('right')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        )}

                        <div className="text-center px-6">
                            <div className="text-6xl mb-4">🧶</div>
                            <h3 className={`text-xl font-semibold mb-2 ${isCompleted ? 'text-wool-800' : 'text-yarn-800'}`}>
                                Row Counter
                            </h3>
                            <p className={`text-sm mb-4 ${isCompleted ? 'text-wool-600' : 'text-yarn-600'}`}>
                                Interactive row-by-row tracking coming in MVP2!
                            </p>
                            <div className="bg-white rounded-xl p-4 border-2 border-yarn-300">
                                <div className={`text-2xl font-bold ${isCompleted ? 'text-wool-800' : 'text-yarn-800'}`}>
                                    Row 1
                                </div>
                                <div className={`text-sm mt-1 ${isCompleted ? 'text-wool-600' : 'text-yarn-600'}`}>
                                    Current Progress
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
                className="relative w-full h-full max-w-md mx-auto bg-white flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Header - Clean with just close and context */}
                <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 relative">
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                            Step {stepIndex + 1} of {totalSteps}
                        </div>
                        <div className="text-xs text-gray-500">
                            {component.name}
                        </div>
                    </div>

                    {/* Close button - top right */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Card Content */}
                {renderCard()}

                {/* Flip Button - Only show for step cards, not prep cards */}
                {currentItem.type === 'step' && (
                    <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3">
                        <button
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-sage-100 hover:bg-sage-200 text-sage-700 rounded-xl transition-colors font-medium"
                        >
                            <RotateCcw size={18} />
                            <span>{isFlipped ? 'View Instructions' : 'Row Counter'}</span>
                        </button>
                    </div>
                )}

                {/* Progress Dots - Show carousel position */}
                {carouselItems.length > 1 && (
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                        <div className="flex space-x-2">
                            {carouselItems.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentCarouselIndex
                                            ? 'bg-sage-500'
                                            : 'bg-gray-300'
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