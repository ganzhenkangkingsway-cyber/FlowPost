import { useState, useEffect } from 'react';
import { Calendar, Clock, Send, CheckCircle2, Save } from 'lucide-react';
import { getPlatformIcon } from '../../config/platformIcons';
import { getConnectedAccounts } from '../../services/connectedAccounts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SchedulePostProps {
  scheduledDate: string;
  onScheduleChange: (date: string) => void;
  uploadedImage: string | null;
  caption: string;
  draftId?: string | null;
  onDraftSaved?: (id: string) => void;
}

interface SelectedPlatform {
  name: string;
  selected: boolean;
}

export function SchedulePost({ scheduledDate, onScheduleChange, uploadedImage, caption, draftId, onDraftSaved }: SchedulePostProps) {
  const { user } = useAuth();
  const [selectedTime, setSelectedTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [platforms, setPlatforms] = useState<SelectedPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    loadConnectedPlatforms();
  }, []);

  const loadConnectedPlatforms = async () => {
    try {
      setLoading(true);
      const connectedAccounts = await getConnectedAccounts();

      const connectedPlatforms = connectedAccounts.map(account => ({
        name: account.platform,
        selected: false,
      }));

      setPlatforms(connectedPlatforms);
    } catch (error) {
      console.error('Error loading connected platforms:', error);
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platformName: string) => {
    setPlatforms(platforms.map(p =>
      p.name === platformName ? { ...p, selected: !p.selected } : p
    ));
  };

  const handleSchedule = async () => {
    if (!user || !scheduledDate || !selectedTime) return;

    const selectedPlatformsList = platforms.filter(p => p.selected).map(p => p.name);

    if (selectedPlatformsList.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    setScheduling(true);

    try {
      // Ensure user profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw new Error('Failed to create user profile. Please try again.');
        }
      }

      // Get connected accounts to map platform to username
      const connectedAccounts = await getConnectedAccounts();
      const platformAccounts: { [key: string]: string } = {};

      selectedPlatformsList.forEach(platform => {
        const account = connectedAccounts.find(acc => acc.platform === platform);
        if (account) {
          platformAccounts[platform] = account.platform_username;
        }
      });

      // Determine if uploaded media is video or image
      const isVideo = uploadedImage?.startsWith('blob:') || false;
      const mediaType = uploadedImage ? (isVideo ? 'video' : 'image') : null;

      // Save to Supabase
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          caption: caption,
          image_url: isVideo ? null : uploadedImage,
          video_url: isVideo ? uploadedImage : null,
          media_type: mediaType,
          scheduled_date: scheduledDate,
          scheduled_time: selectedTime,
          platforms: selectedPlatformsList,
          platform_accounts: platformAccounts,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;

      // Also send to webhook for external processing
      const fullDateTime = `${scheduledDate}T${selectedTime}`;
      const postData = {
        timestamp: new Date().toISOString(),
        post: {
          caption: caption,
          image: uploadedImage,
          wordCount: caption.trim().split(/\s+/).filter(w => w).length,
          characterCount: caption.length,
        },
        schedule: {
          date: scheduledDate,
          time: selectedTime,
          fullDateTime: fullDateTime,
          formattedDateTime: new Date(fullDateTime).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }),
        },
        platforms: {
          selected: selectedPlatformsList,
          count: selectedPlatformsList.length,
        },
      };

      try {
        await fetch('https://zhenkang.app.n8n.cloud/webhook/copywrite-check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });
      } catch (webhookError) {
        console.error('Webhook error (non-critical):', webhookError);
      }

      setIsScheduled(true);
      onScheduleChange(`${scheduledDate}T${selectedTime}`);

      setTimeout(() => {
        setIsScheduled(false);
      }, 3000);

    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('Failed to schedule post. Please try again.');
    } finally {
      setScheduling(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) return;

    setSavingDraft(true);

    try {
      // Ensure user profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw new Error('Failed to create user profile. Please try again.');
        }
      }

      const selectedPlatformsList = platforms.filter(p => p.selected).map(p => p.name);

      // Get connected accounts to map platform to username
      const connectedAccounts = await getConnectedAccounts();
      const platformAccounts: { [key: string]: string } = {};

      selectedPlatformsList.forEach(platform => {
        const account = connectedAccounts.find(acc => acc.platform === platform);
        if (account) {
          platformAccounts[platform] = account.platform_username;
        }
      });

      // Determine if uploaded media is video or image
      const isVideo = uploadedImage?.startsWith('blob:') || false;
      const mediaType = uploadedImage ? (isVideo ? 'video' : 'image') : null;

      const postData = {
        user_id: user.id,
        caption: caption,
        image_url: isVideo ? null : uploadedImage,
        video_url: isVideo ? uploadedImage : null,
        media_type: mediaType,
        scheduled_date: scheduledDate || null,
        scheduled_time: selectedTime || null,
        platforms: selectedPlatformsList,
        platform_accounts: platformAccounts,
        status: 'draft',
      };

      let savedDraftId: string;

      if (draftId) {
        // Update existing draft
        const { data, error } = await supabase
          .from('posts')
          .update({ ...postData, updated_at: new Date().toISOString() })
          .eq('id', draftId)
          .select()
          .single();

        if (error) throw error;
        savedDraftId = data.id;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('posts')
          .insert(postData)
          .select()
          .single();

        if (error) throw error;
        savedDraftId = data.id;
      }

      setDraftSaved(true);
      if (onDraftSaved) {
        onDraftSaved(savedDraftId);
      }

      setTimeout(() => {
        setDraftSaved(false);
      }, 3000);

    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setSavingDraft(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const selectedPlatformCount = platforms.filter(p => p.selected).length;
  const canSchedule = uploadedImage && caption && scheduledDate && selectedTime && selectedPlatformCount > 0;
  const canSaveDraft = uploadedImage || caption;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-fit sticky top-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Post</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Choose when and where to publish</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Platforms ({selectedPlatformCount})
          </label>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : platforms.length === 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                No connected platforms found
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Please connect your social media accounts in Settings first
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {platforms.map((platform) => {
                const iconConfig = getPlatformIcon(platform.name);
                return (
                  <button
                    key={platform.name}
                    onClick={() => togglePlatform(platform.name)}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      platform.selected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-10 h-10 ${iconConfig.bgColor} rounded-lg flex items-center justify-center overflow-hidden mx-auto`}>
                      <img
                        src={iconConfig.icon}
                        alt={platform.name}
                        className={`w-6 h-6 object-contain ${iconConfig.iconClass}`}
                      />
                    </div>
                    {platform.selected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute top-2 right-2" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date
          </label>
          <input
            type="date"
            value={scheduledDate}
            min={getMinDate()}
            onChange={(e) => onScheduleChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Time
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        {/* Preview Summary */}
        {uploadedImage && caption && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Post Preview
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                {uploadedImage.startsWith('blob:') ? (
                  <video
                    src={uploadedImage}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    muted
                  />
                ) : (
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{caption}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Publishing to:</span>
                <div className="flex gap-1">
                  {platforms.filter(p => p.selected).map((platform) => {
                    const iconConfig = getPlatformIcon(platform.name);
                    return (
                      <div key={platform.name} className={`w-6 h-6 ${iconConfig.bgColor} rounded flex items-center justify-center overflow-hidden`}>
                        <img
                          src={iconConfig.icon}
                          alt={platform.name}
                          className={`w-full h-full object-cover ${iconConfig.iconClass}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={!canSaveDraft || draftSaved || savingDraft}
            className={`flex-1 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              draftSaved
                ? 'bg-blue-600 text-white'
                : canSaveDraft && !savingDraft
                ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            {draftSaved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Draft Saved!
              </>
            ) : savingDraft ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Draft
              </>
            )}
          </button>

          <button
            onClick={handleSchedule}
            disabled={!canSchedule || isScheduled || scheduling}
            className={`flex-1 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isScheduled
                ? 'bg-green-600 text-white'
                : canSchedule && !scheduling
                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isScheduled ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Post Scheduled!
              </>
            ) : scheduling ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Scheduling...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Schedule Post
              </>
            )}
          </button>
        </div>

        {!canSchedule && (
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {!uploadedImage && '📸 Upload an image • '}
              {!caption && '✍️ Write a caption • '}
              {!scheduledDate && '📅 Pick a date • '}
              {!selectedTime && '🕐 Set a time • '}
              {selectedPlatformCount === 0 && '🌐 Select platforms'}
            </p>
          </div>
        )}

        {scheduledDate && selectedTime && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <p className="text-sm text-green-800 dark:text-green-300">
              <span className="font-semibold">Scheduled for:</span> {new Date(`${scheduledDate}T${selectedTime}`).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
