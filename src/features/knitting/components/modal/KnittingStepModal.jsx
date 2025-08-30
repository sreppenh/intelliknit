// src/features/knitting/components/modal/KnittingStepModal.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStepNavigation } from '../../hooks/useStepNavigation';
import { useKnittingProgress } from '../../hooks/useKnittingProgress';
import { getModalTheme } from './KnittingModalTheme';
import KnittingStepInstructions from './KnittingStepInstructions';
import KnittingStepCounter from './KnittingStepCounter';
import KnittingPrepCard from './KnittingPrepCard';
import { useLocalStorage } from '../../../../shared/hooks/useLocalStorage';

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

    // Reset view mode when step changes
    const [viewMode, setViewMode] = useLocalStorage(
        `knitting-view-mode-${project.id}`,
        'instructions'
    );

    // Create carousel items
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

    // Create carousel items
    const carouselItems = createCarouselItems(step, stepIndex);

    // Navigation hook
    const navigation = useStepNavigation({
        stepIndex,
        totalSteps,
        carouselItems,
        onNavigateStep,
        onToggleCompletion,
        isModalOpen: true
    });

    // Progress hook integration
    const progress = useKnittingProgress(project.id, component.id, component.steps);

    // Theme for current step
    const theme = getModalTheme(step);
    const currentItem = navigation.currentItem || carouselItems[0];

    const renderCardContent = () => {
        if (currentItem.type === 'prep') {
            return (
                <KnittingPrepCard
                    prepNote={currentItem.prepNote}
                    stepIndex={stepIndex}
                    navigation={navigation}
                />
            );
        }

        if (viewMode === 'counter') {
            return (
                <KnittingStepCounter
                    step={step}
                    component={component}
                    project={project}
                    theme={theme}
                    progress={progress}
                    navigation={navigation}
                />
            );
        }

        return (
            <KnittingStepInstructions
                step={step}
                component={component}
                project={project}
                theme={theme}
                progress={progress}
                navigation={navigation}
            />
        );
    };

    return createPortal(
        <div className="modal" onClick={onClose}>
            <div
                className="modal-content flex flex-col overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={navigation.onTouchStart}
                onTouchMove={navigation.onTouchMove}
                onTouchEnd={navigation.onTouchEnd}
            >
                {/* ✅ CLEANED HEADER - Focus on essential info */}
                <div className="knitting-modal-header">
                    <button
                        onClick={onClose}
                        className="absolute -top-6 -right-6 z-30 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm border border-gray-200"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigation.navigateLeft();
                            }}
                            disabled={!navigation.canGoLeft}
                            className="knitting-nav-arrow-left p-2 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="text-center flex-1 px-2">
                            {/* ✅ SIMPLIFIED: Just step progress + component name */}
                            <div className="text-sm font-medium text-gray-900 mb-1">
                                Step {stepIndex + 1} of {totalSteps} • {component.name}
                            </div>
                            {/* ✅ KEPT: Progress dots - they're useful and clean */}
                            <div className="flex justify-center space-x-1">
                                {Array.from({ length: totalSteps }, (_, i) => (
                                    <div
                                        key={i}
                                        className={`knitting-progress-dot ${i === stepIndex
                                            ? 'knitting-progress-dot-active'
                                            : i < stepIndex
                                                ? 'bg-sage-300'
                                                : 'knitting-progress-dot-inactive'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigation.navigateRight();
                            }}
                            disabled={!navigation.canGoRight}
                            className="knitting-nav-arrow-right p-2 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Card content */}
                {renderCardContent()}

                {/* Footer with view toggle */}
                {currentItem.type === 'step' && (
                    <div className="knitting-modal-footer">
                        <button
                            onClick={() => setViewMode(viewMode === 'instructions' ? 'counter' : 'instructions')}
                            className="knitting-flip-button w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-colors font-medium shadow-sm"
                        >
                            <RotateCcw size={18} />
                            <span>{viewMode === 'instructions' ? 'Switch to Counter' : 'Back to Instructions'}</span>
                        </button>
                    </div>
                )}

                {/* Transition feedback */}
                {navigation.isTransitioning && (
                    <div className="knitting-transition-overlay">
                        <div className="knitting-transition-message">
                            <div className="text-sm font-medium text-gray-700">Navigating...</div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default KnittingStepModal;