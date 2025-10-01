import React, { useState, useCallback } from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import { CheckCircle2, Circle, FileText, X } from 'lucide-react';
import PageHeader from '../../../shared/components/PageHeader';
import { getFormattedStepDisplay } from '../../../shared/utils/stepDescriptionUtils';
import KnittingStepModal from './modal/KnittingStepModal';
import { isLengthBasedStep } from '../../../shared/utils/gaugeUtils';
import { getPrepCardColorInfo } from '../../../shared/utils/prepCardUtils';
import { Palette } from 'lucide-react';
import { UnifiedPrepDisplay } from '../../../shared/components/PrepStepSystem';

const Tracking = ({ onBack, onEditSteps, onGoToLanding }) => {
  const { currentProject, activeComponentIndex, dispatch } = useProjectsContext();
  const [localActiveIndex, setLocalActiveIndex] = useState(activeComponentIndex || 0);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [showStepModal, setShowStepModal] = useState(false);

  // Add this new function after handleCloseStepModal
  const updateProject = useCallback((updatedProject) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
  }, [dispatch]);

  if (!currentProject) {
    return <div>No project selected</div>;
  }

  const handleToggleStepCompletion = (componentIndex, stepIndex, updatedProject = null) => {
    // First, toggle the step completion
    dispatch({
      type: 'TOGGLE_STEP_COMPLETION',
      payload: { componentIndex, stepIndex }
    });

    // Then update project if gauge data was provided
    if (updatedProject) {
      updateProject(updatedProject);
    }
  };

  const handleComponentTabClick = (index) => {
    setLocalActiveIndex(index);
    dispatch({ type: 'SET_ACTIVE_COMPONENT_INDEX', payload: index });
  };

  const handleStepClick = (stepIndex) => {
    setSelectedStepIndex(stepIndex);
    setShowStepModal(true);
  };

  const handleCloseStepModal = () => {
    setShowStepModal(false);
    setSelectedStepIndex(null);
  };

  const activeComponent = currentProject.components[localActiveIndex];

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
      const afterNote = getStepAfterNote(step); // ✅ FIXED: Now in correct scope

      // Add prep card if prep note exists
      // ✅ NEW: Check for dynamic color changes
      const colorInfo = getPrepCardColorInfo(step, stepIndex, activeComponent, currentProject);
      // ✅ FIXED: Add prep card if prep note exists OR color info exists
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

      // ✅ FIXED: Add assembly note card if it exists (now in correct scope)
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

        {/* Progress Overview */}
        <div className="p-6 pb-3 bg-yarn-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 text-left">
            {activeComponent.name}
          </h2>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              {activeComponent.steps.filter(s => s.completed).length} of{' '}
              {activeComponent.steps.length} steps completed
            </span>
            <span>
              {Math.round((activeComponent.steps.filter(s => s.completed).length /
                activeComponent.steps.length) * 100) || 0}% done
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-sage-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(activeComponent.steps.filter(s => s.completed).length /
                  activeComponent.steps.length) * 100}%`
              }}
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
                // Use unified prep display for both color changes and user notes
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
                // ✅ NEW: Assembly Card - Sage themed
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
                // Step Card - Sage themed, streamlined
                const step = item.step;
                const stepIndex = item.stepIndex;
                const isCompleted = step.completed;
                const isCurrentStep = stepIndex === activeComponent.currentStep;
                const { description, technicalData } = getFormattedStepDisplay(step, activeComponent.name, currentProject);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleStepClick(stepIndex)}
                    className={`border-2 rounded-xl p-5 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md ${isCompleted
                      ? 'bg-sage-50 border-sage-300'
                      : isCurrentStep
                        ? 'bg-yarn-50 border-sage-400 shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Completion Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStepCompletion(localActiveIndex, stepIndex);
                        }}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={24} className="text-sage-500" />
                        ) : (
                          <Circle size={24} className="text-gray-400 hover:text-sage-500 transition-colors" />
                        )}
                      </button>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        {/* Step number and badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-500">
                            STEP {stepIndex + 1}
                          </span>
                          {isCurrentStep && !isCompleted && (
                            <span className="text-xs bg-sage-500 text-white px-2 py-0.5 rounded-full font-semibold">
                              CURRENT
                            </span>
                          )}
                        </div>

                        {/* Main Description */}
                        <div className={`text-base font-medium mb-2 text-left ${isCompleted
                          ? 'text-gray-500 line-through'
                          : isCurrentStep
                            ? 'text-gray-900'
                            : 'text-gray-800'
                          }`}>
                          {description}
                        </div>

                        {/* Technical Data + Row Progress Combined */}
                        <div className="text-xs text-gray-500 text-left">
                          {(() => {
                            const storageKey = `row-counter-${currentProject.id}-${activeComponent.id}-${stepIndex}`;
                            const rowState = JSON.parse(localStorage.getItem(storageKey) || '{}');
                            const currentRow = rowState.currentRow || 1;
                            const totalRows = step.totalRows || 1;

                            let rowInfo = null;
                            if (isLengthBasedStep(step)) {
                              rowInfo = `Row ${currentRow}`;
                            } else if (totalRows > 1) {
                              rowInfo = `Row ${currentRow} of ${totalRows}`;
                            }

                            // Combine technical data with row info
                            if (technicalData && rowInfo) {
                              return `${technicalData} • ${rowInfo}`;
                            } else if (technicalData) {
                              return technicalData;
                            } else if (rowInfo) {
                              return rowInfo;
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

          {/* Component Complete State */}
          {activeComponent.steps.length > 0 &&
            activeComponent.currentStep >= activeComponent.steps.length && (
              <div className="mt-6 p-6 bg-sage-50 border-2 border-sage-200 rounded-xl text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-semibold text-sage-800 mb-1">Component Complete!</h3>
                <p className="text-sage-600 text-sm">
                  Great job finishing {activeComponent.name}!
                </p>
              </div>
            )}
        </div>

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