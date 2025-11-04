import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Edit3 } from 'lucide-react';

interface CopywritingCheckProps {
  caption: string;
  onCaptionChange: (caption: string) => void;
  uploadedImage: string | null;
}

interface GeneratedCaption {
  text: string;
  hashtags: string[];
  tone: string;
}

type CaptionMode = 'ai' | 'manual';

export function CopywritingCheck({ caption, onCaptionChange, uploadedImage }: CopywritingCheckProps) {
  const [mode, setMode] = useState<CaptionMode>('ai');
  const [generatedCaption, setGeneratedCaption] = useState<GeneratedCaption | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isUsed, setIsUsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastImageProcessed, setLastImageProcessed] = useState<string | null>(null);

  // Reset caption generation state when image changes
  useEffect(() => {
    if (uploadedImage && uploadedImage !== lastImageProcessed) {
      setIsUsed(false);
      setError(null);
    }
  }, [uploadedImage, lastImageProcessed]);

  const generateCaption = async () => {
    if (!uploadedImage) return;

    setIsGenerating(true);
    setError(null);
    setIsUsed(false);
    setLastImageProcessed(uploadedImage);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-caption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ imageData: uploadedImage }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate caption');
      }

      const caption = await response.json();
      setGeneratedCaption(caption);
    } catch (err) {
      console.error('Error generating caption:', err);
      setError('Failed to generate caption. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, hashtags: string[]) => {
    const fullCaption = `${text}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullCaption);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const useCaption = (text: string, hashtags: string[]) => {
    const fullCaption = `${text}\n\n${hashtags.join(' ')}`;
    onCaptionChange(fullCaption);
    setIsUsed(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
            {mode === 'ai' ? (
              <Sparkles className="w-5 h-5 text-white" />
            ) : (
              <Edit3 className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'ai' ? 'AI Caption Generator' : 'Write Your Caption'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {mode === 'ai' ? 'Generate captions based on your image or video' : 'Create your own custom caption'}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex gap-1">
        <button
          onClick={() => setMode('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium text-sm transition-all ${
            mode === 'ai'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Generate
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium text-sm transition-all ${
            mode === 'manual'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Write Manually
        </button>
      </div>

      <div className="space-y-4">
        {mode === 'manual' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="Write your post caption here... Make it engaging!"
              className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {caption.length} characters • {caption.trim().split(/\s+/).filter(w => w).length} words
              </span>
            </div>
          </div>
        ) : !uploadedImage || uploadedImage.trim() === '' ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Sparkles className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload an image or video above to generate captions
            </p>
          </div>
        ) : (
          <>
            {uploadedImage && uploadedImage !== lastImageProcessed && !isGenerating && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  New image detected! Click below to generate a caption
                </p>
              </div>
            )}
            <button
              onClick={generateCaption}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {uploadedImage?.startsWith('blob:') ? 'Analyzing Video...' : 'Analyzing Image...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {lastImageProcessed && lastImageProcessed === uploadedImage ? 'Regenerate Caption' : 'Generate Caption from Image'}
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {generatedCaption && (
              <div className="space-y-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Generated Caption</h4>
                  <button
                    onClick={generateCaption}
                    disabled={isGenerating}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </div>

                <div className={`rounded-lg p-4 border-2 transition-all ${
                  isUsed
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500 shadow-lg'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        isUsed
                          ? 'bg-blue-600 dark:bg-blue-500 text-white'
                          : 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {generatedCaption.tone}
                      </span>
                      {isUsed && (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                          <Check className="w-3 h-3" />
                          Selected
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedCaption.text, generatedCaption.hashtags)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      title="Copy to clipboard"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className={`text-sm mb-3 ${
                    isUsed
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {generatedCaption.text}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {generatedCaption.hashtags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={`text-xs px-2 py-1 rounded ${
                          isUsed
                            ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/40 font-medium'
                            : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => useCaption(generatedCaption.text, generatedCaption.hashtags)}
                    className={`w-full text-sm font-medium py-2 rounded-lg transition-all ${
                      isUsed
                        ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md cursor-default'
                        : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                    disabled={isUsed}
                  >
                    {isUsed ? 'Currently Selected' : 'Use This Caption'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
