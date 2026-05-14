import { motion } from 'motion/react';
import Logo from '../components/Logo';

export default function SplashScreen() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-sand relative overflow-hidden">
      {/* Decorative carving patterns in the background */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-5 rotate-12">
         <div className="w-full h-full border-[32px] border-coffee rounded-full" />
      </div>
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-5 -rotate-12">
         <div className="w-full h-full border-[16px] border-maroon rounded-[20%]" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="z-10 flex flex-col items-center"
      >
        <Logo size="lg" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-12 flex flex-col items-center"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-6 bg-parchment" />
            <span className="text-[10px] font-bold text-clay uppercase tracking-[0.4em]">Shilpa-Kala</span>
            <div className="h-px w-6 bg-parchment" />
          </div>
          <p className="text-coffee/40 font-serif italic text-sm">Crafting Digital Heritage</p>
        </motion.div>
      </motion.div>

      {/* Progress Indicator */}
      <div className="absolute bottom-16 w-32 h-1 bg-cream rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-saffron"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="absolute bottom-8 text-[8px] font-bold text-clay uppercase tracking-widest opacity-30">
        Artisans of India • Shilpa-Kala
      </div>
    </div>
  );
}
