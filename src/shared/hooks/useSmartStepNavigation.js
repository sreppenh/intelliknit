// src/shared/hooks/useSmartStepNavigation.js
import { useState, useRef, useCallback } from 'react';
import IntelliKnitLogger from '../utils/ConsoleLogging';

/**
 * Smart Step Navigation Hook
 * 
 * Replaces all calculated navigation logic with actual visited screen tracking.
 * Handles data persistence and cycle-aware navigation for Step Wizard.
 * 
 * Key Features:
 * - Tracks actual visited screens (no calculations)
 * - Session-scoped data persistence 
 * - Cycle-aware back navigation (prevents unwinding loops)
 * - Unsaved changes detection integration ready
 */
export const useSmartStepNavigation = (initialStep = 1, wizardData, updateWizardData, savedNavigationData = null) => {
    // Initialize with saved data if editing, otherwise start fresh
    const [navigationStack, setNavigationStack] = useState(() => {
        return savedNavigationData?.savedStack || [initialStep];
    });

    const [currentStep, setCurrentStep] = useState(() => {
        return savedNavigationData?.savedStack?.slice(-1)[0] || initialStep;
    });

    // Initialize cache with saved data if editing
    const dataCache = useRef(
        savedNavigationData?.savedCache || {
            patterns: {},
            shaping: {},
            cycleEntryPoints: new Map()
        });

    /**
     * Navigate to a specific step
     * Automatically tracks the navigation and manages data persistence
     */
    const goToStep = useCallback((targetStep, options = {}) => {
        const {
            isCycleEntry = false,
            cycleType = null,
            preserveData = true
        } = options;

        // Handle cycle entry points (like entering Sequential Phases)
        if (isCycleEntry && cycleType) {
            dataCache.current.cycleEntryPoints.set(cycleType, currentStep);
        }

        // Persist current data before navigation
        if (preserveData) {
            persistCurrentStepData(currentStep, wizardData);
        }

        // Update navigation stack
        setNavigationStack(prev => [...prev, targetStep]);
        setCurrentStep(targetStep);

        // Restore any compatible cached data for target step
        restoreStepData(targetStep);
    }, [currentStep, navigationStack, wizardData]);

    /**
     * Smart back navigation
     * Handles cycle detection and data persistence
     */
    const goBack = useCallback((options = {}) => {
        const { forceExit = false } = options;

        if (navigationStack.length <= 1) {
            return { action: 'exit', targetStep: null };
        }

        // Check for cycle exit
        const cycleExitInfo = checkCycleExit(currentStep);
        if (cycleExitInfo && !forceExit) {

            // Go back to cycle entry point instead of unwinding
            const entryStep = dataCache.current.cycleEntryPoints.get(cycleExitInfo.cycleType);
            if (entryStep) {
                setNavigationStack([entryStep]);
                setCurrentStep(entryStep);
                return { action: 'cycle-exit', targetStep: entryStep, cycleType: cycleExitInfo.cycleType };
            }
        }

        // Normal back navigation
        const newStack = [...navigationStack];
        newStack.pop(); // Remove current step
        const previousStep = newStack[newStack.length - 1];

        setNavigationStack(newStack);
        setCurrentStep(previousStep);

        // Restore data for previous step
        restoreStepData(previousStep);

        return { action: 'back', targetStep: previousStep };
    }, [currentStep, navigationStack]);

    /**
     * Persist data for current step based on step type and content
     */
    const persistCurrentStepData = useCallback((step, data) => {
        const { stitchPattern, shapingConfig, duration, colorwork } = data;

        // Persist pattern data with category+pattern key
        if (stitchPattern?.category && stitchPattern?.pattern) {
            const patternKey = `${stitchPattern.category}_${stitchPattern.pattern}`;
            dataCache.current.patterns[patternKey] = {
                ...stitchPattern,
                timestamp: Date.now()
            };
        }

        // Persist shaping data by type
        if (shapingConfig?.type) {
            dataCache.current.shaping[shapingConfig.type] = {
                ...shapingConfig,
                timestamp: Date.now()
            };
        }

        // Duration persists with current session (no special key needed)
        if (duration?.type && duration?.value) {
            dataCache.current.lastDuration = {
                ...duration,
                timestamp: Date.now()
            };
        }

    }, []);

    /**
     * Restore compatible cached data for target step
     */
    const restoreStepData = useCallback((step) => {
        const { stitchPattern } = wizardData;

        // For pattern steps, restore if we have matching cached data
        if (step === 1 || step === 2) {
            if (stitchPattern?.category && stitchPattern?.pattern) {
                const patternKey = `${stitchPattern.category}_${stitchPattern.pattern}`;
                const cachedPattern = dataCache.current.patterns[patternKey];

                if (cachedPattern && isRecentData(cachedPattern.timestamp)) {
                    updateWizardData('stitchPattern', cachedPattern);
                }
            }
        }

        // For shaping steps, restore based on current shaping type
        if (step === 3 || step === 4) {
            const currentShapingType = wizardData.shapingConfig?.type;
            if (currentShapingType) {
                const cachedShaping = dataCache.current.shaping[currentShapingType];
                if (cachedShaping && isRecentData(cachedShaping.timestamp)) {
                    updateWizardData('shapingConfig', cachedShaping);
                }
            }
        }
    }, [wizardData, updateWizardData]);

    /**
     * Check if current step is exiting a cycle (like Sequential Phases)
     */
    const checkCycleExit = useCallback((step) => {
        // Define cycle patterns - these are screens that form cycles
        const cyclePatterns = {
            'sequential-phases': {
                screens: ['phase-summary', 'phase-type-select', 'phase-configure'],
                exitScreen: 'phase-summary'
            }
            // Can add more cycle types here as needed
        };

        // For now, we'll detect cycles based on step patterns
        // This is a placeholder - real implementation would need more context
        return null; // Will implement when integrating with actual sub-wizards
    }, []);

    /**
     * Check if cached data is recent enough to restore
     */
    const isRecentData = useCallback((timestamp) => {
        const MAX_AGE = 30 * 60 * 1000; // 30 minutes
        return (Date.now() - timestamp) < MAX_AGE;
    }, []);

    /**
     * Clear all cached data (called on wizard exit)
     */
    const clearCache = useCallback(() => {
        dataCache.current = {
            patterns: {},
            shaping: {},
            cycleEntryPoints: new Map()
        };
    }, []);

    /**
     * Get navigation context for debugging/UI
     */
    const getNavigationContext = useCallback(() => {
        return {
            currentStep,
            stackLength: navigationStack.length,
            canGoBack: navigationStack.length > 1,
            cachedPatterns: Object.keys(dataCache.current.patterns),
            cachedShaping: Object.keys(dataCache.current.shaping),
            cycleEntryPoints: Array.from(dataCache.current.cycleEntryPoints.entries())
        };
    }, [currentStep, navigationStack]);

    /**
     * Check if there are unsaved changes (integration point for future enhancement)
     */
    const hasUnsavedChanges = useCallback(() => {
        // Placeholder for unsaved changes detection
        // Will integrate with form state comparison when needed
        return false;
    }, []);

    return {
        // Current state
        currentStep,
        canGoBack: navigationStack.length > 1,

        // Navigation actions
        goToStep,
        goBack,

        // Data management
        clearCache,

        // Utilities
        getNavigationContext,
        hasUnsavedChanges,

        // ✅ ADD THIS for edit preservation
        dataCache: dataCache.current,

        // For integration with existing patterns
        navigationStack: [...navigationStack] // Read-only copy


    };
};

export default useSmartStepNavigation;