// src/features/steps/components/edit/EditCustomRowByRowForm.jsx
import React, { useState, useEffect } from 'react';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import PageHeader from '../../../../shared/components/PageHeader';
import SimpleRowBuilder from '../pattern-configs/SimpleRowBuilder';

const EditCustomRowByRowForm = ({
    componentIndex,
    editingStepIndex,
    onBack,
    onGoToLanding
}) => {
    const { currentProject, dispatch } = useProjectsContext();
    const [wizardData, setWizardData] = useState({
        stitchPattern: {}
    });

    // Load initial data
    useEffect(() => {
        const component = currentProject?.components?.[componentIndex];
        const step = component?.steps?.[editingStepIndex];

        if (step?.wizardConfig?.stitchPattern) {
            console.log('📋 EditCustomRowByRowForm - Loading step data:', step.wizardConfig.stitchPattern);

            setWizardData({
                stitchPattern: {
                    pattern: 'Custom',
                    entryMode: 'row_by_row',
                    customSequence: step.wizardConfig.stitchPattern.customSequence || { rows: [] },
                    rowsInPattern: step.wizardConfig.stitchPattern.rowsInPattern || '0'
                }
            });
        } else {
            console.log('📋 EditCustomRowByRowForm - No existing custom pattern data found');
            setWizardData({
                stitchPattern: {
                    pattern: 'Custom',
                    entryMode: 'row_by_row',
                    customSequence: { rows: [] }
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
                pattern: 'Custom',
                entryMode: 'row_by_row',
                customSequence: wizardData.stitchPattern.customSequence,
                rowsInPattern: wizardData.stitchPattern.rowsInPattern
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

    // Check if there are any rows configured
    const hasRows = wizardData.stitchPattern?.customSequence?.rows?.length > 0;

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
                            Edit Custom Pattern
                        </h1>
                        <p className="text-wool-600">
                            Modify your row-by-row pattern instructions
                        </p>
                    </div>

                    {/* SimpleRowBuilder Component */}
                    <SimpleRowBuilder
                        wizardData={wizardData}
                        updateWizardData={updateWizardData}
                        construction={construction}
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
                            disabled={!hasRows}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCustomRowByRowForm;