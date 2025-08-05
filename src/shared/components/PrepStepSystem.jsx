// src/shared/components/PrepStepSystem.jsx
import React, { useState, useEffect } from 'react';

// Updated PrepStepOverlay from PrepStepSystem.jsx

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

  // Standardized Complex Modal Behavior  
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Focus the textarea for immediate editing
      setTimeout(() => {
        const textarea = document.querySelector('[data-modal-focus]');
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

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
    <div className="modal-overlay">
      <div className="modal-content-light max-h-[80vh] overflow-y-auto">

        {/* Header with lighter treatment */}
        <div className="modal-header-light">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{icon}</div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sage-600 text-sm">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-sage-600 text-2xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 stack-lg">

          {/* Note Input */}
          <div>
            <label className="form-label">
              What should the knitter do?
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={placeholder}
              rows={2}
              data-modal-focus
              className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white resize-none"
            />
          </div>


          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-tertiary"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex-1 btn-primary"
            >
              Save Note
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
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
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
// Component to display prep notes in instruction lists - NOW CLICKABLE
// Component to display prep notes in instruction lists - NOW CLICKABLE with SAGE styling
export const PrepNoteDisplay = ({ note, className = "", onClick }) => {
  if (!note || note.trim().length === 0) return null;

  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={`bg-sage-100 border-l-4 border-sage-500 rounded-r-lg p-3 my-2 ${className} ${isClickable ? 'cursor-pointer hover:bg-sage-150 transition-colors' : ''
        }`}
      onClick={isClickable ? onClick : undefined}
      title={isClickable ? "Click to edit preparation note" : undefined}
    >
      <div className="flex items-start gap-2">
        <span className="text-sage-600 text-sm">📝</span>
        <div className="flex-1">
          <div className="text-xs font-semibold text-sage-700 mb-1">
            Preparation Note:{isClickable && <span className="ml-1 text-sage-500">(click to edit)</span>}
          </div>
          <div className="text-sm text-sage-600 italic">"{note}"</div>
        </div>
        {isClickable && (
          <div className="text-sage-500 text-xs opacity-70">✏️</div>
        )}
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