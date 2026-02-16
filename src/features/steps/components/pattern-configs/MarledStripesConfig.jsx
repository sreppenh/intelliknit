import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, List, Palette } from 'lucide-react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { StandardModal } from '../../../../shared/components/modals/StandardModal';
import useYarnManager from '../../../../shared/hooks/useYarnManager';

const MarledStripesConfig = ({
    wizardData,
    updateWizardData,
    construction,
    onSave,
    onCancel,
    project,
    mode = 'create',
    showHeader = false,
    headerTitle = "Configure Marled Stripes",
    headerSubtitle = "Define your marled stripe sequence"
}) => {
    // Marled sequence state
    const [marledSequence, setMarledSequence] = useState([]);

    useEffect(() => {
        if (wizardData.colorwork?.marledSequence && wizardData.colorwork.marledSequence.length > 0) {
            console.log('🔧 MarledStripesConfig - Loading marled sequence:', wizardData.colorwork.marledSequence);
            setMarledSequence(wizardData.colorwork.marledSequence);
        }
    }, [wizardData.colorwork?.marledSequence]);

    // View toggle state
    const [viewMode, setViewMode] = useState('cards');

    // Modal states
    const [showMarledModal, setShowMarledModal] = useState(false);
    const [editingMarledIndex, setEditingMarledIndex] = useState(null);
    const [marledForm, setMarledForm] = useState({
        rows: 7,
        colors: ['A', 'A']
    });

    // Modal unsaved changes tracking
    const [marledModalHasChanges, setMarledModalHasChanges] = useState(false);
    const [showMarledUnsavedModal, setShowMarledUnsavedModal] = useState(false);

    // Get project color data
    const { yarns } = useYarnManager();

    const projectColorCount = project?.colorCount || 6;
    const colorMapping = project?.colorMapping || {};

    useEffect(() => {
        const totalRows = marledSequence.reduce((sum, marled) => sum + marled.rows, 0);

        updateWizardData('colorwork', {
            type: 'marled_stripes',
            marledSequence: marledSequence,
            totalRows: totalRows
        });
    }, [marledSequence]);

    // Get available color letters
    const getAvailableColors = () => {
        const maxLetters = Math.min(projectColorCount, 26);
        return Array.from({ length: maxLetters }, (_, i) => String.fromCharCode(65 + i));
    };

    // Get color info for a letter
    const getColorInfo = (letter) => {
        const yarn = yarns.find(y => y.letter === letter);
        return {
            name: yarn?.color || colorMapping[letter] || `Color ${letter}`,
            displayName: yarn?.color || `Color ${letter}`,
            hex: yarn?.colorHex || '#f3f4f6',
            hasMapping: !!(yarn?.color || colorMapping[letter]),
            hasYarn: !!yarn
        };
    };

    // Handle add marled stripe
    const handleAddMarled = () => {
        setMarledForm({
            rows: 7,
            colors: ['A', 'A']
        });
        setEditingMarledIndex(null);
        setMarledModalHasChanges(false);
        setShowMarledModal(true);
    };

    // Handle edit marled stripe
    const handleEditMarled = (marledIndex) => {
        const marled = marledSequence[marledIndex];
        setMarledForm({
            rows: marled.rows,
            colors: [...marled.colors]
        });
        setEditingMarledIndex(marledIndex);
        setMarledModalHasChanges(false);
        setShowMarledModal(true);
    };

    // Handle delete marled stripe
    const handleDeleteMarled = (marledIndex) => {
        setMarledSequence(prev => prev.filter((_, index) => index !== marledIndex));
    };

    // Handle marled form changes
    const handleMarledFormChange = (field, value) => {
        setMarledForm(prev => ({
            ...prev,
            [field]: value
        }));
        setMarledModalHasChanges(true);
    };

    // Handle marled modal close with unsaved check
    const handleMarledModalClose = () => {
        if (marledModalHasChanges) {
            setShowMarledUnsavedModal(true);
        } else {
            setShowMarledModal(false);
            setMarledModalHasChanges(false);
        }
    };

    // Handle confirmed marled modal cancel
    const handleConfirmMarledCancel = () => {
        setShowMarledModal(false);
        setShowMarledUnsavedModal(false);
        setMarledModalHasChanges(false);
    };

    // Handle save marled stripe
    const handleSaveMarled = () => {
        let updatedMarled = [...marledSequence];

        const marledToSave = {
            rows: parseInt(marledForm.rows) || 1,
            colors: [...marledForm.colors],
            id: Date.now()
        };

        if (editingMarledIndex !== null) {
            const oldMarled = marledSequence[editingMarledIndex];
            updatedMarled[editingMarledIndex] = { ...marledToSave, id: oldMarled.id || Date.now() };
        } else {
            updatedMarled.push(marledToSave);
        }

        setMarledSequence(updatedMarled);
        setShowMarledModal(false);
        setMarledModalHasChanges(false);
    };

    // Quick pattern templates
    const insertQuickPattern = (pattern, rowsPerPhase) => {
        let newSequence;
        switch (pattern) {
            case 'tonal_fade':
                newSequence = [
                    { rows: rowsPerPhase, colors: ["A", "A"], id: Date.now() + 1 },
                    { rows: rowsPerPhase, colors: ["A", "B"], id: Date.now() + 2 },
                    { rows: rowsPerPhase, colors: ["B", "B"], id: Date.now() + 3 }
                ];
                break;
            case 'three_color':
                newSequence = [
                    { rows: rowsPerPhase, colors: ["A", "A"], id: Date.now() + 1 },
                    { rows: rowsPerPhase, colors: ["A", "B"], id: Date.now() + 2 },
                    { rows: rowsPerPhase, colors: ["B", "B"], id: Date.now() + 3 },
                    { rows: rowsPerPhase, colors: ["B", "C"], id: Date.now() + 4 },
                    { rows: rowsPerPhase, colors: ["C", "C"], id: Date.now() + 5 },
                    { rows: rowsPerPhase, colors: ["A", "C"], id: Date.now() + 6 }
                ];
                break;
            default:
                return;
        }
        setMarledSequence(newSequence);
    };

    const [quickPatternRows, setQuickPatternRows] = useState(7);

    const totalRows = marledSequence.reduce((sum, marled) => sum + marled.rows, 0);
    const rowUnit = construction === 'round' ? 'rounds' : 'rows';

    // Get display string for color combo
    const getComboDisplay = (colors) => {
        return colors.map(c => {
            const info = getColorInfo(c);
            return info.hasYarn ? info.displayName : `Color ${c}`;
        }).join(' + ');
    };

    // Add/Edit Marled Stripe Modal
    const marledModal = (
        <StandardModal
            isOpen={showMarledModal}
            onClose={handleMarledModalClose}
            onConfirm={handleSaveMarled}
            category="input"
            colorScheme="sage"
            title={editingMarledIndex !== null ? 'Edit Marled Stripe' : 'Add Marled Stripe'}
            subtitle="Configure marled stripe details"
            primaryButtonText={editingMarledIndex !== null ? 'Save Changes' : 'Add Marled Stripe'}
            secondaryButtonText="Cancel"
            primaryButtonProps={{
                disabled: !marledForm.rows || marledForm.rows <= 0
            }}
        >
            <div className="space-y-4">
                {/* Number of rows */}
                <div>
                    <label className="form-label">How many {rowUnit}?</label>
                    <IncrementInput
                        value={marledForm.rows}
                        onChange={(value) => handleMarledFormChange('rows', parseInt(value) || 1)}
                        label={`${rowUnit} in this marled stripe`}
                        unit={rowUnit}
                        min={1}
                        max={50}
                        size="sm"
                    />
                </div>

                {/* First Color Selection */}
                <div>
                    <label className="form-label">First Color</label>
                    <div className="grid grid-cols-3 gap-2">
                        {getAvailableColors().map(letter => {
                            const colorInfo = getColorInfo(letter);
                            const isSelected = marledForm.colors[0] === letter;

                            return (
                                <button
                                    key={letter}
                                    type="button"
                                    onClick={() => handleMarledFormChange('colors', [letter, marledForm.colors[1]])}
                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all relative text-center ${isSelected
                                        ? 'border-sage-500 bg-sage-50 text-sage-700'
                                        : 'border-wool-200 hover:border-wool-300 text-wool-600 hover:bg-wool-25'
                                        }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mb-2"
                                        style={{ backgroundColor: colorInfo.hex }}
                                    />
                                    <div className="font-bold text-sm">{letter}</div>
                                    <div className="text-xs mt-1">
                                        {colorInfo.hasYarn ? (
                                            <span className="truncate block" title={colorInfo.displayName}>
                                                {colorInfo.displayName.length > 8
                                                    ? colorInfo.displayName.substring(0, 8) + '...'
                                                    : colorInfo.displayName
                                                }
                                            </span>
                                        ) : (
                                            `Color ${letter}`
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Second Color Selection */}
                <div>
                    <label className="form-label">Second Color</label>
                    <div className="grid grid-cols-3 gap-2">
                        {getAvailableColors().map(letter => {
                            const colorInfo = getColorInfo(letter);
                            const isSelected = marledForm.colors[1] === letter;

                            return (
                                <button
                                    key={letter}
                                    type="button"
                                    onClick={() => handleMarledFormChange('colors', [marledForm.colors[0], letter])}
                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all relative text-center ${isSelected
                                        ? 'border-sage-500 bg-sage-50 text-sage-700'
                                        : 'border-wool-200 hover:border-wool-300 text-wool-600 hover:bg-wool-25'
                                        }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mb-2"
                                        style={{ backgroundColor: colorInfo.hex }}
                                    />
                                    <div className="font-bold text-sm">{letter}</div>
                                    <div className="text-xs mt-1">
                                        {colorInfo.hasYarn ? (
                                            <span className="truncate block" title={colorInfo.displayName}>
                                                {colorInfo.displayName.length > 8
                                                    ? colorInfo.displayName.substring(0, 8) + '...'
                                                    : colorInfo.displayName
                                                }
                                            </span>
                                        ) : (
                                            `Color ${letter}`
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Preview */}
                <div className="mt-3 text-sm text-wool-600 text-center">
                    Will add: <strong>{marledForm.rows} {rowUnit} of {getComboDisplay(marledForm.colors)}</strong>
                </div>
            </div>
        </StandardModal>
    );

    return (
        <div className="space-y-6">
            {/* Optional Header */}
            {showHeader && (
                <div>
                    <h2 className="content-header-primary">{headerTitle}</h2>
                    <p className="content-subheader">{headerSubtitle}</p>
                </div>
            )}

            {/* Existing content starts here */}
            <div className="flex items-center justify-between mb-4">
                {/* View Toggle - Left side */}
                {marledSequence.length > 0 && (
                    <div className="flex bg-wool-100 border border-wool-200 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${viewMode === 'cards'
                                ? 'bg-white text-wool-700 shadow-sm'
                                : 'text-wool-600 hover:text-wool-800'
                                }`}
                        >
                            <List size={12} className="inline mr-1" />
                            Cards
                        </button>
                        <button
                            onClick={() => setViewMode('visual')}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${viewMode === 'visual'
                                ? 'bg-white text-wool-700 shadow-sm'
                                : 'text-wool-600 hover:text-wool-800'
                                }`}
                        >
                            <Palette size={12} className="inline mr-1" />
                            Visual
                        </button>
                    </div>
                )}

                {marledSequence.length === 0 && <div></div>}

                {/* Add Marled Stripe Button - Right side */}
                <button
                    onClick={handleAddMarled}
                    className="btn-secondary btn-sm flex items-center gap-2"
                >
                    <Plus size={16} />
                    Add Marled Stripe
                </button>
            </div>

            {/* Quick Patterns - Only when empty */}
            {marledSequence.length === 0 && (
                <div>
                    <label className="form-label">Quick Start</label>

                    {/* Rows per phase input */}
                    <div className="mb-3">
                        <label className="text-sm text-wool-600 mb-1 block">Rows per phase:</label>
                        <IncrementInput
                            value={quickPatternRows}
                            onChange={(value) => setQuickPatternRows(parseInt(value) || 7)}
                            label="rows per phase"
                            unit={rowUnit}
                            min={1}
                            max={20}
                            size="sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { key: 'tonal_fade', label: 'Tonal Fade (2 colors)', desc: 'AA → AB → BB' },
                            { key: 'three_color', label: 'Three Color Rotation', desc: 'AA → AB → BB → BC → CC → AC' }
                        ].map(pattern => (
                            <button
                                key={pattern.key}
                                onClick={() => insertQuickPattern(pattern.key, quickPatternRows)}
                                className="text-left p-3 rounded-xl border-2 border-wool-200 hover:border-sage-300 hover:bg-sage-50 transition-colors bg-white"
                            >
                                <div className="text-sm font-medium">{pattern.label}</div>
                                <div className="text-xs text-wool-600">{pattern.desc}</div>
                            </button>
                        ))}
                    </div>
                    <div className="text-center mt-4 mb-2">
                        <div className="text-sm text-wool-500">or build custom:</div>
                    </div>
                </div>
            )}

            {/* Marled Stripe Display */}
            {marledSequence.length > 0 && (
                <div>
                    {viewMode === 'cards' ? (
                        /* Card View */
                        <div className="space-y-3">
                            {marledSequence.map((marled, index) => {
                                const color1Info = getColorInfo(marled.colors[0]);
                                const color2Info = getColorInfo(marled.colors[1]);

                                return (
                                    <div key={marled.id || index} className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-wool-200">
                                        {/* Color chips - side by side */}
                                        <div className="flex gap-1 flex-shrink-0">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 border-gray-300"
                                                style={{
                                                    backgroundColor: color1Info.hex,
                                                    color: color1Info.hex && color1Info.hex !== '#ffffff' ? 'white' : '#6b7280'
                                                }}
                                            >
                                                {marled.colors[0]}
                                            </div>
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 border-gray-300"
                                                style={{
                                                    backgroundColor: color2Info.hex,
                                                    color: color2Info.hex && color2Info.hex !== '#ffffff' ? 'white' : '#6b7280'
                                                }}
                                            >
                                                {marled.colors[1]}
                                            </div>
                                        </div>

                                        {/* Marled info */}
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                                {getComboDisplay(marled.colors)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {marled.rows} {marled.rows === 1 ? rowUnit.slice(0, -1) : rowUnit}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditMarled(index)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                                title="Edit marled stripe"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMarled(index)}
                                                className="delete-icon"
                                                title="Delete marled stripe"
                                                aria-label={`Delete marled stripe ${index + 1}`}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Visual View */
                        <div className="bg-white rounded-xl border-2 border-wool-200 p-6">
                            <div className="text-sm text-wool-600 mb-4 text-center">
                                Marled Stripe Pattern Preview ({totalRows} {rowUnit} total)
                            </div>

                            {/* Visual marled stripe bars */}
                            <div className="space-y-1">
                                {marledSequence.map((marled, index) => {
                                    const color1Info = getColorInfo(marled.colors[0]);
                                    const color2Info = getColorInfo(marled.colors[1]);
                                    const heightPx = marled.rows * 12;

                                    return (
                                        <div key={marled.id || index} className="relative">
                                            <div
                                                className="w-full rounded border border-gray-300 flex"
                                                style={{ height: `${heightPx}px` }}
                                                title={`${marled.rows} ${marled.rows === 1 ? rowUnit.slice(0, -1) : rowUnit} of ${getComboDisplay(marled.colors)}`}
                                            >
                                                {/* Split bar to show both colors */}
                                                <div
                                                    className="w-1/2 border-r border-gray-300"
                                                    style={{ backgroundColor: color1Info.hex }}
                                                />
                                                <div
                                                    className="w-1/2"
                                                    style={{ backgroundColor: color2Info.hex }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="mt-4 pt-4 border-t border-wool-200">
                                <div className="text-xs text-wool-600 mb-2">Pattern Sequence:</div>
                                <div className="flex flex-wrap gap-3">
                                    {marledSequence.map((marled, index) => {
                                        const color1Info = getColorInfo(marled.colors[0]);
                                        const color2Info = getColorInfo(marled.colors[1]);
                                        return (
                                            <div key={`${marled.colors.join('-')}-${index}`} className="flex items-center gap-2">
                                                <div className="flex gap-0.5">
                                                    <div
                                                        className="w-4 h-4 rounded border border-gray-300"
                                                        style={{ backgroundColor: color1Info.hex }}
                                                    />
                                                    <div
                                                        className="w-4 h-4 rounded border border-gray-300"
                                                        style={{ backgroundColor: color2Info.hex }}
                                                    />
                                                </div>
                                                <span className="text-xs text-wool-700">
                                                    {marled.colors.join('+')} : {marled.rows} {marled.rows === 1 ? rowUnit.slice(0, -1) : rowUnit}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {marledSequence.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🧵</div>
                    <p>No marled stripes added yet</p>
                    <p className="text-sm">Use quick start or add your first marled stripe</p>
                </div>
            )}

            {/* Pattern Summary */}
            {marledSequence.length > 0 && (
                <div className="card-info">
                    <h4 className="text-sm font-semibold text-lavender-700 mb-3">📊 Pattern Summary</h4>
                    <div className="space-y-2 text-sm">
                        <div className="text-lavender-700">
                            <span className="font-medium">{marledSequence.length} marled stripes</span> using <span className="font-medium">{[...new Set(marledSequence.flatMap(s => s.colors))].length} colors</span>. <span className="font-medium">{totalRows} {rowUnit} repeat</span>.
                        </div>
                    </div>
                </div>
            )}

            {/* Render modal */}
            {showMarledModal && createPortal(marledModal, document.body)}

            {/* Marled Modal Unsaved Changes Warning */}
            {showMarledUnsavedModal && createPortal(
                <StandardModal
                    isOpen={showMarledUnsavedModal}
                    onClose={() => setShowMarledUnsavedModal(false)}
                    onConfirm={handleConfirmMarledCancel}
                    category="warning"
                    colorScheme="red"
                    title="Discard Marled Stripe Changes?"
                    subtitle="You have unsaved changes to this marled stripe"
                    primaryButtonText="Discard Changes"
                    secondaryButtonText="Keep Editing"
                >
                    <p className="text-sm text-gray-700">
                        Are you sure you want to close without saving? Your marled stripe details will be lost.
                    </p>
                </StandardModal>,
                document.body
            )}
        </div>
    );
};

export default MarledStripesConfig;