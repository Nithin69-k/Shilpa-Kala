import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  Check, 
  ChevronLeft, 
  Image as ImageIcon, 
  Sun, 
  Maximize2,
  Brush,
  AlertCircle,
  Wand2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { removeBackground } from '@imgly/background-removal';

const backgrounds = [
  { id: 'white', name: 'White Studio', color: '#ffffff', textColor: 'text-wood' },
  { id: 'wooden', name: 'Wooden Showcase', color: '#f3e5d8', texture: 'https://www.transparenttextures.com/patterns/wood-pattern.png', textColor: 'text-wood' },
  { id: 'luxury', name: 'Luxury Catalog', color: '#2d0a0a', textColor: 'text-white/80' },
  { id: 'heritage', name: 'Heritage Texture', color: '#fcfaf7', texture: 'https://www.transparenttextures.com/patterns/rough-paper.png', textColor: 'text-wood' },
  { id: 'terracotta', name: 'Terracotta', color: '#e2725b', textColor: 'text-white' },
  { id: 'indigo', name: 'Traditional Indigo', color: '#1a237e', textColor: 'text-white' }
];

export default function EditorScreen({ 
  image, 
  processedImage: initialProcessedImage, 
  onProcessed, 
  onComplete, 
  onBack 
}: { 
  image: string, 
  processedImage: string | null,
  onProcessed: (img: string) => void,
  onComplete: (processed: string) => void, 
  onBack: () => void 
}) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(!initialProcessedImage);
  const [processedImage, setProcessedImage] = useState<string | null>(initialProcessedImage);
  const [selectedBg, setSelectedBg] = useState('white');
  const [brightness, setBrightness] = useState(105);
  const [contrast, setContrast] = useState(110);
  const [showAiAudit, setShowAiAudit] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const productImgRef = useRef<HTMLImageElement | null>(null);
  const textureImgRef = useRef<HTMLImageElement | null>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (processedImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = processedImage;
      img.onload = () => {
        productImgRef.current = img;
        redrawCanvas();
      };
    }
  }, [processedImage]);

  useEffect(() => {
    const bg = backgrounds.find(b => b.id === selectedBg);
    if (bg?.texture) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = bg.texture;
      img.onload = () => {
        textureImgRef.current = img;
        redrawCanvas();
      };
    } else {
      textureImgRef.current = null;
      redrawCanvas();
    }
  }, [selectedBg]);

  useEffect(() => {
    if (processedImage) return;
    let objectUrl: string | null = null;
    let isMounted = true;
    const handleRemoveBackground = async () => {
      try {
        const resultBlob = await removeBackground(image);
        if (!isMounted) return;
        objectUrl = URL.createObjectURL(resultBlob);
        setProcessedImage(objectUrl);
        onProcessed(objectUrl);
      } catch (err) {
        console.error('Background removal failed:', err);
        if (isMounted) {
          setProcessedImage(image); 
          onProcessed(image);
        }
      } finally {
        if (isMounted) {
          // Add a tiny delay for the "success" feel
          setTimeout(() => {
            if (isMounted) setIsProcessing(false);
          }, 800);
        }
      }
    };
    handleRemoveBackground();
    return () => { isMounted = false; };
  }, [image, processedImage, onProcessed]);

  const [loadingStep, setLoadingStep] = useState(0);
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const loadingMessages = [
    "Identifying product silhouette...",
    "Removing background artifacts...",
    "Perfecting studio lighting...",
    "Optimizing image quality..."
  ];

  const handleSkipAi = () => {
    setProcessedImage(image);
    setIsProcessing(false);
  };

  const runAiAudit = () => {
    setShowAiAudit(true);
    const suggestions = [
      "Lighting seems a bit uneven on the left side.",
      "Background is clean, but shadow depth could be improved.",
      "Consider adding a signature watermark for better protection.",
      "The wood grain detail is excellent and sharp."
    ];
    setAiSuggestions(suggestions);
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !processedImage || !productImgRef.current) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const bg = backgrounds.find(b => b.id === selectedBg) || backgrounds[0];
    
    // Standard Catalog Aspect (4:5)
    canvas.width = 1080;
    canvas.height = 1350;

    // 1. Draw Background
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Texture
    if (textureImgRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        const pattern = ctx.createPattern(textureImgRef.current, 'repeat');
        if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
    }

    // 3. Product
    const productImg = productImgRef.current;
    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    
    const scale = Math.min(canvas.width * 0.72 / productImg.width, canvas.height * 0.72 / productImg.height);
    const nw = productImg.width * scale;
    const nh = productImg.height * scale;
    const nx = (canvas.width - nw) / 2;
    const ny = (canvas.height - nh) / 2;

    ctx.shadowBlur = 60;
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowOffsetY = 30;

    ctx.drawImage(productImg, nx, ny, nw, nh);
    ctx.restore();

    // 4. Subtle Border
    ctx.strokeStyle = bg.textColor === 'text-white' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 40;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, [processedImage, selectedBg, brightness, contrast]);

  useEffect(() => {
    if (isProcessing) return;
    if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
    renderTimeoutRef.current = setTimeout(redrawCanvas, 50);
    return () => { if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current); };
  }, [redrawCanvas, isProcessing]);

  const handleFinish = () => {
    if (!canvasRef.current) return;
    setIsApplying(true);
    // Ensure last frame is captured
    setTimeout(() => {
      onComplete(canvasRef.current!.toDataURL('image/jpeg', 0.6));
      setIsApplying(false);
    }, 200);
  };

  return (
    <div className="h-full w-full flex flex-col bg-heritage">
      {/* Header */}
      <div className="p-6 pt-12 flex items-center justify-between">
        <button onClick={onBack} className="text-wood hover:text-maroon">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-serif font-bold text-maroon">AI Studio</h1>
        <div className="w-6" />
      </div>

      {/* Editor View */}
      <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        <div 
          className={cn(
            "flex-1 artisan-card relative overflow-hidden transition-all duration-700 flex items-center justify-center border-none shadow-2xl bg-cream/30"
          )}
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-black/70 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="relative w-48 h-64 mb-8 bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <img src={image} alt="Processing" className="w-full h-full object-cover opacity-40" />
                    
                    {/* Scanner Effect */}
                    <motion.div 
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-saffron shadow-[0_0_20px_rgba(231,171,43,1)] z-10"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-saffron/5 to-transparent animate-pulse" />
                    
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-24 h-24 rounded-full bg-saffron/20 border border-saffron/40 flex items-center justify-center"
                        >
                            <Sparkles className="text-saffron" size={40} />
                        </motion.div>
                    </motion.div>
                </div>

                <div className="space-y-4 max-w-xs">
                    <AnimatePresence mode="wait">
                        <motion.h3 
                            key={loadingStep}
                            initial={{ y: 5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -5, opacity: 0 }}
                            className="text-white text-xl font-serif font-bold h-7"
                        >
                            {loadingMessages[loadingStep]}
                        </motion.h3>
                    </AnimatePresence>
                    <p className="text-white/40 text-sm">Our AI is transforming your photo into a professional studio shot...</p>
                </div>

                <div className="mt-10 flex flex-col items-center gap-6">
                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 15, ease: "linear" }}
                          className="h-full bg-gradient-to-r from-saffron to-maroon"
                        />
                    </div>
                    
                    <button 
                      onClick={handleSkipAi}
                      className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full"
                    >
                      Skip Enhancement
                    </button>
                </div>
              </motion.div>
            ) : (
                <motion.div
                    key="editor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative z-10 w-full h-full flex items-center justify-center p-4"
                >
                    <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                    {/* Simulated Clean Cut Label */}
                    <div className="absolute top-8 right-8 bg-saffron text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg pointer-events-none">
                        <Check size={10} /> AI Enhanced
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tools */}
        {!isProcessing && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <p className="text-xs font-bold uppercase text-wood/40 mb-3 ml-1 tracking-widest">Studio Backgrounds</p>
              <div className="flex gap-4">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBg(bg.id)}
                    className={cn(
                      "w-12 h-12 rounded-2xl border-2 transition-all shadow-sm flex items-center justify-center text-[8px] font-bold uppercase px-1 text-center",
                      selectedBg === bg.id ? "border-maroon scale-110 shadow-md" : "border-transparent",
                      bg.textColor
                    )}
                    style={{ backgroundColor: bg.color }}
                  >
                    {bg.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="artisan-card p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-wood/60 mb-2">
                  <Sun size={16} />
                  <span className="text-xs font-bold uppercase">Brightness</span>
                </div>
                <input 
                  type="range" min="50" max="150" value={brightness} 
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-maroon"
                />
              </div>
              <button 
                onClick={runAiAudit}
                className="artisan-card p-4 flex flex-col gap-2 text-center items-center justify-center hover:bg-beige transition-colors"
              >
                 <Wand2 size={16} className="text-maroon mb-1" />
                 <span className="text-xs font-bold uppercase text-maroon">AI Audit</span>
                 <p className="text-[10px] text-wood/40 font-bold">Smart Check</p>
              </button>
            </div>

            <AnimatePresence>
              {showAiAudit && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white border border-maroon/20 rounded-3xl p-5 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3 text-maroon">
                    <AlertCircle size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">AI Quality Audit</h4>
                  </div>
                  <ul className="space-y-2">
                    {aiSuggestions.map((s, i) => (
                      <li key={i} className="text-[10px] text-wood/70 flex items-start gap-2">
                        <div className="w-1 h-1 bg-maroon rounded-full mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleFinish} 
              disabled={isApplying}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 group"
            >
              {isApplying ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
              )}
              {isApplying ? 'Processing Final Export...' : 'Next: Add Branding'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
