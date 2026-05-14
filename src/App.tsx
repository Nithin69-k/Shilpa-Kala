/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import './services/i18n';
import { useAuth } from './hooks/useAuth';
import SplashScreen from './screens/SplashScreen';
import LanguageScreen from './screens/LanguageScreen';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import CameraScreen from './screens/CameraScreen';
import EditorScreen from './screens/EditorScreen';
import BrandingScreen from './screens/BrandingScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import GalleryScreen from './screens/GalleryScreen';
import ShareScreen from './screens/ShareScreen';
import StorefrontScreen from './screens/StorefrontScreen';
import { Product } from './types';

export enum Screen {
  SPLASH = 'splash',
  LANGUAGE = 'language',
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  CAMERA = 'camera',
  EDITOR = 'editor',
  BRANDING = 'branding',
  DETAILS = 'details',
  GALLERY = 'gallery',
  SHARE = 'share',
  STOREFRONT = 'storefront'
}

export default function App() {
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.SPLASH);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [viewingArtisanId, setViewingArtisanId] = useState<string | null>(null);
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);

  useEffect(() => {
    // Check for artisanId/productId in URL for public sharing
    const params = new URLSearchParams(window.location.search);
    const aid = params.get('artisanId');
    const pid = params.get('productId');
    
    if (aid) {
      setViewingArtisanId(aid);
      if (pid) setViewingProductId(pid);
      setCurrentScreen(Screen.STOREFRONT);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // document.documentElement.classList.add('dark'); // Optional: auto-detect
    }
  }, []);

  useEffect(() => {
    if (currentScreen === Screen.SPLASH) {
      const timer = setTimeout(() => {
        const savedLang = localStorage.getItem('shilpa_kala_lang');
        if (savedLang) {
          i18n.changeLanguage(savedLang);
          if (user) {
            setCurrentScreen(Screen.DASHBOARD);
          } else {
            setCurrentScreen(Screen.LOGIN);
          }
        } else {
          setCurrentScreen(Screen.LANGUAGE);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, user, i18n]);

  const navigateTo = (screen: Screen) => {
    console.log(`Navigating to: ${screen}`);
    setCurrentScreen(screen);
  };

  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      <div className="h-screen w-full max-w-md bg-heritage overflow-hidden relative shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full w-full"
          >
            {currentScreen === Screen.SPLASH && <SplashScreen />}
          
          {currentScreen === Screen.LANGUAGE && (
            <LanguageScreen onComplete={() => navigateTo(Screen.LOGIN)} />
          )}
          
          {currentScreen === Screen.LOGIN && (
            <LoginScreen onLogin={() => navigateTo(Screen.DASHBOARD)} />
          )}
          
          {currentScreen === Screen.DASHBOARD && (
            <Dashboard 
              onNavigate={navigateTo} 
              user={user} 
              onSelectProduct={(p) => {
                setEditingProduct(p);
                navigateTo(Screen.DETAILS);
              }}
            />
          )}

          {currentScreen === Screen.CAMERA && (
            <CameraScreen 
              onCapture={(img) => {
                setCapturedImage(img);
                navigateTo(Screen.EDITOR);
              }}
              onBack={() => navigateTo(Screen.DASHBOARD)}
            />
          )}

          {currentScreen === Screen.EDITOR && capturedImage && (
            <EditorScreen 
              image={capturedImage}
              processedImage={processedImage}
              onProcessed={(img) => setProcessedImage(img)}
              onComplete={(final) => {
                setEditingProduct(prev => ({ ...prev, imageUrl: final }));
                navigateTo(Screen.BRANDING);
              }}
              onBack={() => {
                setProcessedImage(null); // Clear cache if going all the way back to camera
                navigateTo(Screen.CAMERA);
              }}
            />
          )}

          {currentScreen === Screen.BRANDING && (
            <BrandingScreen 
              product={editingProduct as Product}
              onComplete={(updated) => {
                setEditingProduct(updated);
                navigateTo(Screen.DETAILS);
              }}
              onBack={() => navigateTo(Screen.DASHBOARD)}
              onEditAgain={() => navigateTo(Screen.EDITOR)}
            />
          )}

          {currentScreen === Screen.DETAILS && (
            <ProductDetailsScreen 
              product={editingProduct as Product}
              onComplete={(finalProduct) => {
                if (finalProduct === null) {
                  // Product was deleted
                  setEditingProduct({});
                  navigateTo(Screen.GALLERY);
                } else {
                  // Reset creation flow and go to storefront as requested
                  setCapturedImage(null);
                  setProcessedImage(null);
                  setEditingProduct({});
                  setViewingArtisanId(user?.uid || null);
                  setViewingProductId(finalProduct.id);
                  navigateTo(Screen.STOREFRONT);
                }
              }}
              onBack={() => {
                if (editingProduct.id) {
                  navigateTo(Screen.GALLERY);
                } else {
                  navigateTo(Screen.BRANDING);
                }
              }}
            />
          )}

          {currentScreen === Screen.GALLERY && (
            <GalleryScreen 
              onSelect={(p) => {
                setEditingProduct(p);
                navigateTo(Screen.DETAILS);
              }}
              onBack={() => navigateTo(Screen.DASHBOARD)}
            />
          )}

          {currentScreen === Screen.SHARE && (
            <ShareScreen 
              product={editingProduct as Product}
              onDone={() => navigateTo(Screen.DASHBOARD)}
            />
          )}

          {currentScreen === Screen.STOREFRONT && (
            <StorefrontScreen 
              artisanId={viewingArtisanId || user?.uid || ''}
              initialProductId={viewingProductId || undefined}
              onBack={() => {
                if (viewingArtisanId) {
                  window.location.href = window.location.origin + window.location.pathname;
                } else {
                  navigateTo(Screen.DASHBOARD);
                }
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}
