import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Grid, List, Search, Filter, Plus, Image as ImageIcon, Edit3, ArrowUpDown } from 'lucide-react';
import { Product } from '../types';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export default function GalleryScreen({ onSelect, onBack }: { onSelect: (p: Product) => void, onBack: () => void }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      if (!auth.currentUser) return;
      const path = 'products';
      try {
        const q = query(
          collection(db, path),
          where('artisanId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'newest':
        // Already sorted by newest from Firestore
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [products, searchQuery, sortBy]);

  return (
    <div className="h-full w-full flex flex-col bg-heritage overflow-y-auto pb-20">
      <div className="p-6 pt-12 flex items-center justify-between shrink-0 bg-heritage sticky top-0 z-10 border-b border-beige/50">
        <button onClick={onBack} className="text-wood hover:text-maroon">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-serif font-bold text-maroon">My Gallery</h1>
        <div className="flex gap-4">
           <button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className="text-wood/40">
              {view === 'grid' ? <List size={20} /> : <Grid size={20} />}
           </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-2 mb-8">
            <div className="artisan-card p-3 flex items-center gap-3 flex-1 bg-white">
                <Search className="text-wood/30" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm" 
                />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="artisan-card p-3 bg-white text-maroon hover:bg-maroon hover:text-white transition-colors flex items-center gap-2"
              >
                  <ArrowUpDown size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Sort</span>
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-parchment rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      {[
                        { id: 'newest', label: 'Newest First' },
                        { id: 'price-low', label: 'Price: Low to High' },
                        { id: 'price-high', label: 'Price: High to Low' },
                        { id: 'name', label: 'Name: A to Z' }
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSortBy(option.id as any);
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                            sortBy === option.id 
                              ? 'bg-maroon text-white' 
                              : 'text-coffee hover:bg-sand'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-50">
                <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin mb-4" />
                <p>Loading your catalog...</p>
            </div>
        ) : (
            <div className={cn(
                "grid gap-4",
                view === 'grid' ? "grid-cols-2" : "grid-cols-1"
            )}>
                {filteredProducts.map((p) => (
                    <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => onSelect(p)}
                        className={cn(
                            "artisan-card overflow-hidden group cursor-pointer active:scale-95 transition-all",
                            view === 'list' && "flex h-24"
                        )}
                    >
                        <div className={cn(
                            "bg-sand/30 relative overflow-hidden flex items-center justify-center",
                            view === 'grid' ? "aspect-square" : "w-24 h-full shrink-0"
                        )}>
                            <img src={p.imageUrl} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-3 flex flex-col justify-center flex-1 bg-white">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm text-wood truncate">{p.name}</h3>
                                    <p className="text-xs text-maroon font-serif font-bold">₹{p.price}</p>
                                </div>
                                <button 
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          await updateDoc(doc(db, 'products', p.id), { views: (p.views || 0) + 1 });
                                        } catch (err) { /* ignore */ }
                                        onSelect({ ...p, views: (p.views || 0) + 1 });
                                    }}
                                    className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-maroon hover:bg-maroon hover:text-white transition-colors ml-2"
                                >
                                    <Edit3 size={14} />
                                </button>
                            </div>
                            {view === 'list' && <p className="text-[10px] text-wood/40 mt-1 line-clamp-1">{p.description}</p>}
                        </div>
                    </motion.div>
                ))}
            </div>
        )}

        {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 opacity-40 text-center">
                <ImageIcon className="mb-4" size={48} />
                <p>{searchQuery ? "No products match your search." : "Your catalog is empty."}</p>
                {!searchQuery && <p className="text-xs mt-2 uppercase tracking-widest">Create your first product card</p>}
            </div>
        )}
      </div>
    </div>
  );
}
