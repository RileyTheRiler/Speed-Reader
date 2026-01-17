import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Play, Settings, Zap, BookOpen, Keyboard, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to Hypersonic Reader',
    description: 'Speed read any text with scientifically-backed techniques. This quick tutorial will show you the key features.',
    icon: <Zap className="text-yellow-400" size={32} />,
    tip: 'You can skip this tutorial anytime and access it later from Settings.',
  },
  {
    title: 'Import Your Text',
    description: 'Paste text directly, or drag and drop PDF, EPUB, or text files. The reader supports all common document formats.',
    icon: <BookOpen className="text-blue-400" size={32} />,
    tip: 'Pro tip: You can also use Ctrl+V to quickly paste text from your clipboard.',
  },
  {
    title: 'Reading Modes',
    description: 'Choose between RSVP (Rapid Serial Visual Presentation) for maximum speed, or Highlighter mode for a more traditional reading experience with a moving guide.',
    icon: <Play className="text-green-400" size={32} />,
    tip: 'RSVP mode uses the Optimal Recognition Point (ORP) to help your eyes focus on the right spot.',
  },
  {
    title: 'Customize Your Experience',
    description: 'Adjust reading speed (WPM), font size, colors, and enable features like Bionic Reading, Smart Chunking, or Peripheral Training.',
    icon: <Settings className="text-purple-400" size={32} />,
    tip: 'Start with a comfortable speed (200-300 WPM) and gradually increase as you improve.',
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Use Space to play/pause, arrow keys to navigate and adjust speed. Press ? anytime to see all shortcuts.',
    icon: <Keyboard className="text-orange-400" size={32} />,
    tip: 'Shift+Arrow keys let you jump between sentences quickly.',
  },
  {
    title: 'AI Summary',
    description: 'Get an AI-powered summary of your text before or after reading. Perfect for quick comprehension checks.',
    icon: <Sparkles className="text-pink-400" size={32} />,
    tip: 'You\'ll need a Google AI API key to use this feature.',
  },
];

const TUTORIAL_SEEN_KEY = 'hypersonic-tutorial-seen';

interface OnboardingTutorialProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete, forceShow = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      setCurrentStep(0);
      return;
    }

    const hasSeenTutorial = localStorage.getItem(TUTORIAL_SEEN_KEY);
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, [forceShow]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <span className="text-xs text-gray-500 font-medium">
            Step {currentStep + 1} of {tutorialSteps.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            Skip tutorial
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-2xl flex items-center justify-center">
            {step.icon}
          </div>

          <div className="space-y-3">
            <h2 id="tutorial-title" className="text-xl font-bold text-white">
              {step.title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>

          {step.tip && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-300">
                <span className="font-semibold">Tip:</span> {step.tip}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800 bg-[#1a1a1a]">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={clsx(
              "flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-colors",
              currentStep === 0
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            )}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {/* Step Indicators */}
          <div className="flex items-center gap-1.5">
            {tutorialSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={clsx(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentStep
                    ? "bg-blue-500 w-4"
                    : idx < currentStep
                    ? "bg-gray-500"
                    : "bg-gray-700"
                )}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isLastStep ? 'Get Started' : 'Next'}
            {!isLastStep && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Export function to reset tutorial (for testing or re-showing)
export const resetTutorial = () => {
  localStorage.removeItem(TUTORIAL_SEEN_KEY);
};
