import React, { useState, useEffect } from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import PageHeader from '../../../shared/components/PageHeader';
import IncrementInput from '../../../shared/components/IncrementInput';
import { getHumanReadableDescription } from '../../../shared/utils/stepDescriptionUtils';
import {
    getPatternQuickActions,
    getPatternPlaceholderText,
    getPatternDescriptionPlaceholder
} from '../../../shared/utils/stepDisplayUtils';

// ===== PATTERN-SPECIFIC HELPER FUNCTIONS (reused from RowByRowPatternConfig) =====

const EditRowByRowPatternForm = ({
    componentIndex,
    editingStepIndex,
    onBack
}) => {
    const { currentProject, dispatch } = useProjectsContext();

    // ===== ALL STATE DECLARATIONS FIRST =====
    const [showRowEntryOverlay, setShowRowEntryOverlay] = useState(false);
    const [editingRowIndex, setEditingRowIndex] = useState(null);
    const [tempRowText, setTempRowText] = useState('');
    const [formData, setFormData] = useState({
        pattern: '',
        entryMode: 'description',
        customText: '',
        rowsInPattern: '',
        rowInstructions: []
    });

    // ===== ALL HOOKS BEFORE ANY EARLY RETURNS =====

    // Initialize form data from step
    useEffect(() => {
        const component = currentProject?.components?.[componentIndex];
        const step = component?.steps?.[editingStepIndex];

        if (step?.wizardConfig?.stitchPattern) {
            const stitchPattern = step.wizardConfig.stitchPattern;
            setFormData({
                pattern: stitchPattern.pattern || '',
                entryMode: stitchPattern.entryMode || 'description',
                customText: stitchPattern.customText || '',
                rowsInPattern: stitchPattern.rowsInPattern || '',
                rowInstructions: stitchPattern.rowInstructions || []
            });
        }
    }, [currentProject, componentIndex, editingStepIndex]);

    // ESC key handler for overlay
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showRowEntryOverlay) {
                setShowRowEntryOverlay(false);
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showRowEntryOverlay]);

    // ===== NOW SAFE TO DO EARLY RETURNS =====

    // Component validation
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
    const construction = step?.construction || 'flat';

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

    // ===== PATTERN-SPECIFIC DATA =====
    const quickActions = getPatternQuickActions(formData.pattern);
    const placeholderText = getPatternPlaceholderText(formData.pattern);

    // ===== FORM HANDLERS =====
    const updateFormData = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleModeToggle = (newMode) => {
        updateFormData({ entryMode: newMode });
    };

    // ===== ROW MANAGEMENT =====
    const handleAddRow = () => {
        setEditingRowIndex(null);
        setTempRowText('');
        setShowRowEntryOverlay(true);
    };

    const handleEditRow = (index) => {
        setEditingRowIndex(index);
        setTempRowText(formData.rowInstructions[index] || '');
        setShowRowEntryOverlay(true);
    };

    const handleSaveRow = () => {
        if (!tempRowText.trim()) return;

        let updatedInstructions = [...formData.rowInstructions];

        if (editingRowIndex === null) {
            updatedInstructions.push(tempRowText.trim());
        } else {
            updatedInstructions[editingRowIndex] = tempRowText.trim();
        }

        updateFormData({
            rowInstructions: updatedInstructions,
            rowsInPattern: updatedInstructions.length.toString()
        });

        setShowRowEntryOverlay(false);
        setTempRowText('');
        setEditingRowIndex(null);
    };

    const handleDeleteRow = (index) => {
        const updatedInstructions = formData.rowInstructions.filter((_, i) => i !== index);
        updateFormData({
            rowInstructions: updatedInstructions,
            rowsInPattern: updatedInstructions.length.toString()
        });
    };

    // ===== UTILITY FUNCTIONS =====
    const getRowSide = (rowNumber) => {
        if (construction === 'round') return 'RS';
        return rowNumber % 2 === 1 ? 'RS' : 'WS';
    };

    const handleQuickAction = (action) => {
        if (action === 'K all') {
            setTempRowText('K all');
        } else if (action === 'P all') {
            setTempRowText('P all');
        } else if (action.startsWith('copy_')) {
            const rowIndex = parseInt(action.split('_')[1]);
            setTempRowText(formData.rowInstructions[rowIndex] || '');
        } else {
            setTempRowText(prev => prev ? `${prev}, ${action}` : action);
        }
    };

    const handleOverlayBackdrop = (e) => {
        if (e.target === e.currentTarget) {
            setShowRowEntryOverlay(false);
        }
    };

    // ===== SAVE FUNCTIONALITY =====
    const canSave = () => {
        if (formData.entryMode === 'description') {
            return formData.customText.trim() && formData.rowsInPattern;
        } else {
            return formData.rowInstructions.length > 0;
        }
    };

    const handleSave = () => {
        const updatedWizardConfig = {
            ...step.wizardConfig,
            stitchPattern: {
                ...step.wizardConfig.stitchPattern,
                ...formData
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
                    title={`Edit ${formData.pattern}`}
                    subtitle="Pattern configuration"
                    onBack={onBack}
                    showBackButton={true}
                    showCancelButton={true}
                    onCancel={onBack}
                />

                <div className="p-6 space-y-6">
                    {/* Entry Mode Toggle */}
                    <div>
                        <label className="form-label">Pattern Entry Method</label>
                        <div className="flex gap-3">
                            <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${formData.entryMode === 'description'
                                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                                }`}>
                                <input
                                    type="radio"
                                    name="entry_mode"
                                    value="description"
                                    checked={formData.entryMode === 'description'}
                                    onChange={() => handleModeToggle('description')}
                                    className="sr-only"
                                />
                                <div className="text-center">
                                    <div className="text-2xl mb-2">📝</div>
                                    <div className="font-semibold">Description</div>
                                    <div className="text-sm opacity-75">Traditional text description</div>
                                </div>
                            </label>

                            <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${formData.entryMode === 'row_by_row'
                                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                                }`}>
                                <input
                                    type="radio"
                                    name="entry_mode"
                                    value="row_by_row"
                                    checked={formData.entryMode === 'row_by_row'}
                                    onChange={() => handleModeToggle('row_by_row')}
                                    className="sr-only"
                                />
                                <div className="text-center">
                                    <div className="text-2xl mb-2">📋</div>
                                    <div className="font-semibold">Row-by-Row</div>
                                    <div className="text-sm opacity-75">Enter each row individually</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Description Mode */}
                    {formData.entryMode === 'description' && (
                        <>
                            <div>
                                <label className="form-label">Pattern Description</label>
                                <textarea
                                    value={formData.customText}
                                    onChange={(e) => updateFormData({ customText: e.target.value })}
                                    placeholder={getPatternDescriptionPlaceholder(formData.pattern)}
                                    rows={3}
                                    className="input-field-lg resize-none"
                                />
                            </div>

                            <div>
                                <label className="form-label">Rows in Pattern</label>
                                <IncrementInput
                                    value={formData.rowsInPattern}
                                    onChange={(value) => updateFormData({ rowsInPattern: value })}
                                    label="rows in pattern"
                                    construction={construction}
                                />
                                <div className="form-help">
                                    Number of {construction === 'round' ? 'rounds' : 'rows'} in one complete pattern repeat
                                </div>
                            </div>
                        </>
                    )}

                    {/* Row-by-Row Mode */}
                    {formData.entryMode === 'row_by_row' && (
                        <div>
                            <label className="form-label">Pattern Rows</label>

                            {/* Row List */}
                            {formData.rowInstructions.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {formData.rowInstructions.map((instruction, index) => {
                                        const rowNumber = index + 1;
                                        const rowSide = getRowSide(rowNumber);

                                        return (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-white border-2 border-wool-200 rounded-lg">
                                                <div className="flex-shrink-0 text-sm font-medium text-wool-600 min-w-[80px]">
                                                    Row {rowNumber} ({rowSide}):
                                                </div>
                                                <div className="flex-1 text-sm text-wool-700 font-mono">
                                                    {instruction}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEditRow(index)}
                                                        className="p-1 text-sage-600 hover:text-sage-700 hover:bg-sage-100 rounded transition-colors"
                                                        title="Edit row"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRow(index)}
                                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                                                        title="Delete row"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Add Row Button */}
                            <button
                                onClick={handleAddRow}
                                className="w-full py-3 px-4 border-2 border-dashed border-sage-300 rounded-lg text-sage-600 hover:border-sage-500 hover:text-sage-700 hover:bg-sage-50 transition-colors font-medium"
                            >
                                + Add Row {formData.rowInstructions.length + 1}
                            </button>

                            {/* Pattern Summary */}
                            {formData.rowInstructions.length > 0 && (
                                <div className="mt-3 text-sm text-wool-600 text-center">
                                    {formData.rowInstructions.length} {formData.rowInstructions.length === 1 ? 'row' : 'rows'} in pattern
                                </div>
                            )}
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="pt-4 border-t border-wool-200">
                        <div className="flex gap-3">
                            <button
                                onClick={onBack}
                                className="flex-1 btn-tertiary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!canSave()}
                                className="flex-1 btn-primary"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Row Entry Overlay */}
                {showRowEntryOverlay && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={handleOverlayBackdrop}
                    >
                        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-wool-700">
                                        {editingRowIndex === null ? `Row ${formData.rowInstructions.length + 1}` : `Edit Row ${editingRowIndex + 1}`}
                                        {editingRowIndex === null && (
                                            <span className="text-sm font-normal text-wool-500 ml-2">
                                                ({getRowSide(formData.rowInstructions.length + 1)})
                                            </span>
                                        )}
                                    </h3>
                                    <button
                                        onClick={() => setShowRowEntryOverlay(false)}
                                        className="text-wool-400 hover:text-wool-600 text-xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <textarea
                                        value={tempRowText}
                                        onChange={(e) => setTempRowText(e.target.value)}
                                        placeholder={placeholderText}
                                        rows={3}
                                        className="w-full border-2 border-wool-200 rounded-lg px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors resize-none"
                                        autoFocus
                                    />
                                </div>

                                <div className="mb-4">
                                    <div className="text-sm font-medium text-wool-600 mb-2">Quick Actions:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {quickActions.map(action => (
                                            <button
                                                key={action}
                                                onClick={() => handleQuickAction(action)}
                                                className="px-3 py-1 bg-sage-100 text-sage-700 rounded-lg text-sm hover:bg-sage-200 transition-colors"
                                            >
                                                {action}
                                            </button>
                                        ))}

                                        {formData.rowInstructions.map((instruction, index) => (
                                            <button
                                                key={`copy_${index}`}
                                                onClick={() => handleQuickAction(`copy_${index}`)}
                                                className="px-3 py-1 bg-yarn-100 text-yarn-700 rounded-lg text-sm hover:bg-yarn-200 transition-colors"
                                            >
                                                Copy Row {index + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowRowEntryOverlay(false)}
                                        className="flex-1 py-3 px-4 border-2 border-wool-200 rounded-lg text-wool-600 hover:bg-wool-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveRow}
                                        disabled={!tempRowText.trim()}
                                        className="flex-1 py-3 px-4 bg-sage-500 text-white rounded-lg hover:bg-sage-600 disabled:bg-wool-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {editingRowIndex === null ? 'Add Row' : 'Save Row'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditRowByRowPatternForm;