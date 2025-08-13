// src/features/steps/components/EditRowByRowPatternForm.jsx
import React, { useState, useEffect } from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import PageHeader from '../../../shared/components/PageHeader';
import RowByRowPatternConfig from './pattern-configs/RowByRowPatternConfig';
import { getHumanReadableDescription } from '../../../shared/utils/stepDescriptionUtils';

/**
 * EditRowByRowPatternForm - Thin wrapper around RowByRowPatternConfig
 * 
 * This replaces the 345-line duplicate with a 50-line wrapper that reuses
 * the existing RowByRowPatternConfig component in edit mode.
 */
const EditRowByRowPatternForm = ({
    componentIndex,
    editingStepIndex,
    onBack,
    onGoToLanding
}) => {
    const { currentProject, dispatch } = useProjectsContext();
    const [wizardData, setWizardData] = useState({ stitchPattern: {} });

    // ===== LOAD INITIAL DATA =====
    useEffect(() => {
        const component = currentProject?.components?.[componentIndex];
        const step = component?.steps?.[editingStepIndex];

        if (step?.wizardConfig?.stitchPattern) {
            setWizardData({
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
        if (section === 'stitchPattern') {
            setWizardData(prev => ({
                ...prev,
                stitchPattern: { ...prev.stitchPattern, ...data }
            }));
        }
    };

    // ===== SAVE HANDLER =====
    const handleSave = (patternData) => {
        const updatedWizardConfig = {
            ...step.wizardConfig,
            stitchPattern: {
                ...step.wizardConfig.stitchPattern,
                ...patternData
            }
        };

        // Regenerate description
        const mockStep = {
            ...step,
            wizardConfig: updatedWizardConfig
        };
        const regeneratedDescription = getHumanReadableDescription(mockStep);

        // Dispatch update
        dispatch({
            type: 'UPDATE_STEP',
            payload: {
                componentIndex,
                stepIndex: editingStepIndex,
                step: {
                    ...step,
                    wizardConfig: updatedWizardConfig,
                    description: regeneratedDescription
                }
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

                <div className="p-6">
                    {/* Use the mode-aware RowByRowPatternConfig */}
                    <RowByRowPatternConfig
                        wizardData={wizardData}
                        updateWizardData={updateWizardData}
                        construction={construction}
                        mode="edit"
                        onSave={handleSave}
                        onCancel={onBack}
                        showSaveActions={true}
                    // Optional: Add constraints if needed
                    // readOnlyFields={['entryMode']} // Example: prevent changing entry mode
                    />
                </div>
            </div>
        </div>
    );
};

export default EditRowByRowPatternForm;