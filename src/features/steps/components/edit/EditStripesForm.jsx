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
    // Replace the useEffect in EditStripesForm.jsx with this improved version:

    // Load initial data
    useEffect(() => {
        const component = currentProject?.components?.[componentIndex];
        const step = component?.steps?.[editingStepIndex];

        if (step?.wizardConfig?.colorwork) {
            console.log('🔧 EditStripesForm - Loading step data:', step.wizardConfig.colorwork);

            setWizardData({
                colorwork: {
                    type: 'stripes',
                    stripeSequence: step.wizardConfig.colorwork.stripeSequence || [],
                    totalRows: step.wizardConfig.colorwork.totalRows || 0
                }
            });
        } else {
            console.log('🔧 EditStripesForm - No existing stripe data found');
            setWizardData({
                colorwork: {
                    type: 'stripes',
                    stripeSequence: []
                }
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
        if (section === 'colorwork') {
            setWizardData(prev => ({
                ...prev,
                colorwork: { ...prev.colorwork, ...data }
            }));
        }
    };

    // Save handler
    const handleSave = () => {
        const updatedWizardConfig = {
            ...step.wizardConfig,
            colorwork: {
                ...wizardData.colorwork
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

    // Replace the entire return statement in EditStripesForm.jsx with this:

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
                    {/* Header Section */}
                    <div className="mb-6">
                        <h1 className="content-header-primary">
                            Edit Stripe Pattern
                        </h1>
                        <p className="text-wool-600">
                            Modify your stripe configuration and sequence
                        </p>
                    </div>

                    {/* Stripes Config Component */}
                    <StripesConfig
                        wizardData={wizardData}
                        updateWizardData={updateWizardData}
                        construction={construction}
                        project={currentProject}
                        mode="edit"
                        showSaveActions={false} // We'll handle save/cancel here instead
                    />

                    {/* Save/Cancel Actions */}
                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onBack}
                            className="flex-1 btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 btn-primary"
                            disabled={!wizardData.colorwork?.stripeSequence?.length}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditStripesForm;