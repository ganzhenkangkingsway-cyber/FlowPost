import { X, BookOpen, Video } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onStartStepByStep: () => void;
  onStartVideo: () => void;
  onSkip: () => void;
}

export function WelcomeModal({ isOpen, onStartStepByStep, onStartVideo, onSkip }: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onSkip}></div>

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-fade-in-up border border-gray-200 dark:border-gray-700">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl">👋</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Welcome to PostSync!
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-center mb-8 text-lg">
            We're excited to have you here! Would you like a quick tutorial to help you get started?
          </p>

          <div className="space-y-4 mb-6">
            <button
              onClick={onStartStepByStep}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <BookOpen className="w-5 h-5" />
              <span>Step-by-Step Tutorial</span>
            </button>

            <button
              onClick={onStartVideo}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white rounded-xl font-semibold transition-all hover:shadow-md transform hover:scale-[1.02]"
            >
              <Video className="w-5 h-5" />
              <span>Watch Video Tutorial</span>
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
