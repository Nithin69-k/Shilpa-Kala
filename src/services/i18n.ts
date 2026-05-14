import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: "Shilpa-Kala",
      tagline: "Digital Portfolio Assistant",
      selectLanguage: "Select Language",
      getStarted: "Get Started",
      login: "Login",
      logout: "Logout",
      dashboard: "Dashboard",
      camera: "Smart Camera",
      gallery: "My Gallery",
      branding: "Branding",
      storefront: "Digital Storefront",
      productName: "Product Name",
      price: "Price",
      material: "Material",
      description: "Description",
      save: "Save",
      share: "Share",
      edit: "Edit",
      delete: "Delete",
      capture: "Capture",
      nav: {
        home: "Home",
        gallery: "Gallery",
        profile: "Profile"
      },
      processing: "Processing...",
      backgroundRemoved: "Background Removed",
      applyBranding: "Apply Branding",
      congratulations: "Congratulations!",
      productReady: "Your product is ready for the world.",
      karnatakaHandmade: "Handmade in Karnataka",
      heritageLabel: "Heritage Craft",
      authenticitySeal: "Authenticity Certified",
      artisanName: "Artisan Name",
      craftOrigin: "Craft Origin",
      contactDetails: "Contact Details",
      categories: {
        toys: "Toys",
        carvings: "Wooden Carvings",
        decor: "Home Decor",
        dolls: "Dolls",
        crafts: "Decorative Crafts"
      },
      cameraGuides: {
        moveCloser: "Move closer",
        increaseLight: "Increase light",
        centerProduct: "Center the product",
        holdSteady: "Hold steady",
        goodLighting: "Lighting is good"
      },
      backgrounds: {
        white: "White Studio",
        wooden: "Wooden Showcase",
        luxury: "Luxury Catalog",
        heritage: "Heritage Texture"
      }
    }
  },
  kn: {
    translation: {
      appName: "ಶಿಲ್ಪ-ಕಲಾ",
      tagline: "ಡಿಜಿಟಲ್ ಪೋರ್ಟ್ಫೋಲಿಯೋ ಸಹಾಯಕ",
      selectLanguage: "ಭಾಷೆಯನ್ನು ಆರಿಸಿ",
      getStarted: "ಪ್ರಾರಂಭಿಸಿ",
      login: "ಲಾಗಿನ್",
      logout: "ಲಾಗ್ ಔಟ್",
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      camera: "ಸ್ಮಾರ್ಟ್ ಕ್ಯಾಮೆರಾ",
      gallery: "ನನ್ನ ಗ್ಯಾಲರಿ",
      branding: "ಬ್ರ್ಯಾಂಡಿಂಗ್",
      storefront: "ಡಿಜಿಟಲ್ ಮಳಿಗೆ",
      productName: "ಉತ್ಪನ್ನದ ಹೆಸರು",
      price: "ಬೆಲೆ",
      material: "ವಸ್ತು",
      description: "ವಿವರಣೆ",
      save: "ಉಳಿಸಿ",
      share: "ಹಂಚಿಕೊಳ್ಳಿ",
      edit: "ತಿದ್ದುಪಡಿ",
      delete: "ಅಳಿಸಿ",
      capture: "ಸೆರೆಹಿಡಿಯಿರಿ",
      processing: "ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ...",
      backgroundRemoved: "ಹಿನ್ನೆಲೆ ತೆಗೆದುಹಾಕಲಾಗಿದೆ",
      applyBranding: "ಬ್ರ್ಯಾಂಡಿಂಗ್ ಅನ್ವಯಿಸಿ",
      congratulations: "ಅಭಿನಂದನೆಗಳು!",
      productReady: "ನಿಮ್ಮ ಉತ್ಪನ್ನವು ಜಗತ್ತಿಗೆ ಸಿದ್ಧವಾಗಿದೆ.",
      karnatakaHandmade: "ಕರ್ನಾಟಕದ ಹಸ್ತಕಲೆ",
      heritageLabel: "ಪರಂಪರೆಯ ಕಲೆ",
      authenticitySeal: "ಅಧಿಕೃತತೆಯ ಪ್ರಮಾಣಪತ್ರ",
      artisanName: "ಕುಶಲಕರ್ಮಿ ಹೆಸರು",
      craftOrigin: "ಕಲೆಯ ಮೂಲ",
      contactDetails: "ಸಂಪರ್ಕ ವಿವರಗಳು",
      categories: {
        toys: "ಆಟಿಕೆಗಳು",
        carvings: "ಮರದ ಕೆತ್ತನೆಗಳು",
        decor: "ಮನೆ ಅಲಂಕಾರ",
        dolls: "ಗೊಂಬೆಗಳು",
        crafts: "ಅಲಂಕಾರಿಕ ಕಲೆಗಳು"
      },
      cameraGuides: {
        moveCloser: "ಹತ್ತಿರ ಸರಿಸಿ",
        increaseLight: "ಬೆಳಕು ಹೆಚ್ಚಿಸಿ",
        centerProduct: "ಉತ್ಪನ್ನವನ್ನು ಮಧ್ಯದಲ್ಲಿ ಇರಿಸಿ",
        holdSteady: "ಸ್ಥಿರವಾಗಿ ಹಿಡಿಯಿರಿ",
        goodLighting: "ಬೆಳಕು ಚೆನ್ನಾಗಿದೆ"
      }
    }
  },
  hi: {
    translation: {
      appName: "शिल्प-कला",
      tagline: "डिजिटल पोर्टफोलियो सहायक",
      selectLanguage: "भाषा चुनें",
      getStarted: "शुरू करें",
      dashboard: "डैशबोर्ड",
      camera: "स्मार्ट कैमरा",
      gallery: "मेरी गैलरी",
      karnatakaHandmade: "कर्नाटक में निर्मित",
      heritageLabel: "विरासत शिल्प"
    }
  },
  ta: {
    translation: {
      appName: "ஷில்பா-கலா",
      tagline: "டிஜிட்டல் போர்ட்ஃபோலியோ உதவியாளர்",
      selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
      getStarted: "தொடங்கவும்",
      dashboard: "டாஷ்போர்டு",
      camera: "ஸ்மார்ட் கேமரா",
      gallery: "எனது கேலரி"
    }
  },
  te: {
    translation: {
      appName: "శిల్ప-కళ",
      tagline: "డిజిటల్ పోర్ట్‌ఫోలియో అసిస్టెంట్",
      selectLanguage: "భాషను ఎంచుకోండి",
      getStarted: "ప్రారంభించండి",
      dashboard: "డ్యాష్‌బోర్డ్",
      camera: "స్మార్ట్ కెమెరా",
      gallery: "నా గ్యాలరీ"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
