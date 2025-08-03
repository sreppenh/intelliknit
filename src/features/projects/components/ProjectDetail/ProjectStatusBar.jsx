import React from 'react';
import { getProjectStatus as getSharedProjectStatus } from '../../../shared/utils/projectStatus';

/**
 * ProjectStatusBar - Enhanced status display for project dashboard
 * Replaces the basic ContextualBar with prominent project information
 */

const ProjectStatusBar = ({ project, onEditProject, className = "" }) => {

    // Calculate project status
    const getProjectStatus = () => {
        const sharedStatus = getSharedProjectStatus(project);
        return sharedStatus.text || 'Unknown';
    };

    // Format dates
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate last activity
    const getLastActivity = () => {
        // For now, we'll use a placeholder - this would be calculated from actual activity tracking
        const daysSinceCreated = Math.floor((new Date() - new Date(project.createdAt)) / (1000 * 60 * 60 * 24));

        if (daysSinceCreated === 0) return 'Today';
        if (daysSinceCreated === 1) return '1 day ago';
        if (daysSinceCreated < 7) return `${daysSinceCreated} days ago`;
        if (daysSinceCreated < 30) return `${Math.floor(daysSinceCreated / 7)} weeks ago`;
        return `${Math.floor(daysSinceCreated / 30)} months ago`;
    };

    const status = getProjectStatus();

    return (
        <div className={`bg-sage-50 border-b border-sage-200 px-6 py-3 ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-sage-700">Status:</span>
                        <span className={`text-sm font-medium ${status === 'Complete' ? 'text-sage-800' :
                            status === 'In Progress' ? 'text-sage-700' :
                                status === 'Ready to Knit' ? 'text-yarn-700' :
                                    'text-wool-600'
                            }`}>
                            {status}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-sage-700">Started:</span>
                        <span className="text-sm text-sage-600">
                            {formatDate(project.createdAt)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onEditProject}
                    className="bg-sage-500 text-white text-xs px-3 py-1.5 rounded-md font-medium hover:bg-sage-600 transition-colors"
                >
                    Edit
                </button>
            </div>

            <div className="text-sm text-sage-600">
                Last worked: {getLastActivity()}
                {/* Future: Add specific component context like " (Left Sleeve)" */}
            </div>
        </div>
    );
};

export default ProjectStatusBar;