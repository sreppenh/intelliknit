import React, { useState, useCallback, useEffect } from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import PageHeader from '../../../shared/components/PageHeader';
import { getFormattedStepDisplay } from '../../../shared/utils/stepDescriptionUtils';
import KnittingStepModal from './modal/KnittingStepModal';
import { isLengthBasedStep } from '../../../shared/utils/gaugeUtils';
import { getPrepCardColorInfo } from '../../../shared/utils/prepCardUtils';
import { UnifiedPrepDisplay } from '../../../shared/components/PrepStepSystem';
import StandardModal from '../../../shared/components/modals/StandardModal';

// ✅ NEW: Import progress tracking utilities
import {
  getStepProgressState,
  saveStepProgressState,
  clearStepProgressState,
  canStartStep,
  inferProgressFromStep,
  needsRowVerification,
  getComponentProgressStats,
  migrateOldCompletionFlags,
  PROGRESS_STATUS
} from '../../../shared/utils/progressTracking';

const Tracking = ({ onBack, onEditSteps, onGoToLanding }) => {
  const { currentProject, activeComponentIndex, dispatch } = useProjectsContext();
  const [localActiveIndex, setLocalActiveIndex] = useState(activeComponentIndex || 0);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [showStepModal, setShowStepModal] = useState(false);

  // ✅ NEW: Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState(null);

  // ✅ NEW: Force re-render trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);  // ✅ CORRECT

  // ✅ IMPORTANT: Calculate activeComponent BEFORE hooks (needed for hook dependencies)
  const activeComponent = currentProject?.components[localActiveIndex];

  // ✅ NEW: Get progress stats using new system (BEFORE hooks)
  const progressStats = activeComponent ? getComponentProgressStats(
    activeComponent.steps,
    activeComponent.id,
    currentProject.id
  ) : null;

  // ✅ NEW: One-time migration of old completion flags
  useEffect(() => {
    if (activeComponent && currentProject) {
      const progressKey = `knitting-progress-${currentProject.id}-${activeComponent.id}`;
      const hasNewProgress = localStorage.getItem(progressKey);

      // If no new progress exists, migrate old completed flags
      if (!hasNewProgress) {
        migrateOldCompletionFlags(activeComponent, currentProject.id);
        setRefreshTrigger(prev => prev + 1); // Trigger re-render after migration
      }
    }
  }, [activeComponent?.id, currentProject?.id]);

  const updateProject = useCallback((updatedProject) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
  }, [dispatch]);

  // ✅ NEW: Smart checkbox handler with sequential enforcement (MUST be before early return)
  const handleCheckboxClick = useCallback((componentIndex, stepIndex) => {
    if (!currentProject) return;
    const component = currentProject.components[componentIndex];
    const step = component.steps[stepIndex];
    const progress = getStepProgressState(step.id, component.id, currentProject.id);

    // Handle NOT_STARTED steps
    if (progress.status === PROGRESS_STATUS.NOT_STARTED) {
      // Check if can start
      if (!canStartStep(stepIndex, component.steps, component.id, currentProject.id)) {
        // Show toast or alert
        alert('⚠️ Complete previous steps first');
        return;
      }

      // Infer completion from step data
      const inferred = inferProgressFromStep(step, currentProject);

      // Save as completed
      saveStepProgressState(step.id, component.id, currentProject.id, {
        status: PROGRESS_STATUS.COMPLETED,
        ...inferred,
        completionMethod: 'checkbox',
        completedAt: new Date().toISOString()
      });

      // Show warning for length-based steps without gauge
      if (needsRowVerification(step, currentProject)) {
        alert('✓ Step completed\n\nNote: Row count is estimated. Verify in knitting mode if needed.');
      }

      // Force re-render to show updated state
      setRefreshTrigger(prev => prev + 1);
      return;
    }

    // Handle IN_PROGRESS steps
    if (progress.status === PROGRESS_STATUS.IN_PROGRESS) {
      const remaining = (progress.totalRows || step.totalRows) - progress.currentRow;
      const finalRow = progress.totalRows || step.totalRows;

      setConfirmDialogData({
        title: 'Complete Remaining Rows?',
        message: `Mark the remaining ${remaining} rows as complete?`,
        onConfirm: () => {
          // Save to progress system
          saveStepProgressState(step.id, component.id, currentProject.id, {
            status: PROGRESS_STATUS.COMPLETED,
            currentRow: finalRow,
            totalRows: finalRow,
            completionMethod: 'checkbox',
            completedAt: new Date().toISOString()
          });

          // Update row counter
          console.log('Updating row counter:', {
            stepIndex,
            finalRow,
            key: `row-counter-${currentProject.id}-${component.id}-${stepIndex}`
          });

          // ✅ NEW: Also update the row counter localStorage
          const rowCounterKey = `row-counter-${currentProject.id}-${component.id}-${step.id}`;
          const rowCounterState = {
            currentRow: finalRow,
            stitchCount: step.endingStitches || step.startingStitches || 0,
            lastUpdated: Date.now()
          };
          localStorage.setItem(rowCounterKey, JSON.stringify(rowCounterState));

          console.log('After setItem:', localStorage.getItem(rowCounterKey));

          setShowConfirmDialog(false);
          setRefreshTrigger(prev => prev + 1);
        },
        onCancel: () => {
          setShowConfirmDialog(false);
          setConfirmDialogData(null);
        }
      });

      setShowConfirmDialog(true);
      return;
    }

    // When user clicks checkbox on a COMPLETED step (any completed step)
    if (progress.status === PROGRESS_STATUS.COMPLETED) {
      // Find all steps after this one
      const stepsToReset = [];
      for (let i = stepIndex + 1; i < component.steps.length; i++) {
        stepsToReset.push(component.steps[i]);
      }

      const resetMessage = stepsToReset.length > 0
        ? `This will reset all steps from Step ${stepIndex + 1} through Step ${stepsToReset.length + stepIndex + 1}. You will lose all progress on these steps.`
        : `This will reset Step ${stepIndex + 1}.`;

      setConfirmDialogData({
        title: '⚠️ Frog Steps?',
        message: resetMessage,
        onConfirm: () => {
          // Clear this step
          clearStepProgressState(step.id, component.id, currentProject.id, stepIndex);

          // Clear all subsequent steps
          stepsToReset.forEach((s, idx) => {
            const actualStepIndex = stepIndex + 1 + idx;
            clearStepProgressState(s.id, component.id, currentProject.id, actualStepIndex);
          });

          setShowConfirmDialog(false);
          setRefreshTrigger(prev => prev + 1);
        },
        onCancel: () => {
          setShowConfirmDialog(false);
          setConfirmDialogData(null);
        }
      });

      setShowConfirmDialog(true);
      return;
    }
  }, [currentProject, dispatch]);

  // ✅ LEGACY: Keep old handler for backward compatibility with modal
  const handleToggleStepCompletion = useCallback((componentIndex, stepIndex, updatedProject = null) => {
    // ✅ CHANGED: Don't redirect to checkbox handler anymore
    // The modal handles its own completion via progress system
    // This is only for legacy compatibility

    // Just update project if gauge data was provided
    if (updatedProject) {
      updateProject(updatedProject);
    }

    // Force refresh to show updated state
    setRefreshTrigger(prev => prev + 1);
  }, [updateProject]);

  const handleComponentTabClick = useCallback((index) => {
    setLocalActiveIndex(index);
    dispatch({ type: 'SET_ACTIVE_COMPONENT_INDEX', payload: index });
  }, [dispatch]);

  const handleStepClick = useCallback((stepIndex) => {
    setSelectedStepIndex(stepIndex);
    setShowStepModal(true);
  }, []);

  const handleCloseStepModal = useCallback(() => {
    setShowStepModal(false);
    setSelectedStepIndex(null);
  }, []);

  // ✅ NOW: Early return AFTER all hooks
  if (!currentProject) {
    return <div>No project selected</div>;
  }

  if (!activeComponent) {
    return <div>No component selected</div>;
  }

  // Helper to determine if step has prep note
  const getStepPrepNote = (step) => {
    return step.prepNote ||
      step.wizardConfig?.prepNote ||
      step.advancedWizardConfig?.prepNote ||
      '';
  };

  // Helper to get after note
  const getStepAfterNote = (step) => {
    return step.afterNote ||
      step.wizardConfig?.afterNote ||
      step.advancedWizardConfig?.afterNote ||
      '';
  };

  // Create display items (prep cards + step cards + assembly cards)
  const createDisplayItems = (component) => {
    const items = [];

    component.steps.forEach((step, stepIndex) => {
      const prepNote = getStepPrepNote(step);
      const afterNote = getStepAfterNote(step);

      // Add prep card if prep note exists
      const colorInfo = getPrepCardColorInfo(step, stepIndex, activeComponent, currentProject);
      if (prepNote || colorInfo) {
        items.push({
          type: 'prep',
          stepIndex,
          prepNote,
          id: `prep-${stepIndex}`
        });
      }

      // Add step card
      items.push({
        type: 'step',
        stepIndex,
        step,
        id: `step-${stepIndex}`
      });

      // Add assembly note card if it exists
      if (afterNote) {
        items.push({
          type: 'assembly',
          stepIndex,
          afterNote,
          id: `assembly-${stepIndex}`
        });
      }
    });

    return items;
  };

  const displayItems = createDisplayItems(activeComponent);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="app-container bg-white min-h-screen shadow-lg">
        <PageHeader
          useBranding={true}
          onHome={onGoToLanding}
          compact={true}
          onBack={onBack}
          showCancelButton={true}
          onCancel={onBack}
        />

        {/* Component Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {currentProject.components.map((component, index) => (
              <button
                key={component.id}
                onClick={() => handleComponentTabClick(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${localActiveIndex === index
                  ? 'bg-sage-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {component.name}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ UPDATED: Progress Overview using new stats */}
        <div className="p-6 pb-3 bg-yarn-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 text-left">
            {activeComponent.name}
          </h2>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              {progressStats.completed} of {progressStats.total} steps completed
            </span>
            <span>{progressStats.percentage}% done</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-sage-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressStats.percentage}%` }}
            />
          </div>
        </div>

        {/* Streamlined Step List */}
        <div className="px-6 pb-6 space-y-3">
          {displayItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-gray-600 mb-4">No steps added yet</p>
              <button
                onClick={() => onEditSteps(localActiveIndex)}
                className="btn-primary"
              >
                Add Steps
              </button>
            </div>
          ) : (
            displayItems.map((item) => {
              if (item.type === 'prep') {
                const step = activeComponent.steps[item.stepIndex];
                return (
                  <UnifiedPrepDisplay
                    key={item.id}
                    step={step}
                    stepIndex={item.stepIndex}
                    component={activeComponent}
                    project={currentProject}
                  />
                );
              } else if (item.type === 'assembly') {
                return (
                  <div
                    key={item.id}
                    className="bg-sage-50 border-l-4 border-sage-400 rounded-r-xl p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-sage-400 text-white flex items-center justify-center flex-shrink-0">
                        🔧
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-sage-700 mb-1 text-left">
                          Assembly Notes
                        </div>
                        <div className="text-sm text-sage-600 italic text-left">
                          {item.afterNote}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // ✅ UPDATED: Step Card with new progress system
                const step = item.step;
                const stepIndex = item.stepIndex;
                const { description, technicalData } = getFormattedStepDisplay(
                  step,
                  activeComponent.name,
                  currentProject
                );

                // Get progress state using new system
                const progress = getStepProgressState(
                  step.id,
                  activeComponent.id,
                  currentProject.id
                );

                const isCompleted = progress.status === PROGRESS_STATUS.COMPLETED;
                const isInProgress = progress.status === PROGRESS_STATUS.IN_PROGRESS;
                const isBlocked = !canStartStep(
                  stepIndex,
                  activeComponent.steps,
                  activeComponent.id,
                  currentProject.id
                ) && progress.status === PROGRESS_STATUS.NOT_STARTED;

                const isCurrentStep = isInProgress ||
                  (!isCompleted && !isBlocked && stepIndex === progressStats.completed);

                return (
                  <div
                    key={item.id}
                    onClick={() => !isBlocked && handleStepClick(stepIndex)}
                    className={`border-2 rounded-xl p-5 shadow-sm transition-all duration-200 ${isBlocked
                      ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                      : isCompleted
                        ? 'bg-sage-50 border-sage-300 cursor-pointer hover:shadow-md'
                        : isCurrentStep
                          ? 'bg-yarn-50 border-sage-400 shadow-md cursor-pointer hover:shadow-lg'
                          : 'bg-white border-gray-200 cursor-pointer hover:border-gray-300 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* ✅ UPDATED: Conditional checkbox rendering */}
                      {!isBlocked ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckboxClick(localActiveIndex, stepIndex);
                          }}
                          className="flex-shrink-0 mt-0.5"
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={24} className="text-sage-500" />
                          ) : (
                            <Circle size={24} className="text-gray-400 hover:text-sage-500 transition-colors" />
                          )}
                        </button>
                      ) : (
                        <div className="flex-shrink-0 mt-0.5">
                          <Lock size={24} className="text-gray-300" />
                        </div>
                      )}

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        {/* Step number and badges */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-500">
                            STEP {stepIndex + 1}
                          </span>
                          {isCurrentStep && !isCompleted && (
                            <span className="text-xs bg-sage-500 text-white px-2 py-0.5 rounded-full font-semibold">
                              CURRENT
                            </span>
                          )}
                          {isBlocked && (
                            <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded-full font-semibold">
                              LOCKED
                            </span>
                          )}
                        </div>

                        {/* Main Description */}
                        <div className={`text-base font-medium mb-2 text-left ${isCompleted
                          ? 'text-gray-500 line-through'
                          : isBlocked
                            ? 'text-gray-400'
                            : isCurrentStep
                              ? 'text-gray-900'
                              : 'text-gray-800'
                          }`}>
                          {description}
                        </div>

                        {/* ✅ UPDATED: Progress info using new system */}
                        <div className="text-xs text-gray-500 text-left">
                          {(() => {
                            let progressInfo = null;

                            if (isInProgress && progress.currentRow) {
                              const totalRows = progress.totalRows || step.totalRows;
                              if (isLengthBasedStep(step)) {
                                progressInfo = `Row ${progress.currentRow}`;
                              } else if (totalRows > 1) {
                                progressInfo = `Row ${progress.currentRow} of ${totalRows}`;
                              }
                            } else if (isBlocked) {
                              progressInfo = 'Complete previous steps first';
                            }

                            // Combine with technical data
                            if (technicalData && progressInfo) {
                              return `${technicalData} • ${progressInfo}`;
                            } else if (technicalData) {
                              return technicalData;
                            } else if (progressInfo) {
                              return progressInfo;
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })
          )}

          {/* ✅ UPDATED: Component Complete State */}
          {activeComponent.steps.length > 0 && progressStats.isComplete && (
            <div className="mt-6 p-6 bg-sage-50 border-2 border-sage-200 rounded-xl text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-semibold text-sage-800 mb-1">Component Complete!</h3>
              <p className="text-sage-600 text-sm">
                Great job finishing {activeComponent.name}!
              </p>
            </div>
          )}
        </div>

        {/* ✅ UPDATED: Confirmation Dialog using StandardModal */}
        {showConfirmDialog && confirmDialogData && (
          <StandardModal
            isOpen={showConfirmDialog}
            onClose={confirmDialogData.onCancel}
            onConfirm={confirmDialogData.onConfirm}
            category="simple"
            colorScheme={confirmDialogData.title.includes('⚠️') ? 'red' : 'sage'}
            title={confirmDialogData.title}
            primaryButtonText="Confirm"
            secondaryButtonText="Cancel"
          >
            <p className="text-sm text-gray-600">
              {confirmDialogData.message}
            </p>
          </StandardModal>
        )}

        {/* Full-Screen Step Modal */}
        {showStepModal && selectedStepIndex !== null && (
          <KnittingStepModal
            step={activeComponent.steps[selectedStepIndex]}
            stepIndex={selectedStepIndex}
            component={activeComponent}
            project={currentProject}
            totalSteps={activeComponent.steps.length}
            updateProject={updateProject}
            onClose={handleCloseStepModal}
            onToggleCompletion={(stepIndex) =>
              handleToggleStepCompletion(localActiveIndex, stepIndex)
            }
            onNavigateStep={(direction) => {
              const newIndex = selectedStepIndex + direction;
              if (newIndex >= 0 && newIndex < activeComponent.steps.length) {
                setSelectedStepIndex(newIndex);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Tracking;