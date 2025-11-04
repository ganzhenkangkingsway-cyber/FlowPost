import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { FileText, Calendar, Image as ImageIcon, Trash2, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DraftPost {
  id: string;
  caption: string;
  image_url: string | null;
  video_url: string | null;
  scheduled_date: string | null;
  platforms: string[];
  created_at: string;
  updated_at: string;
}

export function DraftPosts() {
  const [drafts, setDrafts] = useState<DraftPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDrafts();
    }
  }, [user]);

  const loadDrafts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (id: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDrafts(drafts.filter(draft => draft.id !== id));
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const editDraft = (id: string) => {
    navigate(`/dashboard/create-post?draft=${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="Draft Posts"
        description="Continue working on your saved drafts"
        icon={FileText}
        iconColor="from-amber-500 to-orange-600"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : drafts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No drafts yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Save your in-progress posts as drafts to continue later
          </p>
          <button
            onClick={() => navigate('/dashboard/create-post')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Create New Post
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {(draft.image_url || draft.video_url) && (
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                  {draft.image_url ? (
                    <img
                      src={draft.image_url}
                      alt="Draft preview"
                      className="w-full h-full object-cover"
                    />
                  ) : draft.video_url ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Video
                      </span>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-900 dark:text-white line-clamp-3 mb-3">
                    {draft.caption || 'No caption'}
                  </p>

                  {draft.platforms && draft.platforms.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {draft.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  )}

                  {draft.scheduled_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Scheduled: {formatDate(draft.scheduled_date)}</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Last updated: {formatDate(draft.updated_at)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => editDraft(draft.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this draft?')) {
                        deleteDraft(draft.id);
                      }
                    }}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
