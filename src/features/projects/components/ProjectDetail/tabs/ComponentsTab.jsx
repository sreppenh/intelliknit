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
            {/* Content Header with Button - Matching Details Tab Pattern */}
            <div className="content-header-with-buttons">
                <h2 className="content-title">
                    Components ({project.components.length})
                </h2>
                <div className="button-group">
                    <button
                        onClick={onShowEnhancedCreation}
                        className="btn-primary btn-sm flex items-center gap-2"
                    >
                        <span>➕</span>
                        Add Component
                    </button>
                </div>
            </div>

            <div className="stack-lg">
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