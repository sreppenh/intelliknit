/**
 * NoteDetail - Individual note management (simplified ProjectDetail for notes)
 */

import React, { useState } from 'react';
import { useNotesContext } from '../hooks/useNotesContext';
import PageHeader from '../../../shared/components/PageHeader';
import StandardModal from '../../../shared/components/modals/StandardModal';

const NoteDetail = ({ onBack, onGoToLanding, onEditSteps, onStartKnitting }) => {
    const { currentNote, updateNote, deleteNote } = useNotesContext();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});

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
    const hasYarns = currentNote.yarns?.length > 0;
    const hasGauge = currentNote.gauge?.stitchGauge || currentNote.gauge?.rowGauge;

    // Handle delete note
    const handleDeleteNote = async () => {
        const success = await deleteNote(currentNote.id);
        if (success) {
            onBack(); // Go back to notes list
        }
        setShowDeleteModal(false);
    };

    // Handle edit note details
    const handleEditNote = () => {
        setEditData({
            name: currentNote.name,
            textNotes: currentNote.textNotes || '',
            needleInfo: currentNote.needleInfo || ''
        });
        setShowEditModal(true);
    };

    // Save note edits
    const handleSaveEdit = () => {
        updateNote({
            ...currentNote,
            name: editData.name.trim(),
            textNotes: editData.textNotes.trim(),
            needleInfo: editData.needleInfo.trim()
        });
        setShowEditModal(false);
    };

    // Get pattern info
    const getPatternInfo = () => {
        if (!hasStep) return 'No pattern configured yet';
        const pattern = step.wizardConfig?.stitchPattern?.pattern || 'Unknown pattern';
        const rows = step.totalRows || 1;
        return `${pattern} (${rows} ${rows === 1 ? 'row' : 'rows'})`;
    };

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

                {/* Note Header */}
                <div className="px-6 py-4 bg-white border-b border-wool-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                            <div className="text-3xl">📝</div>
                            <div className="min-w-0 flex-1">



                                <h1 className="text-xl font-bold text-wool-700 mb-1 truncate">
                                    {currentNote.name}
                                </h1>
                                <div className="text-sm text-wool-600">
                                    {currentNote.startingStitches} stitches • {currentNote.construction === 'round' ? 'In the round' : 'Flat knitting'}
                                    {currentNote.numberOfColors > 1 && ` • ${currentNote.numberOfColors} colors`}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleEditNote}
                                className="btn-tertiary btn-sm"
                                title="Edit note details"
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
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Note Status Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-lavender-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-wool-700 flex items-center gap-2">
                                🧶 Note Status
                            </h2>
                            {!hasStep && (
                                <button
                                    onClick={() => onEditSteps(0)} // Component index 0
                                    className="btn-primary btn-sm"
                                >
                                    Configure Note
                                </button>
                            )}
                        </div>

                        {hasStep ? (
                            <div>
                                <div className="text-base text-wool-700 mb-2">
                                    ✅ {getPatternInfo()}
                                </div>
                                <div className="text-sm text-wool-600 mb-4">
                                    {step.description}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => onEditSteps(0)}
                                        className="btn-secondary btn-sm"
                                    >
                                        Edit Pattern
                                    </button>
                                    <button
                                        onClick={() => onStartKnitting(0)}
                                        className="btn-primary btn-sm"
                                    >
                                        Start Knitting
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-3">⚡</div>
                                <h3 className="text-lg font-medium text-wool-700 mb-2">Ready for Your Note</h3>
                                <p className="text-wool-600 text-sm mb-4">
                                    Configure your note using the step wizard.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Note Details Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-wool-200">
                        <h2 className="text-lg font-semibold text-wool-700 mb-4 flex items-center gap-2">
                            📋 Details
                        </h2>

                        <div className="space-y-4">
                            {/* Description */}
                            {currentNote.textNotes && (
                                <div>
                                    <h4 className="text-sm font-medium text-wool-700 mb-1">Description</h4>
                                    <p className="text-sm text-wool-600 italic">"{currentNote.textNotes}"</p>
                                </div>
                            )}

                            {/* Needles */}
                            {currentNote.needleInfo && (
                                <div>
                                    <h4 className="text-sm font-medium text-wool-700 mb-1">Needles</h4>
                                    <p className="text-sm text-wool-600">{currentNote.needleInfo}</p>
                                </div>
                            )}

                            {/* Yarns */}
                            {hasYarns ? (
                                <div>
                                    <h4 className="text-sm font-medium text-wool-700 mb-2">Yarns ({currentNote.yarns.length})</h4>
                                    <div className="space-y-2">
                                        {currentNote.yarns.map((yarn, index) => (
                                            <div key={index} className="flex items-center gap-3 text-sm">
                                                <div className="w-6 h-6 rounded-full bg-wool-300 flex items-center justify-center text-xs font-bold text-wool-700">
                                                    {yarn.letter}
                                                </div>
                                                <span className="text-wool-700">
                                                    {yarn.color || `Color ${yarn.letter}`}
                                                    {yarn.brand && <span className="text-wool-500"> - {yarn.brand}</span>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : currentNote.numberOfColors > 1 ? (
                                <div>
                                    <h4 className="text-sm font-medium text-wool-700 mb-1">Colors</h4>
                                    <p className="text-sm text-wool-600">
                                        {currentNote.numberOfColors} colors (using defaults: {
                                            Array.from({ length: currentNote.numberOfColors }, (_, i) =>
                                                `Color ${String.fromCharCode(65 + i)}`
                                            ).join(', ')
                                        })
                                    </p>
                                </div>
                            ) : null}

                            {/* Gauge */}
                            {hasGauge && (
                                <div>
                                    <h4 className="text-sm font-medium text-wool-700 mb-1">Gauge</h4>
                                    <p className="text-sm text-wool-600">
                                        {currentNote.gauge.stitchGauge &&
                                            `${currentNote.gauge.stitchGauge.stitches} stitches`
                                        }
                                        {currentNote.gauge.stitchGauge && currentNote.gauge.rowGauge && ', '}
                                        {currentNote.gauge.rowGauge &&
                                            `${currentNote.gauge.rowGauge.rows} rows`
                                        }
                                        {' = 4 '}
                                        {currentNote.defaultUnits === 'cm' ? 'cm' : 'inches'}
                                    </p>
                                </div>
                            )}

                            {/* Creation Date */}
                            <div>
                                <h4 className="text-sm font-medium text-wool-700 mb-1">Created</h4>
                                <p className="text-sm text-wool-600">
                                    {new Date(currentNote.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
                                </p>
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
            >
                <div className="text-center py-4">
                    <div className="text-4xl mb-3">📝</div>
                    <div className="text-lg font-semibold text-wool-700 mb-2">{currentNote.name}</div>
                    <div className="text-sm text-wool-600">
                        {hasStep ? `Pattern: ${getPatternInfo()}` : 'No pattern configured'}
                    </div>
                </div>
            </StandardModal>

            {/* Edit Note Modal */}
            <StandardModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onConfirm={handleSaveEdit}
                category="input"
                colorScheme="lavender"
                title="Edit Note Details"
                subtitle="Update your note information"
                primaryButtonText="Save Changes"
                secondaryButtonText="Cancel"
                icon="✏️"
            >
                <div className="space-y-4">
                    <div>
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            value={editData.name || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-lavender-500 focus:ring-0 transition-colors bg-white"
                            data-modal-focus
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label className="form-label">Description</label>
                        <textarea
                            value={editData.textNotes || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, textNotes: e.target.value }))}
                            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-lavender-500 focus:ring-0 transition-colors bg-white resize-none"
                            rows={3}
                            maxLength={200}
                        />
                    </div>

                    <div>
                        <label className="form-label">Needle Information</label>
                        <input
                            type="text"
                            value={editData.needleInfo || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, needleInfo: e.target.value }))}
                            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-lavender-500 focus:ring-0 transition-colors bg-white"
                            maxLength={50}
                        />
                    </div>
                </div>
            </StandardModal>
        </div>
    );
};

export default NoteDetail;