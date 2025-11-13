import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, CheckCircle, XCircle } from 'lucide-react';

export function UploadTutorialVideo() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadStatus('error');
      setMessage('Please select a video file');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `flowpost-tutorial.${fileExt}`;
      const filePath = `tutorials/${fileName}`;

      // Delete old file if exists
      await supabase.storage.from('videos').remove([filePath]);

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      setUploadStatus('success');
      setMessage('Video uploaded successfully! The tutorial modal will now use your video.');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Tutorial Video
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your FlowPost Video.mp4 file
          </p>
        </div>

        <label className="block">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <div>
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Uploading...</p>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 dark:text-white font-medium mb-2">
                  Click to select video
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  MP4, WebM, or other video formats
                </p>
              </div>
            )}
          </div>
        </label>

        {uploadStatus === 'success' && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <strong>Note:</strong> After uploading, go back to the dashboard and open the video tutorial to see your uploaded video.
          </p>
        </div>
      </div>
    </div>
  );
}
