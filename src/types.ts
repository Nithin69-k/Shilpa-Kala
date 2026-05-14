export interface Product {
  id: string;
  artisanId: string;
  name: string;
  price: number;
  material: string;
  description: string;
  category: string;
  imageUrl: string;
  originalImageUrl?: string;
  processedImageUrl?: string;
  artisanName: string;
  craftOrigin: string;
  contactDetails: string;
  createdAt: any;
  updatedAt: any;
  branding?: BrandingConfig;
  views: number;
  inboxCount: number;
}

export interface BrandingConfig {
  overlayText?: string;
  showKarnatakaBadge: boolean;
  showHeritageLabel: boolean;
  showAuthenticitySeal: boolean;
  layout: 'standard' | 'minimal' | 'luxury';
  customName?: string;
  customStore?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  location?: string;
  storeName?: string;
  bio?: string;
  phone?: string;
  inboxCount?: number;
  totalViews?: number;
}
