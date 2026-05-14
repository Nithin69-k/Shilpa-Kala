import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Languages, ChevronRight } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'kn', name: 'ಕನ್ನಡ', native: 'Kannada' },
  { code: 'hi', name: 'हिन्दी', native: 'Hindi' },
  { code: 'ta', name: 'தமிழ்', native: 'Tamil' },
  { code: 'te', name: 'తెలుగు', native: 'Telugu' }
];

export default function LanguageScreen({ onComplete }: { onComplete: () => void }) {
  const { t, i18n } = useTranslation();

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('shilpa_kala_lang', code);
    onComplete();
  };

  return (
    <div className="h-full w-full flex flex-col p-8 bg-sand">
      <div className="mt-12 mb-10">
        <div className="w-16 h-16 bg-saffron rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-saffron/20 rotate-3 transition-transform hover:rotate-0">
          <Languages className="text-white" size={32} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-coffee mb-3">
          {t('selectLanguage')}
        </h1>
        <p className="text-clay font-medium text-sm border-l-2 border-parchment pl-4 py-1">Choose your preferred language to continue.</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {languages.map((lang, index) => (
          <motion.button
            key={lang.code}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => handleLanguageSelect(lang.code)}
            className="w-full artisan-card p-6 flex items-center justify-between group hover:border-saffron hover:bg-cream/50 transition-all active:scale-[0.98]"
          >
            <div className="text-left flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-clay group-hover:bg-saffron group-hover:text-white transition-all font-bold">
                 {lang.code.toUpperCase()}
              </div>
              <div>
                <p className="text-xl font-serif font-bold text-coffee">{lang.name}</p>
                <p className="text-[10px] text-clay font-bold uppercase tracking-widest">{lang.native}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-parchment flex items-center justify-center text-clay group-hover:text-saffron transition-all">
              <ChevronRight size={18} />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 text-center pb-4">
        <p className="text-[10px] text-clay font-bold uppercase tracking-[0.3em] leading-loose opacity-60">
          Artisans of India • Shilpa-Kala
        </p>
      </div>
    </div>
  );
}
