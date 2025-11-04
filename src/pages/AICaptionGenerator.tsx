import { useState, useRef } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Sparkles, Upload, Pen, Loader2 } from 'lucide-react';

export function AICaptionGenerator() {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualCaption, setManualCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateCaptions = async () => {
    if (!uploadedImage) return;

    setIsGenerating(true);
    setGeneratedCaptions([]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockCaptions = [
        "Transform your social media game with stunning visuals that captivate! 🎨✨ #DesignInspiration #CreativeContent",
        "Every great post starts with a powerful image. Make yours count! 💫 #SocialMediaMarketing #ContentCreation",
        "Elevate your brand with eye-catching designs that tell your story. Ready to stand out? 🚀 #BrandIdentity #DigitalMarketing"
      ];

      setGeneratedCaptions(mockCaptions);
    } catch (error) {
      console.error('Error generating captions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const writingTips = [
    {
      title: 'Keep it concise:',
      description: 'Aim for 15-40 words for maximum engagement'
    },
    {
      title: 'Add a CTA:',
      description: 'Include clear call-to-action words like "Try", "Get", "Learn"'
    },
    {
      title: 'Use hashtags:',
      description: 'Include 2-3 relevant hashtags for better reach'
    },
    {
      title: 'Add personality:',
      description: 'Use emojis strategically to make your post engaging'
    }
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="AI Caption Generator"
        description="Upload an image and generate engaging captions"
        icon={Sparkles}
        iconColor="from-blue-500 to-blue-600"
      />

      <div className="space-y-6 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Image</h3>

          {!uploadedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
            >
              <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-900 dark:text-white font-medium mb-1">Click to upload an image</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">PNG, JPG up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full max-h-96 object-contain rounded-xl border border-gray-200 dark:border-gray-600"
              />
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setGeneratedCaptions([]);
                }}
                className="absolute top-4 right-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Caption Generator</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate captions based on your image or video</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'ai'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-500 dark:border-blue-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Generate
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'manual'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-500 dark:border-blue-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-transparent'
              }`}
            >
              <Pen className="w-4 h-4" />
              Write Manually
            </button>
          </div>

          {activeTab === 'ai' ? (
            <div className="space-y-6">
              {!uploadedImage ? (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                  <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Upload an image or video above to generate captions</p>
                </div>
              ) : (
                <>
                  {generatedCaptions.length === 0 && !isGenerating && (
                    <button
                      onClick={handleGenerateCaptions}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Generate AI Captions
                    </button>
                  )}

                  {isGenerating && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                      <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-900 dark:text-white font-medium">Generating creative captions...</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This may take a few seconds</p>
                    </div>
                  )}

                  {generatedCaptions.length > 0 && (
                    <div className="space-y-3">
                      {generatedCaptions.map((caption, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer group"
                        >
                          <p className="text-gray-900 dark:text-white mb-3">{caption}</p>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                              Use This Caption
                            </button>
                            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handleGenerateCaptions}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-medium rounded-xl transition-all"
                      >
                        Generate More Variations
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={manualCaption}
                onChange={(e) => setManualCaption(e.target.value)}
                placeholder="Write your caption here..."
                className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{manualCaption.length} characters</p>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                  Save Caption
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Writing Tips</h3>
          <div className="space-y-3">
            {writingTips.map((tip, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{tip.title}</span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">{tip.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
