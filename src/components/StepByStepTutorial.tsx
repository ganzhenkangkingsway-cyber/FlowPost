import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Create Your First Post',
    description: 'Click here to start creating engaging content for your social media platforms. You can schedule posts, add media, and customize content for each platform.',
    target: '[data-tutorial="create-post"]',
    position: 'bottom',
  },
  {
    title: 'View Your Calendar',
    description: 'See all your scheduled posts in a beautiful calendar view. Easily manage and reorganize your content strategy at a glance.',
    target: '[data-tutorial="calendar"]',
    position: 'right',
  },
  {
    title: 'Check Analytics',
    description: 'Monitor your social media performance with detailed analytics. Track engagement, reach, and growth across all platforms.',
    target: '[data-tutorial="analytics"]',
    position: 'right',
  },
  {
    title: 'Manage Your Team',
    description: 'Collaborate with your team members. Invite colleagues, assign roles, and work together seamlessly.',
    target: '[data-tutorial="team"]',
    position: 'right',
  },
  {
    title: 'Customize Settings',
    description: 'Personalize your experience by adjusting settings, connecting social accounts, and managing your subscription.',
    target: '[data-tutorial="settings"]',
    position: 'right',
  },
];

interface StepByStepTutorialProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function StepByStepTutorial({ isActive, onComplete, onSkip }: StepByStepTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isActive && currentStep < tutorialSteps.length) {
      const step = tutorialSteps[currentStep];
      const element = document.querySelector(step.target);

      if (element) {
        const rect = element.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2;
            break;
          case 'top':
            top = rect.top - 20;
            left = rect.left + rect.width / 2;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 20;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 20;
            break;
        }

        setTooltipPosition({ top, left });

        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, isActive]);

  if (!isActive) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const targetElement = document.querySelector(step.target);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"></div>

      {targetElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 8,
            left: targetElement.getBoundingClientRect().left - 8,
            width: targetElement.getBoundingClientRect().width + 16,
            height: targetElement.getBoundingClientRect().height + 16,
          }}
        >
          <div className="absolute inset-0 rounded-xl border-4 border-blue-500 shadow-2xl animate-pulse bg-white/5"></div>
        </div>
      )}

      <div
        className="fixed z-50 max-w-md animate-fade-in-up"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: step.position === 'bottom' || step.position === 'top'
            ? 'translateX(-50%)'
            : step.position === 'right'
            ? 'translateY(-50%)'
            : 'translate(-100%, -50%)',
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-blue-500 dark:border-blue-400">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {currentStep + 1}
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
            </div>
            <button
              onClick={onSkip}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {step.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Skip Tutorial
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {isLastStep ? (
                  <>
                    Get Started
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-1">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-500'
                    : index < currentStep
                    ? 'bg-blue-300 dark:bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
