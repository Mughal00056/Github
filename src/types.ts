export interface Review {
  id: string;
  username: string;
  avatar?: string;
  rating: number;
  text: string;
  date: string;
}

export type DownloadProvider = 'Google Drive' | 'Dropbox' | 'GitHub' | 'CDN' | 'S3 Buckets';

export interface Product {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: 'Web Templates' | 'UI Kits' | 'Scripts' | 'Plugins' | 'Graphics' | 'SaaS Tools' | 'AI Prompts';
  price: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  previewImage: string;
  downloadUrl: string; // The external download link (unlocked after purchase)
  provider: DownloadProvider;
  dateCreated: string;
  features: string[];
  fileSize: string;
  fileFormat: string;
  version: string;
  reviews: Review[];
  detailImageUrl?: string;
  detailText?: string;
}

export interface CartItem {
  product: Product;
  quantity?: number;
}

export interface Purchase {
  id: string;
  productId: string;
  productTitle: string;
  purchaseDate: string;
  amountPaid: number;
  downloadUrl: string;
  provider: DownloadProvider;
  unlockToken: string;
  ratingSubmitted?: boolean;
}

export interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  wishlistIds: string[];
  purchasedProducts: Purchase[];
}
