/**
 * Notes List - Simplified version of ProjectList for notes management
 */

import React, { useState } from 'react';
import { useNotesContext } from '../hooks/useNotesContext';
import PageHeader from '../../../shared/components/PageHeader';
import NoteCard from './NoteCard';
import CreateNoteWizard from './CreateNoteWizard';

const NotesList = ({ onBack, onGoToLanding, onOpenNote, onCreateNote }) => {
    const { notes, createNote, deleteNote, updateNote } = useNotesContext();
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'pattern'
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Sort notes
    const getSortedNotes = () => {
        const sortedNotes = [...notes];

        switch (sortBy) {
            case 'name':
                return sortedNotes.sort((a, b) => a.name.localeCompare(b.name));
            case 'pattern':
                return sortedNotes.sort((a, b) => {
                    const patternA = a.components?.[0]?.steps?.[0]?.wizardConfig?.stitchPattern?.pattern || '';
                    const patternB = b.components?.[0]?.steps?.[0]?.wizardConfig?.stitchPattern?.pattern || '';
                    return patternA.localeCompare(patternB);
                });
            case 'recent':
            default:
                return sortedNotes.sort((a, b) => {
                    const dateA = new Date(a.lastActivityAt || a.createdAt);
                    const dateB = new Date(b.lastActivityAt || b.createdAt);
                    return dateB - dateA;
                });
        }
    };

    // Handle create note
    const handleCreateNote = async (noteData) => {
        const newNote = await createNote(noteData);
        if (newNote) {
            // Immediately open the new note for pattern setup
            onOpenNote(newNote);
        }
    };

    // Handle delete note
    const handleDeleteNote = async (noteId) => {
        await deleteNote(noteId);
    };

    // Handle rename note
    const handleRenameNote = (noteId, newName) => {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            updateNote({
                ...note,
                name: newName
            });
        }
    };

    const sortedNotes = getSortedNotes();

    return (
        <div className="min-h-screen bg-lavender-50">
            <div className="app-container bg-lavender-50 min-h-screen shadow-lg">

                {/* Page Header */}
                <PageHeader
                    useBranding={true}
                    onHome={onGoToLanding}
                    compact={true}
                    onBack={onBack}
                    showCancelButton={true}
                    onCancel={onBack}
                />

                {/* Header with note count */}
                <div className="content-header-with-buttons px-6 py-4 bg-white border-b border-wool-100">
                    <div className="content-title">
                        📝 Your Notes {notes.length > 0 && `(${notes.length})`}
                    </div>
                    <div className="button-group">
                        <button
                            onClick={() => onCreateNote()}
                            className="btn-primary btn-sm"
                        >
                            Create Note
                        </button>
                    </div>
                </div>

                {/* Simple sort bar */}
                {notes.length > 0 && (
                    <div className="px-6 py-3 bg-white border-b border-wool-100">
                        <div className="flex items-center gap-2 text-xs text-wool-500">
                            <span>{sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>Sort by:</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setSortBy('recent')}
                                    className={`font-medium transition-colors ${sortBy === 'recent'
                                        ? 'text-lavender-600'
                                        : 'text-wool-400 hover:text-lavender-600'
                                        }`}
                                >
                                    recent
                                </button>
                                <span className="text-wool-400">|</span>
                                <button
                                    onClick={() => setSortBy('name')}
                                    className={`font-medium transition-colors ${sortBy === 'name'
                                        ? 'text-lavender-600'
                                        : 'text-wool-400 hover:text-lavender-600'
                                        }`}
                                >
                                    name
                                </button>
                                <span className="text-wool-400">|</span>
                                <button
                                    onClick={() => setSortBy('pattern')}
                                    className={`font-medium transition-colors ${sortBy === 'pattern'
                                        ? 'text-lavender-600'
                                        : 'text-wool-400 hover:text-lavender-600'
                                        }`}
                                >
                                    pattern
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content area */}
                <div className="p-6 bg-lavender-50">

                    {/* Notes list or empty state */}
                    {sortedNotes.length === 0 ? (
                        <div className="text-center">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-lavender-200 mb-4">
                                <div className="text-4xl mb-3">📝</div>
                                <h2 className="text-xl font-bold text-wool-700 mb-2">Welcome to Notepad Mode!</h2>
                                <p className="content-subheader leading-relaxed text-sm mb-4">
                                    Create quick notes to test patterns, knit swatches, or track small projects without the overhead of a full project setup.
                                </p>
                                <button
                                    onClick={() => onCreateNote()}
                                    className="bg-lavender-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-lavender-700 transition-colors shadow-sm"
                                >
                                    ✨ Create Your First Note
                                </button>
                            </div>

                            <div className="bg-yarn-100 rounded-2xl p-4 border-2 border-yarn-200">
                                <div className="text-2xl mb-2">💡</div>
                                <div className="text-sm text-wool-600">
                                    Perfect for swatches, colorwork tests, and pattern experiments
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Notes grid */
                        <div className="space-y-3">
                            {sortedNotes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onOpen={() => onOpenNote(note)}
                                    onDelete={handleDeleteNote}
                                    onRename={handleRenameNote}
                                />
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center pt-6 pb-2">
                        <p className="text-xs text-wool-400">Happy experimenting! 🧶</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesList;