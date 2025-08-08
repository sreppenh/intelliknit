import { getStepPatternName } from './stepDisplayUtils';

export const getProjectStatus = (project) => {
    if (!project) {
        return { emoji: '❓', text: 'Unknown' };
    }

    if (project.completed) return { emoji: '🎉', text: 'Completed' };
    if (project.frogged) return { emoji: '🐸', text: 'Frogged' };

    // Check if project is actually being worked on (has progress)
    const hasProgress = project.components?.some(comp =>
        comp.steps?.some(step => step.completed)
    );

    // Calculate streak for fire status - BUT only if project has progress
    if (hasProgress) {
        const getStreakDays = () => {
            if (!project.activityLog || project.activityLog.length === 0) return 0;
            let streak = 0;
            const today = new Date();
            const msPerDay = 24 * 60 * 60 * 1000;

            for (let i = 0; i < 30; i++) {
                const checkDate = new Date(today.getTime() - (i * msPerDay));
                const dayString = checkDate.toISOString().split('T')[0];
                if (project.activityLog.includes(dayString)) {
                    streak = i + 1;
                } else if (i === 0) {
                    continue;
                } else {
                    break;
                }
            }
            return streak;
        };

        const streakDays = getStreakDays();
        if (streakDays >= 3) {
            return { emoji: '🔥', text: `On fire! ${streakDays} day streak` };
        }

        // Check for dormant projects (has progress but inactive)
        const lastActivity = new Date(project.lastActivityAt || project.createdAt);
        const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceActivity > 14) {
            return { emoji: '😴', text: 'Taking a nap...' };
        }

        // Has progress but no streak
        return { emoji: '🧶', text: 'In progress' };
    }

    // No progress yet - check if ready to start
    const isReadyToKnit = project.components?.some(comp => {
        const hasCastOn = comp.steps?.some(step =>
            getStepPatternName(step) === 'Cast On'
        );
        const hasBindOff = comp.steps?.some(step =>
            getStepPatternName(step) === 'Bind Off'
        );
        return hasCastOn && hasBindOff;
    });

    if (isReadyToKnit) {
        return { emoji: '🚀', text: 'Ready to knit' };
    }

    // Check for empty (no components)
    if (!project.components || project.components.length === 0) {
        return { emoji: '💭', text: 'Ready to begin' };
    }

    // Has components but not ready yet
    return { emoji: '📝', text: 'Planning' };
};

// NEW: Smart status that ignores manual completed/frogged flags
export const getSmartProjectStatus = (project) => {
    if (!project) {
        return { emoji: '❓', text: 'Unknown' };
    }

    // IGNORE manual completed/frogged flags - calculate based on actual project state

    // Check if project is actually being worked on (has progress)
    const hasProgress = project.components?.some(comp =>
        comp.steps?.some(step => step.completed)
    );

    // Calculate streak for fire status - BUT only if project has progress
    if (hasProgress) {
        const getStreakDays = () => {
            if (!project.activityLog || project.activityLog.length === 0) return 0;
            let streak = 0;
            const today = new Date();
            const msPerDay = 24 * 60 * 60 * 1000;

            for (let i = 0; i < 30; i++) {
                const checkDate = new Date(today.getTime() - (i * msPerDay));
                const dayString = checkDate.toISOString().split('T')[0];
                if (project.activityLog.includes(dayString)) {
                    streak = i + 1;
                } else if (i === 0) {
                    continue;
                } else {
                    break;
                }
            }
            return streak;
        };

        const streakDays = getStreakDays();
        if (streakDays >= 3) {
            return { emoji: '🔥', text: `On fire! ${streakDays} day streak` };
        }

        // Check for dormant projects (has progress but inactive)
        const lastActivity = new Date(project.lastActivityAt || project.createdAt);
        const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceActivity > 14) {
            return { emoji: '😴', text: 'Taking a nap...' };
        }

        // Has progress but no streak
        return { emoji: '🧶', text: 'In progress' };
    }

    // No progress yet - check if ready to start
    const isReadyToKnit = project.components?.some(comp => {
        const hasCastOn = comp.steps?.some(step =>
            getStepPatternName(step) === 'Cast On'
        );
        const hasBindOff = comp.steps?.some(step =>
            getStepPatternName(step) === 'Bind Off'
        );
        return hasCastOn && hasBindOff;
    });

    if (isReadyToKnit) {
        return { emoji: '🚀', text: 'Ready to knit' };
    }

    // Check for empty (no components)
    if (!project.components || project.components.length === 0) {
        return { emoji: '💭', text: 'Ready to begin' };
    }

    // Has components but not ready yet
    return { emoji: '📝', text: 'Planning' };
};