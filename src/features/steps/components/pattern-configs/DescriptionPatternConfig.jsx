// src/features/steps/components/pattern-configs/DescriptionPatternConfig.jsx
import React, { useRef } from 'react'; // Add useRef
import IncrementInput from '../../../../shared/components/IncrementInput';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import KnittingAbbreviationBar from '../../../../shared/components/KnittingAbbreviationBar';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext'; // ✨ ADD
import { useKnittingAbbreviations, handleSmartKeyDown } from '../../../../shared/hooks/useKnittingAbbreviations';

const DescriptionPatternConfig = ({
    wizardData,
    updateWizardData,
    construction,

    // Mode-aware props
    mode = 'create',           // 'create' | 'edit' | 'notepad'
    onSave,                    // Called when save button is clicked (edit mode)
    onCancel,                  // Called when cancel button is clicked (edit mode)
    readOnlyFields = [],       // Array of field names that should be read-only
    showSaveActions = false    // Whether to show save/cancel buttons
}) => {
    // Construction Awareness
    const terms = getConstructionTerms(construction);

    // Mode detection
    const isEditMode = mode === 'edit';
    const isNotepadMode = mode === 'notepad';

    // Check if a field is read-only
    const isReadOnly = (fieldName) => readOnlyFields.includes(fieldName);

    // ✨ ADD THESE:
    const textareaRef = useRef(null);
    const { currentProject, dispatch } = useProjectsContext();

    // ✨ ADD THIS HANDLER:
    const handleUpdateRecentlyUsed = (updatedArray) => {
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                ...currentProject,
                customAbbreviations: {
                    ...currentProject.customAbbreviations,
                    recentlyUsed: updatedArray
                }
            }
        });
    };

    // Determine if we should show save/cancel actions
    const shouldShowActions = showSaveActions || isEditMode;

    // Validation
    const canSave = () => {
        return wizardData.stitchPattern.customText?.trim() &&
            wizardData.stitchPattern.rowsInPattern;
    };

    // Save handlers
    const handleSave = () => {
        if (onSave && canSave()) {
            onSave(wizardData.stitchPattern);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="stack-lg">
            {/* Mode indicator for edit mode */}
            {isEditMode && (
                <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-yarn-600 font-medium">
                        🔧 Edit Mode - Description Pattern Configuration
                    </p>
                    <p className="text-xs text-yarn-500 mt-1">
                        Make changes to your pattern description
                    </p>
                </div>
            )}

            {/* Notepad mode indicator */}
            {isNotepadMode && (
                <div className="bg-lavender-100 border-2 border-lavender-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-lavender-600 font-medium">
                        📝 Notepad Mode - Pattern Designer
                    </p>
                    <p className="text-xs text-lavender-500 mt-1">
                        Design your pattern for future use in projects
                    </p>
                </div>
            )}

            {/* Pattern Description */}
            <div>
                <label className="form-label">Pattern Description</label>
                <textarea
                    ref={textareaRef}
                    value={wizardData.stitchPattern.customText || ''}
                    onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
                    onKeyDown={(e) => handleSmartKeyDown(e, wizardData.stitchPattern.customText || '', (newValue) => updateWizardData('stitchPattern', { customText: newValue }), textareaRef)}
                    placeholder="e.g., '5 rows stockinette, 1 bobble row'"
                    rows={3}
                    className="input-field-lg resize-none"
                    readOnly={isReadOnly('customText')}
                />
                <div className="form-help">
                    Describe your pattern in your own words
                </div>

                {/* ✨ ADD: Abbreviation Bar */}
                {!isReadOnly('customText') && (
                    <KnittingAbbreviationBar
                        textareaRef={textareaRef}
                        value={wizardData.stitchPattern.customText || ''}
                        onChange={(newValue) => updateWizardData('stitchPattern', { customText: newValue })}
                        recentlyUsed={currentProject?.customAbbreviations?.recentlyUsed || []}
                        onUpdateRecentlyUsed={handleUpdateRecentlyUsed}
                    />
                )}
                {isReadOnly('customText') && (
                    <p className="text-xs text-yarn-600 mt-1">
                        Pattern description is read-only in edit mode
                    </p>
                )}
            </div>

            {/* Rows in Pattern */}
            <div>
                <label className="form-label">Rows in Pattern</label>
                <IncrementInput
                    value={wizardData.stitchPattern.rowsInPattern}
                    onChange={(value) => updateWizardData('stitchPattern', { rowsInPattern: value })}
                    label="rows in pattern"
                    construction={construction}
                    disabled={isReadOnly('rowsInPattern')}
                />
                <div className="form-help">
                    Number of {terms.rows} in one complete pattern repeat
                </div>
                {isReadOnly('rowsInPattern') && (
                    <p className="text-xs text-yarn-600 mt-1">
                        Row count is locked to preserve calculations
                    </p>
                )}
            </div>

            {/* Stitch Change per Repeat */}
            <div>
                <label className="form-label">Stitch Change per Repeat</label>
                <IncrementInput
                    value={wizardData.stitchPattern.stitchChangePerRepeat || 0}
                    onChange={(value) => updateWizardData('stitchPattern', { stitchChangePerRepeat: value })}
                    label="stitch change"
                    unit="stitches"
                    construction={construction}
                    min={-20}
                    max={20}
                    allowNegative={true}
                    disabled={isReadOnly('stitchChangePerRepeat')}
                />
                <div className="form-help">
                    Stitches gained (+) or lost (-) per repeat. Use 0 for stitch-neutral patterns (most common).
                </div>
                {isReadOnly('stitchChangePerRepeat') && (
                    <p className="text-xs text-yarn-600 mt-1">
                        Stitch change is locked to preserve calculations
                    </p>
                )}
            </div>

            {/* Save/Cancel Actions */}
            {shouldShowActions && (
                <div className="pt-4 border-t border-wool-200">
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="flex-1 btn-tertiary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!canSave()}
                            className="flex-1 btn-primary"
                        >
                            {isEditMode ? 'Save Changes' : isNotepadMode ? 'Save to Notepad' : 'Save Pattern'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DescriptionPatternConfig;