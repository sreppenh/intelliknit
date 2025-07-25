import React from 'react';

/**
 * EmptyState - Universal empty state component for consistent UX across tabs
 * 
 * Features:
 * - Customizable messaging per tab context
 * - Clear call-to-action buttons
 * - Consistent visual design
 * - Mobile-optimized layout
 */

const EmptyState = ({
    icon,
    title,
    description,
    primaryAction,
    secondaryAction,
    className = "",
    variant = "default" // 'default' | 'info' | 'encouraging'
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'info':
                return 'bg-lavender-50 border-lavender-200';
            case 'encouraging':
                return 'bg-sage-50 border-sage-200';
            default:
                return 'bg-white border-wool-200';
        }
    };

    return (
        <div className={`text-center py-12 px-6 ${className}`}>
            <div className={`max-w-sm mx-auto rounded-xl p-6 border-2 shadow-sm ${getVariantClasses()}`}>
                {/* Icon/Emoji */}
                {icon && (
                    <div className="text-4xl mb-4">
                        {icon}
                    </div>
                )}

                {/* Title */}
                {title && (
                    <h3 className="font-semibold text-wool-700 mb-2 text-lg">
                        {title}
                    </h3>
                )}

                {/* Description */}
                {description && (
                    <p className="text-wool-500 text-sm mb-6 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            className={primaryAction.className || "w-full bg-yarn-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-yarn-700 transition-colors shadow-sm"}
                        >
                            {primaryAction.label}
                        </button>
                    )}

                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className={secondaryAction.className || "w-full bg-wool-200 text-wool-700 py-2.5 px-4 rounded-xl font-medium hover:bg-wool-300 transition-colors"}
                        >
                            {secondaryAction.label}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Pre-configured empty states for common tab scenarios
EmptyState.Overview = ({ onEditProject, onAddComponent }) => (
    <EmptyState
        icon="🚀"
        title="Project Starting Soon"
        description="Your project is ready to begin! Add components to start tracking your knitting progress."
        variant="encouraging"
        primaryAction={{
            label: "Add First Component",
            onClick: onAddComponent
        }}
        secondaryAction={{
            label: "Edit Project Details",
            onClick: onEditProject
        }}
    />
);

EmptyState.Components = ({ onAddComponent }) => (
    <EmptyState
        icon="🧶"
        title="Add Your First Component"
        description="Break your project into manageable pieces like sleeves, body, or collar to track progress effectively."
        primaryAction={{
            label: "Add Component",
            onClick: onAddComponent
        }}
    />
);

EmptyState.Checklist = ({ onCreateChecklist }) => (
    <EmptyState
        icon="📋"
        title="Create Your Project Checklist"
        description="Stay organized with finishing tasks like blocking, seaming, and adding buttons or zippers."
        variant="info"
        primaryAction={{
            label: "Create Checklist",
            onClick: onCreateChecklist
        }}
    />
);

EmptyState.Photos = ({ onAddPhoto }) => (
    <EmptyState
        icon="📷"
        title="Photos Coming Soon"
        description="Project photo gallery will be available in a future update to showcase your beautiful work."
        variant="info"
    />
);

export default EmptyState;