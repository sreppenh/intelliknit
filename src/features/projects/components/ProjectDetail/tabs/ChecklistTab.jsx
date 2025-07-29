import React, { useState, useEffect } from 'react';

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

        onProjectUpdate({
            ...project,
            checklist: updatedChecklist
        });
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

    // Task Item Component
    const TaskItem = ({ task, categoryId }) => (
        <div className="flex items-center gap-3 p-4 min-h-[44px] hover:bg-lavender-50 transition-colors group">
            {/* Checkbox */}
            <button
                onClick={() => handleToggleTask(categoryId, task.id)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${task.completed
                    ? 'bg-lavender-500 border-lavender-500 text-white'
                    : 'border-lavender-400 hover:border-lavender-500'
                    }`}
            >
                {task.completed && '✓'}
            </button>

            {/* Task Text */}
            <span className={`flex-1 transition-all ${task.completed
                ? 'text-lavender-400 line-through'
                : 'text-wool-700'
                }`}>
                {task.text}
            </span>

            {/* Drag Handle (show on hover/touch) */}
            <div className="text-lavender-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                ⋮⋮
            </div>
        </div>
    );

    // Category Section Component
    const CategorySection = ({ category }) => (
        <div className="mb-6">
            {/* Category Header with Lavender Styling */}
            <div className="bg-lavender-100 border-2 border-lavender-300 rounded-t-xl p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-lavender-800 flex items-center gap-2">
                    {category.icon} {category.name}
                </h3>
                <button
                    onClick={() => handleAddTask(category.id)}
                    className="bg-lavender-500 hover:bg-lavender-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors"
                >
                    +
                </button>
            </div>

            {/* Task List */}
            <div className="bg-white border-2 border-lavender-200 border-t-0 rounded-b-xl">
                {category.tasks.length > 0 ? (
                    <div className="divide-y divide-lavender-100">
                        {category.tasks.map(task => (
                            <TaskItem key={task.id} task={task} categoryId={category.id} />
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-center text-lavender-400">
                        + Add {category.name.toLowerCase()} tasks
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/* Header with Progress */}
            <div className="content-header-primary">
                <div>
                    <h2 className="content-title">📋 Checklist</h2>
                    {stats.total > 0 && (
                        <p className="text-sm text-wool-500 mt-1">
                            {stats.completed} of {stats.total} tasks completed ({stats.percentage}%)
                        </p>
                    )}
                </div>
                <div className="button-group">
                    {stats.total > 0 && (
                        <div className="bg-lavender-100 border border-lavender-300 text-lavender-700 px-3 py-1 rounded-full text-xs font-medium">
                            {stats.percentage}%
                        </div>
                    )}
                </div>
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

            {/* Add Tasks Modal */}
            {showAddTaskModal && currentCategory && (
                <div className="modal-overlay" onClick={handleBackdropClick}>
                    <div className="modal-content-light max-w-lg">
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

                        <div className="p-6 space-y-4">
                            {/* Smart Suggestions */}
                            <div>
                                <h4 className="font-medium text-wool-700 mb-3">Smart Suggestions:</h4>
                                <div className="space-y-2">
                                    {getSuggestionsForCategory(currentCategory.id).map(suggestion => (
                                        <label key={suggestion} className="flex items-center gap-3 p-2 hover:bg-lavender-50 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedSuggestions.includes(suggestion)}
                                                onChange={() => toggleSuggestion(suggestion)}
                                                className="w-4 h-4 text-lavender-500 border-lavender-300 rounded focus:ring-lavender-500"
                                            />
                                            <span className="text-sm">{suggestion}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Task Input */}
                            <div>
                                <label className="form-label">Add Custom Task:</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customTaskText}
                                        onChange={(e) => setCustomTaskText(e.target.value)}
                                        placeholder="e.g., Block aggressively - this yarn grows!"
                                        className="details-input-field flex-1"
                                    />
                                    <button
                                        onClick={handleAddCustomTask}
                                        disabled={!customTaskText.trim()}
                                        className="btn-secondary"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Added Custom Tasks Preview */}
                            {customTasks.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-medium text-wool-600 mb-2">Custom Tasks to Add:</h5>
                                    <div className="space-y-1">
                                        {customTasks.map((task, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm text-lavender-700 bg-lavender-50 p-2 rounded">
                                                <span>•</span>
                                                <span>{task}</span>
                                                <button
                                                    onClick={() => setCustomTasks(prev => prev.filter((_, i) => i !== index))}
                                                    className="ml-auto text-lavender-400 hover:text-lavender-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button onClick={handleCloseModal} className="btn-tertiary flex-1">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSelectedTasks}
                                    disabled={selectedSuggestions.length === 0 && customTasks.length === 0}
                                    className="btn-primary flex-1"
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