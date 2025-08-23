import React, { useState, useEffect } from 'react';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import PageHeader from '../../../../shared/components/PageHeader';
import StripesConfig from '../pattern-configs/StripesConfig';

const EditStripesForm = ({
    componentIndex,
    editingStepIndex,
    onBack,
    onGoToLanding
}) => {
    const { currentProject, dispatch } = useProjectsContext();
    const [wizardData, setWizardData] = useState({ stitchPattern: {} });

    // Load initial data
    useEffect(() => {
        const component = currentProject?.components?.[componentIndex];
        const step = component?.steps?.[editingStepIndex];

        if (step?.wizardConfig?.stitchPattern) {
            setWizardData({
                stitchPattern: step.wizardConfig.stitchPattern
            });
        }
    }, [currentProject, componentIndex, editingStepIndex]);

    // Validation
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

    // Data handlers
    const updateWizardData = (section, data) => {
        if (section === 'stitchPattern') {
            setWizardData(prev => ({
                ...prev,
                stitchPattern: { ...prev.stitchPattern, ...data }
            }));
        }
    };

    // Save handler
    const handleSave = () => {
        const updatedWizardConfig = {
            ...step.wizardConfig,
            stitchPattern: {
                ...step.wizardConfig.stitchPattern,
                ...wizardData.stitchPattern
            }
        };

        dispatch({
            type: 'UPDATE_STEP',
            payload: {
                componentIndex,
                stepIndex: editingStepIndex,
                step: {
                    ...step,
                    wizardConfig: updatedWizardConfig
                }
            }
        });

        onBack();
    };

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
                    <StripesConfig
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

export default EditStripesForm;