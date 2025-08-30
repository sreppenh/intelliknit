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

    // Reset carousel when step changes
    useEffect(() => {
        setCurrentCarouselIndex(0);
    }, [stepIndex]);

    // Safe carousel navigation
    const safeCarouselIndex = Math.min(currentCarouselIndex, carouselItems.length - 1);
    const currentItem = carouselItems[safeCarouselIndex];

    // Navigation bounds checking
    const canGoLeft = safeCarouselIndex > 0 || stepIndex > 0;
    const canGoRight = safeCarouselIndex < carouselItems.length - 1 || stepIndex < totalSteps - 1;

    // Smooth transition wrapper
    const withTransition = useCallback(async (action) => {
        setIsTransitioning(true);
        try {
            await action();
            // ✅ REMOVE THIS: No artificial delay needed
            // await new Promise(resolve => setTimeout(resolve, 150));
        } finally {
            setIsTransitioning(false);
        }
    }, []);

    // ✅ DEFINE NAVIGATION FUNCTIONS BEFORE EVENT LISTENERS
    const navigateLeft = useCallback(() => {
        if (isTransitioning) return;

        withTransition(async () => {
            if (safeCarouselIndex > 0) {
                setCurrentCarouselIndex(safeCarouselIndex - 1);
            } else if (stepIndex > 0) {
                onNavigateStep(-1);
            }
        });
    }, [safeCarouselIndex, stepIndex, onNavigateStep, withTransition, isTransitioning]);

    const navigateRight = useCallback(() => {
        if (isTransitioning) return;

        withTransition(async () => {
            if (safeCarouselIndex < carouselItems.length - 1) {
                setCurrentCarouselIndex(safeCarouselIndex + 1);
            } else if (stepIndex < totalSteps - 1) {
                onNavigateStep(1);
            }
        });
    }, [safeCarouselIndex, carouselItems.length, stepIndex, totalSteps, onNavigateStep, withTransition, isTransitioning]);

    // Jump directly to a specific step
    const jumpToStep = useCallback((targetStepIndex) => {
        if (targetStepIndex >= 0 && targetStepIndex < totalSteps && targetStepIndex !== stepIndex) {
            withTransition(async () => {
                const direction = targetStepIndex - stepIndex;
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

    // ✅ KEYBOARD SHORTCUTS - NOW WITH PROPER DEPENDENCY ARRAY
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
            console.log(`🔄 Preloading step ${targetStepIndex + 1}`);
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

    // ✅ RESTORED: Swipe gesture handling (was missing in my version)
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

        if (isLeftSwipe) {
            navigateRight();
        } else if (isRightSwipe) {
            navigateLeft();
        }
    }, [touchStart, touchEnd, navigateLeft, navigateRight]);

    // Navigation state
    const navigationState = {
        currentStep: stepIndex,
        totalSteps,
        currentCarouselIndex: safeCarouselIndex,
        totalCarouselItems: carouselItems.length,
        canGoLeft,
        canGoRight,
        isTransitioning,
        currentItem,
        preloadedSteps: Array.from(preloadedSteps)
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

        // ✅ RESTORED: Swipe gesture handler (was referenced but missing)
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