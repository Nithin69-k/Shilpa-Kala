import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ShieldCheck, Award, MapPin, Type, Edit3, Save, Sparkles } from 'lucide-react';
import { Product, BrandingConfig } from '../types';
import { cn } from '../lib/utils';

export default function BrandingScreen({ product, onComplete, onBack, onEditAgain }: { product: Product, onComplete: (updated: Product) => void, onBack: () => void, onEditAgain: () => void }) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isBaking, setIsBaking] = useState(false);
  const [showPurePhoto, setShowPurePhoto] = useState(false);
  const [branding, setBranding] = useState<BrandingConfig>({
    showKarnatakaBadge: true,
    showHeritageLabel: true,
    showAuthenticitySeal: true,
    layout: 'standard',
    customName: product.branding?.customName || product.artisanName || '',
    customStore: product.branding?.customStore || product.category || ''
  });

  const handleFinish = async () => {
    if (!canvasRef.current) return;
    setIsBaking(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load original edited image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = product.imageUrl;

    await new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const padding = canvas.width * 0.05;
        
        // Helper to draw rounded rect for badges
        const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
          ctx.fill();
        };

        if (branding.layout !== 'minimal') {
          // 1. Karnataka Badge (Top Left)
          if (branding.showKarnatakaBadge) {
            ctx.fillStyle = branding.layout === 'luxury' ? '#D4AF37' : '#8B0000';
            const badgeW = 120;
            const badgeH = 80;
            drawRoundedRect(padding, padding, badgeW, badgeH, 15);
            
            ctx.fillStyle = branding.layout === 'luxury' ? '#8B0000' : '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.font = 'bold 16px Inter';
            ctx.fillText('HANDMADE', padding + badgeW/2, padding + 30);
            ctx.font = 'bold 20px Inter';
            ctx.fillText('KARNATAKA', padding + badgeW/2, padding + 60);
          }

          // 2. Authenticity Seal (Top Right)
          if (branding.showAuthenticitySeal) {
            const sealSize = 120;
            ctx.strokeStyle = branding.layout === 'luxury' ? '#D4AF37' : '#FFFFFF';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(canvas.width - padding - sealSize/2, padding + sealSize/2, sealSize/2, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = branding.layout === 'luxury' ? '#D4AF37' : '#FFFFFF';
            ctx.font = 'bold 40px Inter';
            ctx.fillText('✓', canvas.width - padding - sealSize/2, padding + sealSize/2 + 15);
          }

          // 3. Heritage Label (Above Name)
          if (branding.showHeritageLabel) {
            ctx.fillStyle = 'rgba(245, 245, 220, 0.9)';
            const labelW = 200;
            const labelH = 40;
            const labelY = canvas.height - padding - 160;
            drawRoundedRect(padding, labelY, labelW, labelH, 20);
            
            ctx.fillStyle = '#8B0000';
            ctx.textAlign = 'left';
            ctx.font = 'bold 16px Inter';
            ctx.fillText('HERITAGE OF INDIA', padding + 20, labelY + 25);
          }
        }

        // 4. Main Branding Bar
        const barH = 140;
        const barY = canvas.height - padding - barH;
        
        if (branding.layout === 'luxury') {
          ctx.fillStyle = 'rgba(139, 0, 0, 0.9)';
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth = 2;
          drawRoundedRect(padding, barY, canvas.width - padding*2, barH, 25);
          ctx.stroke();
        } else if (branding.layout === 'minimal') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          drawRoundedRect(canvas.width/2 - 200, barY, 400, barH, 25);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          drawRoundedRect(padding, barY, canvas.width - padding*2, barH, 25);
        }

        ctx.textAlign = branding.layout === 'minimal' ? 'center' : 'left';
        ctx.fillStyle = branding.layout === 'luxury' ? '#D4AF37' : '#8B0000';
        ctx.font = 'bold 40px "Playfair Display", serif';
        const textX = branding.layout === 'minimal' ? canvas.width/2 : padding + 40;
        ctx.fillText((branding.customStore || "TRADITIONAL CRAFT").toUpperCase(), textX, barY + 60);

        ctx.fillStyle = branding.layout === 'luxury' ? 'rgba(255,255,255,0.7)' : 'rgba(45, 10, 10, 0.6)';
        ctx.font = 'bold 24px Inter';
        ctx.fillText(`ARTISAN: ${branding.customName || "HERITAGE ARTISAN"}`, textX, barY + 110);

        resolve(null);
      };
      img.onerror = () => resolve(null);
    });

    const finalImage = canvas.toDataURL('image/jpeg', 0.7);
    onComplete({ ...product, imageUrl: finalImage, branding });
    setIsBaking(false);
  };

  return (
    <div className="h-full w-full flex flex-col bg-heritage overflow-y-auto">
      <canvas ref={canvasRef} className="hidden" />
      {/* Header */}
      <div className="p-6 pt-12 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-1">
          <button onClick={onBack} className="text-wood hover:text-maroon p-2 -ml-2">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <button 
                onClick={onEditAgain}
                className="text-[10px] font-bold uppercase tracking-widest text-maroon/60 hover:text-maroon flex items-center gap-1 bg-maroon/5 px-3 py-1 rounded-full transition-all"
            >
                <Edit3 size={12} /> Edit
            </button>
            <button 
                onClick={() => setShowPurePhoto(!showPurePhoto)}
                className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all flex items-center gap-1",
                    showPurePhoto ? "bg-maroon text-white shadow-md" : "bg-clay/10 text-clay"
                )}
            >
                {showPurePhoto ? 'Show Overlays' : 'View Pure Photo'}
            </button>
          </div>
        </div>
        <h1 className="text-xl font-serif font-bold text-maroon">Artisan Branding</h1>
        <div className="w-10" />
      </div>

      <div className="p-6 space-y-8 pb-32">
        {/* Preview Card */}
        <div className={cn(
            "artisan-card relative aspect-square shadow-2xl group overflow-hidden transition-all duration-700",
            branding.layout === 'luxury' ? "border-saffron/30 ring-8 ring-saffron/5" : 
            branding.layout === 'minimal' ? "border-transparent shadow-lg" : "border-parchment"
        )}>
          <motion.img 
            key={product.imageUrl}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            src={product.imageUrl} 
            alt="Preview" 
            className="w-full h-full object-cover" 
          />
          
          {/* Branding Overlays based on Layout */}
          <AnimatePresence>
          {!showPurePhoto && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none"
            >
              {branding.layout !== 'minimal' && (
                <div className="flex justify-between items-start">
                  {branding.showKarnatakaBadge && (
                    <motion.div 
                      key="badge"
                      initial={{ scale: 0, x: -20, rotate: -10 }} 
                      animate={{ scale: 1, x: 0, rotate: 0 }} 
                      className={cn(
                        "p-2 rounded-lg flex flex-col items-center shadow-lg border backdrop-blur-sm",
                        branding.layout === 'luxury' ? "bg-saffron text-maroon border-maroon/20" : "bg-maroon/90 text-white border-white/20"
                    )}>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-70">Handmade</span>
                        <span className="text-[10px] font-bold">Karnataka</span>
                    </motion.div>
                  )}
                  {branding.showAuthenticitySeal && (
                    <motion.div 
                      key="seal"
                      initial={{ rotate: -90, opacity: 0, scale: 0.5 }} 
                      animate={{ rotate: 0, opacity: 1, scale: 1 }} 
                      className={cn(
                        "w-16 h-16 rounded-full border-2 flex items-center justify-center bg-white/10 backdrop-blur-md shadow-xl",
                        branding.layout === 'luxury' ? "border-saffron text-saffron" : "border-white/40 text-white"
                    )}>
                       <ShieldCheck size={32} />
                    </motion.div>
                  )}
                </div>
              )}

              <div className={cn(
                  "space-y-2",
                  branding.layout === 'minimal' && "mt-auto"
              )}>
                  <AnimatePresence>
                  {branding.showHeritageLabel && branding.layout !== 'minimal' && (
                      <motion.div 
                        initial={{ x: -50, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }} 
                        exit={{ x: -20, opacity: 0 }}
                        className="bg-beige/90 backdrop-blur-md self-start px-3 py-1 rounded-full border border-wood/10 shadow-md flex items-center gap-2"
                      >
                          <p className="text-[10px] font-bold text-wood uppercase tracking-widest flex items-center gap-2">
                             <Award size={10} className="text-maroon" /> Heritage of India
                          </p>
                      </motion.div>
                  )}
                  </AnimatePresence>
                  
                  <motion.div 
                    layout
                    className={cn(
                      "backdrop-blur-md p-4 rounded-2xl shadow-xl transition-all duration-700",
                      branding.layout === 'luxury' ? "bg-maroon/90 border border-saffron/30" : 
                      branding.layout === 'minimal' ? "bg-white/40 border-none shadow-none text-center" : 
                      "bg-white/80 border border-white/40"
                  )}>
                      <motion.h3 
                        layout
                        className={cn(
                          "font-serif font-bold text-lg leading-tight uppercase tracking-tight",
                          branding.layout === 'luxury' ? "text-saffron" : "text-maroon"
                      )}>
                          {branding.customStore || "Traditional Craft"}
                      </motion.h3>
                      <motion.div 
                        layout
                        className={cn(
                          "flex items-center gap-1",
                          branding.layout === 'luxury' ? "text-white/60" : "text-wood/60",
                          branding.layout === 'minimal' && "justify-center"
                      )}>
                          <MapPin size={10} />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">
                              {branding.customName || "Artisan Ramesh"} • Channapatna
                          </span>
                      </motion.div>
                  </motion.div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Branding Controls */}
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-wood/40 mb-4 ml-1">Branding Style</h2>
            <div className="grid grid-cols-3 gap-3">
                <LayoutButton id="standard" label="Standard" active={branding.layout === 'standard'} onClick={() => setBranding(prev => ({ ...prev, layout: 'standard' }))} />
                <LayoutButton id="minimal" label="Minimal" active={branding.layout === 'minimal'} onClick={() => setBranding(prev => ({ ...prev, layout: 'minimal' }))} />
                <LayoutButton id="luxury" label="Luxury" active={branding.layout === 'luxury'} onClick={() => setBranding(prev => ({ ...prev, layout: 'luxury' }))} />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-wood/40 mb-4 ml-1">Custom Info</h2>
            <div className="artisan-card p-4 space-y-4 bg-white/50">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-maroon uppercase">Artisan Name</label>
                    <div className="flex items-center gap-2 border-b border-parchment py-2">
                        <Edit3 size={14} className="text-clay" />
                        <input 
                            type="text" 
                            value={branding.customName}
                            onChange={(e) => setBranding(prev => ({ ...prev, customName: e.target.value }))}
                            placeholder="Your Name"
                            className="bg-transparent border-none outline-none text-sm font-bold w-full"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-maroon uppercase">Branding Title</label>
                    <div className="flex items-center gap-2 border-b border-parchment py-2">
                        <Type size={14} className="text-clay" />
                        <input 
                            type="text" 
                            value={branding.customStore}
                            onChange={(e) => setBranding(prev => ({ ...prev, customStore: e.target.value }))}
                            placeholder="e.g. Master Woodcraft"
                            className="bg-transparent border-none outline-none text-sm font-bold w-full"
                        />
                    </div>
                </div>
            </div>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-wood/40 mb-4 ml-1">Badges & Seals</h2>
            <div className="space-y-3">
                <BrandingOption 
                    icon={<MapPin size={18} />} 
                    title="Karnataka Handmade Badge" 
                    active={branding.showKarnatakaBadge}
                    onClick={() => setBranding(prev => ({ ...prev, showKarnatakaBadge: !prev.showKarnatakaBadge }))}
                />
                <BrandingOption 
                    icon={<Award size={18} />} 
                    title="Heritage of India Label" 
                    active={branding.showHeritageLabel}
                    onClick={() => setBranding(prev => ({ ...prev, showHeritageLabel: !prev.showHeritageLabel }))}
                />
                <BrandingOption 
                    icon={<ShieldCheck size={18} />} 
                    title="Authenticity Seal" 
                    active={branding.showAuthenticitySeal}
                    onClick={() => setBranding(prev => ({ ...prev, showAuthenticitySeal: !prev.showAuthenticitySeal }))}
                />
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 w-full p-6 bg-white/50 backdrop-blur-md border-t border-parchment">
        <button 
          onClick={handleFinish} 
          disabled={isBaking}
          className="btn-secondary w-full py-4 shadow-xl active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isBaking ? <div className="w-5 h-5 border-2 border-maroon/30 border-t-maroon rounded-full animate-spin" /> : <Save size={20} />}
          {isBaking ? 'Exporting...' : 'Apply Branding & Continue'}
          {!isBaking && <Sparkles size={16} className="text-saffron" />}
        </button>
      </div>
    </div>
  );
}


function BrandingOption({ icon, title, active, onClick }: { icon: any, title: string, active: boolean, onClick: () => void }) {
    return (
        <button 
           onClick={onClick}
           className={cn(
             "w-full artisan-card p-4 flex items-center justify-between border-2 transition-all",
             active ? "border-maroon bg-maroon/5 shadow-md" : "border-beige shadow-sm"
           )}
        >
            <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", active ? "bg-maroon text-white" : "bg-beige text-wood/40")}>
                    {icon}
                </div>
                <span className={cn("font-bold text-sm", active ? "text-maroon" : "text-wood/60")}>{title}</span>
            </div>
            <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", active ? "border-maroon bg-maroon text-white" : "border-beige")}>
                {active && <Check size={14} />}
            </div>
        </button>
    );
}

function LayoutButton({ id, label, active, onClick }: { id: string, label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "py-3 rounded-2xl border-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                active ? "bg-maroon text-white border-maroon shadow-lg" : "border-beige text-wood/40"
            )}
        >
            {label}
        </button>
    );
}

function Check({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
}
