// src/features/steps/components/EditDurationForm.jsx
import React, { useState, useEffect } from 'react';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import PageHeader from '../../../../shared/components/PageHeader';
import DurationChoice from '../wizard-steps/DurationChoice';

/**
 * EditDurationForm - Thin wrapper around DurationChoice
 * 
 * This replaces the 314-line duplicate with a 50-line wrapper that reuses
 * the existing DurationChoice component in edit mode.
 */
const EditDurationForm = ({
    componentIndex,
    editingStepIndex,
    onBack,
    onGoToLanding
}) => {
    const { currentProject, dispatch } = useProjectsContext();
    const [wizardData, setWizardData] = useState({ duration: {}, stitchPattern: {} });

    // ===== LOAD INITIAL DATA =====
    useEffect(() => {
        const component = currentProject?.components?.[componentIndex];
        const step = component?.steps?.[editingStepIndex];

        if (step?.wizardConfig?.duration && step?.wizardConfig?.stitchPattern) {
            setWizardData({
                duration: step.wizardConfig.duration,
                stitchPattern: step.wizardConfig.stitchPattern
            });
        }
    }, [currentProject, componentIndex, editingStepIndex]);

    // ===== EARLY RETURN FOR VALIDATION =====
    if (!currentProject || componentIndex === null || !currentProject.components[componentIndex]) {
        return (
            <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
                    <div className="text-4xl mb-4">❌</div>
                    <h3 className="text-lg font-medium text-wool-600 mb-2">Component not found</h3>
                    <button onClick={onBack} className="btn-primary btn-sm">← Back</button>
                </div>
            </div>
        );
    }

    const component = currentProject.components[componentIndex];
    const step = component.steps[editingStepIndex];

    if (!step) {
        return (
            <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
                    <div className="text-4xl mb-4">❌</div>
                    <h3 className="text-lg font-medium text-wool-600 mb-2">Step not found</h3>
                    <button onClick={onBack} className="btn-primary btn-sm">← Back</button>
                </div>
            </div>
        );
    }

    const construction = step?.construction || 'flat';

    // ===== DATA HANDLERS =====
    const updateWizardData = (section, data) => {
        if (section === 'duration') {
            setWizardData(prev => ({
                ...prev,
                duration: { ...prev.duration, ...data }
            }));
        }
    };

    // ===== SAVE HANDLER =====
    const handleSave = (durationData) => {
        const updatedWizardConfig = {
            ...step.wizardConfig,
            duration: {
                ...step.wizardConfig.duration,
                ...durationData
            }
        };

        // For repeats, recalculate total rows if pattern has rowsInPattern
        let updatedStep = {
            ...step,
            wizardConfig: updatedWizardConfig
        };

        if (durationData.type === 'repeats' && step.wizardConfig?.stitchPattern?.rowsInPattern) {
            const repeats = parseInt(durationData.value) || 1;
            const rowsInPattern = parseInt(step.wizardConfig.stitchPattern.rowsInPattern) || 1;
            updatedStep.totalRows = repeats * rowsInPattern;
        }

        // Dispatch update
        dispatch({
            type: 'UPDATE_STEP',
            payload: {
                componentIndex,
                stepIndex: editingStepIndex,
                step: updatedStep
            }
        });

        onBack();
    };

    // ===== RENDER =====
    return (
        <div className="min-h-screen bg-yarn-50">
            <div className="app-container bg-white min-h-screen shadow-lg">
                <PageHeader
                    useBranding={true}
                    onHome={onGoToLanding}
                    compact={true}
                    onBack={onBack}
                    showCancelButton={true}
                    onCancel={onBack}
                />

                <div className="p-6 bg-yarn-50">
                    {/* Use the mode-aware DurationChoice */}
                    <DurationChoice
                        wizardData={wizardData}
                        updateWizardData={updateWizardData}
                        construction={construction}
                        project={currentProject}
                        mode="edit"
                        onSave={handleSave}
                        onCancel={onBack}
                        showSaveActions={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditDurationForm;