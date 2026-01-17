import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Clock, BookOpen, Target, Award, Calendar } from 'lucide-react';

interface ReadingSession {
  id: string;
  date: string;
  wordsRead: number;
  timeSpent: number; // seconds
  avgWpm: number;
  completionRate: number;
}

interface ReadingStatsData {
  totalWordsRead: number;
  totalTimeSpent: number;
  totalSessions: number;
  averageWpm: number;
  bestWpm: number;
  currentStreak: number;
  longestStreak: number;
  recentSessions: ReadingSession[];
  lastReadDate: string | null;
}

const STATS_STORAGE_KEY = 'hypersonic-reading-stats';

const getDefaultStats = (): ReadingStatsData => ({
  totalWordsRead: 0,
  totalTimeSpent: 0,
  totalSessions: 0,
  averageWpm: 0,
  bestWpm: 0,
  currentStreak: 0,
  longestStreak: 0,
  recentSessions: [],
  lastReadDate: null,
});

export const loadStats = (): ReadingStatsData => {
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (stored) {
      return { ...getDefaultStats(), ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load reading stats:', e);
  }
  return getDefaultStats();
};

export const saveStats = (stats: ReadingStatsData): void => {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to save reading stats:', e);
  }
};

export const recordSession = (wordsRead: number, timeSpent: number, avgWpm: number, completionRate: number): void => {
  const stats = loadStats();
  const today = new Date().toISOString().split('T')[0];

  // Update totals
  stats.totalWordsRead += wordsRead;
  stats.totalTimeSpent += timeSpent;
  stats.totalSessions += 1;

  // Update average WPM
  if (stats.totalSessions > 0) {
    stats.averageWpm = Math.round(
      (stats.averageWpm * (stats.totalSessions - 1) + avgWpm) / stats.totalSessions
    );
  } else {
    stats.averageWpm = avgWpm;
  }

  // Update best WPM
  if (avgWpm > stats.bestWpm) {
    stats.bestWpm = avgWpm;
  }

  // Update streak
  if (stats.lastReadDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (stats.lastReadDate === yesterdayStr) {
      stats.currentStreak += 1;
    } else if (stats.lastReadDate !== today) {
      stats.currentStreak = 1;
    }

    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
  }

  stats.lastReadDate = today;

  // Add to recent sessions (keep last 10)
  const session: ReadingSession = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    wordsRead,
    timeSpent,
    avgWpm,
    completionRate,
  };

  stats.recentSessions.unshift(session);
  if (stats.recentSessions.length > 10) {
    stats.recentSessions.pop();
  }

  saveStats(stats);
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext }) => (
  <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
    <div className="flex items-center gap-2 text-gray-400">
      {icon}
      <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
  </div>
);

interface ReadingStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadingStatsModal: React.FC<ReadingStatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<ReadingStatsData>(getDefaultStats);

  useEffect(() => {
    if (isOpen) {
      setStats(loadStats());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
    >
      <div
        className="bg-[#1a1a1a] w-full max-w-2xl rounded-xl border border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#222]">
          <h2 id="stats-title" className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-green-500" size={20} />
            Reading Statistics
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
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={<BookOpen size={16} />}
              label="Words Read"
              value={stats.totalWordsRead.toLocaleString()}
            />
            <StatCard
              icon={<Clock size={16} />}
              label="Time Spent"
              value={formatTime(stats.totalTimeSpent)}
            />
            <StatCard
              icon={<Target size={16} />}
              label="Avg WPM"
              value={stats.averageWpm}
            />
            <StatCard
              icon={<Award size={16} />}
              label="Best WPM"
              value={stats.bestWpm}
            />
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500/30 rounded-full flex items-center justify-center">
                  <Calendar className="text-orange-400" size={24} />
                </div>
                <div>
                  <div className="text-xs text-orange-300 font-medium uppercase tracking-wider">Current Streak</div>
                  <div className="text-3xl font-bold text-white">{stats.currentStreak} days</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Longest streak</div>
                <div className="text-lg font-semibold text-gray-300">{stats.longestStreak} days</div>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Recent Sessions
            </h3>

            {stats.recentSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                <p>No reading sessions yet</p>
                <p className="text-xs mt-1">Start reading to track your progress!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">
                        {session.wordsRead.toLocaleString()} words
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(session.date)} • {formatTime(session.timeSpent)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-400">
                        {session.avgWpm} WPM
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(session.completionRate)}% complete
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Sessions */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-800">
            Total sessions: {stats.totalSessions}
          </div>
        </div>
      </div>
    </div>
  );
};
