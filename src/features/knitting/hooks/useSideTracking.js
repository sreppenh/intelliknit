// src/features/knitting/hooks/useSideTracking.js
import { useState, useEffect } from 'react';

/**
 * Side Tracking Hook
 * Manages side intelligence data persistence similar to useRowCounter
 * Stores both session overrides and permanent step modifications
 */
export const useSideTracking = (projectId, componentId, stepIndex, step, component) => {
    // Storage keys
    const sessionKey = `side-session-${projectId}-${componentId}-${stepIndex}`;
    const stepKey = `side-step-${projectId}-${componentId}-${stepIndex}`;

    // Session state (temporary overrides)
    const [sessionOverride, setSessionOverride] = useState(() => {
        const saved = localStorage.getItem(sessionKey);
        return saved ? JSON.parse(saved) : null;
    });

    // Pattern offset state
    const [patternOffset, setPatternOffset] = useState(() => {
        const saved = localStorage.getItem(`${sessionKey}-pattern`);
        return saved ? JSON.parse(saved) : 0;
    });

    // Save session data to localStorage
    useEffect(() => {
        if (sessionOverride) {
            localStorage.setItem(sessionKey, JSON.stringify(sessionOverride));
        } else {
            localStorage.removeItem(sessionKey);
        }
    }, [sessionOverride, sessionKey]);

    useEffect(() => {
        localStorage.setItem(`${sessionKey}-pattern`, JSON.stringify(patternOffset));
    }, [patternOffset, sessionKey]);

    // Update session override
    const updateSideOverride = (newSide) => {
        setSessionOverride(newSide);
    };

    // Update pattern offset
    const updatePatternOffset = (offset) => {
        setPatternOffset(offset);
    };

    // Commit session changes to permanent step data
    const commitSideChanges = (updateProject) => {
        if (!sessionOverride && patternOffset === 0) return; // Nothing to commit

        // Update the step's sideTracking data
        updateProject(prevProject => {
            const newProject = { ...prevProject };
            const targetComponent = newProject.components[componentId];
            const targetStep = targetComponent.steps[stepIndex];

            // Initialize sideTracking if it doesn't exist
            if (!targetStep.sideTracking) {
                targetStep.sideTracking = {};
            }

            // Commit changes
            if (sessionOverride) {
                targetStep.sideTracking.startingSide = sessionOverride;
                targetStep.sideTracking.userOverride = true;
            }

            if (patternOffset !== 0) {
                targetStep.sideTracking.patternOffset = patternOffset;
            }

            return newProject;
        });

        // Clear session data after committing
        clearSessionData();
    };

    // Record actual ending side when step is completed
    const recordEndingSide = (endingSide, currentRow, updateProject) => {
        updateProject(prevProject => {
            const newProject = { ...prevProject };
            const targetComponent = newProject.components[componentId];
            const targetStep = targetComponent.steps[stepIndex];

            if (!targetStep.sideTracking) {
                targetStep.sideTracking = {};
            }

            targetStep.sideTracking.actualEndingSide = endingSide;
            targetStep.sideTracking.actualEndingRow = currentRow;

            return newProject;
        });
    };

    // Clear session data
    const clearSessionData = () => {
        setSessionOverride(null);
        setPatternOffset(0);
        localStorage.removeItem(sessionKey);
        localStorage.removeItem(`${sessionKey}-pattern`);
    };

    // Reset all side tracking for this step
    const resetSideTracking = (updateProject) => {
        updateProject(prevProject => {
            const newProject = { ...prevProject };
            const targetComponent = newProject.components[componentId];
            const targetStep = targetComponent.steps[stepIndex];

            delete targetStep.sideTracking;

            return newProject;
        });

        clearSessionData();
    };

    return {
        // Current state
        sessionOverride,
        patternOffset,

        // Actions  
        updateSideOverride,
        updatePatternOffset,
        commitSideChanges,
        recordEndingSide,
        clearSessionData,
        resetSideTracking,

        // Computed state
        hasSessionChanges: Boolean(sessionOverride || patternOffset !== 0),
        hasCommittedChanges: Boolean(step.sideTracking?.userOverride || step.sideTracking?.patternOffset)
    };
};