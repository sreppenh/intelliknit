// src/features/steps/components/shaping-wizard/MarkerPhasesConfig.jsx
import React, { useState } from 'react';
import ShapingHeader from './ShapingHeader';

const MarkerPhasesConfig = ({
    shapingData,
    setShapingData,
    currentStitches,
    construction,
    component,
    componentIndex,
    editingStepIndex,
    onExitToComponentSteps,
    onComplete,
    onBack,
    wizardData,
    onGoToLanding,
    wizard,
    onCancel,
    mode
}) => {
    const [screen, setScreen] = useState(1);

    // Temporary development screen
    return (
        <div>
            <ShapingHeader
                onBack={onBack}
                onGoToLanding={onGoToLanding}
                wizard={wizard}
                onCancel={onCancel}
            />

            <div className="p-6 stack-lg">
                <div className="text-center py-8">
                    <div className="text-4xl mb-4">🏗️</div>
                    <h3 className="content-header-secondary mb-2">Marker Phases</h3>
                    <p className="content-subheader">Under construction - coming soon!</p>
                    <div className="text-sm text-wool-600 mb-6">
                        This will be the comprehensive marker-based shaping system.
                    </div>
                    <button
                        onClick={onBack}
                        className="btn-tertiary"
                    >
                        ← Back to Types
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarkerPhasesConfig;