import { useState } from 'react';
import { PosterUpload } from '../components/PostSync/PosterUpload';
import { CopywritingCheck } from '../components/PostSync/CopywritingCheck';
import { SchedulePost } from '../components/PostSync/SchedulePost';

export function CreatePost() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [scheduledDate, setScheduledDate] = useState<string>('');

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create Your Multi-Platform Post
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
          />
          <CopywritingCheck
            caption={caption}
            onCaptionChange={setCaption}
            uploadedImage={uploadedImage}
          />
        </div>

        <div className="space-y-6">
          <SchedulePost
            scheduledDate={scheduledDate}
            onScheduleChange={setScheduledDate}
            uploadedImage={uploadedImage}
            caption={caption}
          />
        </div>
      </div>
    </div>
  );
}
