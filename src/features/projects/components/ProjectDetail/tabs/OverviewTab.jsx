import React from 'react';
import { getProjectStatus } from '../../../../../shared/utils/projectStatus';

const OverviewTab = ({
    project,
    totalComponents,
    completedComponents,
    onCompleteProject,
    onEditProjectDetails
}) => {

    // Format dates (migrated from ProjectStatusBar)
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate last activity (migrated from ProjectStatusBar)
    const getLastActivity = () => {
        const daysSinceCreated = Math.floor((new Date() - new Date(project.createdAt)) / (1000 * 60 * 60 * 24));

        if (daysSinceCreated === 0) return 'Today';
        if (daysSinceCreated === 1) return '1 day ago';
        if (daysSinceCreated < 7) return `${daysSinceCreated} days ago`;
        if (daysSinceCreated < 30) return `${Math.floor(daysSinceCreated / 7)} weeks ago`;
        return `${Math.floor(daysSinceCreated / 30)} months ago`;
    };

    const status = getProjectStatus(project);

    return (
        <div className="p-6 space-y-6">
            {/* Project Status Section - Enhanced with migrated information */}
            <div className="bg-white rounded-xl p-5 border-2 border-wool-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-wool-700">Project Status</h3>
                    <button
                        onClick={onEditProjectDetails}
                        className="bg-sage-500 text-white text-xs px-3 py-1.5 rounded-md font-medium hover:bg-sage-600 transition-colors"
                    >
                        Edit
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-sage-700">Status:</span>
                        <span className={`text-sm font-medium ${status.text === 'Completed' ? 'text-sage-800' :
                            status.text.includes('progress') || status.text.includes('fire') ? 'text-sage-700' :
                                status.text.includes('Ready to knit') ? 'text-yarn-700' :
                                    'text-wool-600'
                            }`}>
                            {status.emoji} {status.text}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-sage-700">Started:</span>
                        <span className="text-sm text-sage-600">
                            {formatDate(project.createdAt)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-sage-700">Last worked:</span>
                        <span className="text-sm text-sage-600">
                            {getLastActivity()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Project Summary */}
            <div className="bg-white rounded-xl p-5 border-2 border-wool-200 shadow-sm">
                <h3 className="font-semibold text-wool-700 mb-4">Project Summary</h3>
                <div className="space-y-3 text-sm">
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