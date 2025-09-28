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
import { StandardModal } from '../../../../shared/components/modals/StandardModal';

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
                    step={step}                    // ✅ ADD
                    stepIndex={stepIndex}
                    component={component}          // ✅ ADD
                    project={project}              // ✅ ADD
                    prepNote={currentItem.prepNote}
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

    // Dynamic color scheme based on step type
    const getModalColorScheme = () => {
        if (theme.accent === 'lavender') return 'lavender';
        if (theme.accent === 'yarn') return 'yarn';
        return 'sage'; // default
    };

    return (
        <StandardModal
            isOpen={true}
            onClose={onClose}
            category="complex"
            colorScheme={getModalColorScheme()}
            showButtons={false}
            className="knitting-modal-content"
            allowBackdropClick={true}
            title={`Step ${stepIndex + 1} of ${totalSteps}`}
            subtitle={component.name}
        >
            {/* Fixed position navigation arrows - on top of everything */}
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
                    style={{
                        position: 'fixed',
                        left: '16px',
                        top: '50vh',
                        transform: 'translateY(-50%)',
                        zIndex: 9999
                    }}
                >
                    <ChevronLeft size={18} />
                </button>
            )}

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
                    style={{
                        position: 'fixed',
                        right: '16px',
                        top: '50vh',
                        transform: 'translateY(-50%)',
                        zIndex: 9999
                    }}
                >
                    <ChevronRight size={18} />
                </button>
            )}

            {/* Content with no header gap */}
            <div
                className="flex flex-col overflow-hidden shadow-2xl -m-6"
                onTouchStart={navigation.onTouchStart}
                onTouchMove={navigation.onTouchMove}
                onTouchEnd={navigation.onTouchEnd}
            >
                {/* Content directly connected to header */}
                {renderCardContent()}

                {/* Footer stays the same */}
                {currentItem.type === 'step' && (
                    <div className="knitting-modal-footer">
                        <button
                            onClick={() => setViewMode(viewMode === 'instructions' ? 'counter' : 'instructions')}
                            className="knitting-flip-button"
                        >
                            <RotateCcw size={18} />
                            <span>{viewMode === 'instructions' ? 'Switch to Counter' : 'Back to Instructions'}</span>
                        </button>
                    </div>
                )}

                {/* Transition overlay */}
                {navigation.isTransitioning && (
                    <div className="knitting-transition-overlay">
                        <div className="knitting-transition-message">
                            <div className="text-sm font-medium text-gray-700">Navigating...</div>
                        </div>
                    </div>
                )}
            </div>
        </StandardModal>
    );
};

export default KnittingStepModal;