import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Info, Tags, DollarSign, Sparkles, Wand2, ArrowRight, Trash2, Link2, Copy, Check, X } from 'lucide-react';
import { Product } from '../types';
import { generateCaption } from '../services/gemini';
import { db, auth } from '../services/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export default function ProductDetailsScreen({ product, onComplete, onBack }: { product: Product, onComplete: (final: Product | null) => void, onBack: () => void }) {
  const { t, i18n } = useTranslation();
  const [details, setDetails] = useState({
    name: product.name || '',
    price: product.price || '',
    material: product.material || '',
    description: product.description || '',
    category: product.category || 'Toys'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!product.id || !auth.currentUser) return;
    const url = `${window.location.origin}${window.location.pathname}?artisanId=${auth.currentUser.uid}&productId=${product.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateCaption = async () => {
    setIsGenerating(true);
    const caption = await generateCaption({ ...details, artisanName: auth.currentUser?.displayName }, i18n.language);
    setDetails(prev => ({ ...prev, description: caption }));
    setIsGenerating(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const path = 'products';
    try {
      // Create a clean data object with only the fields we want to persist
      // Avoid spreading the whole product object which may contain 'id' or internal fields
      const dataToPersist: any = {
        name: details.name.trim(),
        price: Number(details.price),
        description: details.description.trim(),
        category: details.category,
        material: details.material.trim(),
        imageUrl: product.imageUrl,
        artisanId: auth.currentUser?.uid,
        artisanName: auth.currentUser?.displayName || 'Artisan',
        branding: product.branding || null,
        updatedAt: serverTimestamp(),
      };

      let finalProduct: Product;

      if (product.id) {
        // Update existing product
        const docRef = doc(db, path, product.id);
        
        // When updating, we must only send fields allowed by the hasOnly rule.
        // artisanId and createdAt are immutable and should NOT be in the update payload.
        const { artisanId, ...updateFields } = dataToPersist;
        
        const updateData = {
          ...updateFields,
          // We include views and inboxCount to ensure they match schema if sent.
          views: product.views || 0,
          inboxCount: product.inboxCount || 0
        };
        
        await updateDoc(docRef, updateData);
        finalProduct = { ...product, ...updateData } as Product;
      } else {
        // Create new product
        const createData = {
          ...dataToPersist,
          createdAt: serverTimestamp(),
          views: 0,
          inboxCount: 0,
        };
        const docRef = await addDoc(collection(db, path), createData);
        finalProduct = { ...createData, id: docRef.id } as Product;
      }

      // Show Success Animation
      setShowSuccess(true);
      
      // Delay navigation to let user see success
      setTimeout(() => {
        onComplete(finalProduct);
      }, 800);

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, product.id ? `products/${product.id}` : 'products');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product.id) return;
    setIsDeleting(true);
    const path = 'products';
    try {
      const docRef = doc(db, path, product.id);
      await deleteDoc(docRef);
      onComplete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-heritage overflow-y-auto">
      <div className="p-6 pt-12 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-wood hover:text-maroon">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-serif font-bold text-maroon">Product Information</h1>
        <div className="w-6 flex items-center gap-4">
          {product.id && (
            <>
              <button 
                onClick={handleCopyLink}
                className={cn(
                  "p-2 rounded-full transition-all",
                  copied ? "text-green-600 bg-green-50" : "text-clay bg-cream hover:bg-parchment"
                )}
                title="Copy Product Link"
              >
                {copied ? <Check size={18} /> : <Link2 size={18} />}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="text-maroon/40 hover:text-maroon transition-colors p-2"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 pb-32">
        <div className="artisan-card h-64 overflow-hidden flex items-center justify-center bg-sand/30">
          <img src={product.imageUrl} alt="Thumbnail" className="max-w-full max-h-full object-contain" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 artisan-card p-4 text-center">
            <p className="text-[10px] font-bold uppercase text-wood/40 mb-1">Total Views</p>
            <p className="text-xl font-bold text-coffee">{product.views || 0}</p>
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              if (!product.id) return;
              try {
                await updateDoc(doc(db, 'products', product.id), { inboxCount: (product.inboxCount || 0) + 1 });
                // We should update the local state too if we want immediate feedback, but the parent will handle it onComplete
                alert('Success! Simulated a customer inquiry.');
              } catch (err) { /* ignore */ }
            }}
            className="flex-1 artisan-card p-4 text-center hover:bg-beige transition-colors border-maroon/20"
          >
            <p className="text-[10px] font-bold uppercase text-maroon mb-1">Inbox Requests</p>
            <p className="text-xl font-bold text-maroon">{product.inboxCount || 0}</p>
          </motion.button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-wood/50 ml-1">Product Name</label>
            <div className="artisan-card flex items-center p-4 gap-3">
               <Tags size={18} className="text-maroon" />
               <input 
                 type="text" 
                 placeholder="e.g. Wooden Elephant"
                 value={details.name}
                 onChange={(e) => setDetails(prev => ({ ...prev, name: e.target.value }))}
                 className="flex-1 bg-transparent border-none outline-none font-medium"
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-wood/50 ml-1">Price (₹)</label>
                <div className="artisan-card flex items-center p-4 gap-3">
                    <DollarSign size={18} className="text-maroon" />
                    <input 
                        type="number" 
                        placeholder="500"
                        value={details.price}
                        onChange={(e) => setDetails(prev => ({ ...prev, price: e.target.value }))}
                        className="flex-1 bg-transparent border-none outline-none font-medium"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-wood/50 ml-1">Material</label>
                <div className="artisan-card flex items-center p-4 gap-3">
                    <Info size={18} className="text-maroon" />
                    <input 
                        type="text" 
                        placeholder="Wood"
                        value={details.material}
                        onChange={(e) => setDetails(prev => ({ ...prev, material: e.target.value }))}
                        className="flex-1 bg-transparent border-none outline-none font-medium"
                    />
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1 px-1">
                <label className="text-xs font-bold uppercase text-wood/50">Description</label>
                <button 
                  onClick={handleGenerateCaption}
                  disabled={isGenerating}
                  className="flex items-center gap-1 text-[10px] font-bold text-maroon uppercase tracking-widest hover:opacity-80 transition-all disabled:opacity-50"
                >
                  <Wand2 size={12} /> {isGenerating ? 'Writing...' : 'AI Auto-Generate'}
                </button>
            </div>
            <div className="artisan-card p-4">
               <textarea 
                 rows={4}
                 placeholder="Describe your craft details..."
                 value={details.description}
                 onChange={(e) => setDetails(prev => ({ ...prev, description: e.target.value }))}
                 className="w-full bg-transparent border-none outline-none font-medium resize-none text-sm"
               />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full p-6 bg-heritage/80 backdrop-blur-md flex gap-4">
        <button 
          onClick={handleSave} 
          disabled={isSaving || !details.name || !details.price || isNaN(Number(details.price))}
          className="btn-primary flex-1 py-4 shadow-xl disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Finish & Save'}
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-coffee/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-maroon/10 rounded-full flex items-center justify-center mx-auto text-maroon">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-coffee">Delete Product?</h3>
                <p className="text-sm text-clay leading-relaxed">
                  Are you sure you want to remove this craft from your gallery? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-4 rounded-2xl font-bold bg-cream text-clay active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-4 rounded-2xl font-bold bg-maroon text-white active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-8 text-center"
          >
             <motion.div 
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl mb-8"
             >
                <Check size={64} strokeWidth={3} />
             </motion.div>
             
             <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
             >
                <h2 className="text-3xl font-serif font-bold text-maroon">Product Saved!</h2>
                <p className="text-clay max-w-xs mx-auto">
                   Your exquisite handicraft has been added to the Artisan Store gallery.
                </p>
             </motion.div>

             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 flex flex-col items-center gap-2"
             >
                <div className="w-12 h-1 bg-maroon/10 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5 }}
                        className="h-full bg-maroon"
                    />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-wood/40">Opening Your Storefront</p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saving Overlay */}
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-coffee/20 backdrop-blur-md z-[150] flex flex-col items-center justify-center"
          >
            <div className="artisan-card p-8 bg-white/90 shadow-2xl flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-maroon/20 border-t-maroon rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-maroon">Securing Data...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
