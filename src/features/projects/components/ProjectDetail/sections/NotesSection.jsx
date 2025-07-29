import React, { useState, useEffect } from 'react';

/**
 * 💭 NotesSection - Text Management Showcase
 * 
 * Features:
 * - Elegant expand/collapse for long text
 * - Inline editing with comfortable textarea
 * - Character counting and limits
 * - Perfect modal standards compliance
 * - Mobile-optimized text editing experience
 */
const NotesSection = ({
    project,
    formData,
    handleInputChange
}) => {
    // Local state management
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesForm, setNotesForm] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    // Get current notes data
    const notes = formData?.notes || project?.notes || '';

    // Determine if section has content
    const hasContent = notes && notes.trim().length > 0;

    // Text truncation helper
    const truncateAtWord = (text, maxLength) => {
        if (text.length <= maxLength) return text;

        const truncated = text.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');

        return lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
    };

    // Expand/collapse logic
    const shouldTruncate = hasContent && notes.length > 200;
    const displayText = shouldTruncate && !isExpanded
        ? truncateAtWord(notes, 200) + "..."
        : notes;

    // Modal handlers
    const handleEditNotes = () => {
        setNotesForm(notes || '');
        setShowNotesModal(true);
    };

    const handleSaveNotes = () => {
        handleInputChange('notes', notesForm.trim());
        setShowNotesModal(false);
    };

    const handleCloseModal = () => {
        setShowNotesModal(false);
    };

    // Character counter with enforcement
    const handleNotesChange = (e) => {
        const value = e.target.value;
        if (value.length <= 1000) {
            setNotesForm(value);
        }
    };

    // Modal behavior compliance
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showNotesModal) {
                handleCloseModal();
            }
        };

        const handleEnterKey = (event) => {
            // Regular Enter for newlines, Ctrl+Enter to save
            if (event.key === 'Enter' && event.ctrlKey && showNotesModal) {
                event.preventDefault();
                handleSaveNotes();
            }
        };

        if (showNotesModal) {
            document.addEventListener('keydown', handleEscKey);
            document.addEventListener('keydown', handleEnterKey);

            // Auto-focus textarea
            setTimeout(() => {
                const focusElement = document.querySelector('[data-modal-focus]');
                if (focusElement) {
                    focusElement.focus();
                    // Position cursor at end
                    focusElement.setSelectionRange(focusElement.value.length, focusElement.value.length);
                }
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('keydown', handleEnterKey);
        };
    }, [showNotesModal]);

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            handleCloseModal();
        }
    };

    // 📖 Read View - Conversational Display with Expand/Collapse
    return (
        <>
            <div
                className="read-mode-section hover:bg-sage-25 active:scale-95 cursor-pointer transition-all duration-200"
                onClick={handleEditNotes}
            >
                <div className="details-section-header">
                    <h3 className="section-header-secondary">💭 Notes</h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>

                {hasContent ? (
                    <div className="text-left">
                        <p className="whitespace-pre-wrap text-sm text-wool-700 leading-relaxed">
                            {displayText}
                        </p>

                        {shouldTruncate && (
                            <div className="mt-2">
                                {!isExpanded ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsExpanded(true);
                                        }}
                                        className="text-sage-600 hover:text-sage-700 font-medium text-sm underline transition-colors"
                                    >
                                        Read more
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsExpanded(false);
                                        }}
                                        className="text-sage-600 hover:text-sage-700 font-medium text-sm underline transition-colors"
                                    >
                                        Show less
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-wool-400 italic">
                        + Add project notes
                    </div>
                )}
            </div>

            {/* Notes Edit Modal */}
            {showNotesModal && (
                <div className="modal-overlay" onClick={handleBackdropClick}>
                    <div className="modal-content-light max-w-lg">
                        <div className="modal-header-light">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">💭</div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold">Project Notes</h2>
                                    <p className="text-sage-600 text-sm">Add notes, modifications, or reminders</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-sage-600 text-xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div>
                                <label className="form-label">Notes</label>
                                <textarea
                                    data-modal-focus
                                    value={notesForm}
                                    onChange={handleNotesChange}
                                    className="details-textarea"
                                    placeholder="Special notes, modifications, deadlines, or anything else you want to remember..."
                                    rows={6}
                                    maxLength={1000}
                                />
                                <div className="character-count">
                                    {1000 - notesForm.length} characters remaining
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    data-modal-cancel
                                    onClick={handleCloseModal}
                                    className="btn-tertiary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    data-modal-primary
                                    onClick={handleSaveNotes}
                                    className="btn-primary flex-1"
                                >
                                    Save Notes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotesSection;