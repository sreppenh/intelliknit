import React from 'react';
import CompactComponentCard from '../../CompactComponentCard';

const ComponentsTab = ({
    project,
    sortedComponents,
    onShowEnhancedCreation,
    onComponentManageSteps,
    onComponentMenuAction,
    openMenuId,
    setOpenMenuId
}) => {
    return (
        <div className="p-6">
            <div className="stack-lg">
                {/* Add Component Button - Less prominent than before */}
                <button
                    onClick={onShowEnhancedCreation}
                    className="w-full bg-wool-200 text-wool-700 py-2.5 px-4 rounded-xl font-medium hover:bg-wool-300 transition-colors flex items-center justify-center gap-2 border-2 border-wool-300"
                >
                    <span>➕</span>
                    Add Component
                </button>

                {/* Component Grid - Exactly as before */}
                <div className="grid-2-equal">
                    {sortedComponents.map((item, index) => (
                        <CompactComponentCard
                            key={item.id}
                            component={item}
                            onManageSteps={onComponentManageSteps}
                            onMenuAction={onComponentMenuAction}
                            openMenuId={openMenuId}
                            setOpenMenuId={setOpenMenuId}
                        />
                    ))}
                </div>

                {/* Empty state message */}
                {project.components.length === 0 && (
                    <div className="mt-6 py-8 text-center">
                        <div className="text-2xl mb-2">🧶</div>
                        <p className="text-wool-500 text-sm">Add your first component to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComponentsTab;