/**
 * Note Card - Individual note display (simplified version of project cards)
 */

import React, { useState } from 'react';
import StandardModal from '../../../shared/components/modals/StandardModal';

const NoteCard = ({ note, onOpen, onDelete, onRename }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [newName, setNewName] = useState('');

    // Get note info
    const hasStep = note.components?.[0]?.steps?.length > 0;
    const stepCount = note.components?.[0]?.steps?.length || 0;
    const hasYarns = note.yarns?.length > 0;
    const hasGauge = note.gauge?.stitchGauge || note.gauge?.rowGauge;
    const hasNeedles = note.needleInfo?.trim();

    // Get creation date
    const createdDate = new Date(note.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    // Get pattern type from step
    const getPatternType = () => {
        if (!hasStep) return 'No pattern yet';
        const step = note.components[0].steps[0];
        const pattern = step.wizardConfig?.stitchPattern?.pattern || 'Unknown pattern';
        return pattern;
    };

    // Handle delete
    const handleDelete = () => {
        onDelete(note.id);
        setShowDeleteModal(false);
    };

    // Handle rename
    const handleRename = () => {
        if (newName.trim() && newName.trim() !== note.name) {
            onRename(note.id, newName.trim());
        }
        setShowRenameModal(false);
        setNewName('');
    };

    // Handle rename modal open
    const openRenameModal = (e) => {
        e.stopPropagation();
        setNewName(note.name);
        setShowRenameModal(true);
    };

    // Handle delete modal open
    const openDeleteModal = (e) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    return (
        <>
            <div
                className="card-interactive p-4 cursor-pointer hover:shadow-md transition-all duration-200 border-2 border-lavender-200 hover:border-lavender-400  hover:bg-lavender-75 bg-white"
                onClick={onOpen}
            >
                {/* Header: Note icon + name + menu */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-2xl">📝</span>
                        <h3 className="font-semibold text-wool-700 text-base truncate">
                            {note.name}
                        </h3>
                    </div>

                    {/* Three dot menu */}
                    <div className="relative flex-shrink-0">
                        <button
                            className="p-1.5 rounded-full hover:bg-lavender-100 text-wool-400 hover:text-lavender-600 transition-colors"
                            onClick={openDeleteModal}
                            title="Delete note"
                        >
                            🗑️
                        </button>
                    </div>
                </div>

                {/* Status */}
                <div className="mb-2">
                    <span className="text-sm font-medium text-lavender-700">
                        {hasStep ? `${getPatternType()} configured` : '⚡ Ready for pattern'}
                    </span>
                </div>

                {/* Details */}
                <div className="text-sm text-wool-600 space-y-1">
                    <div>
                        {note.startingStitches} stitches • {note.construction === 'round' ? 'In the round' : 'Flat knitting'}
                    </div>

                    {note.numberOfColors > 1 && (
                        <div>
                            {note.numberOfColors} colors • {hasYarns ? 'Yarns specified' : 'Using defaults'}
                        </div>
                    )}

                    {(hasGauge || hasNeedles) && (
                        <div className="flex gap-2 text-xs">
                            {hasGauge && <span className="bg-lavender-100 text-lavender-700 px-2 py-0.5 rounded-full">Gauge</span>}
                            {hasNeedles && <span className="bg-lavender-100 text-lavender-700 px-2 py-0.5 rounded-full">Needles</span>}
                        </div>
                    )}

                    <div className="text-xs text-wool-500 pt-1">
                        Created {createdDate}
                        {note.textNotes && (
                            <span> • {note.textNotes.slice(0, 50)}{note.textNotes.length > 50 ? '...' : ''}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <StandardModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                category="warning"
                colorScheme="red"
                title="Delete Note?"
                subtitle={`"${note.name}" will be permanently deleted. This cannot be undone.`}
                primaryButtonText="Delete Note"
                secondaryButtonText="Cancel"
                icon="🗑️"
            >
                <div className="text-center py-4">
                    <div className="text-4xl mb-3">📝</div>
                    <div className="text-lg font-semibold text-wool-700 mb-2">{note.name}</div>
                    <div className="text-sm text-wool-600">
                        {hasStep ? `Pattern: ${getPatternType()}` : 'No pattern configured yet'}
                    </div>
                </div>
            </StandardModal>

            {/* Rename Modal */}
            <StandardModal
                isOpen={showRenameModal}
                onClose={() => {
                    setShowRenameModal(false);
                    setNewName('');
                }}
                onConfirm={handleRename}
                category="input"
                colorScheme="lavender"
                title="Rename Note"
                subtitle="Give your note a new name"
                primaryButtonText="Rename"
                secondaryButtonText="Cancel"
                icon="✏️"
            >
                <div>
                    <label className="form-label">Name</label>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new name"
                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-lavender-500 focus:ring-0 transition-colors bg-white"
                        data-modal-focus
                        maxLength={100}
                    />
                </div>
            </StandardModal>
        </>
    );
};

export default NoteCard;