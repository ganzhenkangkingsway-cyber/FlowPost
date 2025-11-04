import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PosterUpload } from '../components/PostSync/PosterUpload';
import { CopywritingCheck } from '../components/PostSync/CopywritingCheck';
import { SchedulePost } from '../components/PostSync/SchedulePost';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function CreatePost() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [isDesigning, setIsDesigning] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const draftParam = searchParams.get('draft');
    if (draftParam && user) {
      loadDraft(draftParam);
    }
  }, [searchParams, user]);

  const loadDraft = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('status', 'draft')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDraftId(data.id);
        setUploadedImage(data.image_url || data.video_url || null);
        setCaption(data.caption || '');
        setScheduledDate(data.scheduled_date?.split('T')[0] || '');
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      alert('Failed to load draft');
    } finally {
      setLoading(false);
    }
  };

  const handleDraftSaved = (id: string) => {
    setDraftId(id);
    // Update URL to include draft ID without reloading
    navigate(`/dashboard/create-post?draft=${id}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading draft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen gradient-bg-animated">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {draftId ? 'Edit Draft Post' : 'Create Your Multi-Platform Post'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your poster, optimize your copy, and schedule across all platforms
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <PosterUpload
            uploadedImage={uploadedImage}
            onImageUpload={setUploadedImage}
            onDesignModeChange={setIsDesigning}
          />
          <CopywritingCheck
            caption={caption}
            onCaptionChange={setCaption}
            uploadedImage={uploadedImage}
            isDesigning={isDesigning}
          />
        </div>

        <div className="space-y-6">
          <SchedulePost
            scheduledDate={scheduledDate}
            onScheduleChange={setScheduledDate}
            uploadedImage={uploadedImage}
            caption={caption}
            draftId={draftId}
            onDraftSaved={handleDraftSaved}
          />
        </div>
      </div>
    </div>
  );
}
