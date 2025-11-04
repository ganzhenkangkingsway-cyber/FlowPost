import { useEffect, useRef, useState } from 'react';
import { Canvas, IText, Rect, Circle as FabricCircle, FabricImage } from 'fabric';
import {
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  Download,
  Trash2,
  ChevronLeft,
  Palette,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Plus,
} from 'lucide-react';

interface DesignPosterProps {
  onExport: (imageUrl: string) => void;
  onBack: () => void;
}

interface Template {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  thumbnail: string;
}

const TEMPLATES: Template[] = [
  { id: 'instagram-square', name: 'Instagram Post', platform: 'Instagram', width: 1080, height: 1080, thumbnail: '#E4405F' },
  { id: 'instagram-story', name: 'Instagram Story', platform: 'Instagram', width: 1080, height: 1920, thumbnail: '#E4405F' },
  { id: 'linkedin-post', name: 'LinkedIn Post', platform: 'LinkedIn', width: 1200, height: 627, thumbnail: '#0077B5' },
  { id: 'twitter-post', name: 'X Post', platform: 'X', width: 1200, height: 675, thumbnail: '#000000' },
  { id: 'facebook-post', name: 'Facebook Post', platform: 'Facebook', width: 1200, height: 630, thumbnail: '#1877F2' },
];

export function DesignPoster({ onExport, onBack }: DesignPosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [activeObject, setActiveObject] = useState<any>(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(32);
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 800,
      backgroundColor: backgroundColor,
    });

    fabricCanvasRef.current = canvas;

    canvas.on('selection:created', (e: any) => {
      const selected = e.selected?.[0] || null;
      setActiveObject(selected);
      updateToolbarFromSelection(selected);
    });

    canvas.on('selection:updated', (e: any) => {
      const selected = e.selected?.[0] || null;
      setActiveObject(selected);
      updateToolbarFromSelection(selected);
    });

    canvas.on('selection:cleared', () => {
      setActiveObject(null);
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.set('backgroundColor', backgroundColor);
      fabricCanvasRef.current.renderAll();
    }
  }, [backgroundColor]);

  const updateToolbarFromSelection = (obj: any) => {
    if (!obj) return;

    if (obj.type === 'i-text' || obj.type === 'text') {
      setTextColor(obj.fill as string || '#000000');
      setFontSize(obj.fontSize || 32);
      setFontWeight(obj.fontWeight === 'bold' ? 'bold' : 'normal');
      setFontStyle(obj.fontStyle === 'italic' ? 'italic' : 'normal');
      setTextAlign(obj.textAlign as 'left' | 'center' | 'right' || 'left');
    }
  };

  const applyTemplate = (template: Template) => {
    setSelectedTemplate(template);

    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const scale = Math.min(800 / template.width, 800 / template.height);
      canvas.setDimensions({
        width: template.width * scale,
        height: template.height * scale,
      });
      canvas.setZoom(scale);
    }
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;

    const text = new IText('Double click to edit', {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fill: textColor,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      textAlign: textAlign,
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  const addShape = (type: 'rect' | 'circle') => {
    if (!fabricCanvasRef.current) return;

    let shape: any;

    if (type === 'rect') {
      shape = new Rect({
        left: 150,
        top: 150,
        width: 200,
        height: 200,
        fill: '#3B82F6',
        stroke: '#1E40AF',
        strokeWidth: 2,
      });
    } else {
      shape = new FabricCircle({
        left: 150,
        top: 150,
        radius: 100,
        fill: '#3B82F6',
        stroke: '#1E40AF',
        strokeWidth: 2,
      });
    }

    fabricCanvasRef.current.add(shape);
    fabricCanvasRef.current.setActiveObject(shape);
    fabricCanvasRef.current.renderAll();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;

      FabricImage.fromURL(imgUrl).then((img) => {
        if (!fabricCanvasRef.current) return;

        const canvas = fabricCanvasRef.current;
        const scale = Math.min(
          (canvas.width! * 0.5) / (img.width || 1),
          (canvas.height! * 0.5) / (img.height || 1)
        );

        img.scale(scale);
        img.set({
          left: 100,
          top: 100,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current || !activeObject) return;

    fabricCanvasRef.current.remove(activeObject);
    fabricCanvasRef.current.renderAll();
    setActiveObject(null);
  };

  const updateTextProperties = () => {
    if (!fabricCanvasRef.current || !activeObject) return;

    if (activeObject.type === 'i-text' || activeObject.type === 'text') {
      activeObject.set({
        fill: textColor,
        fontSize: fontSize,
        fontWeight: fontWeight,
        fontStyle: fontStyle,
        textAlign: textAlign,
      });
      fabricCanvasRef.current.renderAll();
    }
  };

  useEffect(() => {
    updateTextProperties();
  }, [textColor, fontSize, fontWeight, fontStyle, textAlign]);

  const exportCanvas = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const zoom = canvas.getZoom();

    canvas.setZoom(1);
    canvas.setDimensions({
      width: selectedTemplate.width,
      height: selectedTemplate.height,
    });

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    const scale = Math.min(800 / selectedTemplate.width, 800 / selectedTemplate.height);
    canvas.setZoom(scale);
    canvas.setDimensions({
      width: selectedTemplate.width * scale,
      height: selectedTemplate.height * scale,
    });

    onExport(dataURL);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Design Your Poster</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create stunning visuals with drag-and-drop tools
              </p>
            </div>
          </div>
          <button
            onClick={exportCanvas}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export & Use
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 p-6">
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center">
              <canvas ref={canvasRef} className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={addText}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
              >
                <Type className="w-4 h-4" />
                <span className="text-sm font-medium">Add Text</span>
              </button>

              <button
                onClick={() => addShape('rect')}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
              >
                <Square className="w-4 h-4" />
                <span className="text-sm font-medium">Rectangle</span>
              </button>

              <button
                onClick={() => addShape('circle')}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
              >
                <Circle className="w-4 h-4" />
                <span className="text-sm font-medium">Circle</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Add Image</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="flex-1" />

              <button
                onClick={deleteSelected}
                disabled={!activeObject}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>

          {activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text') && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Text Properties</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size
                  </label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="12"
                    max="200"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    fontWeight === 'bold'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    fontStyle === 'italic'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setTextAlign('left')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    textAlign === 'left'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setTextAlign('center')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    textAlign === 'center'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setTextAlign('right')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    textAlign === 'right'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Canvas</h4>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Templates</h4>
            <div className="space-y-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    selectedTemplate.id === template.id
                      ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: template.thumbnail }}
                  >
                    {template.platform.substring(0, 2)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {template.width} × {template.height}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
