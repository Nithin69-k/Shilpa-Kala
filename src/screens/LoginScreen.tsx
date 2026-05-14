import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { LogIn, Smartphone, User } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const { t } = useTranslation();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Initialize user document if it doesn't exist
      const userRef = doc(db, 'users', user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        return;
      }
      
      if (!userSnap.exists()) {
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Artisan',
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }
      }

      onLogin();
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User closed the popup or cancelled, this is not an actual error, just an action cancellation
        console.log("User cancelled login.");
      } else {
        alert(t('login_failed') || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-8 bg-sand relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-coffee/5 -skew-y-12 -translate-y-24" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-saffron/5 rounded-full blur-3xl" />
      
      <div className="mt-20 mb-12 relative z-10">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-10 h-10 bg-saffron rounded-full flex items-center justify-center shadow-lg">
              <LogIn className="text-white" size={20} />
           </div>
           <span className="text-[10px] font-bold text-clay uppercase tracking-[0.2em]">Artisan Portal</span>
        </div>
        <h1 className="text-5xl font-serif font-bold text-coffee mb-3 italic">
          Shilpa-Kala
        </h1>
        <p className="text-lg text-clay font-bold tracking-tight">
          {t('tagline')}
        </p>
      </div>

      <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-center">
        <div className="artisan-card p-10 flex flex-col items-center bg-white/40 backdrop-blur-sm border-white/60">
          <div className="w-20 h-20 bg-cream rounded-3xl flex items-center justify-center mb-8 shadow-inner rotate-6 transition-transform hover:rotate-0">
            <Smartphone className="text-maroon" size={36} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-coffee mb-4 text-center">
            Welcome Artisan
          </h2>
          <p className="text-clay/80 text-center mb-10 text-sm font-medium leading-relaxed">
            Securely sign in to manage your professional digital storefront and products.
          </p>

          <button 
            onClick={handleGoogleLogin}
            className="btn-primary w-full shadow-2xl shadow-maroon/20 py-4.5 group"
          >
            <User size={20} className="group-hover:scale-110 transition-transform" />
            Continue with Google
          </button>
          
          <div className="mt-8 flex items-center gap-4 w-full">
            <div className="flex-1 h-px bg-parchment" />
            <span className="text-[10px] text-clay font-bold uppercase tracking-widest leading-none">Safe & Secure</span>
            <div className="flex-1 h-px bg-parchment" />
          </div>

          <button className="w-full mt-6 py-4 px-6 rounded-full border border-parchment text-clay text-xs font-bold uppercase tracking-widest opacity-60 flex items-center justify-center gap-3">
            <Smartphone size={16} />
            Phone OTP Verification
          </button>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center pb-8 opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-clay">Crafting Digital Heritage</p>
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-maroon" />
          <div className="w-2 h-2 rounded-full bg-saffron" />
          <div className="w-2 h-2 rounded-full bg-coffee" />
        </div>
      </div>
    </div>
  );
}
