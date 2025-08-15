import React from 'react';
import PageHeader from './PageHeader';

/**
 * EditScreenHeader - Reusable header for all edit screens
 * 
 * Provides consistent navigation and branding across edit modes
 * with optional title/subtitle display
 */
const EditScreenHeader = ({
    onBack,
    onGoToLanding,
    title,
    subtitle,
    emoji = '🔧',
    variant = 'edit',
    statusClass = null,
    statusType = null // NEW: Pass the raw status type
}) => {
    // Get status-specific icon based on component status
    const getStatusIcon = (statusType) => {
        const statusIcons = {
            'ready_to_knit': '⚡',     // Lightning bolt for ready
            'in_progress': '🧶',       // Yarn for in progress  
            'complete': '✅',          // Checkmark for complete
            'edit_mode': '🔧',         // Wrench for edit mode
            'planning': '📝',          // Pencil for planning
            'dormant': '😴',           // Sleeping for dormant
            'frogged': '🐸'            // Frog for frogged
        };
        return statusIcons[statusType] || emoji; // Fallback to provided emoji
    };

    // If statusClass provided, use your existing status color system
    if (statusClass && statusType) {
        const statusIcon = getStatusIcon(statusType);

        return (
            <>
                <PageHeader
                    useBranding={true}
                    onHome={onGoToLanding}
                    compact={true}
                    onBack={onBack}
                    showCancelButton={true}
                    onCancel={onBack}
                />

                {title && (
                    <div className={`${statusClass} rounded-xl p-3 mx-6 mt-6 mb-4`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl flex-shrink-0">{statusIcon}</span>
                            <div className="flex-1">
                                <p className="text-lg font-medium">
                                    {title}
                                </p>
                                {subtitle && (
                                    <p className="text-xs mt-1">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Fallback to existing variant system for backward compatibility
    const variantStyles = {
        edit: {
            bg: 'bg-yarn-100',
            border: 'border-yarn-200',
            text: 'text-yarn-600',
            subtext: 'text-yarn-500'
        },
        config: {
            bg: 'bg-sage-100',
            border: 'border-sage-200',
            text: 'text-sage-600',
            subtext: 'text-sage-500'
        },
        pattern: {
            bg: 'bg-lavender-100',
            border: 'border-lavender-200',
            text: 'text-lavender-600',
            subtext: 'text-lavender-500'
        },
        custom: {
            bg: 'bg-wool-100',
            border: 'border-wool-200',
            text: 'text-wool-600',
            subtext: 'text-wool-500'
        }
    };

    const styles = variantStyles[variant] || variantStyles.edit;

    return (
        <>
            <PageHeader
                useBranding={true}
                onHome={onGoToLanding}
                compact={true}
                onBack={onBack}
                showCancelButton={true}
                onCancel={onBack}
            />

            {title && (
                <div className={`${styles.bg} border-2 ${styles.border} rounded-xl p-3 mx-6 mt-6 mb-4`}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl flex-shrink-0">{emoji}</span>
                        <div className="flex-1">
                            <p className={`text-lg ${styles.text} font-medium`}>
                                {title}
                            </p>
                            {subtitle && (
                                <p className={`text-xs ${styles.subtext} mt-1`}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EditScreenHeader;