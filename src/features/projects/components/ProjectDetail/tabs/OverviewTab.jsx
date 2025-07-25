import React from 'react';

const OverviewTab = ({
    project,
    totalComponents,
    completedComponents,
    onCompleteProject,
    onEditProjectDetails
}) => {
    return (
        <div className="p-6 space-y-6">
            {/* Project Dashboard */}
            <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm">
                <h3 className="font-semibold text-wool-700 mb-3">Project Summary</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-wool-600">Components:</span>
                        <span className="font-medium">{totalComponents} total</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-wool-600">Progress:</span>
                        <span className="font-medium">{completedComponents} of {totalComponents} complete</span>
                    </div>
                    {project.yarn && (
                        <div className="flex justify-between">
                            <span className="text-wool-600">Yarn:</span>
                            <span className="font-medium">{project.yarn}</span>
                        </div>
                    )}
                    {project.recipient && (
                        <div className="flex justify-between">
                            <span className="text-wool-600">For:</span>
                            <span className="font-medium">{project.recipient}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Project Actions */}
            <div className="space-y-3">
                <button
                    onClick={onCompleteProject}
                    className="w-full bg-sage-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-sage-700 transition-colors"
                >
                    🏆 Mark Project Complete
                </button>

                <button
                    onClick={onEditProjectDetails}
                    className="w-full bg-yarn-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-yarn-700 transition-colors"
                >
                    ✏️ Edit Project Details
                </button>
            </div>
        </div>
    );
};

export default OverviewTab;