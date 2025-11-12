import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { WelcomeModal } from './WelcomeModal';
import { StepByStepTutorial } from './StepByStepTutorial';
import { VideoTutorialModal } from './VideoTutorialModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function DashboardLayout() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user || hasCheckedOnboarding) return;

    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed, onboarding_skipped')
      .eq('id', user.id)
      .maybeSingle();

    if (data && !data.onboarding_completed && !data.onboarding_skipped) {
      setShowWelcome(true);

      await supabase
        .from('profiles')
        .update({
          onboarding_skipped: true,
        })
        .eq('id', user.id);
    }
    setHasCheckedOnboarding(true);
  };

  const handleStartStepByStep = () => {
    setShowWelcome(false);
    setTimeout(() => setShowStepByStep(true), 300);
  };

  const handleStartVideo = () => {
    setShowWelcome(false);
    setTimeout(() => setShowVideo(true), 300);
  };

  const handleSkip = async () => {
    setShowWelcome(false);
    setShowStepByStep(false);
    if (user) {
      await supabase
        .from('profiles')
        .update({
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }
  };

  const handleCompleteOnboarding = async (tutorialType: 'step-by-step' | 'video') => {
    setShowStepByStep(false);
    setShowVideo(false);

    if (user) {
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          tutorial_type: tutorialType,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }
  };

  const handleRestartTutorial = () => {
    setShowStepByStep(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar onHelpClick={handleRestartTutorial} />
      <main className="ml-64">
        <Outlet />
      </main>

      <WelcomeModal
        isOpen={showWelcome}
        onStartStepByStep={handleStartStepByStep}
        onStartVideo={handleStartVideo}
        onSkip={handleSkip}
      />

      <StepByStepTutorial
        isActive={showStepByStep}
        onComplete={() => handleCompleteOnboarding('step-by-step')}
        onSkip={handleSkip}
      />

      <VideoTutorialModal
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
        onComplete={() => handleCompleteOnboarding('video')}
      />
    </div>
  );
}
