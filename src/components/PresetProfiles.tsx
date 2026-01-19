import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Download, Upload, Check, Sliders } from 'lucide-react';
import { clsx } from 'clsx';
import { useReaderStore } from '../store/useReaderStore';

interface Preset {
  id: string;
  name: string;
  description?: string;
  settings: {
    wpm: number;
    chunkSize: number;
    fontSize: number;
    showReticle: boolean;
    pauseAtEndOfSentence: boolean;
    backgroundColor: string;
    textColor: string;
    highlightColor: string;
    aspectRatio: '16:9' | '9:16';
    fontFamily: 'sans' | 'serif' | 'mono' | 'dyslexic';
    readingMode: 'rsvp' | 'pacer';
    smartChunking: boolean;
    peripheralMode: boolean;
    bionicReading: boolean;
    smartRewind: boolean;
    punctuationPause: boolean;
  };
  createdAt: string;
  isDefault?: boolean;
}

const PRESETS_STORAGE_KEY = 'hypersonic-presets';

const defaultPresets: Preset[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Comfortable pace for new speed readers',
    settings: {
      wpm: 250,
      chunkSize: 1,
      fontSize: 64,
      showReticle: true,
      pauseAtEndOfSentence: true,
      backgroundColor: '#1a1a1a',
      textColor: '#e5e5e5',
      highlightColor: '#ff4444',
      aspectRatio: '16:9',
      fontFamily: 'sans',
      readingMode: 'rsvp',
      smartChunking: false,
      peripheralMode: false,
      bionicReading: true,
      smartRewind: true,
      punctuationPause: true,
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Balanced speed and comprehension',
    settings: {
      wpm: 400,
      chunkSize: 1,
      fontSize: 56,
      showReticle: true,
      pauseAtEndOfSentence: false,
      backgroundColor: '#1a1a1a',
      textColor: '#e5e5e5',
      highlightColor: '#ff4444',
      aspectRatio: '16:9',
      fontFamily: 'sans',
      readingMode: 'rsvp',
      smartChunking: false,
      peripheralMode: true,
      bionicReading: false,
      smartRewind: false,
      punctuationPause: true,
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Maximum velocity for experienced readers',
    settings: {
      wpm: 700,
      chunkSize: 2,
      fontSize: 48,
      showReticle: false,
      pauseAtEndOfSentence: false,
      backgroundColor: '#000000',
      textColor: '#ffffff',
      highlightColor: '#00ff00',
      aspectRatio: '16:9',
      fontFamily: 'sans',
      readingMode: 'rsvp',
      smartChunking: true,
      peripheralMode: true,
      bionicReading: false,
      smartRewind: false,
      punctuationPause: false,
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Easy on the eyes for late-night reading',
    settings: {
      wpm: 300,
      chunkSize: 1,
      fontSize: 64,
      showReticle: true,
      pauseAtEndOfSentence: false,
      backgroundColor: '#002b36',
      textColor: '#839496',
      highlightColor: '#b58900',
      aspectRatio: '16:9',
      fontFamily: 'serif',
      readingMode: 'rsvp',
      smartChunking: false,
      peripheralMode: false,
      bionicReading: false,
      smartRewind: true,
      punctuationPause: true,
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'accessible',
    name: 'Accessible',
    description: 'High contrast with dyslexia-friendly font',
    settings: {
      wpm: 200,
      chunkSize: 1,
      fontSize: 72,
      showReticle: true,
      pauseAtEndOfSentence: true,
      backgroundColor: '#000000',
      textColor: '#ffff00',
      highlightColor: '#ff00ff',
      aspectRatio: '16:9',
      fontFamily: 'dyslexic',
      readingMode: 'pacer',
      smartChunking: false,
      peripheralMode: false,
      bionicReading: true,
      smartRewind: true,
      punctuationPause: true,
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
];

const loadPresets = (): Preset[] => {
  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (stored) {
      const userPresets = JSON.parse(stored) as Preset[];
      // Merge default presets with user presets
      const allPresets = [...defaultPresets];
      userPresets.forEach(up => {
        if (!up.isDefault) {
          allPresets.push(up);
        }
      });
      return allPresets;
    }
  } catch (e) {
    console.warn('Failed to load presets:', e);
  }
  return defaultPresets;
};

const savePresets = (presets: Preset[]): void => {
  try {
    // Only save user presets (non-default)
    const userPresets = presets.filter(p => !p.isDefault);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(userPresets));
  } catch (e) {
    console.warn('Failed to save presets:', e);
  }
};

interface PresetProfilesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresetProfiles: React.FC<PresetProfilesProps> = ({ isOpen, onClose }) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const { settings, wpm, updateSettings, setWpm } = useReaderStore();

  useEffect(() => {
    if (isOpen) {
      setPresets(loadPresets());
    }
  }, [isOpen]);

  const handleApplyPreset = (preset: Preset) => {
    updateSettings(preset.settings);
    setWpm(preset.settings.wpm);
    setActivePresetId(preset.id);
  };

  const handleSaveNewPreset = () => {
    if (!newPresetName.trim()) return;

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      description: newPresetDesc.trim() || undefined,
      settings: { ...settings, wpm },
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    savePresets(updatedPresets);
    setShowSaveDialog(false);
    setNewPresetName('');
    setNewPresetDesc('');
    setActivePresetId(newPreset.id);
  };

  const handleDeletePreset = (id: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      const updatedPresets = presets.filter(p => p.id !== id);
      setPresets(updatedPresets);
      savePresets(updatedPresets);
      if (activePresetId === id) {
        setActivePresetId(null);
      }
    }
  };

  const handleExportPresets = () => {
    const userPresets = presets.filter(p => !p.isDefault);
    const blob = new Blob([JSON.stringify(userPresets, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hypersonic-presets.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as Preset[];
        const validPresets = imported.filter(p => p.name && p.settings);
        const updatedPresets = [...presets];

        validPresets.forEach(p => {
          p.id = Date.now().toString() + Math.random();
          p.isDefault = false;
          updatedPresets.push(p);
        });

        setPresets(updatedPresets);
        savePresets(updatedPresets);
        alert(`Imported ${validPresets.length} preset(s)`);
      } catch {
        alert('Failed to import presets. Invalid file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="presets-title"
    >
      <div
        className="bg-[#1a1a1a] w-full max-w-2xl rounded-xl border border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#222]">
          <h2 id="presets-title" className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="text-purple-500" size={20} />
            Preset Profiles
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-gray-800 flex flex-wrap gap-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Save size={16} />
            Save Current as Preset
          </button>
          <button
            onClick={handleExportPresets}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download size={16} />
            Export
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportPresets}
              className="hidden"
            />
          </label>
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Preset name *"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:border-blue-500 outline-none"
                autoFocus
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newPresetDesc}
                onChange={(e) => setNewPresetDesc(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:border-blue-500 outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNewPreset}
                  disabled={!newPresetName.trim()}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Save Preset
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preset List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={clsx(
                  "group relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                  activePresetId === preset.id
                    ? "bg-blue-500/20 border-blue-500"
                    : "bg-gray-800/50 border-transparent hover:border-gray-600"
                )}
                onClick={() => handleApplyPreset(preset)}
              >
                {activePresetId === preset.id && (
                  <div className="absolute top-2 right-2">
                    <Check size={16} className="text-blue-400" />
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-white flex items-center gap-2">
                      {preset.name}
                      {preset.isDefault && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">
                          Default
                        </span>
                      )}
                    </h3>
                    {preset.description && (
                      <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                    )}
                  </div>

                  {!preset.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Delete preset"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                    {preset.settings.wpm} WPM
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                    {preset.settings.readingMode.toUpperCase()}
                  </span>
                  {preset.settings.bionicReading && (
                    <span className="text-xs px-2 py-1 bg-blue-500/20 rounded text-blue-300">
                      Bionic
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#222] text-center">
          <p className="text-xs text-gray-500">
            Click a preset to apply it • Your current settings will be overwritten
          </p>
        </div>
      </div>
    </div>
  );
};
