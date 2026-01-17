import React, { useState, useEffect } from 'react';
import { X, FileText, Trash2, Clock, BookOpen, Search, FolderOpen } from 'lucide-react';
import { clsx } from 'clsx';

interface SavedDocument {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  createdAt: string;
  lastReadAt: string | null;
  lastPosition: number;
  category?: string;
}

const LIBRARY_STORAGE_KEY = 'hypersonic-document-library';

const loadLibrary = (): SavedDocument[] => {
  try {
    const stored = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load document library:', e);
  }
  return [];
};

const saveLibrary = (docs: SavedDocument[]): void => {
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.warn('Failed to save document library:', e);
  }
};

export const saveDocument = (title: string, content: string): SavedDocument => {
  const docs = loadLibrary();
  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  const doc: SavedDocument = {
    id: Date.now().toString(),
    title: title || `Document ${docs.length + 1}`,
    content,
    wordCount,
    createdAt: new Date().toISOString(),
    lastReadAt: null,
    lastPosition: 0,
  };

  docs.unshift(doc);
  saveLibrary(docs);
  return doc;
};

export const updateDocumentPosition = (id: string, position: number): void => {
  const docs = loadLibrary();
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.lastPosition = position;
    doc.lastReadAt = new Date().toISOString();
    saveLibrary(docs);
  }
};

export const deleteDocument = (id: string): void => {
  const docs = loadLibrary();
  const filtered = docs.filter(d => d.id !== id);
  saveLibrary(filtered);
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

interface DocumentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (content: string, position?: number) => void;
  currentText?: string;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  isOpen,
  onClose,
  onSelectDocument,
  currentText,
}) => {
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDocuments(loadLibrary());
    }
  }, [isOpen]);

  const handleSaveNew = () => {
    if (!currentText?.trim()) return;

    const doc = saveDocument(newDocTitle, currentText);
    setDocuments([doc, ...documents]);
    setShowSaveDialog(false);
    setNewDocTitle('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocument(id);
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  const handleSelect = (doc: SavedDocument) => {
    onSelectDocument(doc.content, doc.lastPosition);
    onClose();
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-title"
    >
      <div
        className="bg-[#1a1a1a] w-full max-w-2xl rounded-xl border border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#222]">
          <h2 id="library-title" className="text-lg font-bold text-white flex items-center gap-2">
            <FolderOpen className="text-yellow-500" size={20} />
            Document Library
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-4 border-b border-gray-800 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 text-sm border border-gray-700 focus:border-blue-500 outline-none"
            />
          </div>

          {currentText?.trim() && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save Current Text to Library
            </button>
          )}
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Document title (optional)"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:border-blue-500 outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNew}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Save
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

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={40} className="mx-auto mb-3 opacity-50" />
              {documents.length === 0 ? (
                <>
                  <p className="font-medium">No saved documents</p>
                  <p className="text-xs mt-1">Save texts to access them later</p>
                </>
              ) : (
                <p>No documents match your search</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={clsx(
                    "group p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors",
                    "border border-transparent hover:border-gray-700"
                  )}
                  onClick={() => handleSelect(doc)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {doc.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          {doc.wordCount.toLocaleString()} words
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(doc.createdAt)}
                        </span>
                        {doc.lastReadAt && doc.lastPosition > 0 && (
                          <span className="text-blue-400">
                            {Math.round((doc.lastPosition / doc.wordCount) * 100)}% read
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#222] text-center">
          <p className="text-xs text-gray-500">
            {documents.length} document{documents.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>
    </div>
  );
};
