import React, { useState, useEffect } from 'react';
import { InputModal } from '../../../../../shared/components/modals/StandardModal';

/**
 * 💭 NotesSection - Text Management Showcase with StandardModal
 * 
 * Features:
 * - Elegant expand/collapse for long text
 * - StandardModal for consistent behavior across devices
 * - Character counting and limits
 * - Perfect tablet/desktop experience
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

    // Enhanced Enter key handling for StandardModal
    useEffect(() => {
        const handleEnterKey = (event) => {
            // Ctrl+Enter to save (regular Enter for newlines in textarea)
            if (event.key === 'Enter' && event.ctrlKey && showNotesModal) {
                event.preventDefault();
                handleSaveNotes();
            }
        };

        if (showNotesModal) {
            document.addEventListener('keydown', handleEnterKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEnterKey);
        };
    }, [showNotesModal, handleSaveNotes]);

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

            {/* Notes Edit Modal - Now using StandardModal */}
            <InputModal
                isOpen={showNotesModal}
                onClose={handleCloseModal}
                onConfirm={handleSaveNotes}
                title="Project Notes"
                subtitle="Add notes, modifications, or reminders"
                icon="💭"
                primaryButtonText="Save Notes"
                secondaryButtonText="Cancel"
            >
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

                    {/* Helpful hint */}
                    <div className="text-xs text-wool-500 mt-2">
                        💡 Tip: Press Ctrl+Enter to save quickly
                    </div>
                </div>
            </InputModal>
        </>
    );
};

export default NotesSection;