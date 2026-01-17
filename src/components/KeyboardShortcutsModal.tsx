import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Playback',
    shortcuts: [
      { keys: ['Space'], description: 'Play / Pause' },
      { keys: ['R'], description: 'Reset to beginning' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['←'], description: 'Skip back 5 words' },
      { keys: ['→'], description: 'Skip forward 5 words' },
      { keys: ['Shift', '←'], description: 'Previous sentence' },
      { keys: ['Shift', '→'], description: 'Next sentence' },
    ],
  },
  {
    title: 'Speed Control',
    shortcuts: [
      { keys: ['↑'], description: 'Increase speed +10 WPM' },
      { keys: ['↓'], description: 'Decrease speed -10 WPM' },
    ],
  },
  {
    title: 'View',
    shortcuts: [
      { keys: ['F'], description: 'Toggle fullscreen' },
      { keys: ['Esc'], description: 'Exit fullscreen / Zen mode' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="bg-[#1a1a1a] w-full max-w-lg rounded-xl border border-gray-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#222]">
          <h2 id="shortcuts-title" className="text-lg font-bold text-white flex items-center gap-2">
            <Keyboard className="text-blue-500" size={20} />
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded-lg"
                  >
                    <span className="text-sm text-gray-300">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          {keyIdx > 0 && <span className="text-gray-600 text-xs">+</span>}
                          <kbd className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs font-mono text-gray-200 min-w-[24px] text-center">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#222]">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
};
