import { useState } from 'react';
import { X, Sparkles, Wand2, Loader2, RefreshCw, ChevronRight, Lightbulb, Edit3, Download } from 'lucide-react';
import { openPixlrEditor, downloadImageForPixlr } from '../../lib/pixlr';

interface AIGenerationModalProps {
  onClose: () => void;
  onGenerate: (imageUrl: string) => void;
}

const STYLE_PRESETS = [
  { id: 'modern', label: 'Modern', emoji: '✨' },
  { id: 'vintage', label: 'Vintage', emoji: '📷' },
  { id: 'minimalist', label: 'Minimalist', emoji: '⚪' },
  { id: 'bold', label: 'Bold', emoji: '💥' },
  { id: 'professional', label: 'Professional', emoji: '💼' },
  { id: 'artistic', label: 'Artistic', emoji: '🎨' },
];

const EXAMPLE_PROMPTS = [
  'A vibrant sunset over mountains with an inspirational quote overlay',
  'Modern workspace with laptop, coffee, and motivational text in minimalist style',
  'Abstract geometric pattern with bold colors and clean typography',
  'Professional business team celebrating success in modern office',
  'Peaceful morning coffee scene with warm lighting and cozy atmosphere',
  'Dynamic fitness motivation poster with energetic colors and action',
];

export function AIGenerationModal({ onClose, onGenerate }: AIGenerationModalProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(true);
  const [showPixlrInfo, setShowPixlrInfo] = useState(false);

  const handleGenerate = async () => {
    if (prompt.trim().length < 10) {
      alert('Please provide a more detailed description (at least 10 characters)');
      return;
    }

    if (!selectedStyle) {
      alert('Please select a style preset');
      return;
    }

    setIsGenerating(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Call the edge function
      const response = await fetch(`${supabaseUrl}/functions/v1/pixlr-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to generate image: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response from API:', data);

      if (data.image_url || data.url || data.output_url || data.result) {
        const imageUrl = data.image_url || data.url || data.output_url || data.result;
        setGeneratedImage(imageUrl);
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('No image URL returned from API. Please check console for details.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image. Please try again.';
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedImage(null);
    handleGenerate();
  };

  const handleUseImage = () => {
    if (generatedImage) {
      onGenerate(generatedImage);
    }
  };

  const handleEditInPixlr = async () => {
    if (!generatedImage) return;

    setShowPixlrInfo(true);

    // Download the image for user to edit in Pixlr
    downloadImageForPixlr(generatedImage, `ai-generated-${Date.now()}.jpg`);

    // Open Pixlr editor
    setTimeout(() => {
      openPixlrEditor({ image: generatedImage, title: 'Edit Generated Image' });
    }, 500);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  const charCount = prompt.length;
  const isValidLength = charCount >= 10 && charCount <= 500;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generate with AI</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Describe your vision in detail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!generatedImage ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Describe your image
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create... (e.g., 'A vibrant sunset over mountains with an inspirational quote overlay')"
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  disabled={isGenerating}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    isValidLength
                      ? 'text-green-600 dark:text-green-400'
                      : charCount > 500
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {charCount}/500 characters {!isValidLength && charCount < 10 && '(minimum 10)'}
                  </span>
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <Lightbulb className="w-3 h-3" />
                    {showTips ? 'Hide tips' : 'Show tips'}
                  </button>
                </div>
              </div>

              {showTips && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Tips for better results
                  </h4>
                  <ul className="text-xs text-purple-800 dark:text-purple-400 space-y-1">
                    <li>• Be specific about style, colors, and mood</li>
                    <li>• Mention any text or quotes you want included</li>
                    <li>• Describe the composition and layout</li>
                    <li>• Include details about lighting and atmosphere</li>
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Style preset <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLE_PRESETS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id === selectedStyle ? null : style.id)}
                      disabled={isGenerating}
                      className={`px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedStyle === style.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 text-gray-700 dark:text-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className="mr-1.5">{style.emoji}</span>
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Example prompts
                </label>
                <div className="space-y-2">
                  {EXAMPLE_PROMPTS.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      disabled={isGenerating}
                      className="w-full text-left px-4 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between group"
                    >
                      <span className="flex-1">{example}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 dark:border-purple-800">
                <img
                  src={generatedImage}
                  alt="AI Generated"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Generated
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Your prompt:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{prompt}"</p>
              </div>

              {showPixlrInfo && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Editing in Pixlr
                  </h4>
                  <div className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                    <p>• Your image has been downloaded and Pixlr editor opened</p>
                    <p>• Upload the downloaded image in Pixlr to edit it</p>
                    <p>• When done, save/download from Pixlr</p>
                    <p>• Then upload the edited image back to your post</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <Loader2 className="absolute -top-2 -right-2 w-8 h-8 text-purple-500 animate-spin" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Generating your image...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This may take a few seconds</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          {generatedImage ? (
            <>
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
              <button
                onClick={handleEditInPixlr}
                disabled={isGenerating}
                className="flex-1 px-4 py-2.5 border-2 border-blue-500 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit in Pixlr
              </button>
              <button
                onClick={handleUseImage}
                disabled={isGenerating}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Use This Image
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !isValidLength || !selectedStyle}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Image
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
