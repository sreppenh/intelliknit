import React, { useState } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';

/**
 * CustomActionEditor - Clean custom action creation/editing interface
 * 
 * Replaces the horrible overlay-on-modal with a clean inline editor
 * that works like NumberKeyboard - fills the PatternInputContainer space
 */
const CustomActionEditor = ({
    // Core props
    patternType,
    currentProject,
    updateProject,

    // Editing state
    editingAction = null,  // null = creating new, object = editing existing
    editingIndex = null,   // which slot (0-3) we're editing

    // Navigation
    onSave,               // Called when save/cancel - returns to keyboard mode
    onCancel
}) => {

    // Form state
    const [formData, setFormData] = useState({
        name: editingAction?.name || '',
        consumed: editingAction?.consumed || 1,
        stitches: editingAction?.stitches || 1
    });

    // Get pattern key for storage
    const getPatternKey = () => {
        return patternType === 'Lace Pattern' ? 'lace' :
            patternType === 'Cable Pattern' ? 'cable' : 'general';
    };

    // Handle save
    const handleSave = () => {
        if (!formData.name.trim()) {
            alert('Please enter a name for the custom action');
            return;
        }

        const trimmedAction = formData.name.trim().substring(0, 8);
        const customActionData = {
            name: trimmedAction,
            consumed: formData.consumed,
            stitches: formData.stitches
        };

        const key = getPatternKey();
        const currentCustomActions = currentProject?.customKeyboardActions || {};
        const patternActions = [...(currentCustomActions[key] || [])];

        // Ensure we have 4 slots
        while (patternActions.length < 4) {
            patternActions.push('Custom');
        }

        // Update the specific slot
        patternActions[editingIndex] = customActionData;

        const updatedCustomActions = {
            ...currentCustomActions,
            [key]: patternActions
        };

        updateProject({ customKeyboardActions: updatedCustomActions });
        onSave(); // Return to keyboard mode
    };

    // Handle cancel
    const handleCancel = () => {
        onCancel(); // Return to keyboard mode
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-lg font-semibold text-wool-700">
                    {editingAction ? 'Edit Custom Action' : 'Create Custom Action'}
                </h3>
                <p className="text-sm text-wool-500 mt-1">
                    {patternType === 'Lace Pattern' ? 'Lace' :
                        patternType === 'Cable Pattern' ? 'Cable' : 'General'} Pattern
                </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-wool-700 mb-2">
                        Action Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            name: e.target.value.substring(0, 8)
                        }))}
                        maxLength={8}
                        placeholder="8 char limit"
                        className="w-full px-4 py-3 border-2 border-wool-300 rounded-lg text-base font-mono focus:border-yarn-500 focus:outline-none transition-colors"
                        autoFocus
                    />
                </div>

                {/* Consumed Stitches */}
                <div>
                    <label className="block text-sm font-medium text-wool-700 mb-2">
                        Stitches Consumed
                    </label>
                    <IncrementInput
                        value={formData.consumed}
                        onChange={(value) => setFormData(prev => ({
                            ...prev,
                            consumed: value
                        }))}
                        min={0}
                        max={10}
                        unit="stitches"
                        size="lg"
                        className="justify-center"
                    />
                    <p className="text-xs text-wool-500 mt-1">
                        How many stitches this action uses up
                    </p>
                </div>

                {/* Resulting Stitches */}
                <div>
                    <label className="block text-sm font-medium text-wool-700 mb-2">
                        Stitches Produced
                    </label>
                    <IncrementInput
                        value={formData.stitches}
                        onChange={(value) => setFormData(prev => ({
                            ...prev,
                            stitches: value
                        }))}
                        min={0}
                        max={10}
                        unit="stitches"
                        size="lg"
                        className="justify-center"
                    />
                    <p className="text-xs text-wool-500 mt-1">
                        How many stitches remain after this action
                    </p>
                </div>
            </div>

            {/* Net Effect Preview */}
            {formData.consumed !== formData.stitches && (
                <div className="bg-sage-50 border border-sage-200 rounded-lg p-3 text-center">
                    <span className="text-sm text-sage-700">
                        Net effect:
                        <span className={`font-bold ml-1 ${formData.stitches > formData.consumed ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {formData.stitches > formData.consumed ? '+' : ''}
                            {formData.stitches - formData.consumed} stitches
                        </span>
                    </span>
                </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                    onClick={handleCancel}
                    className="h-12 bg-wool-100 text-wool-700 rounded-lg text-sm font-medium hover:bg-wool-200 border border-wool-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!formData.name.trim()}
                    className={`h-12 rounded-lg text-sm font-medium transition-colors ${formData.name.trim()
                            ? 'bg-sage-500 text-white hover:bg-sage-600'
                            : 'bg-wool-300 text-wool-500 cursor-not-allowed'
                        }`}
                >
                    {editingAction ? 'Save Changes' : 'Create Action'}
                </button>
            </div>
        </div>
    );
};

export default CustomActionEditor;