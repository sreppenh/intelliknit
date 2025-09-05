import { useState, useEffect, useCallback } from 'react';

/**
 * useStepNavigation - Smart carousel and step navigation hook
 * 
 * Handles keyboard shortcuts, smooth transitions, preloading,
 * and navigation state management for knitting step interface
 */
export const useStepNavigation = ({
    stepIndex,
    totalSteps,
    carouselItems = [],
    onNavigateStep,
    onToggleCompletion,
    isModalOpen = false
}) => {
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [preloadedSteps, setPreloadedSteps] = useState(new Set());
    const [navigationDirection, setNavigationDirection] = useState('forward');

    // Enhanced carousel positioning when step changes
    // Enhanced carousel positioning when step changes
    useEffect(() => {
        if (carouselItems.length > 0) {
            // Check if this step has different content types
            const hasPrep = carouselItems.some(item => item.type === 'prep');

            // For backward navigation, land on main step (skip prep initially)
            if (navigationDirection === 'backward' && carouselItems.length > 1) {
                // Find the main step index (skip prep when going backward)
                const mainStepIndex = carouselItems.findIndex(item => item.type === 'step');
                setCurrentCarouselIndex(mainStepIndex >= 0 ? mainStepIndex : 0);
            } else {
                setCurrentCarouselIndex(0);
            }
        }

        // Reset direction after handling
        setNavigationDirection('forward');
    }, [stepIndex]);

    // Safe carousel navigation
    const safeCarouselIndex = Math.min(currentCarouselIndex, carouselItems.length - 1);
    const currentItem = carouselItems[safeCarouselIndex];

    // Enhanced navigation bounds checking with absolute positioning
    const getNavigationBounds = () => {
        // Calculate absolute bounds across all steps and carousel items
        const isAtAbsoluteStart = stepIndex === 0 && safeCarouselIndex === 0;
        const isAtAbsoluteEnd = stepIndex === totalSteps - 1 && safeCarouselIndex === carouselItems.length - 1;

        const canGoLeft = safeCarouselIndex > 0 || stepIndex > 0;
        const canGoRight = safeCarouselIndex < carouselItems.length - 1 || stepIndex < totalSteps - 1;

        return { canGoLeft, canGoRight, isAtAbsoluteStart, isAtAbsoluteEnd };
    };

    const navigationBounds = getNavigationBounds();

    // Smooth transition wrapper (removed artificial delay)
    const withTransition = useCallback(async (action) => {
        setIsTransitioning(true);
        try {
            await action();
        } finally {
            setIsTransitioning(false);
        }
    }, []);

    // Smart left navigation with proper prep step handling
    const navigateLeft = useCallback(() => {
        if (isTransitioning || !navigationBounds.canGoLeft) return;

        withTransition(async () => {
            if (safeCarouselIndex > 0) {
                // Move within current step's carousel
                setCurrentCarouselIndex(safeCarouselIndex - 1);
            } else if (stepIndex > 0) {
                // Set direction for landing on main step
                setNavigationDirection('backward');
                onNavigateStep(-1);
            }
        });
    }, [safeCarouselIndex, stepIndex, onNavigateStep, withTransition, isTransitioning, navigationBounds.canGoLeft]);

    // Smart right navigation
    const navigateRight = useCallback(() => {
        if (isTransitioning || !navigationBounds.canGoRight) return;

        withTransition(async () => {
            if (safeCarouselIndex < carouselItems.length - 1) {
                // Move within current step's carousel
                setCurrentCarouselIndex(safeCarouselIndex + 1);
            } else if (stepIndex < totalSteps - 1) {
                setNavigationDirection('forward');
                onNavigateStep(1);
            }
        });
    }, [safeCarouselIndex, carouselItems.length, stepIndex, totalSteps, onNavigateStep, withTransition, isTransitioning, navigationBounds.canGoRight]);

    // Jump directly to a specific step
    const jumpToStep = useCallback((targetStepIndex) => {
        if (targetStepIndex >= 0 && targetStepIndex < totalSteps && targetStepIndex !== stepIndex) {
            withTransition(async () => {
                const direction = targetStepIndex - stepIndex;
                setNavigationDirection(direction > 0 ? 'forward' : 'backward');
                onNavigateStep(direction);
            });
        }
    }, [stepIndex, totalSteps, onNavigateStep, withTransition]);

    // Toggle completion for current step
    const toggleCurrentStepCompletion = useCallback(() => {
        if (onToggleCompletion) {
            onToggleCompletion(stepIndex);
        }
    }, [stepIndex, onToggleCompletion]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isModalOpen) return;

        const handleKeyDown = (e) => {
            // Ignore if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    navigateLeft();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    navigateRight();
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    toggleCurrentStepCompletion();
                    break;
                case 'Escape':
                    e.preventDefault();
                    // Let parent handle modal close
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    e.preventDefault();
                    const targetStep = parseInt(e.key) - 1;
                    if (targetStep < totalSteps) {
                        jumpToStep(targetStep);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, navigateLeft, navigateRight, toggleCurrentStepCompletion, jumpToStep, totalSteps]);

    // Smart preloading - preload adjacent steps
    const preloadStep = useCallback((targetStepIndex) => {
        if (targetStepIndex >= 0 && targetStepIndex < totalSteps && !preloadedSteps.has(targetStepIndex)) {
            // Mark as preloaded (actual preloading logic would go here)
            setPreloadedSteps(prev => new Set([...prev, targetStepIndex]));

            // In a real implementation, you might:
            // - Fetch step data
            // - Load images
            // - Prepare calculations
        }
    }, [totalSteps, preloadedSteps]);

    // Auto-preload adjacent steps
    useEffect(() => {
        if (stepIndex > 0) {
            preloadStep(stepIndex - 1);
        }
        if (stepIndex < totalSteps - 1) {
            preloadStep(stepIndex + 1);
        }
    }, [stepIndex, totalSteps, preloadStep]);

    // Swipe gesture handling
    const handleSwipeGesture = useCallback((direction, distance) => {
        const minSwipeDistance = 50;

        if (Math.abs(distance) < minSwipeDistance) return;

        if (direction === 'left') {
            navigateRight(); // Swipe left = go right
        } else if (direction === 'right') {
            navigateLeft(); // Swipe right = go left  
        }
    }, [navigateLeft, navigateRight]);

    // Touch event handlers
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const onTouchStart = useCallback((e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }, []);

    const onTouchMove = useCallback((e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    }, []);

    const onTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;  // Swipe left
        const isRightSwipe = distance < -50; // Swipe right

        if (isLeftSwipe && navigationBounds.canGoRight) {
            navigateRight();
        } else if (isRightSwipe && navigationBounds.canGoLeft) {
            navigateLeft();
        }
    }, [touchStart, touchEnd, navigateLeft, navigateRight, navigationBounds]);

    // Navigation state with absolute boundary info
    const navigationState = {
        currentStep: stepIndex,
        totalSteps,
        currentCarouselIndex: safeCarouselIndex,
        totalCarouselItems: carouselItems.length,
        canGoLeft: navigationBounds.canGoLeft,
        canGoRight: navigationBounds.canGoRight,
        isTransitioning,
        currentItem,
        preloadedSteps: Array.from(preloadedSteps),

        // Additional boundary info for UI
        isAtAbsoluteStart: navigationBounds.isAtAbsoluteStart,
        isAtAbsoluteEnd: navigationBounds.isAtAbsoluteEnd
    };

    // Progress helpers
    const getStepProgress = useCallback(() => {
        return {
            current: stepIndex + 1,
            total: totalSteps,
            percentage: Math.round(((stepIndex + 1) / totalSteps) * 100),
            remaining: totalSteps - stepIndex - 1
        };
    }, [stepIndex, totalSteps]);

    // Return all navigation functionality
    return {
        // State
        ...navigationState,

        // Navigation functions
        navigateLeft,
        navigateRight,
        jumpToStep,
        toggleCurrentStepCompletion,

        // Touch handlers
        onTouchStart,
        onTouchMove,
        onTouchEnd,

        // Carousel management
        setCurrentCarouselIndex,

        // Progress utilities
        getStepProgress,

        // Swipe gesture handler
        handleSwipeGesture,

        // Keyboard shortcut info (for help/hints)
        shortcuts: {
            'Arrow Keys': 'Navigate between steps and carousel items',
            'Spacebar': 'Toggle step completion',
            'Number Keys (1-9)': 'Jump directly to step',
            'Escape': 'Close modal'
        }
    };
};