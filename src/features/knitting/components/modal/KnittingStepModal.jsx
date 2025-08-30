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
import KnittingAssemblyCard from './KnittingAssemblyCard';
import { useLocalStorage } from '../../../../shared/hooks/useLocalStorage';

const KnittingStepModal = ({
    step,
    stepIndex,
    component,
    project,
    totalSteps,
    onClose,
    onToggleCompletion,
    onNavigateStep,
    updateProject
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

        // Extract assembly note (afterNote)
        const afterNote = step.afterNote ||
            step.wizardConfig?.afterNote ||
            step.advancedWizardConfig?.afterNote ||
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

        // Add main step card (always present)
        items.push({
            type: 'step',
            stepIndex,
            step,
            id: `step-${stepIndex}`
        });

        // Add assembly card if assembly note exists
        if (afterNote) {
            items.push({
                type: 'assembly',
                stepIndex,
                afterNote,
                id: `assembly-${stepIndex}`
            });
        }

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

        // ✅ NEW: Assembly notes card
        if (currentItem.type === 'assembly') {
            return (
                <KnittingAssemblyCard
                    afterNote={currentItem.afterNote}
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
                    stepIndex={stepIndex}
                    navigation={navigation}
                    updateProject={updateProject}
                    onToggleCompletion={onToggleCompletion}
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
                {/* ✅ FIXED HEADER - Proper CSS classes and event handling */}
                <div className="knitting-modal-header">
                    <button
                        onClick={onClose}
                        className="absolute -top-6 -right-6 z-30 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm border border-gray-200"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center justify-between">
                        {/* ✅ LEFT ARROW: Only show if not at absolute beginning */}
                        {navigation.canGoLeft && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!navigation.isTransitioning && navigation.canGoLeft) {
                                        navigation.navigateLeft();
                                    }
                                }}
                                disabled={!navigation.canGoLeft || navigation.isTransitioning}
                                className="knitting-nav-arrow knitting-nav-arrow-left"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        )}

                        {/* ✅ SPACER: When left arrow is hidden, center the progress info */}
                        {!navigation.canGoLeft && <div style={{ width: '48px' }} />}

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

                        {/* ✅ RIGHT ARROW: Only show if not at absolute end */}
                        {navigation.canGoRight && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!navigation.isTransitioning && navigation.canGoRight) {
                                        navigation.navigateRight();
                                    }
                                }}
                                disabled={!navigation.canGoRight || navigation.isTransitioning}
                                className="knitting-nav-arrow knitting-nav-arrow-right"
                            >
                                <ChevronRight size={18} />
                            </button>
                        )}

                        {/* ✅ SPACER: When right arrow is hidden, maintain spacing */}
                        {!navigation.canGoRight && <div style={{ width: '48px' }} />}
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