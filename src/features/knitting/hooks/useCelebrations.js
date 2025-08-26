import { useCallback } from 'react';

export const useCelebrations = () => {
    const triggerStepCompletion = useCallback((stepIndex, totalSteps) => {
        // Simple completion feedback
        const completedCount = stepIndex + 1;
        const percentage = Math.round((completedCount / totalSteps) * 100);

        // Milestone celebrations
        if (percentage === 25) {
            showToast("Quarter way there! Keep going!", "🧶");
        } else if (percentage === 50) {
            showToast("Halfway done! You're crushing it!", "🎯");
        } else if (percentage === 75) {
            showToast("Almost finished! So close!", "⭐");
        } else if (percentage === 100) {
            showToast("Component complete! Amazing work!", "🎉");
        }

        // Visual feedback for completion
        addCompletionRipple();
    }, []);

    const showToast = (message, icon) => {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-sage-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transition-all duration-300';
        toast.innerHTML = `<span class="mr-2">${icon}</span>${message}`;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.style.transform = 'translateX(-50%) translateY(0)', 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    const addCompletionRipple = () => {
        // Add ripple effect animation class to completion button
        const buttons = document.querySelectorAll('[data-completion-button]');
        buttons.forEach(button => {
            button.classList.add('animate-pulse');
            setTimeout(() => button.classList.remove('animate-pulse'), 600);
        });
    };

    return {
        triggerStepCompletion
    };
};