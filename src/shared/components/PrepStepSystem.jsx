// src/shared/components/PrepStepSystem.jsx
import React, { useState, useEffect } from 'react';
import { StandardModal } from './StandardModal';

// Updated PrepStepModal using StandardModal
export const PrepStepModal = ({
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

  const canSave = note.trim().length > 0;

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      category="complex"
      colorScheme="sage"
      title={title}
      subtitle={subtitle}
      icon={icon}
      showButtons={false} // Custom buttons for this modal
      focusSelector="[data-modal-focus]" // Focus the textarea
    >
      {/* Note Input */}
      <div className="mb-6">
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

      {/* Custom Action Buttons */}
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
    </StandardModal>
  );
};

// Enhanced Prep Step Button with visual state (NO CHANGES - this is perfect)
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

// Hook for managing prep notes with persistence (NO CHANGES - this is perfect)
export const usePrepNoteManager = (initialNote = '', onSaveNote) => {
  const [isModalOpen, setisModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(initialNote);

  // Update current note when initial note changes (e.g., from props)
  useEffect(() => {
    setCurrentNote(initialNote);
  }, [initialNote]);

  const handleOpenModal = () => {
    setisModalOpen(true);
  };

  const handleCloseModal = () => {
    setisModalOpen(false);
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
    isModalOpen,
    currentNote,
    hasNote,
    notePreview,
    handleOpenModal,
    handleCloseModal,
    handleSaveNote
  };
};

// Component to display prep notes in instruction lists (NO CHANGES - this is perfect)
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

// Context-specific configurations for different wizards (NO CHANGES - this is perfect)
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

// Utility function to get config for a specific wizard (NO CHANGES)
export const getPrepNoteConfig = (wizardType) => {
  return PREP_NOTE_CONFIGS[wizardType] || PREP_NOTE_CONFIGS.stepWizard;
};

// Component to display after notes (NO CHANGES - this is perfect)
export const AfterNoteDisplay = ({ note, className = "", onClick }) => {
  if (!note || note.trim().length === 0) return null;

  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={`bg-sage-100 border-l-4 border-sage-500 rounded-r-lg p-3 my-2 ${className} ${isClickable ? 'cursor-pointer hover:bg-sage-150 transition-colors' : ''
        }`}
      onClick={isClickable ? onClick : undefined}
      title={isClickable ? "Click to edit assembly note" : undefined}
    >
      <div className="flex items-start gap-2">
        <span className="text-sage-600 text-sm">🔧</span>
        <div className="flex-1">
          <div className="text-xs font-semibold text-sage-700 mb-1">
            Assembly Notes:{isClickable && <span className="ml-1 text-sage-500">(click to edit)</span>}
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

// Hook for managing assembly notes (NO CHANGES - this is perfect)
export const useAfterNoteManager = (initialNote = '', onSaveNote) => {
  const [isModalOpen, setisModalOpen] = React.useState(false);
  const [currentNote, setCurrentNote] = React.useState(initialNote);

  // Update current note when initial note changes
  React.useEffect(() => {
    setCurrentNote(initialNote);
  }, [initialNote]);

  const handleOpenModal = () => {
    setisModalOpen(true);
  };

  const handleCloseModal = () => {
    setisModalOpen(false);
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
    isModalOpen,
    currentNote,
    hasNote,
    notePreview,
    handleOpenModal,
    handleCloseModal,
    handleSaveNote
  };
};

// Assembly Note Modal using StandardModal
export const AssemblyNoteModal = ({
  isOpen,
  onClose,
  onSave,
  existingNote = '',
  title = "Assembly Notes",
  subtitle = "Add notes for what to do after completing this step",
  icon = "🔧",
  placeholder = "e.g., Using Kitchener stitch, attach to shoulder"
}) => {
  const [note, setNote] = React.useState(existingNote);

  // Update local state when existingNote changes
  React.useEffect(() => {
    setNote(existingNote);
  }, [existingNote]);

  const handleSave = () => {
    onSave(note.trim());
    onClose();
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      category="complex"
      colorScheme="sage"
      title={title}
      subtitle={subtitle}
      icon={icon}
      showButtons={false} // Custom buttons
      focusSelector="[data-modal-focus]" // Focus the textarea
    >
      {/* Note Input */}
      <div className="mb-6">
        <label className="form-label">
          What should happen after completing this step?
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

      {/* Custom Action Buttons */}
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
          Save Notes
        </button>
      </div>
    </StandardModal>
  );
};