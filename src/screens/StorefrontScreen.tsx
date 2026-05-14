import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Product } from '../types';
import { ChevronLeft, ShoppingBag, MessageSquare, Eye, Star, Send, X, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface Review {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  createdAt: any;
}

export default function StorefrontScreen({ artisanId, onBack, initialProductId }: { artisanId: string, onBack: () => void, initialProductId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [artisanName, setArtisanName] = useState('Artisan Studio');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      if (!artisanId) return;
      try {
        const q = query(collection(db, 'products'), where('artisanId', '==', artisanId));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(data);
        if (data.length > 0) setArtisanName(data[0].artisanName);

        // If initial productId, scroll to it after products are loaded
        if (initialProductId) {
          setTimeout(() => {
            const el = document.getElementById(`product-${initialProductId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 500);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [artisanId, initialProductId]);

  const fetchReviews = async (productId: string) => {
    try {
      const q = query(
        collection(db, 'products', productId, 'reviews'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleInteract = async (product: Product, type: 'view' | 'inbox') => {
    try {
      const docRef = doc(db, 'products', product.id);
      await updateDoc(docRef, {
        [type === 'view' ? 'views' : 'inboxCount']: increment(1)
      });
      // Local update
      setProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { ...p, [type === 'view' ? 'views' : 'inboxCount']: (p[type === 'view' ? 'views' : 'inboxCount'] || 0) + 1 }
          : p
      ));
    } catch (err) {
      // Silently fail interaction tracking for public users if rules block, 
      // though we updated rules to allow this.
      console.error(err);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct || !newReview.name || !newReview.comment) return;
    setSubmittingReview(true);
    try {
      const reviewData = {
        productId: selectedProduct.id,
        rating: newReview.rating,
        comment: newReview.comment,
        customerName: newReview.name,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'products', selectedProduct.id, 'reviews'), reviewData);
      
      const reviewWithId = { ...reviewData, id: docRef.id, createdAt: { seconds: Date.now()/1000 } } as Review;
      setReviews(prev => [reviewWithId, ...prev]);
      setNewReview({ rating: 5, comment: '', name: '' });
      setIsReviewOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShareStore = async () => {
    const storefrontUrl = `${window.location.origin}${window.location.pathname}?artisanId=${artisanId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${artisanName}'s Storefront`,
          text: `Check out my traditional handcrafted catalog!`,
          url: storefrontUrl
        });
      } else {
        await navigator.clipboard.writeText(storefrontUrl);
        alert('Storefront link copied to clipboard!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-heritage overflow-y-auto">
      <div className="p-6 pt-12 flex items-center justify-between border-b sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <button onClick={onBack} className="text-coffee p-2 -ml-2">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
            <h1 className="text-lg font-serif font-bold text-coffee">{artisanName}</h1>
            <p className="text-[10px] uppercase tracking-widest text-clay font-bold">Artisan Catalog</p>
        </div>
        <button onClick={handleShareStore} className="w-10 h-10 flex items-center justify-center text-maroon bg-cream rounded-full active:scale-95 transition-transform">
            <Share2 size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-clay uppercase tracking-widest">Discovering Crafts...</p>
        </div>
      ) : (
        <div className="p-6 grid gap-8 pb-32">
          {products.map(p => (
            <motion.div 
              id={`product-${p.id}`}
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "artisan-card bg-white border-parchment shadow-md group overflow-hidden transition-all duration-500",
                initialProductId === p.id && "ring-4 ring-maroon/20 scale-[1.02]"
              )}
              onViewportEnter={() => handleInteract(p, 'view')}
            >
              <div className="aspect-[4/3] bg-cream flex items-center justify-center overflow-hidden relative">
                <img src={p.imageUrl} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-maroon text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Handcrafted</div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-coffee leading-tight">{p.name}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-maroon uppercase tracking-wider">{p.material}</span>
                        <span className="w-1 h-1 bg-parchment rounded-full" />
                        <span className="text-[10px] font-bold text-clay uppercase tracking-wider">{p.category}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-serif font-black text-maroon">₹{p.price}</p>
                </div>

                <p className="text-sm text-wood/80 leading-relaxed italic line-clamp-3">"{p.description}"</p>
                
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex gap-2">
                      <button 
                        onClick={() => handleInteract(p, 'inbox')}
                        className="flex-1 bg-coffee text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-wood transition-colors active:scale-95"
                      >
                        <MessageSquare size={16} />
                        Inquiry Now
                      </button>
                      <button 
                        onClick={() => {
                            setSelectedProduct(p);
                            fetchReviews(p.id);
                            setIsReviewOpen(true);
                        }}
                        className="px-6 bg-cream text-maroon font-bold rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-parchment transition-colors active:scale-95 border border-maroon/10"
                      >
                        <Star size={16} />
                        Reviews
                      </button>
                  </div>

                  <div className="flex items-center justify-center gap-6 px-4 text-clay/50 border-t border-cream pt-4">
                    <div className="flex items-center gap-2">
                        <Eye size={14} />
                        <span className="text-[10px] font-bold uppercase">{p.views || 0} Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={14} />
                        <span className="text-[10px] font-bold uppercase">{p.inboxCount || 0} Interests</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-20 opacity-30 flex flex-col items-center">
                <ShoppingBag size={64} className="mb-4 stroke-[1px]" />
                <p className="font-serif italic text-lg text-coffee">Storefront is currently empty.</p>
                <p className="text-xs uppercase tracking-widest mt-2">Check back later for new arrivals</p>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewOpen && selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-coffee/80 backdrop-blur-md z-50 p-6 flex flex-col items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-heritage w-full max-w-sm rounded-[40px] overflow-hidden flex flex-col max-h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 border-b border-parchment flex justify-between items-center bg-white">
                <div>
                    <h2 className="text-lg font-bold text-coffee">{selectedProduct.name}</h2>
                    <p className="text-[10px] font-bold text-clay uppercase tracking-widest">Customer Reviews</p>
                </div>
                <button onClick={() => setIsReviewOpen(false)} className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-clay">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Submit Form */}
                <div className="bg-white rounded-3xl p-5 border border-parchment shadow-sm space-y-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        className={cn("transition-transform active:scale-125", newReview.rating >= star ? "text-saffron" : "text-cream")}
                      >
                        <Star size={28} fill={newReview.rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Your Name"
                    value={newReview.name}
                    onChange={e => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-cream border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-maroon transition-all"
                  />
                  <textarea 
                    placeholder="Share your experience..."
                    rows={3}
                    value={newReview.comment}
                    onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full bg-cream border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-maroon transition-all resize-none"
                  />
                  <button 
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !newReview.name || !newReview.comment}
                    className="w-full bg-maroon text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {submittingReview ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <><Send size={14} /> Submit Review</>
                    )}
                  </button>
                </div>

                {/* Review List */}
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-white/50 rounded-2xl p-4 border border-parchment/50">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-coffee uppercase tracking-wider">{review.customerName}</p>
                        <div className="flex gap-0.5 text-saffron scale-75 origin-right">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-wood/70 leading-relaxed italic">"{review.comment}"</p>
                      <p className="text-[8px] text-clay/50 font-bold uppercase mt-2">
                        {new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <p className="text-center py-8 text-xs text-clay uppercase tracking-widest opacity-50">Be the first to review this craft</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
