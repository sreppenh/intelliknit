/**
 * NoteDetail - Redesigned with DetailsTab pattern for better readability
 */

import React, { useState } from 'react';
import { useNotesContext } from '../hooks/useNotesContext';
import PageHeader from '../../../shared/components/PageHeader';
import StandardModal from '../../../shared/components/modals/StandardModal';
import { getFormattedStepDisplay } from '../../../shared/utils/stepDescriptionUtils';
import NoteCounter from './NoteCounter';

const NoteDetail = ({ onBack, onGoToLanding, onEditSteps }) => {
    const { currentNote, updateNote, deleteNote } = useNotesContext();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showKnittingModal, setShowKnittingModal] = useState(false);

    // Edit states for inline editing
    const [editingSection, setEditingSection] = useState(null);
    const [editForm, setEditForm] = useState({});

    if (!currentNote) {
        return (
            <div className="min-h-screen bg-lavender-50 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-wool-600 mb-2">Note not found</h3>
                    <button onClick={onBack} className="btn-primary btn-sm">← Back to Notes</button>
                </div>
            </div>
        );
    }

    // Get note info
    const hasStep = currentNote.components?.[0]?.steps?.length > 0;
    const step = hasStep ? currentNote.components[0].steps[0] : null;
    const hasYarns = currentNote.yarns?.length > 0 && currentNote.yarns.some(y => y.colorHex);
    const hasGauge = currentNote.gauge?.stitchGauge || currentNote.gauge?.rowGauge;

    // Handle delete note
    const handleDeleteNote = async () => {
        const success = await deleteNote(currentNote.id);
        if (success) {
            onBack();
        }
        setShowDeleteModal(false);
    };

    // Handle start knitting
    const handleStartKnitting = () => {
        setShowKnittingModal(true);
    };

    const handleCloseKnittingModal = () => {
        setShowKnittingModal(false);
    };

    // Inline editing handlers
    const startEditing = (section) => {
        setEditingSection(section);
        setEditForm({
            name: currentNote.name,
            textNotes: currentNote.textNotes || '',
            needleInfo: currentNote.needleInfo || ''
        });
    };

    const cancelEditing = () => {
        setEditingSection(null);
        setEditForm({});
    };

    const saveEdit = () => {
        updateNote({
            ...currentNote,
            name: editForm.name?.trim() || currentNote.name,
            textNotes: editForm.textNotes?.trim() || '',
            needleInfo: editForm.needleInfo?.trim() || ''
        });
        setEditingSection(null);
        setEditForm({});
    };

    const updateEditForm = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-lavender-50">
            <div className="app-container bg-lavender-50 min-h-screen shadow-lg">
                <PageHeader
                    useBranding={true}
                    onHome={onGoToLanding}
                    compact={true}
                    onBack={onBack}
                    showCancelButton={true}
                    onCancel={onBack}
                />

                {/* Compact Header */}
                <div className="px-6 py-4 bg-white border-b border-wool-100">
                    {editingSection === 'header' ? (
                        // Editing mode
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => updateEditForm('name', e.target.value)}
                                className="w-full text-xl font-bold text-wool-700 bg-transparent border-0 border-b-2 border-sage-300 focus:border-sage-500 focus:ring-0 px-0"
                                maxLength={100}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button onClick={saveEdit} className="btn-primary btn-sm">Save</button>
                                <button onClick={cancelEditing} className="btn-tertiary btn-sm">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        // Read mode
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-xl font-bold text-wool-700 mb-1">{currentNote.name}</h1>
                                <div className="text-sm text-wool-600">
                                    {currentNote.startingStitches} stitches • {currentNote.construction === 'round' ? 'In the round' : 'Flat knitting'} • {currentNote.defaultUnits === 'cm' ? 'Metric' : 'Imperial'}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => startEditing('header')}
                                    className="btn-tertiary btn-sm"
                                    title="Edit note name"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="btn-tertiary btn-sm text-red-600 hover:bg-red-50"
                                    title="Delete note"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Sections */}
                <div className="p-6 space-y-4">

                    {/* Pattern Section */}
                    {hasStep ? (
                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-lavender-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-lavender-700">🧶 Pattern</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => onEditSteps(0)} className="btn-secondary btn-sm">
                                        Edit Pattern
                                    </button>
                                    <button onClick={handleStartKnitting} className="btn-primary btn-sm">
                                        Start Knitting
                                    </button>
                                </div>
                            </div>

                            <div className="text-left">
                                {(() => {
                                    const { description, contextualPatternNotes, contextualConfigNotes } =
                                        getFormattedStepDisplay(step, "Pattern", currentNote);

                                    return (
                                        <div className="space-y-2">
                                            <div className="font-medium text-wool-700">{description}</div>
                                            {contextualPatternNotes && (
                                                <div className="text-sm text-wool-600 whitespace-pre-line bg-lavender-50 p-3 rounded-lg">
                                                    {contextualPatternNotes}
                                                </div>
                                            )}
                                            {contextualConfigNotes && (
                                                <div className="text-sm text-wool-600 italic">
                                                    {contextualConfigNotes}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-wool-200">
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <h3 className="text-lg font-semibold text-wool-700 mb-2">🧶 Pattern</h3>
                                    <p className="text-wool-500">No pattern configured yet</p>
                                </div>
                                <button onClick={() => onEditSteps(0)} className="btn-primary btn-sm">
                                    Configure Pattern
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Description Section */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-wool-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-wool-700">📝 Description</h3>
                            {editingSection !== 'description' && (
                                <button onClick={() => startEditing('description')} className="text-wool-400 hover:text-sage-600">
                                    ✏️
                                </button>
                            )}
                        </div>

                        {editingSection === 'description' ? (
                            <div className="space-y-3">
                                <textarea
                                    value={editForm.textNotes}
                                    onChange={(e) => updateEditForm('textNotes', e.target.value)}
                                    placeholder="What are you testing or working on?"
                                    className="w-full border-2 border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 resize-none"
                                    rows={3}
                                    maxLength={200}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button onClick={saveEdit} className="btn-primary btn-sm">Save</button>
                                    <button onClick={cancelEditing} className="btn-tertiary btn-sm">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-left" onClick={() => startEditing('description')} style={{ cursor: 'pointer' }}>
                                {currentNote.textNotes ? (
                                    <p className="text-wool-700">{currentNote.textNotes}</p>
                                ) : (
                                    <p className="text-wool-500 italic">+ Add description</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Colors Section */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-wool-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-wool-700 text-left">🎨 Colors</h3>
                            <button onClick={() => startEditing('colors')} className="text-wool-400 hover:text-sage-600">
                                ✏️
                            </button>
                        </div>

                        <div className="space-y-1 text-left">
                            <div>
                                <span className="text-sm font-medium text-wool-700">Colors in project: {currentNote.numberOfColors || 1}</span>
                            </div>

                            {hasYarns && (
                                <div>
                                    <span className="text-sm font-medium text-wool-700 block mb-1">Current colors:</span>
                                    <div className="space-y-1">
                                        {currentNote.yarns.filter(y => y.colorHex).map((yarn, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: yarn.colorHex }}
                                                />
                                                <span className="text-sm text-wool-700">
                                                    Color {yarn.letter}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Technical Details Section */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-wool-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-wool-700 text-left">⚙️ Details</h3>
                            <button onClick={() => startEditing('needles')} className="text-wool-400 hover:text-sage-600">
                                ✏️
                            </button>
                        </div>

                        <div className="space-y-1 text-left">
                            {/* Needles */}
                            <div>
                                {editingSection === 'needles' ? (
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-wool-700">Needles:</span>
                                        <input
                                            type="text"
                                            value={editForm.needleInfo}
                                            onChange={(e) => updateEditForm('needleInfo', e.target.value)}
                                            placeholder="e.g., US 8, 5.0mm"
                                            className="w-full border-2 border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0"
                                            maxLength={50}
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={saveEdit} className="btn-primary btn-sm">Save</button>
                                            <button onClick={cancelEditing} className="btn-tertiary btn-sm">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-sm font-medium text-wool-700">Needles: </span>
                                        <span className="text-sm text-wool-600">
                                            {currentNote.needleInfo || 'Not specified'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Gauge */}
                            {hasGauge && (
                                <div>
                                    <span className="text-sm font-medium text-wool-700">Gauge: </span>
                                    <span className="text-sm text-wool-600">
                                        {currentNote.gauge.stitchGauge && `${currentNote.gauge.stitchGauge.stitches} sts`}
                                        {currentNote.gauge.stitchGauge && currentNote.gauge.rowGauge && ', '}
                                        {currentNote.gauge.rowGauge && `${currentNote.gauge.rowGauge.rows} rows`}
                                        {' = 4 '}{currentNote.defaultUnits === 'cm' ? 'cm' : 'inches'}
                                    </span>
                                </div>
                            )}

                            {/* Creation Date */}
                            <div>
                                <span className="text-sm font-medium text-wool-700">Created: </span>
                                <span className="text-sm text-wool-600">
                                    {new Date(currentNote.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <StandardModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteNote}
                category="warning"
                colorScheme="red"
                title="Delete Note?"
                subtitle={`"${currentNote.name}" will be permanently deleted. This cannot be undone.`}
                primaryButtonText="Delete Note"
                secondaryButtonText="Cancel"
                icon="🗑️"
            />

            {/* Knitting Modal */}
            {showKnittingModal && hasStep && (
                <NoteCounter
                    onBack={handleCloseKnittingModal}
                    onGoToLanding={onGoToLanding}
                />
            )}
        </div>
    );
};

export default NoteDetail;