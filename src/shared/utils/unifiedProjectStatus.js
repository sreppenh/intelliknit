// ===== NEW UNIFIED STATUS SYSTEM =====
// File: src/shared/utils/unifiedProjectStatus.js
import { isInitializationStep, isFinishingStep } from './stepDisplayUtils';

export const getUnifiedProjectStatus = (project) => {
    if (!project) {
        return {
            status: 'Unknown',
            emoji: '❓',
            mood: 'Unknown project',
            color: 'text-wool-500',
            category: 'planning',
            streak: 0,
            isDormant: false,
            // Compatibility with old system
            text: 'Unknown',
            oldFormat: { emoji: '❓', text: 'Unknown' }
        };
    }

    // 1. COMPLETED - nothing else matters
    if (project.completed) {
        return {
            status: 'Completed',
            emoji: '🎉',
            mood: 'Celebration time!',
            color: 'text-sage-600',
            category: 'completed',
            streak: 0, // No streaks for completed projects
            isDormant: false,
            // Compatibility
            text: 'Completed',
            oldFormat: { emoji: '🎉', text: 'Completed' }
        };
    }

    // 2. FROGGED - nothing else matters  
    if (project.frogged) {
        return {
            status: 'Frogged',
            emoji: '🐸',
            mood: 'Taking a break',
            color: 'text-blue-600',
            category: 'planning',
            streak: 0, // No streaks for frogged projects
            isDormant: false,
            // Compatibility
            text: 'Frogged',
            oldFormat: { emoji: '🐸', text: 'Frogged' }
        };
    }

    // 3. For active projects, calculate based on activity and progress
    const totalComponents = project.components?.length || 0;
    const hasSteps = project.components?.some(comp => comp.steps?.length > 0);
    const hasProgress = project.components?.some(comp => comp.steps?.some(step => step.completed));

    // Calculate streak (for active projects only)
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
                continue; // No activity today, check yesterday
            } else {
                break; // Streak broken
            }
        }
        return streak;
    };

    const streakDays = getStreakDays();
    const lastActivity = new Date(project.lastActivityAt || project.createdAt);
    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    // Fire projects (3+ day streak) - ONLY if project has progress
    if (hasProgress && streakDays >= 3) {
        return {
            status: 'Currently Knitting',
            emoji: '🔥',
            mood: `On fire! ${streakDays} day streak`,
            color: 'text-orange-600',
            category: 'active',
            streak: streakDays,
            isDormant: false,
            // Compatibility
            text: `On fire! ${streakDays} day streak`,
            oldFormat: { emoji: '🔥', text: `On fire! ${streakDays} day streak` }
        };
    }

    // Dormant projects (14+ days inactive BUT has progress) - NO STREAK
    if (hasProgress && daysSinceActivity > 14) {
        return {
            status: 'Currently Knitting',
            emoji: '😴',
            mood: 'Taking a nap...',
            color: 'text-wool-500',
            category: 'planning', // Shows in planning filter
            streak: 0, // Streak is broken
            isDormant: true,
            // Compatibility
            text: 'Taking a nap...',
            oldFormat: { emoji: '😴', text: 'Taking a nap...' }
        };
    }

    // Currently Knitting (has progress, recent activity, no big streak)
    if (hasProgress) {
        return {
            status: 'Currently Knitting',
            emoji: '🧶',
            mood: 'In progress',
            color: 'text-yarn-600',
            category: 'active',
            streak: streakDays, // Show small streaks too
            isDormant: false,
            // Compatibility
            text: streakDays > 0 ? `In progress (${streakDays} day${streakDays > 1 ? 's' : ''})` : 'In progress',
            oldFormat: { emoji: '🧶', text: 'In progress' }
        };
    }

    // ✅ NEW - Proper stepDisplayUtils function usage:
    const isReadyToKnit = project.components?.some(comp => {
        const hasInitialization = comp.steps?.some(step => isInitializationStep(step));
        const hasFinalization = comp.steps?.some(step => isFinishingStep(step));
        return hasInitialization && hasFinalization;
    });

    if (isReadyToKnit) {
        return {
            status: 'Ready to Knit',
            emoji: '🚀',
            mood: 'Ready to start knitting',
            color: 'text-lavender-600',
            category: 'active',
            streak: 0,
            isDormant: false,
            // Compatibility
            text: 'Ready to knit',
            oldFormat: { emoji: '🚀', text: 'Ready to knit' }
        };
    }

    // Planning (no components or incomplete components)
    return {
        status: 'Planning',
        emoji: '💭',
        mood: 'Ready to begin',
        color: 'text-wool-600',
        category: 'planning',
        streak: 0,
        isDormant: false,
        // Compatibility
        text: totalComponents === 0 ? 'Ready to begin' : 'Planning',
        oldFormat: { emoji: '💭', text: 'Planning' }
    };
};

// ===== COMPATIBILITY WRAPPER =====
// This ensures existing code doesn't break
export const getProjectStatus = (project) => {
    const unified = getUnifiedProjectStatus(project);
    return unified.oldFormat; // Returns { emoji, text } like before
};

// ===== COMPREHENSIVE TESTING SUITE =====

