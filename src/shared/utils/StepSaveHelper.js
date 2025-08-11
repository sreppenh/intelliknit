// src/shared/utils/StepSaveHelper.js
import React, { useState } from 'react';
import IntelliKnitLogger from './ConsoleLogging';

/**
 * Reusable step save and navigation helper
 * Extracted from useStepActions.js to be used by all "Complete Step" buttons
 * 
 * This hook provides the save logic that was previously only in StepPreview
 * All "Complete Step" buttons should use this to ensure consistent behavior
 * 
 * Usage:
 * const { saveStepAndNavigate, isLoading, error, clearError } = useStepSaveHelper();
 * 
 * // In your button's onClick handler:
 * const success = await saveStepAndNavigate({
 *   instruction: "Generated instruction text",
 *   effect: calculatedEffect,
 *   wizardData: currentWizardData,
 *   currentStitches: currentStitches,
 *   construction: construction,
 *   componentIndex: componentIndex,
 *   editingStepIndex: editingStepIndex || null,
 *   dispatch: dispatch,
 *   onNavigate: () => navigateToManageSteps()
 * });
 */

export const useStepSaveHelper = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const saveStepAndNavigate = async ({
        instruction,
        effect,
        wizardData,
        currentStitches,
        construction,
        componentIndex,
        editingStepIndex = null,
        dispatch,
        onNavigate,
        skipNavigation = false
    }) => {
        try {
            setIsLoading(true);
            setError(null);

            IntelliKnitLogger.debug('StepSaveHelper', {
                action: editingStepIndex !== null ? 'EDIT_STEP' : 'ADD_STEP',
                componentIndex,
                editingStepIndex,
                instruction,
                effect,
                currentStitches,
                construction
            });

            // Validate required parameters
            if (!instruction) {
                throw new Error('Instruction is required');
            }
            if (!effect) {
                throw new Error('Effect calculation is required');
            }
            if (!dispatch) {
                throw new Error('Dispatch function is required');
            }
            if (componentIndex === undefined || componentIndex === null) {
                throw new Error('Component index is required');
            }

            // Validate effect object
            if (!effect.success) {
                throw new Error(effect.error || 'Effect calculation failed');
            }

            // Create step object following the established pattern from useStepActions
            const stepData = {
                description: instruction,
                expectedStitches: effect.endingStitches,
                type: effect.success && effect.totalRows ? 'calculated' : 'manual',
                construction: construction,
                startingStitches: currentStitches > 0 ? currentStitches : effect.startingStitches || 0,
                endingStitches: effect.endingStitches,
                totalRows: effect.totalRows,
                wizardConfig: wizardData,
                prepNote: wizardData.prepNote || '',
                advancedWizardConfig: {
                    hasShaping: wizardData.hasShaping || false,
                    shapingConfig: wizardData.shapingConfig
                }
            };

            console.log('🔍 STEP DATA BEING SENT TO REDUCER:', stepData);

            // Dispatch appropriate action (following exact pattern from useStepActions)
            if (editingStepIndex !== null) {
                IntelliKnitLogger.success(`Updating step ${editingStepIndex}`, stepData);
                dispatch({
                    type: 'UPDATE_STEP',
                    payload: {
                        componentIndex,
                        stepIndex: editingStepIndex,
                        step: stepData
                    }
                });
            } else {
                IntelliKnitLogger.success('Adding new step to component', stepData);
                dispatch({
                    type: 'ADD_STEP',
                    payload: {
                        componentIndex,
                        step: stepData
                    }
                });

                // 🔧 ADD THIS DEBUG LINE:
                console.log('🔧 DISPATCH CALLED:', { componentIndex, stepData });
            }

            // Navigate if not skipped
            if (!skipNavigation && onNavigate) {
                IntelliKnitLogger.debug('StepSaveHelper', 'Navigating after successful save');
                onNavigate();
            }

            return {
                success: true,
                stepData,
                endingStitches: effect.endingStitches
            };

        } catch (saveError) {
            const errorMessage = saveError.message || 'Failed to save step';
            IntelliKnitLogger.error('Step save failed', saveError);
            setError(errorMessage);

            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    return {
        saveStepAndNavigate,
        isLoading,
        error,
        clearError
    };
};

/**
 * Error Modal Component for Step Save Failures
 * Follows IntelliKnit's modal design patterns
 */
export const StepSaveErrorModal = ({ isOpen, error, onClose, onRetry }) => {
    if (!isOpen || !error) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
                {/* Error Header */}
                <div className="text-center mb-4">
                    <div className="text-4xl mb-2">❌</div>
                    <h3 className="text-lg font-semibold text-red-700 mb-1">Save Failed</h3>
                    <p className="text-red-600 text-sm">Could not save your step</p>
                </div>

                {/* Error Details */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-red-700 font-medium mb-2">Error Details:</p>
                    <p className="text-sm text-red-600">{error}</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="w-full btn-primary"
                        >
                            Try Again
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="w-full btn-tertiary"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default useStepSaveHelper;