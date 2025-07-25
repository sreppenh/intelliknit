import React from 'react';

const DetailsTab = ({ project, onEditProjectDetails }) => {
    return (
        <div className="p-6 space-y-4">
            <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm space-y-3">
                <h3 className="font-semibold text-wool-700 mb-3">Project Details</h3>

                {project.yarn && (
                    <div>
                        <span className="text-sm font-medium text-wool-600">Yarn:</span>
                        <p className="text-sm text-wool-700">{project.yarn}</p>
                    </div>
                )}

                {project.needles && (
                    <div>
                        <span className="text-sm font-medium text-wool-600">Needles:</span>
                        <p className="text-sm text-wool-700">{project.needles}</p>
                    </div>
                )}

                {project.gauge && (
                    <div>
                        <span className="text-sm font-medium text-wool-600">Gauge:</span>
                        <p className="text-sm text-wool-700">{project.gauge}</p>
                    </div>
                )}

                {project.notes && (
                    <div>
                        <span className="text-sm font-medium text-wool-600">Notes:</span>
                        <p className="text-sm text-wool-700">{project.notes}</p>
                    </div>
                )}

                {project.designer && (
                    <div>
                        <span className="text-sm font-medium text-wool-600">Designer:</span>
                        <p className="text-sm text-wool-700">{project.designer}</p>
                    </div>
                )}

                {project.recipient && (
                    <div>
                        <span className="text-sm font-medium text-wool-600">Recipient:</span>
                        <p className="text-sm text-wool-700">{project.recipient}</p>
                    </div>
                )}
            </div>

            <button
                onClick={onEditProjectDetails}
                className="w-full bg-yarn-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-yarn-700 transition-colors"
            >
                ✏️ Edit Project Details
            </button>
        </div>
    );
};

export default DetailsTab;