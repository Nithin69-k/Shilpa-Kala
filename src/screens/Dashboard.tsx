import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Image as ImageIcon, 
  Store, 
  User, 
  Settings, 
  Plus, 
  ChevronRight,
  LogOut,
  Languages,
  Phone,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';
import { Screen } from '../App';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, limit, orderBy, doc, updateDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Product } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { cn } from '../lib/utils';
import Logo from '../components/Logo';

const getArtisanRank = (stats: { products: number, views: number, inbox: number }) => {
  if (stats.products > 12 && stats.views > 100 && stats.inbox > 10) return { title: 'Legendary Artisan', color: 'bg-gradient-to-r from-amber-400 to-yellow-600 text-white', icon: '🏆' };
  if (stats.products > 6 && stats.views > 50) return { title: 'Master Craftsman', color: 'bg-maroon text-white', icon: '🎖️' };
  if (stats.products > 2 || stats.views > 20) return { title: 'Rising Artisan', color: 'bg-saffron text-white', icon: '⭐' };
  return { title: 'Novice Artisan', color: 'bg-clay text-white', icon: '🌱' };
};

export default function Dashboard({ 
  onNavigate, 
  user, 
  onSelectProduct 
}: { 
  onNavigate: (s: Screen) => void, 
  user: any,
  onSelectProduct: (p: Product) => void
}) {
  const { t, i18n } = useTranslation();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [stats, setStats] = useState({ products: 0, views: 0, inbox: 0 });
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    phone: '',
    storeName: '',
    location: ''
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' }
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('shilpa_kala_lang', code);
    setShowLangMenu(false);
  };

  const suggestions = [
    { title: 'Update Your Branding', desc: 'Add your logo for brand recognition', icon: <Sparkles size={16} />, action: () => onNavigate(Screen.BRANDING) },
    { title: 'New Product Entry', desc: 'Capture your latest creation', icon: <Plus size={16} />, action: () => onNavigate(Screen.CAMERA) },
    { title: 'Review Your Gallery', desc: 'Check your existing catalog', icon: <ImageIcon size={16} />, action: () => onNavigate(Screen.GALLERY) }
  ];

  useEffect(() => {
    if (!user) return;

    const path = 'products';
    
    // Listener 1: Recent products
    const qRecent = query(
      collection(db, path),
      where('artisanId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(4)
    );
    const unsubscribeRecent = onSnapshot(qRecent, (snap) => {
      const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setRecentProducts(products);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'recent_products');
      setLoading(false);
    });

    // Listener 2: All products for Stats
    const qAll = query(collection(db, path), where('artisanId', '==', user.uid));
    const unsubscribeStats = onSnapshot(qAll, (snap) => {
      let totalViews = 0;
      let totalInbox = 0;
      snap.docs.forEach(doc => {
        const p = doc.data() as Product;
        totalViews += (p.views || 0);
        totalInbox += (p.inboxCount || 0);
      });
      setStats({
        products: snap.size,
        views: totalViews,
        inbox: totalInbox
      });
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'stats'));

    // Listener 3: User Profile
    const qUser = query(collection(db, 'users'), where('uid', '==', user.uid), limit(1));
    const unsubscribeUser = onSnapshot(qUser, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setProfileData({
          displayName: data.displayName || user.displayName || '',
          phone: data.phone || '',
          storeName: data.storeName || '',
          location: data.location || ''
        });
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'profile'));

    return () => {
      unsubscribeRecent();
      unsubscribeStats();
      unsubscribeUser();
    };
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Update User Document
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, {
          displayName: profileData.displayName,
          phone: profileData.phone,
          storeName: profileData.storeName,
          location: profileData.location,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        throw err;
      }

      // 2. Update all Products with new artisan info
      const productsQ = query(collection(db, 'products'), where('artisanId', '==', user.uid));
      const snap = await getDocs(productsQ);
      
      const batchUpdates = snap.docs.map(productDoc => 
        updateDoc(doc(db, 'products', productDoc.id), {
          artisanName: profileData.displayName,
          contactDetails: profileData.phone,
          updatedAt: serverTimestamp()
        })
      );
      
      try {
        await Promise.all(batchUpdates);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'products_batch_update');
        throw err;
      }

      setShowProfileEdit(false);
      alert('Profile and all product details updated successfully!');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const rank = getArtisanRank(stats);

  return (
    <div className="h-full w-full flex flex-col bg-sand overflow-y-auto pb-24">
      {/* Header */}
      <header className="h-20 bg-white border-b border-parchment flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-coffee leading-none">{t('appName')}</h1>
            <p className="text-[8px] uppercase tracking-widest text-clay font-bold">{t('tagline')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 bg-cream rounded-full flex items-center justify-center text-maroon hover:bg-parchment transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button 
            onClick={() => setShowProfileEdit(true)}
            className="w-10 h-10 bg-cream rounded-full flex items-center justify-center text-maroon hover:bg-parchment transition-colors"
          >
            <Settings size={20} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="w-10 h-10 bg-cream rounded-full flex items-center justify-center text-clay hover:bg-parchment transition-colors"
            >
              <Languages size={20} />
            </button>
            
            <AnimatePresence>
              {showLangMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-parchment rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          i18n.language === lang.code 
                            ? 'bg-maroon text-white' 
                            : 'text-coffee hover:bg-sand'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => auth.signOut()}
            className="w-10 h-10 bg-maroon rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold"
          >
            {user?.displayName?.charAt(0) || 'A'}
          </button>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="p-6">
        <div className="bg-white rounded-[32px] p-8 border border-parchment shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-serif italic text-coffee leading-tight">Namaste, {user?.displayName?.split(' ')[0]}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xl">{rank.icon}</span>
                <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider", rank.color)}>
                  {rank.title}
                </span>
                <button 
                  onClick={() => setShowProfileEdit(true)}
                  className="text-[10px] text-maroon font-bold underline underline-offset-2 ml-2"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatsCard label="Products" value={stats.products.toString()} onClick={() => onNavigate(Screen.GALLERY)} />
            <StatsCard label="Views" value={stats.views.toString()} />
            <StatsCard label="Inbox" value={stats.inbox.toString()} />
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="p-6 pt-0 space-y-8">
        {/* Contact Support Button */}
        <section className="bg-gradient-to-r from-maroon to-clay p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Need Help?</h3>
            <p className="text-white/70 text-xs mb-4">Connect with our support team for any assistance.</p>
            <button 
              onClick={() => window.location.href = 'mailto:support@shilpakala.com'}
              className="bg-white text-maroon px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-lg hover:bg-beige"
            >
              <Phone size={14} />
              Contact Support
            </button>
          </div>
          <Phone size={140} className="absolute -right-10 -bottom-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </section>

        {/* Suggestion Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-coffee uppercase tracking-[0.2em]">{t('Smart Suggestions')}</h3>
          </div>
          <div className="grid gap-3">
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={s.action}
                className="w-full artisan-card p-4 flex items-center gap-4 bg-white hover:bg-beige transition-colors shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-saffron/10 text-saffron flex items-center justify-center">
                  {s.icon}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-xs font-bold text-wood">{s.title}</h4>
                  <p className="text-[10px] text-wood/50">{s.desc}</p>
                </div>
                <ChevronRight size={14} className="text-wood/20" />
              </motion.button>
            ))}
          </div>
        </section>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(Screen.CAMERA)}
          className="w-full h-48 bg-maroon rounded-[40px] p-8 text-white flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-8 translate-y-8"></div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4">
            <Camera className="text-white" size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-1">Smart Capture</h3>
          <p className="text-white/70 text-xs px-6">AI guided professional capture</p>
        </motion.button>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(Screen.GALLERY)}
            className="h-32 bg-white border border-parchment rounded-[32px] p-5 flex flex-col justify-between shadow-sm group"
          >
            <div className="w-10 h-10 bg-saffron/10 text-saffron rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <ImageIcon size={20} />
            </div>
            <p className="text-coffee font-bold text-base tracking-tight">{t('gallery')}</p>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(Screen.STOREFRONT)}
            className="h-32 bg-white border border-parchment rounded-[32px] p-5 flex flex-col justify-between shadow-sm group"
          >
            <div className="w-10 h-10 bg-coffee/10 text-coffee rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store size={20} />
            </div>
            <p className="text-coffee font-bold text-base tracking-tight">Your Storefront</p>
          </motion.button>
        </div>
      </div>

      {/* Recent Showcase */}
      <div className="p-6 pt-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-clay">Recent Showcase</h3>
          <button onClick={() => onNavigate(Screen.GALLERY)} className="text-maroon text-[10px] font-bold uppercase tracking-widest border-b border-maroon">View All</button>
        </div>

        {recentProducts.length === 0 ? (
          <div className="bg-white border border-parchment rounded-[32px] p-10 flex flex-col items-center justify-center text-center opacity-70">
            <Plus className="text-parchment mb-4" size={48} />
            <p className="text-clay text-sm font-medium leading-relaxed">No products yet. Ready to capture your masterpiece?</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {recentProducts.map((product) => (
              <motion.button
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectProduct(product)}
                className="bg-white p-3 rounded-[24px] border border-parchment shadow-sm group cursor-pointer active:scale-95 transition-transform text-left w-full"
              >
                <div className="aspect-square bg-cream rounded-xl mb-3 overflow-hidden relative flex items-center justify-center">
                   <div className="absolute top-2 right-2 bg-green-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded tracking-tighter">ENHANCED</div>
                   <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h4 className="font-bold text-sm text-coffee truncate w-full">{product.name}</h4>
                <p className="text-[10px] font-bold text-clay uppercase">₹{product.price}</p>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileEdit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6"
            >
              <div className="text-center">
                <h3 className="text-2xl font-serif font-bold text-coffee">Artisan Profile</h3>
                <p className="text-clay text-xs mt-1">Manage your professional identity</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-clay ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(p => ({ ...p, displayName: e.target.value }))}
                    className="w-full artisan-card p-4 text-sm font-bold bg-sand border-none outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-clay ml-1">Contact Phone</label>
                  <input 
                    type="tel" 
                    value={profileData.phone}
                    placeholder="+91 98765 43210"
                    onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full artisan-card p-4 text-sm font-bold bg-sand border-none outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-clay ml-1">Studio Name</label>
                  <input 
                    type="text" 
                    value={profileData.storeName}
                    placeholder="e.g. Karnataka Woodcrafts"
                    onChange={(e) => setProfileData(p => ({ ...p, storeName: e.target.value }))}
                    className="w-full artisan-card p-4 text-sm font-bold bg-sand border-none outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-clay ml-1">Location</label>
                  <input 
                    type="text" 
                    value={profileData.location}
                    placeholder="e.g. Channapatna, Karnataka"
                    onChange={(e) => setProfileData(p => ({ ...p, location: e.target.value }))}
                    className="w-full artisan-card p-4 text-sm font-bold bg-sand border-none outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setShowProfileEdit(false)}
                  className="flex-1 py-4 text-sm font-bold text-clay uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="flex-1 btn-primary py-4 flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-0 left-0 right-0 w-full bg-white border-t border-parchment p-3 flex items-center justify-around z-30 shadow-2xl pb-6">
        <button 
          onClick={() => onNavigate(Screen.DASHBOARD)}
          className={`flex flex-col items-center gap-1 transition-colors ${i18n.language === 'en' ? 'text-maroon' : 'text-clay'}`} // Simple active state simulation
        >
          <motion.div whileTap={{ scale: 0.8 }}><Store size={22} /></motion.div>
          <span className="text-[8px] font-bold uppercase tracking-widest">{t('nav.home') || 'Home'}</span>
        </button>
        
        <div className="relative">
          <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={() => onNavigate(Screen.CAMERA)}
              className="w-16 h-16 bg-saffron rounded-full -mt-10 border-8 border-sand shadow-2xl flex items-center justify-center text-white relative z-40"
          >
            <Camera size={28} />
          </motion.button>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-saffron/20 rounded-full animate-pulse -z-10" />
        </div>

        <button 
          onClick={() => onNavigate(Screen.GALLERY)} 
          className="text-clay flex flex-col items-center gap-1 hover:text-maroon transition-colors"
        >
          <motion.div whileTap={{ scale: 0.8 }}><ImageIcon size={22} /></motion.div>
          <span className="text-[8px] font-bold uppercase tracking-widest">{t('nav.gallery') || 'Gallery'}</span>
        </button>
      </div>

      {/* Footer Status */}
      <footer className="status-bar h-8 flex items-center justify-center gap-4 opacity-50 mb-20 px-6 overflow-hidden mt-4">
          <span>Status: Online</span>
          <div className="w-1 h-1 bg-green-500 rounded-full" />
          <span>Cloud Sync Active</span>
      </footer>
    </div>
  );
}

function StatsCard({ label, value, onClick }: { label: string, value: string, onClick?: () => void }) {
  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`bg-sand border border-parchment p-3 rounded-2xl text-center w-full transition-colors ${onClick ? 'hover:bg-cream cursor-pointer' : 'cursor-default'}`}
    >
      <p className="text-[8px] uppercase font-bold text-clay mb-1">{label}</p>
      <p className="text-xl font-bold text-coffee">{value}</p>
    </motion.button>
  );
}