export const runStatusTests = () => {
    console.log('🧪 Starting Unified Status Tests...');

    const testCases = [
        {
            name: 'Empty Project',
            project: { components: [] },
            expected: {
                status: 'Planning',
                category: 'planning',
                streak: 0,
                isDormant: false
            }
        },
        {
            name: 'Completed Project',
            project: {
                completed: true,
                activityLog: ['2024-01-01', '2024-01-02', '2024-01-03'], // Should be ignored
                components: [{ steps: [{ completed: true }] }]
            },
            expected: {
                status: 'Completed',
                category: 'completed',
                streak: 0, // No streaks for completed
                isDormant: false
            }
        },
        {
            name: 'Frogged Project',
            project: {
                frogged: true,
                activityLog: ['2024-01-01', '2024-01-02'], // Should be ignored
                components: [{ steps: [{ completed: true }] }]
            },
            expected: {
                status: 'Frogged',
                category: 'planning',
                streak: 0, // No streaks for frogged
                isDormant: false
            }
        },
        {
            name: 'Fire Streak Project',
            project: {
                completed: false,
                frogged: false,
                components: [{ steps: [{ completed: true }] }], // Has progress
                activityLog: [
                    new Date().toISOString().split('T')[0], // Today
                    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
                    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
                    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]  // 3 days ago
                ],
                lastActivityAt: new Date().toISOString()
            },
            expected: {
                status: 'Currently Knitting',
                category: 'active',
                streak: 4, // 4 day streak
                isDormant: false
            }
        },
        {
            name: 'Dormant Project',
            project: {
                completed: false,
                frogged: false,
                components: [{ steps: [{ completed: true }] }], // Has progress
                activityLog: [], // No recent activity
                lastActivityAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            expected: {
                status: 'Currently Knitting',
                category: 'planning', // Dormant shows in planning
                streak: 0, // Streak broken
                isDormant: true
            }
        },
        {
            name: 'Ready to Knit Project',
            project: {
                completed: false,
                frogged: false,
                components: [{
                    steps: [
                        { wizardConfig: { stitchPattern: { pattern: 'Cast On' } }, completed: false },
                        { description: 'knit some rows', completed: false },
                        { wizardConfig: { stitchPattern: { pattern: 'Bind Off' } }, completed: false }
                    ]
                }],
                activityLog: [],
                lastActivityAt: new Date().toISOString()
            },
            expected: {
                status: 'Ready to Knit',
                category: 'active',
                streak: 0,
                isDormant: false
            }
        },
        {
            name: 'Currently Knitting (small streak)',
            project: {
                completed: false,
                frogged: false,
                components: [{ steps: [{ completed: true }] }], // Has progress
                activityLog: [
                    new Date().toISOString().split('T')[0], // Today
                    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Yesterday
                ],
                lastActivityAt: new Date().toISOString()
            },
            expected: {
                status: 'Currently Knitting',
                category: 'active',
                streak: 2, // 2 day streak (< 3, so not fire)
                isDormant: false
            }
        }
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach(testCase => {
        try {
            const result = getUnifiedProjectStatus(testCase.project);

            // Check each expected property
            let testPassed = true;
            Object.keys(testCase.expected).forEach(key => {
                if (result[key] !== testCase.expected[key]) {
                    console.error(`❌ ${testCase.name}: ${key} expected ${testCase.expected[key]}, got ${result[key]}`);
                    testPassed = false;
                }
            });

            if (testPassed) {
                console.log(`✅ ${testCase.name}: PASSED`);
                passed++;
            } else {
                console.log(`❌ ${testCase.name}: FAILED`);
                console.log(`   Expected:`, testCase.expected);
                console.log(`   Got:`, result);
                failed++;
            }
        } catch (error) {
            console.error(`💥 ${testCase.name}: ERROR - ${error.message}`);
            failed++;
        }
    });

    console.log(`\n🧪 Test Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log('🎉 All tests passed! Safe to proceed.');
    } else {
        console.log('⚠️ Some tests failed. Please review before proceeding.');
    }

    return { passed, failed };
};

// ===== MIGRATION HELPER =====
export const testCompatibility = (projects) => {
    console.log('🔄 Testing compatibility with existing projects...');

    if (!projects || projects.length === 0) {
        console.log('📝 No projects to test');
        return;
    }

    projects.forEach((project, index) => {
        try {
            const oldResult = getProjectStatus(project); // Old format
            const newResult = getUnifiedProjectStatus(project); // New format

            console.log(`📋 Project ${index + 1} (${project.name || 'Unnamed'}):`);
            console.log(`   Old: ${oldResult.emoji} ${oldResult.text}`);
            console.log(`   New: ${newResult.emoji} ${newResult.status} (${newResult.mood})`);

            if (newResult.streak > 0) {
                console.log(`   🔥 Streak: ${newResult.streak} days`);
            }
            if (newResult.isDormant) {
                console.log(`   😴 Status: Dormant`);
            }
        } catch (error) {
            console.error(`💥 Error testing project ${index + 1}: ${error.message}`);
        }
    });

    console.log('✅ Compatibility test complete');
};