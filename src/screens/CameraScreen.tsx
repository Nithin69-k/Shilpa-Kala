import { useRef, useState, useCallback, useEffect, ChangeEvent } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Camera, X, RefreshCw, Zap, Maximize, AlertCircle, Settings, Image as ImageIcon, Filter } from 'lucide-react';
import { getSmartSuggestions } from '../services/gemini';
import { cn } from '../lib/utils';

const filters = [
  { id: 'none', name: 'Original', class: '' },
  { id: 'heritage', name: 'Heritage', class: 'sepia(0.3) contrast(1.1) brightness(1.05)' },
  { id: 'warm', name: 'Warm Sun', class: 'saturate(1.2) brightness(1.1) hue-rotate(5deg)' },
  { id: 'bw', name: 'Classic B&W', class: 'grayscale(1) contrast(1.2)' },
  { id: 'vibrant', name: 'Vibrant Grain', class: 'saturate(1.5) contrast(1.1)' }
];

export default function CameraScreen({ onCapture, onBack }: { onCapture: (img: string) => void, onBack: () => void }) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [advice, setAdvice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [flash, setFlash] = useState(false);

  // Apply track constraints (zoom/torch)
  useEffect(() => {
    if (webcamRef.current && webcamRef.current.video && (webcamRef.current.video as any).srcObject) {
       const stream = (webcamRef.current.video as any).srcObject as MediaStream;
       const [track] = stream.getVideoTracks();
       const capabilities = track.getCapabilities ? track.getCapabilities() : null;
       
       if (capabilities && (capabilities as any).zoom) {
         track.applyConstraints({ advanced: [{ zoom: zoom }] } as any);
       }
       if (capabilities && (capabilities as any).torch) {
         track.applyConstraints({ advanced: [{ torch: flash }] } as any);
       }
    }
  }, [zoom, flash]);

  const capture = useCallback(() => {
    if (!isReady || !webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // In a real app, I'd apply the filter to the captured canvas/image
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture, isReady]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate AI guidance
  useEffect(() => {
    const adviceTimer = setInterval(async () => {
        if (!isProcessing && webcamRef.current) {
            // In a real app, I'd send a low-res frame to Gemini for live tips
            // For now, let's just cycle through helpful tooltips
            const tips = [
                t('cameraGuides.centerProduct'),
                t('cameraGuides.moveCloser'),
                t('cameraGuides.increaseLight'),
                t('cameraGuides.holdSteady')
            ];
            setAdvice(tips[Math.floor(Math.random() * tips.length)]);
        }
    }, 4000);
    return () => clearInterval(adviceTimer);
  }, [t, isProcessing]);

  return (
    <div className="h-full w-full bg-black relative flex flex-col overflow-hidden">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex items-center justify-between">
        {/* Flash Toggle */}
        <button 
          onClick={() => setFlash(!flash)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors",
            flash ? "bg-yellow-400" : "bg-black/40 backdrop-blur-md"
          )}
        >
          <Zap size={20} />
        </button>

        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
          <span className="text-white text-xs font-bold uppercase tracking-widest">Smart AI Mode</span>
        </div>
        <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
          <Settings size={20} />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Zoom Slider Overlay */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 h-64 w-8 flex flex-col items-center">
             <input 
               type="range" 
               min="1" 
               max="3" 
               step="0.1" 
               value={zoom} 
               onChange={(e) => setZoom(parseFloat(e.target.value))}
               className="h-full w-full appearance-none bg-transparent vertical-slider"
               style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
             />
        </div>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="h-full w-full object-contain"
          onUserMedia={() => setIsReady(true)}
          style={{ filter: filters.find(f => f.id === selectedFilter)?.class }}
          videoConstraints={{
            facingMode: 'environment',
            width: { min: 640 },
            height: { min: 640 },
            aspectRatio: 1
          }}
          disablePictureInPicture={true}
          forceScreenshotSourceSize={true}
          imageSmoothing={true}
          mirrored={false}
          onUserMediaError={() => {}}
          screenshotQuality={0.85}
        />

        {/* Product Outline Guide */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-80 border-2 border-white/30 rounded-[40px] relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-saffron rounded-full shadow-[0_0_10px_#F4A261]" />
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-1 w-2 h-2 bg-saffron rounded-full shadow-[0_0_10px_#F4A261]" />
             <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-saffron rounded-full shadow-[0_0_10px_#F4A261]" />
             <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1 w-2 h-2 bg-saffron rounded-full shadow-[0_0_10px_#F4A261]" />
          </div>
        </div>

        {/* AI Guidance HUD */}
        <div className="absolute bottom-32 left-0 right-0 flex flex-col items-center gap-4 px-6 z-10">
          <AnimatePresence mode="wait">
            {advice && (
              <motion.div
                key={advice}
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.95 }}
                className="bg-maroon/90 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/20"
              >
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-6 h-6 rounded-full bg-saffron flex items-center justify-center"
                >
                    <AlertCircle size={14} className="text-white" />
                </motion.div>
                <span className="text-white font-medium text-sm">{advice}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls Container */}
      <div className="h-48 bg-black flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute top-0 -translate-y-full w-full bg-black/60 backdrop-blur-xl p-4 flex gap-4 overflow-x-auto no-scrollbar"
            >
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-xl border-2 overflow-hidden transition-all",
                    selectedFilter === f.id ? "border-saffron scale-110" : "border-white/10"
                  )}>
                    <div className="w-full h-full bg-slate-800" style={{ filter: f.class }} />
                  </div>
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-widest",
                    selectedFilter === f.id ? "text-saffron" : "text-white/40"
                  )}>{f.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-12">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ImageIcon size={24} />
            </button>
            <motion.button 
                whileTap={{ scale: 0.8 }}
                onClick={capture}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1"
            >
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-black">
                    <Camera size={32} />
                </div>
            </motion.button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                showFilters ? "bg-saffron text-white" : "bg-white/10 text-white/40"
              )}
            >
              <RefreshCw size={24} className={showFilters ? "rotate-180 transition-transform" : ""} />
            </button>
        </div>
      </div>
    </div>
  );
}
