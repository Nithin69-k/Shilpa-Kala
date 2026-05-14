import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Share2, 
  Download, 
  ExternalLink, 
  Mail, 
  MessageCircle,
  Home,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import { cn } from '../lib/utils';

export default function ShareScreen({ product, onDone }: { product: Product, onDone: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B0000', '#F4A261', '#5D4037']
    });
  }, []);

  const handleShare = async (platform: string) => {
    const storefrontUrl = `${window.location.origin}${window.location.pathname}?artisanId=${product.artisanId}`;
    const shareData = {
      title: `${product.artisanName}'s Storefront`,
      text: `Check out my latest craft: ${product.name} at my digital storefront!`,
      url: storefrontUrl,
    };

    try {
      if (platform === 'WhatsApp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`, '_blank');
      } else if (platform === 'Instagram') {
        // Copy to clipboard is better for insta
        await navigator.clipboard.writeText(storefrontUrl);
        alert('Storefront link copied! Post it in your Instagram Bio or Story.');
      } else if (platform === 'Email') {
        window.location.href = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`;
      } else if (platform === 'Download') {
        const link = document.createElement('a');
        link.href = product.imageUrl;
        link.download = `${product.name.replace(/\s+/g, '_')}.jpg`;
        link.click();
      } else if (navigator.share) {
        await navigator.share(shareData);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-maroon p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-40 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')]" />
      </div>

      <div className="mt-12 mb-12 flex flex-col items-center text-center relative z-10">
        <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 border-2 border-white/40"
        >
            <CheckCircle2 size={40} className="text-white" />
        </motion.div>
        <h1 className="text-4xl font-serif font-bold text-white mb-4">
          {t('congratulations')}
        </h1>
        <p className="text-white/70 text-lg">
          {t('productReady')}
        </p>
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="artisan-card relative overflow-hidden mb-12 shadow-2xl"
      >
        <div className="h-64 overflow-hidden relative">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
                <p className="text-[10px] font-bold text-maroon uppercase tracking-widest">Digital Ready</p>
            </div>
        </div>
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="text-2xl font-serif font-bold text-wood">{product.name}</h3>
                   <p className="text-maroon font-bold">₹{product.price}</p>
                </div>
                <div className="w-16 h-16 bg-beige rounded-xl flex items-center justify-center border-2 border-wood/5">
                   <QrCode size={32} className="text-wood" />
                </div>
            </div>
            <p className="text-xs text-wood/60 line-clamp-3 italic">"{product.description}"</p>
        </div>
      </motion.div>

      <div className="space-y-4">
         <h3 className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] text-center mb-4">Express Share</h3>
         <div className="grid grid-cols-4 gap-4">
            <ShareButton icon={<MessageCircle size={24} />} platform="WhatsApp" onClick={() => handleShare('whatsapp')} />
            <ShareButton icon={<ExternalLink size={24} />} platform="Instagram" onClick={() => handleShare('instagram')} />
            <ShareButton icon={<Mail size={24} />} platform="Email" onClick={() => handleShare('email')} />
            <ShareButton icon={<Download size={24} />} platform="Download" onClick={() => handleShare('download')} />
         </div>

         <button 
           onClick={onDone}
           className="w-full bg-white text-maroon py-4 rounded-full font-bold shadow-xl shadow-black/20 mt-12 flex items-center justify-center gap-2 hover:bg-beige transition-all active:scale-95"
         >
           <Home size={20} />
           Back to Dashboard
         </button>
      </div>
    </div>
  );
}

function ShareButton({ icon, platform, onClick }: { icon: any, platform: string, onClick: () => void }) {
    return (
        <button 
           onClick={onClick}
           className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-all group"
        >
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-white/20 group-hover:scale-110 transition-all border border-white/5">
                {icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{platform}</span>
        </button>
    );
}
