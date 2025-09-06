// src/features/knitting/components/modal/KnittingStepModal.jsx
import React, { useState, useEffect } from 'react';
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
import KnittingCelebrationCard from './KnittingCelebrationCard';
import KnittingGaugeCard from './KnittingGaugeCard';
import { updateProjectGaugeFromMeasurement } from '../../../../shared/utils/gaugeUtils';

const KnittingStepModal = ({
    step,
    stepIndex,
    component,
    project,
    totalSteps,
    onClose,
    onToggleCompletion,
    onNavigateStep,
    updateProject,
    onShowGaugeCard
}) => {

    // Reset view mode when step changes
    const [viewMode, setViewMode] = useLocalStorage(
        `knitting-view-mode-${project.id}`,
        'instructions'
    );

    // States for cards
    const [showCelebration, setShowCelebration] = useState(false);
    const [showGaugeCard, setShowGaugeCard] = useState(false);
    const [gaugeData, setGaugeData] = useState(null);

    // Add these gauge card handlers in KnittingStepModal.jsx
    const handleGaugeAccept = () => {
        if (gaugeData) {
            const updatedProject = updateProjectGaugeFromMeasurement(project, gaugeData);

            // Update project with new gauge
            if (updateProject) {
                updateProject(updatedProject);
            }

            // Mark step as complete after accepting gauge
            onToggleCompletion(stepIndex);

            // Clear gauge card and navigate
            setShowGaugeCard(false);
            setGaugeData(null);

            // Navigate to next step/card or close modal
            if (project?.isNotepadMode) {
                onClose(); // Close modal for notepad
            } else {
                // Navigate to next step/card for project mode
                if (navigation.canGoRight) {
                    navigation.navigateRight();
                }
            }
        }
    };

    const handleGaugeDecline = () => {
        // Mark step as complete even if declining gauge update
        onToggleCompletion(stepIndex);

        // Clear gauge card and navigate without updating gauge
        setShowGaugeCard(false);
        setGaugeData(null);

        // Navigate to next step/card or close modal
        if (project?.isNotepadMode) {
            onClose(); // Close modal for notepad
        } else {
            // Navigate to next step/card for project mode
            if (navigation.canGoRight) {
                navigation.navigateRight();
            }
        }
    };

    // Fixed: Don't navigate immediately, let React re-render with gauge card
    const handleShowGaugeCard = (promptData) => {
        setGaugeData(promptData);
        setShowGaugeCard(true);
        // DON'T navigate here - let the useEffect handle it after render
    };

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

        // Add gauge card after main step, before assembly notes
        if (showGaugeCard && gaugeData) {
            items.push({
                type: 'gauge',
                stepIndex,
                gaugeData,
                id: `gauge-${stepIndex}`
            });
        }

        // Add assembly card if assembly note exists
        if (afterNote) {
            items.push({
                type: 'assembly',
                stepIndex,
                afterNote,
                id: `assembly-${stepIndex}`
            });
        }

        // Add celebration card if component is complete and this is the last step
        if (stepIndex === totalSteps - 1 && step.completed) {
            items.push({
                type: 'celebration',
                stepIndex,
                id: `celebration-${stepIndex}`
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

    // NEW: Auto-navigate to gauge card when it appears
    useEffect(() => {
        if (showGaugeCard && gaugeData) {
            // Find the gauge card index in carousel items
            const gaugeIndex = carouselItems.findIndex(item => item.type === 'gauge');
            if (gaugeIndex !== -1 && navigation.currentCarouselIndex !== gaugeIndex) {
                // Small delay to ensure DOM is updated
                setTimeout(() => {
                    navigation.setCurrentCarouselIndex(gaugeIndex);
                }, 50);
            }
        }
    }, [showGaugeCard, gaugeData, carouselItems.length]); // Use carouselItems.length to detect changes

    // Progress hook integration
    const progress = useKnittingProgress(project.id, component.id, component.steps);

    // Celebration Callback
    const handleComponentComplete = () => setShowCelebration(true);

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

        if (currentItem.type === 'gauge') {
            return (
                <KnittingGaugeCard
                    gaugeData={currentItem.gaugeData}
                    onAccept={handleGaugeAccept}
                    onDecline={handleGaugeDecline}
                    navigation={navigation}
                    isNotepadMode={project?.isNotepadMode}
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
                    totalSteps={totalSteps}
                    onComponentComplete={handleComponentComplete}
                />
            );
        }

        // Add this after the assembly card case
        if (currentItem.type === 'celebration') {
            return (
                <KnittingCelebrationCard
                    component={component}
                    onClose={onClose}
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
                    onComponentComplete={handleComponentComplete}
                    onShowGaugeCard={handleShowGaugeCard}
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