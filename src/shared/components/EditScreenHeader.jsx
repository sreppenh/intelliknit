// src/shared/components/EditScreenHeader.jsx
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
    variant = 'edit' // 'edit' | 'config' | 'pattern' | 'custom'
}) => {
    // Variant styles
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
                    <p className={`text-sm ${styles.text} font-medium`}>
                        {emoji} {title}
                    </p>
                    {subtitle && (
                        <p className={`text-xs ${styles.subtext} mt-1`}>
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
        </>
    );
};

export default EditScreenHeader;