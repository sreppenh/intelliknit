import React, { useState, useEffect } from 'react';
import useThreeDotMenu from '../../../../../shared/hooks/useThreeDotMenu';
import useProjectUpdate from '../../../../../shared/hooks/useProjectUpdate';

/**
 * 📋 ChecklistTab - The Ultimate Finishing Task Management System
 * 
 * Features:
 * - Beautiful lavender-themed design
 * - Smart contextual suggestions based on project type/construction
 * - Lightning-fast task adding with modal workflow
 * - Mobile-optimized interactions with 44px touch targets
 * - Smooth animations and transitions
 * - Perfect data persistence
 */
const ChecklistTab = ({ project, onProjectUpdate }) => {
    // State management
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [selectedSuggestions, setSelectedSuggestions] = useState([]);
    const [customTaskText, setCustomTaskText] = useState('');
    const [customTasks, setCustomTasks] = useState([]);

    // Use shared three-dot menu behavior
    const { openMenuId, setOpenMenuId, handleMenuToggle, handleMenuAction } = useThreeDotMenu();
    const { updateProject } = useProjectUpdate(onProjectUpdate);

    // Get or initialize checklist data
    const checklist = project.checklist || { categories: getDefaultCategories() };

    // Smart suggestions system
    const getSuggestionsForCategory = (categoryId) => {
        const suggestions = {
            seaming: getSeamingSuggestions(project),
            blocking: getBlockingSuggestions(project),
            finishing: getFinishingSuggestions(project),
            documentation: getDocumentationSuggestions(project)
        };

        return suggestions[categoryId] || [];
    };

    const getSeamingSuggestions = (project) => {
        const universal = ['Weave in ends'];

        if (project.construction === 'flat') {
            return [
                'Seam shoulders',
                'Attach sleeves',
                'Seam sides',
                'Sew button band',
                'Add zipper',
                'Mattress stitch sides',
                ...universal
            ];
        }

        return [
            'Check for twisted stitches',
            'Steam lightly',
            ...universal
        ];
    };

    const getBlockingSuggestions = (project) => [
        'Soak in lukewarm water',
        'Pin to measurements',
        'Steam block',
        'Air dry flat',
        'Measure and adjust'
    ];

    const getFinishingSuggestions = (project) => {
        const universal = [
            'Weave in ends',
            'Take final photos',
            'Check fit'
        ];

        if (project.projectType === 'hat') {
            return ['Add pompom', 'Check circumference', ...universal];
        }

        if (project.projectType === 'sweater') {
            return ['Sew on buttons', 'Check armhole fit', 'Add button holes', ...universal];
        }

        return universal;
    };

    const getDocumentationSuggestions = (project) => [
        'Add to Ravelry',
        'Write notes about modifications',
        'Rate the pattern',
        'Upload photos',
        'Share on social media'
    ];

    {/* Helper function to add to ChecklistTab component */ }
    const removeCustomTask = (index) => {
        setCustomTasks(prev => prev.filter((_, i) => i !== index));
    };

    // Default categories
    function getDefaultCategories() {
        return [
            {
                id: 'seaming',
                name: 'Seaming',
                icon: '🪡',
                tasks: []
            },
            {
                id: 'blocking',
                name: 'Blocking',
                icon: '🌊',
                tasks: []
            },
            {
                id: 'finishing',
                name: 'Finishing',
                icon: '✨',
                tasks: []
            },
            {
                id: 'documentation',
                name: 'Documentation',
                icon: '📝',
                tasks: []
            }
        ];
    }

    // Task management functions
    const handleAddTask = (categoryId) => {
        const category = checklist.categories.find(c => c.id === categoryId);
        setCurrentCategory(category);
        setSelectedSuggestions([]);
        setCustomTaskText('');
        setCustomTasks([]);
        setShowAddTaskModal(true);
    };

    const handleToggleTask = (categoryId, taskId) => {
        const updatedChecklist = {
            ...checklist,
            categories: checklist.categories.map(category => {
                if (category.id === categoryId) {
                    return {
                        ...category,
                        tasks: category.tasks.map(task =>
                            task.id === taskId
                                ? { ...task, completed: !task.completed }
                                : task
                        )
                    };
                }
                return category;
            })
        };

        updateProject(project, { checklist: updatedChecklist });
    };

    const handleDeleteTask = (categoryId, taskId) => {
        const updatedChecklist = {
            ...checklist,
            categories: checklist.categories.map(category => {
                if (category.id === categoryId) {
                    return {
                        ...category,
                        tasks: category.tasks.filter(task => task.id !== taskId)
                    };
                }
                return category;
            })
        };

        updateProject(project, { checklist: updatedChecklist });
    };

    const handleMoveTask = (categoryId, taskId, direction) => {
        const updatedChecklist = {
            ...checklist,
            categories: checklist.categories.map(category => {
                if (category.id === categoryId) {
                    const sortedTasks = [...category.tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
                    const currentIndex = sortedTasks.findIndex(task => task.id === taskId);

                    if (direction === 'up' && currentIndex > 0) {
                        // Swap with previous task
                        [sortedTasks[currentIndex], sortedTasks[currentIndex - 1]] = [sortedTasks[currentIndex - 1], sortedTasks[currentIndex]];
                    } else if (direction === 'down' && currentIndex < sortedTasks.length - 1) {
                        // Swap with next task
                        [sortedTasks[currentIndex], sortedTasks[currentIndex + 1]] = [sortedTasks[currentIndex + 1], sortedTasks[currentIndex]];
                    }

                    // Update order values
                    const reorderedTasks = sortedTasks.map((task, index) => ({
                        ...task,
                        order: index
                    }));

                    return {
                        ...category,
                        tasks: reorderedTasks
                    };
                }
                return category;
            })
        };

        onProjectUpdate({
            ...project,
            checklist: updatedChecklist
        });
    };

    const handleChecklistMenuToggle = (taskId, e) => {
        handleMenuToggle(taskId, e); // Use the shared hook function
    };

    const handleChecklistMenuAction = (action, categoryId, taskId, e) => {
        const menuResult = handleMenuAction(action, taskId, { categoryId }, e); // Use shared hook

        if (menuResult.action === 'delete') {
            handleDeleteTask(categoryId, taskId);
        } else if (menuResult.action === 'move-up') {
            handleMoveTask(categoryId, taskId, 'up');
        } else if (menuResult.action === 'move-down') {
            handleMoveTask(categoryId, taskId, 'down');
        }
    };

    const toggleSuggestion = (suggestion) => {
        setSelectedSuggestions(prev =>
            prev.includes(suggestion)
                ? prev.filter(s => s !== suggestion)
                : [...prev, suggestion]
        );
    };

    const handleAddCustomTask = () => {
        if (customTaskText.trim()) {
            setCustomTasks(prev => [...prev, customTaskText.trim()]);
            setCustomTaskText('');
        }
    };

    const handleAddSelectedTasks = () => {
        const allNewTasks = [...selectedSuggestions, ...customTasks];

        if (allNewTasks.length === 0) return;

        const updatedChecklist = {
            ...checklist,
            categories: checklist.categories.map(category => {
                if (category.id === currentCategory.id) {
                    const newTasks = allNewTasks.map((taskText, index) => ({
                        id: `task_${Date.now()}_${index}`,
                        text: taskText,
                        completed: false,
                        order: category.tasks.length + index
                    }));

                    return {
                        ...category,
                        tasks: [...category.tasks, ...newTasks]
                    };
                }
                return category;
            })
        };

        onProjectUpdate({
            ...project,
            checklist: updatedChecklist
        });

        handleCloseModal();
    };

    const handleCloseModal = () => {
        setShowAddTaskModal(false);
        setCurrentCategory(null);
        setSelectedSuggestions([]);
        setCustomTaskText('');
        setCustomTasks([]);
    };

    // Modal behavior compliance
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showAddTaskModal) {
                handleCloseModal();
            }
        };

        const handleEnterKey = (event) => {
            if (event.key === 'Enter' && showAddTaskModal && customTaskText.trim()) {
                event.preventDefault();
                handleAddCustomTask();
            }
        };

        if (showAddTaskModal) {
            document.addEventListener('keydown', handleEscKey);
            document.addEventListener('keydown', handleEnterKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('keydown', handleEnterKey);
        };
    }, [showAddTaskModal, customTaskText]);

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            handleCloseModal();
        }
    };

    // Calculate completion stats
    const getCompletionStats = () => {
        const allTasks = checklist.categories.flatMap(c => c.tasks);
        const completedTasks = allTasks.filter(t => t.completed);
        return {
            total: allTasks.length,
            completed: completedTasks.length,
            percentage: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0
        };
    };

    const stats = getCompletionStats();

    // Task Item Component with Three-Dot Menu (adapted from Components tab)
    const TaskItem = ({ task, categoryId, index, totalTasks }) => {
        const isFirst = index === 0;
        const isLast = index === totalTasks - 1;

        return (
            <div className="bg-white flex items-center gap-3 p-4 min-h-[60px] hover:bg-lavender-50 transition-colors relative">
                {/* Checkbox - Large Touch Target */}
                <button
                    onClick={() => handleToggleTask(categoryId, task.id)}
                    className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all ${task.completed
                        ? 'bg-lavender-500 border-lavender-500 text-white shadow-sm'
                        : 'border-lavender-400 hover:border-lavender-500 hover:bg-lavender-50'
                        }`}
                >
                    {task.completed && '✓'}
                </button>

                {/* Task Text - Larger, More Readable */}
                <span className={`flex-1 transition-all text-base text-left ${task.completed
                    ? 'text-lavender-400 line-through'
                    : 'text-wool-700'
                    }`}>
                    {task.text}
                </span>

                {/* Three-dot Menu (exact copy from Components tab) */}
                <div className="relative ml-2 flex-shrink-0">
                    <button
                        onClick={(e) => handleChecklistMenuToggle(task.id, e)}
                        className={`p-1.5 text-wool-400 hover:text-wool-600 hover:bg-wool-200 rounded-full transition-colors ${openMenuId === task.id ? 'relative z-[101]' : ''
                            }`}
                        aria-label={`Menu for ${task.text}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="3" r="1.5" />
                            <circle cx="8" cy="8" r="1.5" />
                            <circle cx="8" cy="13" r="1.5" />
                        </svg>
                    </button>

                    {openMenuId === task.id && (
                        <>
                            {/* Backdrop for click-outside */}
                            <div
                                className="fixed inset-0 z-[90]"
                                onMouseDown={() => setOpenMenuId(null)}
                                aria-hidden="true"
                            />

                            {/* Menu with smooth animation */}
                            <div className="absolute right-0 top-10 bg-white border-2 border-wool-200 rounded-xl shadow-xl z-[100] min-w-32 overflow-hidden transform transition-all duration-200 ease-out animate-in">
                                {!isFirst && (
                                    <button
                                        onClick={(e) => handleChecklistMenuAction('move-up', categoryId, task.id, e)}
                                        className="w-full px-4 py-3 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors font-medium"
                                    >
                                        ↑ Move Up
                                    </button>
                                )}
                                {!isLast && (
                                    <button
                                        onClick={(e) => handleChecklistMenuAction('move-down', categoryId, task.id, e)}
                                        className={`w-full px-4 py-3 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors font-medium ${!isFirst ? 'border-t border-wool-100' : ''}`}
                                    >
                                        ↓ Move Down
                                    </button>
                                )}
                                <button
                                    onClick={(e) => handleChecklistMenuAction('delete', categoryId, task.id, e)}
                                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 text-sm flex items-center gap-2 transition-colors font-medium border-t border-wool-100"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    // Category Section Component
    const CategorySection = ({ category }) => (
        <div className="mb-4">
            {/* Category Header - Narrower and More Compact */}
            <div className="bg-lavender-100 border-2 border-lavender-300 rounded-t-xl p-3 flex justify-between items-center">
                <h3 className="text-base font-semibold text-lavender-800 flex items-center gap-2">
                    {category.icon} {category.name}
                </h3>
                <button
                    onClick={() => handleAddTask(category.id)}
                    className="bg-lavender-500 hover:bg-lavender-600 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-colors text-sm"
                >
                    +
                </button>
            </div>

            {/* Task List */}
            <div className="bg-white border-2 border-lavender-200 border-t-0 rounded-b-xl">
                {category.tasks.length > 0 ? (
                    <div className="divide-y divide-lavender-100">
                        {category.tasks
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((task, index) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    categoryId={category.id}
                                    index={index}
                                    totalTasks={category.tasks.length}
                                />
                            ))}
                    </div>
                ) : (
                    <div
                        className="p-4 text-center text-lavender-400 cursor-pointer hover:text-lavender-600 hover:bg-lavender-50 transition-colors"
                        onClick={() => handleAddTask(category.id)}
                    >
                        + Add {category.name.toLowerCase()} tasks
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/* Header with Progress */}
            <div className="mb-6">
                <h2 className="content-header-primary">📋 Checklist</h2>
                <p className="content-subheader">Track your non-knitting project activities </p>

                {stats.total > 0 && (
                    <p className="text-sm text-wool-500 mt-2 text-center">
                        {stats.completed} of {stats.total} tasks completed ({stats.percentage}%)
                    </p>
                )}
            </div>

            {/* Progress Bar */}
            {stats.total > 0 && (
                <div className="mb-6">
                    <div className="bg-lavender-100 rounded-full h-2 border border-lavender-200">
                        <div
                            className="bg-lavender-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.percentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Categories */}
            {checklist.categories.map(category => (
                <CategorySection key={category.id} category={category} />
            ))}

            {/* Add Custom Category (Future Enhancement) */}
            <button className="btn-tertiary w-full mt-4 opacity-50 cursor-not-allowed">
                + Add Category (Coming Soon)
            </button>

            {/* Add Tasks Modal - Updated with Mobile Scrolling + Full Width Button */}
            {showAddTaskModal && currentCategory && (
                <div className="modal-overlay" onClick={handleBackdropClick}>
                    <div className="modal-content-light max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="modal-header-light">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">{currentCategory.icon}</div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold">Add {currentCategory.name} Tasks</h2>
                                    <p className="text-sage-600 text-sm">Select suggestions or add custom tasks</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-sage-600 text-xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 1. PREVIEW FIRST - Tasks to Add */}
                            {(selectedSuggestions.length > 0 || customTasks.length > 0) && (
                                <div className="bg-lavender-50 border-2 border-lavender-200 rounded-xl p-4">
                                    <h5 className="font-medium text-lavender-800 mb-3 text-center">Tasks to Add</h5>
                                    <div className="space-y-2">
                                        {selectedSuggestions.map(task => (
                                            <div key={`suggestion-${task}`} className="flex items-center justify-between bg-white rounded-lg p-3 border border-lavender-200">
                                                <span className="text-sm text-wool-700 flex-1 text-left">{task}</span>
                                                <button
                                                    onClick={() => toggleSuggestion(task)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors ml-2"
                                                    title="Remove this task"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        {customTasks.map((task, index) => (
                                            <div key={`custom-${index}`} className="flex items-center justify-between bg-white rounded-lg p-3 border border-lavender-200">
                                                <span className="text-sm text-wool-700 flex-1 text-left">{task}</span>
                                                <button
                                                    onClick={() => removeCustomTask(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors ml-2"
                                                    title="Remove this task"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 2. SMART SUGGESTIONS SECOND - Bubble UI */}
                            <div>
                                <h4 className="font-medium text-wool-700 mb-4 text-center">Smart Suggestions</h4>
                                <div className="flex flex-wrap gap-2 justify-center mb-4">
                                    {getSuggestionsForCategory(currentCategory.id)
                                        .filter(suggestion => !selectedSuggestions.includes(suggestion))
                                        .map(suggestion => (
                                            <button
                                                key={suggestion}
                                                onClick={() => toggleSuggestion(suggestion)}
                                                className="suggestion-bubble"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                </div>
                            </div>

                            {/* 3. CUSTOM ENTRY THIRD - Full Width Button Like Needle Pattern */}
                            <div className={`${(selectedSuggestions.length > 0 || customTasks.length > 0) ? 'border-t border-wool-200 pt-6' : ''} space-y-3`}>
                                <h4 className="font-medium text-wool-700">Add Custom Task</h4>
                                <input
                                    type="text"
                                    value={customTaskText}
                                    onChange={(e) => setCustomTaskText(e.target.value)}
                                    placeholder="Enter custom task..."
                                    className="details-input-field w-full"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && customTaskText.trim()) {
                                            e.preventDefault();
                                            handleAddCustomTask();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleAddCustomTask}
                                    disabled={!customTaskText.trim()}
                                    className="w-full btn-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    + Add Custom Task
                                </button>
                            </div>

                            {/* 4. ACTION BUTTONS LAST - Standard Modal Pattern */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleCloseModal}
                                    data-modal-cancel
                                    className="btn-tertiary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSelectedTasks}
                                    disabled={selectedSuggestions.length === 0 && customTasks.length === 0}
                                    data-modal-primary
                                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add {selectedSuggestions.length + customTasks.length} Tasks
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default ChecklistTab;