import { motion } from 'motion/react';

export default function Logo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizes[size]} ${className}`}>
      {/* Wooden Carving Background Effect with Grain */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-[0.03]"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full text-wood">
          <defs>
            <pattern id="grain" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M0 0 Q5 5 10 0 T20 0" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grain)" />
          <path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" fill="currentColor" />
        </svg>
      </motion.div>

      {/* Main Logo Icon */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-saffron p-3 rounded-[30%] shadow-xl rotate-3">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            <path d="M12 4.5L16.5 16h-9L12 4.5z" opacity="0.3" fill="black" />
          </svg>
        </div>
        
        {size === 'lg' || size === 'xl' ? (
          <div className="mt-6 text-center">
            <h1 className="text-4xl font-serif font-black text-wood tracking-[0.2em] uppercase drop-shadow-sm">Shilpa Kala</h1>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-px w-10 bg-maroon/20" />
              <span className="text-[9px] font-bold text-clay uppercase tracking-[0.5em]">Heritage Artistry</span>
              <div className="h-px w-10 bg-maroon/20" />
            </div>
            
            {/* Wooden Artistic Elements Below */}
            <div className="mt-10 flex flex-col items-center">
              <div className="w-48 h-px bg-gradient-to-r from-transparent via-wood/20 to-transparent mb-6" />
              <div className="flex gap-12 text-wood/40">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="bg-sand p-2 rounded-lg border border-parchment">
                    <ChiselIcon />
                  </div>
                  <span className="text-[7px] font-bold uppercase tracking-widest opacity-60">Chisel</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="bg-sand p-2 rounded-lg border border-parchment">
                    <HammerIcon />
                  </div>
                  <span className="text-[7px] font-bold uppercase tracking-widest opacity-60">Hammer</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="bg-sand p-2 rounded-lg border border-parchment">
                    <BrushIcon />
                  </div>
                  <span className="text-[7px] font-bold uppercase tracking-widest opacity-60">Finish</span>
                </motion.div>
              </div>
              <div className="mt-8">
                <svg width="120" height="20" viewBox="0 0 120 20" className="text-maroon/20">
                  <path d="M0 10 Q30 0 60 10 T120 10" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ChiselIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3v4" />
      <path d="m13 10 9 9" />
      <path d="m13 21-6-6" />
      <path d="m2 10 9-9" />
      <path d="M10 14h4" />
    </svg>
  );
}

function HammerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 12-8.5 8.5" />
      <path d="m9 18-4-4" />
      <path d="m21 7-3 3-2-2 3-3" />
      <path d="m9 18 3 3 4-4-3-3" />
    </svg>
  );
}

function BrushIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 3.5a11.06 11.06 0 0 0 10.12-2.73" />
      <path d="m3.55 17.46 1.45 1.44" />
    </svg>
  );
}
