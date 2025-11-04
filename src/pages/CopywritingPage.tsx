import { useState } from 'react';
import { CopywritingCheck } from '../components/PostSync/CopywritingCheck';
import { Sparkles, Upload, X } from 'lucide-react';

export function CopywritingPage() {
  const [caption, setCaption] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Caption Generator</h1>
            <p className="text-gray-600 dark:text-gray-400">Upload an image and generate engaging captions</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Image</h3>

          {!uploadedImage ? (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50">
                <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">Click to upload an image</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG up to 10MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-64 object-cover rounded-xl"
              />
              <button
                onClick={removeImage}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <CopywritingCheck caption={caption} onCaptionChange={setCaption} uploadedImage={uploadedImage} />

        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl border border-blue-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">AI Writing Tips</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Keep it concise:</strong> Aim for 15-40 words for maximum engagement
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Add a CTA:</strong> Include clear call-to-action words like "Try", "Get", "Learn"
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Use hashtags:</strong> Include 2-3 relevant hashtags for better reach
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Add personality:</strong> Use emojis strategically to make your post engaging
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
