// src/shared/components/PrepStepSystem.jsx
import React, { useState, useEffect } from 'react';

// Overlay Modal for Prep Notes
export const PrepStepOverlay = ({ 
  isOpen,
  onClose,
  onSave,
  existingNote = '',
  title = "Preparation Note",
  subtitle = "Add a setup note for this step",
  icon = "📝",
  examples = [
    "Switch to US 6 circular needles",
    "Place markers for pattern sections",
    "Check gauge on a swatch first",
    "Try on garment for fit adjustment"
  ],
  placeholder = "e.g., Switch to smaller needles, place stitch markers, check measurements"
}) => {
  const [note, setNote] = useState(existingNote);

  // Update local state when existingNote changes
  useEffect(() => {
    setNote(existingNote);
  }, [existingNote]);

  const handleSave = () => {
    onSave(note.trim());
    onClose();
  };

  const handleClear = () => {
    setNote('');
    onSave('');
    onClose();
  };

  const canSave = note.trim().length > 0;
  const hasExistingNote = existingNote.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-yarn-50 rounded-2xl shadow-xl max-w-sm w-full border-2 border-wool-200 max-h-[80vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-sage-500 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{icon}</div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sage-100 text-sm">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 bg-yarn-50 space-y-6">
          
          {/* Note Input */}
          <div>
            <label className="block text-sm font-semibold text-wool-700 mb-3">
              What should the knitter do?
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white resize-none"
              autoFocus
            />
          </div>

          {/* Examples (only show if no existing note to save space) */}
          {!hasExistingNote && (
            <div className="bg-sage-100 border-2 border-sage-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 Examples</h4>
              <div className="text-sm text-sage-600 space-y-1">
                {examples.slice(0, 3).map((example, index) => (
                  <div key={index}>• {example}</div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {hasExistingNote && (
              <button
                onClick={handleClear}
                className="flex-1 bg-red-100 text-red-700 py-3 px-4 rounded-xl font-semibold text-base hover:bg-red-200 transition-colors border border-red-200"
              >
                Clear Note
              </button>
            )}
            
            <button
              onClick={onClose}
              className="flex-1 bg-wool-100 text-wool-700 py-3 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex-2 bg-sage-500 text-white py-3 px-6 rounded-xl font-semibold text-base hover:bg-sage-600 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm"
              style={{flexGrow: 2}}
            >
              {hasExistingNote ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Prep Step Button with visual state
export const PrepStepButton = ({ 
  onClick, 
  hasNote = false,
  notePreview = '',
  position = "top-right",
  size = "normal",
  variant = "ghost"
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "absolute top-0 right-0 z-10";
      case "floating":
        return "fixed bottom-4 right-4 z-50";
      case "inline":
      default:
        return "";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "p-1.5";
      case "large":
        return "p-3";
      case "normal":
      default:
        return "p-2";
    }
  };

  const getVariantClasses = () => {
    if (hasNote) {
      return "bg-sage-500 text-white hover:bg-sage-600 shadow-md";
    }
    
    switch (variant) {
      case "outlined":
        return "border-2 border-sage-300 text-sage-600 hover:bg-sage-50";
      case "solid":
        return "bg-sage-500 text-white hover:bg-sage-600";
      case "ghost":
      default:
        return "text-wool-400 hover:text-sage-600 hover:bg-sage-50";
    }
  };

  const iconSize = size === "small" ? "16" : size === "large" ? "24" : "20";

  return (
    <div className={getPositionClasses()}>
      <button
        onClick={onClick}
        className={`${getSizeClasses()} ${getVariantClasses()} rounded-full transition-all duration-200 group relative`}
        title={hasNote ? `Edit note: ${notePreview.slice(0, 30)}${notePreview.length > 30 ? '...' : ''}` : "Add preparation note"}
      >
        <svg 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="group-hover:scale-110 transition-transform"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
        </svg>
        
        {/* Note indicator dot */}
        {hasNote && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yarn-600 rounded-full border-2 border-white"></div>
        )}
      </button>
    </div>
  );
};

// Hook for managing prep notes with persistence
export const usePrepNoteManager = (initialNote = '', onSaveNote) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(initialNote);

  // Update current note when initial note changes (e.g., from props)
  useEffect(() => {
    setCurrentNote(initialNote);
  }, [initialNote]);

  const handleOpenOverlay = () => {
    setIsOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
  };

  const handleSaveNote = (note) => {
    setCurrentNote(note);
    if (onSaveNote) {
      onSaveNote(note);
    }
  };

  const hasNote = currentNote.trim().length > 0;
  const notePreview = currentNote.slice(0, 50);

  return {
    isOverlayOpen,
    currentNote,
    hasNote,
    notePreview,
    handleOpenOverlay,
    handleCloseOverlay,
    handleSaveNote
  };
};

// Component to display prep notes in instruction lists
export const PrepNoteDisplay = ({ note, className = "" }) => {
  if (!note || note.trim().length === 0) return null;

  return (
    <div className={`bg-sage-100 border-l-4 border-sage-500 rounded-r-lg p-3 my-2 ${className}`}>
      <div className="flex items-start gap-2">
        <span className="text-sage-600 text-sm">📝</span>
        <div className="flex-1">
          <div className="text-xs font-semibold text-sage-700 mb-1">Preparation Note:</div>
          <div className="text-sm text-sage-600 italic">"{note}"</div>
        </div>
      </div>
    </div>
  );
};

// Context-specific configurations for different wizards
export const PREP_NOTE_CONFIGS = {
  stepWizard: {
    title: "Preparation Note",
    subtitle: "Add a setup note before this pattern",
    icon: "📝",
    examples: [
      "Switch to US 6 circular needles",
      "Place markers for pattern sections",
      "Check gauge on a swatch first",
      "Try on garment for fit adjustment"
    ],
    placeholder: "e.g., Switch to smaller needles, place stitch markers, check measurements"
  },
  
  componentCreation: {
    title: "Setup Note",
    subtitle: "Add preparation before starting this component",
    icon: "🛠️",
    examples: [
      "Transfer stitches to circular needle",
      "Place holders on live stitches", 
      "Set up for picking up stitches",
      "Change to contrast color yarn"
    ],
    placeholder: "e.g., Transfer to 16-inch circular needle, place live stitches on holder"
  },
  
  componentEnding: {
    title: "Finishing Note",
    subtitle: "Add setup note before finishing this component", 
    icon: "🏁",
    examples: [
      "Try on garment to check fit",
      "Measure piece against pattern schematic",
      "Set up needles for three-needle bind off",
      "Thread tapestry needle for grafting"
    ],
    placeholder: "e.g., Try on to check length, set up for three-needle bind off"
  }
};

// Utility function to get config for a specific wizard
export const getPrepNoteConfig = (wizardType) => {
  return PREP_NOTE_CONFIGS[wizardType] || PREP_NOTE_CONFIGS.stepWizard;
};