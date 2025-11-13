import { useState, useEffect } from 'react';
import { X, Play, RotateCcw, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function VideoTutorialModal({ isOpen, onClose, onComplete }: VideoTutorialModalProps) {
  const [hasEnded, setHasEnded] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadVideoUrl();
    }
  }, [isOpen]);

  const loadVideoUrl = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.storage
        .from('videos')
        .getPublicUrl('tutorials/flowpost-tutorial.mp4');

      if (data?.publicUrl) {
        // Check if video exists by trying to fetch it
        const response = await fetch(data.publicUrl, { method: 'HEAD' });
        if (response.ok) {
          setVideoUrl(data.publicUrl);
          setVideoError(false);
        } else {
          setVideoError(true);
        }
      } else {
        setVideoError(true);
      }
    } catch (error) {
      console.error('Error loading video:', error);
      setVideoError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleReplay = () => {
    setHasEnded(false);
    setVideoKey(prev => prev + 1);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoError(false);
      setVideoKey(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full animate-fade-in-up border border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 bg-white/90 dark:bg-gray-800/90"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Video Tutorial
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learn the basics in just 2 minutes
              </p>
            </div>
          </div>

          <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl aspect-video">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-400">Loading video...</p>
              </div>
            ) : videoError ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                <Upload className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Tutorial Video Found</h3>
                <p className="text-gray-400 mb-6">Please upload your FlowPost Video.mp4 file</p>
                <a
                  href="/upload-video"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Go to Upload Page
                </a>
                <label className="mt-4 px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  Or Select File Now
                </label>
              </div>
            ) : (
              <video
                key={videoKey}
                className="w-full h-full"
                controls
                autoPlay
                onEnded={() => setHasEnded(true)}
                onError={() => setVideoError(true)}
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'%3E%3Crect fill='%231f2937' width='1280' height='720'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='48' fill='%239ca3af'%3EFlowPost Tutorial%3C/text%3E%3C/svg%3E"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {hasEnded && !videoError && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tutorial Complete!</h3>
                  <p className="text-gray-300 mb-6">You're ready to start using PostSync</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleReplay}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Replay
            </button>

            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Start Using PostSync
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Tip:</strong> You can access this tutorial anytime from the Help menu in the navigation bar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
