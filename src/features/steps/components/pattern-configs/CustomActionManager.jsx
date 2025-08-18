// src/features/steps/components/pattern-configs/CustomActionManager.jsx
import React, { useState } from 'react';

const CustomActionManager = ({ patternType, onActionSelect, currentProject, updateProject, newActionStitches, setNewActionStitches }) => {
    const [newActionName, setNewActionName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Get custom actions from current project
    const customActions = currentProject?.customActions?.[
        patternType === 'Lace Pattern' ? 'lace' :
            patternType === 'Cable Pattern' ? 'cable' : 'general'
    ] || [];

    const handleAddAction = () => {
        if (newActionName.trim() && newActionStitches.trim()) {
            const stitchCount = parseInt(newActionStitches);
            if (isNaN(stitchCount) || stitchCount < 0) {
                alert('Please enter a valid number of stitches (0 or higher)');
                return;
            }

            const key = patternType === 'Lace Pattern' ? 'lace' :
                patternType === 'Cable Pattern' ? 'cable' : 'general';

            // Store as object with stitch count
            const customActionData = {
                name: newActionName.trim(),
                stitches: stitchCount
            };

            const currentCustomActions = currentProject?.customKeyboardActions || {};
            const updatedCustomActions = {
                ...currentCustomActions,
                [key]: [...(currentCustomActions[key] || []), customActionData]
            };

            updateProject({ customKeyboardActions: updatedCustomActions });
            setNewActionName('');
            setNewActionStitches('1');
            setShowAddForm(false);
        }
    };

    const handleRemoveAction = (actionToRemove) => {
        const key = patternType === 'Lace Pattern' ? 'lace' :
            patternType === 'Cable Pattern' ? 'cable' : 'general';

        const currentCustomActions = currentProject?.customActions || {};
        const updatedCustomActions = {
            ...currentCustomActions,
            [key]: (currentCustomActions[key] || []).filter(action => action !== actionToRemove)
        };

        updateProject({ customActions: updatedCustomActions });
    };

    if (showAddForm) {
        return (
            <div className="bg-lavender-50 border-2 border-lavender-200 rounded-lg p-3 mb-3">
                <div className="text-sm font-medium text-lavender-700 mb-2">Add Custom Action</div>
                <div className="space-y-2">
                    <input
                        type="text"
                        value={newActionName}
                        onChange={(e) => setNewActionName(e.target.value)}
                        placeholder="e.g., Bobble, Nupps, Tree Branch"
                        className="w-full px-3 py-2 border border-lavender-300 rounded-lg text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAction()}
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={newActionStitches}
                            onChange={(e) => setNewActionStitches(e.target.value)}
                            placeholder="Stitches"
                            min="0"
                            className="w-20 px-3 py-2 border border-lavender-300 rounded-lg text-sm"
                        />
                        <span className="text-xs text-lavender-600 flex items-center">stitches produced</span>
                    </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={handleAddAction}
                        className="px-3 py-2 bg-lavender-500 text-white rounded-lg text-sm hover:bg-lavender-600"
                    >
                        Add
                    </button>
                    <button
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-2 bg-lavender-200 text-lavender-700 rounded-lg text-sm hover:bg-lavender-300"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-3">
            <div className="text-sm font-medium text-wool-600 mb-2">
                Custom {patternType.replace(' Pattern', '')} Actions
            </div>
            <div className="flex flex-wrap gap-2">
                {customActions.map((action, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <button
                            onClick={() => onActionSelect(action)}
                            className="px-3 py-2 bg-yarn-100 text-yarn-700 rounded-lg text-sm hover:bg-yarn-200 border border-yarn-200"
                        >
                            {typeof action === 'object' ? `${action.name} (${action.stitches})` : action}
                        </button>
                        <button
                            onClick={() => handleRemoveAction(action)}
                            className="w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs hover:bg-red-200 flex items-center justify-center"
                            title="Remove custom action"
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-3 py-2 bg-lavender-100 text-lavender-700 rounded-lg text-sm hover:bg-lavender-200 border border-lavender-200 border-dashed"
                >
                    + Add Custom
                </button>
            </div>
        </div>
    );
};

export default CustomActionManager;