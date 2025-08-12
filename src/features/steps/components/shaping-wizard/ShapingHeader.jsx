// src/features/steps/components/shaping-wizard/ShapingHeader.jsx
import React from 'react';
import PageHeader from '../../../../shared/components/PageHeader';

const ShapingHeader = ({
    onBack,
    onGoToLanding,
    wizard,
    onCancel
}) => {
    // Get construction display for contextual bar
    const getConstructionDisplay = () => {
        // First try component construction (from recent component creation work)
        if (wizard.component?.construction) {
            return wizard.component.construction === 'flat' ? 'Flat' : 'Round';
        }
        // Fallback to wizard construction
        return wizard.construction === 'flat' ? 'Flat' : 'Round';
    };

    // Get pattern type for contextual display
    const getPatternType = () => {
        const { pattern } = wizard.wizardData.stitchPattern || {};
        if (!pattern) return 'Pattern';
        return pattern;
    };

    // Get stitch count display with calculation state
    const getStitchCountDisplay = () => {
        // During calculations or special states, show "Working with X stitches"
        if (wizard.wizardData.hasShaping && wizard.wizardStep >= 3) {
            return `**Working with ${wizard.currentStitches} stitches**`;
        }
        // Normal state
        return `${wizard.currentStitches} stitches`;
    };

    return (
        <>
            <PageHeader
                onBack={onBack}
                onHome={onGoToLanding}
                showCancelButton={true}
                onCancel={onCancel || onBack}
                useBranding={true}
                compact={true}
                sticky={true}
            />

            {/* Inlined WizardContextBar */}
            <div className="px-6 py-3 bg-sage-100 border-b border-sage-200">
                <div className="flex items-center gap-2 text-sage-700 text-sm">
                    <span>{getConstructionDisplay()}</span>
                    <span>•</span>
                    <span>{getPatternType()}</span>
                    <span>•</span>
                    <span className={wizard.wizardData.hasShaping && wizard.wizardStep >= 3 ? 'font-semibold' : ''}>
                        {getStitchCountDisplay()}
                    </span>
                </div>
            </div>
        </>
    );
};

export default ShapingHeader;