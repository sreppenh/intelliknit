import React from 'react';
import StepWizard from '../../steps/components/StepWizard';

const ConfigureNotePattern = ({ onBack, onGoToLanding }) => {
    return (
        <StepWizard
            mode="notepad"
            componentIndex={0}
            onBack={onBack}
            onGoToLanding={onGoToLanding}
        />
    );
};

export default ConfigureNotePattern;