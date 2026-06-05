import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Sparkles, 
  Heart, 
  ShoppingBag, 
  TrendingUp, 
  Filter, 
  Star, 
  RotateCcw, 
  ArrowRight, 
  ChevronLeft,
  ChevronRight,
  Search, 
  SlidersHorizontal,
  ChevronDown,
  Info,
  CheckCircle,
  Clock,
  ShieldAlert,
  X,
  Download,
  Menu,
  ExternalLink,
  User,
  LogOut
} from 'lucide-react';

import { Product, CartItem, UserProfile, DownloadProvider, Review } from './types';
import { INITIAL_PRODUCTS } from './data';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import AdminDashboard from './admin/AdminDashboard';
import { db, syncUserProfile, getUserProfile, recordPurchase, getUserPurchases, logoutUser } from './firebase';

const CIRCLE_CATEGORIES = [
  { name: 'All', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150&h=150' },
  { name: 'Web Templates', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=150&h=150' },
  { name: 'UI Kits', image: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&q=80&w=150&h=150' },
  { name: 'Scripts', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=150&h=150' },
  { name: 'Downloads', image: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&q=80&w=150&h=150', isDownload: true }
];

export default function App() {
  // Theme Configuration (Light vs Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const cached = localStorage.getItem('aether-theme');
    if (cached === 'light' || cached === 'dark') return cached;
    return 'dark'; // Cool, high-contrast dark theme by default
  });

  // Products Data
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('aether-products');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Shopping Cart Products
  const [cart, setCart] = useState<CartItem[]>(() => {
    const cached = localStorage.getItem('aether-cart');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Logged-in User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const cached = localStorage.getItem('aether-user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Return default guest state
      }
    }
    return {
      email: '',
      name: 'Guest Developer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      isLoggedIn: false,
      isAdmin: true,
      wishlistIds: [],
      purchasedProducts: []
    };
  });

  // UI Visibility States
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  
  const handleAdminOpen = (open: boolean) => {
    setIsAdminPanelOpen(open);
    if (open) {
      window.history.pushState({}, '', '/admin/dashboard');
      setCurrentPath('/admin/dashboard');
    }
  };
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeFullImage, setActiveFullImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [menuSubView, setMenuSubView] = useState<'main' | 'thumbnail-form' | 'logo-form'>('main');

  // Custom Thumbnail/Asset Form States
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customShortDesc, setCustomShortDesc] = useState<string>('');
  const [customPreviewImage, setCustomPreviewImage] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<Product['category']>('Web Templates');
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [customDownloadUrl, setCustomDownloadUrl] = useState<string>('');

  // Custom Logo Form States
  const [logoTitle, setLogoTitle] = useState<string>('');
  const [logoShortDesc, setLogoShortDesc] = useState<string>('');
  const [logoPreviewImage, setLogoPreviewImage] = useState<string>('');
  const [logoCategory, setLogoCategory] = useState<Product['category']>('Graphics');
  const [logoPrice, setLogoPrice] = useState<number>(0);
  const [logoDownloadUrl, setLogoDownloadUrl] = useState<string>('');

  // Upload countdown timer metadata
  interface UploadingAsset {
    title: string;
    type: 'thumbnail' | 'logo';
    secondsLeft: number;
    totalSeconds: number;
    previewImage: string;
    shortDescription: string;
    category: Product['category'];
    price: number;
    downloadUrl: string;
  }
  const [uploadingAsset, setUploadingAsset] = useState<UploadingAsset | null>(null);

  // Mouse drag horizontal scroll for categories
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const [isCatDragActive, setIsCatDragActive] = useState(false);
  const [catStartX, setCatStartX] = useState(0);
  const [catScrollLeft, setCatScrollLeft] = useState(0);

  const handleCatMouseDown = (e: React.MouseEvent) => {
    if (!categoriesRef.current) return;
    setIsCatDragActive(true);
    setCatStartX(e.pageX - categoriesRef.current.offsetLeft);
    setCatScrollLeft(categoriesRef.current.scrollLeft);
  };

  const handleCatMouseLeaveOrUp = () => {
    setIsCatDragActive(false);
  };

  const handleCatMouseMove = (e: React.MouseEvent) => {
    if (!isCatDragActive || !categoriesRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoriesRef.current.offsetLeft;
    const walk = (x - catStartX) * 1.5; // speed multiplier
    categoriesRef.current.scrollLeft = catScrollLeft - walk;
  };

  // Search & Filter state variables
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(149);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // Checkout meta-state passed from Cart checkout trigger
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Welcome Toast banner setting
  const [showToast, setShowToast] = useState<string>('');

  // Splash Screen Active State
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [splashLogIndex, setSplashLogIndex] = useState<number>(0);

  // Top Slider Active Announcement State
  const [announcementIndex, setAnnouncementIndex] = useState<number>(0);

  // Spotlight Product Slider State
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);

  const SPLASH_LOGS = [
    "Initializing secure digital asset sandbox...",
    "Connecting to AetherVault secure mirrors...",
    "Decrypting file ingestion keys...",
    "Validating secure download protocol bounds...",
    "Setting up local sandbox storage variables...",
    "Active sync confirmed. Decrypted portal live!"
  ];

  const ANNOUNCEMENTS = [
    "🔥 EXCLUSIVE PROMO: Get 25% OFF on all React templates & UI kits using code VAULT25!",
    "⚡ SECURE SECRETS: Direct Dropbox & Drive browser unlocks, no registered logins requested!",
    "🛡️ SANDBOX GUARANTEE: Lightweight, verified, production-ready source scripts!",
    "💎 ACTIVE SPOTLIGHTS: Upgraded catalog features direct source updates every week!"
  ];

  // Splash and Top Bar Announcement timer configurations
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let logInterval: NodeJS.Timeout;

    progressInterval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setIsSplashActive(false), 550);
          return 100;
        }
        const step = Math.floor(Math.random() * 9) + 7;
        return Math.min(prev + step, 100);
      });
    }, 110);

    logInterval = setInterval(() => {
      setSplashLogIndex((prev) => (prev < SPLASH_LOGS.length - 1 ? prev + 1 : prev));
    }, 320);

    const announcementTimer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);

    const spotlightTimer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % 3); // rotate among top 3 assets
    }, 6000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      clearInterval(announcementTimer);
      clearInterval(spotlightTimer);
    };
  }, []);

  // Real-time synchronization of products with Firestore database
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const initProductsSync = async () => {
      try {
        const { collection, onSnapshot } = await import('firebase/firestore');
        const prodCol = collection(db, 'products');
        unsubscribe = onSnapshot(prodCol, (snapshot) => {
          if (!snapshot.empty) {
            const liveList: Product[] = [];
            snapshot.forEach((doc) => {
              liveList.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(liveList);
          } else {
            setProducts(INITIAL_PRODUCTS);
          }
        }, (err) => {
          console.warn("Firestore products snapshot listener error:", err);
        });
      } catch (err) {
        console.warn("Failsafe loading products error:", err);
      }
    };
    initProductsSync();
    return () => {
      unsubscribe();
    };
  }, []);

  // Settle theme transformations on root document
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('aether-theme', theme);
  }, [theme]);

  // Synchronizers to local storage
  useEffect(() => {
    localStorage.setItem('aether-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aether-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('aether-user', JSON.stringify(user));
  }, [user]);

  // Reset side menu view when it closes
  useEffect(() => {
    if (!isMenuOpen) {
      setMenuSubView('main');
    }
  }, [isMenuOpen]);

  // Handle simulated upload timer for custom assets
  useEffect(() => {
    if (!uploadingAsset) return;

    const timer = setInterval(() => {
      setUploadingAsset((prev) => {
        if (!prev) return null;
        if (prev.secondsLeft <= 1) {
          clearInterval(timer);
          
          // Construct and add the actual product now!
          const isLogo = prev.type === 'logo';
          const newProduct: Product = {
            id: `custom-${Date.now()}`,
            title: prev.title,
            shortDescription: prev.shortDescription,
            description: isLogo 
              ? `This is a high-performance custom vector logo asset dynamically published on AetherVault platform. Crafted in standard vector formats, this asset features sleek modern geometry, smart anchor grids, and beautiful color balance built specifically for elite technological branding projects.`
              : `This is a premium custom-compiled design asset dynamically published on AetherVault platform. It contains fully detailed layout templates, customizable vector modules, and direct high-performance source components for seamless sandbox development integration.`,
            category: prev.category,
            price: prev.price,
            rating: 5.0,
            reviewsCount: 0,
            tags: [prev.category.toLowerCase(), 'custom', 'sandbox', isLogo ? 'logo' : 'thumbnail'],
            previewImage: prev.previewImage || (isLogo 
              ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200' 
              : 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1200'),
            downloadUrl: prev.downloadUrl,
            provider: 'Google Drive',
            dateCreated: 'May 2026',
            features: isLogo ? [
              'Scale-independent SVG and Adobe Illustrator files',
              'Multiple vector lockups and monochrome presets',
              'Fully layered grid systems for developer scaling',
              'Lifetime developer integration license included'
            ] : [
              'Premium PNG/Image source thumbnail files included',
              'Lifetime unlimited developer integration licence',
              'Fully-tested high-performance component architecture',
              'Direct cloud mirror secure sandbox package files'
            ],
            fileSize: isLogo ? '2.8 MB' : '15.4 MB',
            fileFormat: isLogo ? 'SVG / AI Vector' : 'ZIP Archive',
            version: 'v1.0.0',
            reviews: []
          };

          setProducts((prevProducts) => [newProduct, ...prevProducts]);
          triggerToast(`Successfully compiled and published "${newProduct.title}" to catalog! 🚀`);
          return null;
        }
        return {
          ...prev,
          secondsLeft: prev.secondsLeft - 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [uploadingAsset]);

  // Handle custom thumbnail asset submission
  const handleCustomAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customPreviewImage || !customShortDesc || !customDownloadUrl) {
      alert("Please provide all required fields!");
      return;
    }

    // Trigger upload progress timer
    setUploadingAsset({
      title: customTitle,
      type: 'thumbnail',
      secondsLeft: 5,
      totalSeconds: 5,
      previewImage: customPreviewImage,
      shortDescription: customShortDesc,
      category: customCategory,
      price: customPrice,
      downloadUrl: customDownloadUrl
    });

    // Clear form
    setCustomTitle('');
    setCustomShortDesc('');
    setCustomPreviewImage('');
    setCustomCategory('Web Templates');
    setCustomPrice(0);
    setCustomDownloadUrl('');
    
    // Close Drawer
    setIsMenuOpen(false);
  };

  // Handle custom logo asset submission
  const handleCustomLogoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoTitle || !logoPreviewImage || !logoShortDesc) {
      alert("Please provide all required fields!");
      return;
    }

    // Trigger upload progress timer
    setUploadingAsset({
      title: logoTitle,
      type: 'logo',
      secondsLeft: 5,
      totalSeconds: 5,
      previewImage: logoPreviewImage,
      shortDescription: logoShortDesc,
      category: logoCategory,
      price: logoPrice,
      downloadUrl: 'https://github.com/Mughal00056/Hipoo/raw/main/src/components/SampleLogo.svg'
    });

    // Clear form
    setLogoTitle('');
    setLogoShortDesc('');
    setLogoPreviewImage('');
    setLogoCategory('Graphics');
    setLogoPrice(0);
    setLogoDownloadUrl('');
    
    // Close Drawer
    setIsMenuOpen(false);
  };

  // Trigger quick alerts
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast('');
    }, 4000);
  };

  // Add to Wishlist Toggle
  const handleToggleWishlist = async (productId: string) => {
    const exists = user.wishlistIds.includes(productId);
    const updatedWishlist = exists
      ? user.wishlistIds.filter(id => id !== productId)
      : [...user.wishlistIds, productId];

    setUser(prev => ({
      ...prev,
      wishlistIds: updatedWishlist
    }));

    if (user.isLoggedIn && user.email) {
      try {
        await syncUserProfile(user.email, user.name, user.avatar, updatedWishlist);
      } catch (err) {
        console.error('Wishlist cloud sync failed:', err);
      }
    }

    triggerToast(exists ? '💔 Item removed from saved Wishlist.' : '❤️ Saved to your Wishlist!');
  };

  // Direct remove from wishlist inside dashboard
  const handleRemoveFromWishlist = async (productId: string) => {
    const updatedWishlist = user.wishlistIds.filter(id => id !== productId);
    setUser(prev => ({
      ...prev,
      wishlistIds: updatedWishlist
    }));

    if (user.isLoggedIn && user.email) {
      try {
        await syncUserProfile(user.email, user.name, user.avatar, updatedWishlist);
      } catch (err) {
        console.error('Wishlist cloud sync failed:', err);
      }
    }

    triggerToast('💔 Item removed from saved Wishlist.');
  };

  // Add to Cart Action
  const handleAddToCart = (product: Product, quantityIn: number = 1) => {
    // Check if product exists in cart
    const exists = cart.some(item => item.product.id === product.id);
    if (exists) {
      setCart(prev => prev.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: (item.quantity || 1) + quantityIn }
          : item
      ));
      triggerToast('🛒 Cart updated with more quantity!');
      setIsCartOpen(true);
      return;
    }

    setCart(prev => [...prev, { product, quantity: quantityIn }]);
    triggerToast('🛒 Product added to shopping cart!');
  };

  // Quick single item Buy Now action
  const handleBuyNow = (product: Product, quantityIn: number = 1) => {
    // Put inside cart and launch checkout directly
    const inCart = cart.some(item => item.product.id === product.id);
    if (!inCart) {
      setCart([{ product, quantity: quantityIn }]);
    } else {
      setCart(prev => prev.map(item => 
        item.product.id === product.id
          ? { ...item, quantity: quantityIn }
          : item
      ));
    }
    setAppliedPromo('');
    setDiscountAmount(0);
    setIsCheckoutOpen(true);
  };

  // Remove checkout item
  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // From Cart Drawer: Continue to Secure Checkout
  const handleTriggerCheckout = (discountCode: string, discAmt: number) => {
    setAppliedPromo(discountCode);
    setDiscountAmount(discAmt);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Checkout Payment cleared callback
  const handlePurchaseSuccess = async (
    email: string, 
    itemsPaid: { id: string; price: number; title: string; downloadUrl: string; provider: DownloadProvider }[],
    paymentMeta?: { method: string; payNumber: string; transactionId: string }
  ) => {
    const currentDateStr = new Date().toISOString().split('T')[0];
    const orderId = `ord-${Math.floor(100 + Math.random() * 900)}`;
    
    // Convert paid items into lifetime license logs (initially locked with 'pending' status)
    const newPurchases = itemsPaid.map(item => ({
      id: `purch-${Math.random().toString(36).substring(2, 7)}-${Date.now().toString().slice(-4)}`,
      productId: item.id,
      productTitle: item.title,
      purchaseDate: currentDateStr,
      amountPaid: item.price,
      downloadUrl: item.downloadUrl,
      provider: item.provider,
      unlockToken: `LIC-CODE-${item.provider.toUpperCase().split(' ')[0]}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'pending', // Added status tracker to lock/control downloads
      orderId: orderId,
      method: paymentMeta?.method || 'Direct License',
      payNumber: paymentMeta?.payNumber || 'N/A',
      transactionId: paymentMeta?.transactionId || 'FREE-UNLOCK'
    }));

    const finalPurchasesList = [...user.purchasedProducts, ...newPurchases];

    setUser(prev => ({
      ...prev,
      email: prev.email || email,
      isLoggedIn: true,
      name: prev.name || email.split('@')[0],
      avatar: prev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      purchasedProducts: finalPurchasesList
    }));

    // Reset shopping cart
    setCart([]);

    // Post new order record to Server Backend so Admin sees it immediately
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          userEmail: email,
          userName: email.split('@')[0],
          totalAmount: itemsPaid.reduce((sum, i) => sum + i.price, 0),
          paymentStatus: 'pending',
          downloadStatus: 'pending',
          transactionId: paymentMeta?.transactionId || 'FREE-UNLOCK',
          method: paymentMeta?.method || 'Direct License',
          payNumber: paymentMeta?.payNumber || 'N/A',
          items: itemsPaid.map(item => ({ id: item.id, title: item.title, price: item.price }))
        })
      });
    } catch (err) {
      console.warn("Failed to register order on backend server:", err);
    }

    if (email) {
      const activeEmail = user.email || email;
      const activeName = user.name || email.split('@')[0];
      const activeAvatar = user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120';
      
      try {
        // Sync user profile first
        await syncUserProfile(activeEmail, activeName, activeAvatar, user.wishlistIds);
        
        // Write each single purchase record conforming to Firebase rules and schema
        for (const p of newPurchases) {
          await recordPurchase(activeEmail, p);
        }
        triggerToast('🎉 Order Transmitted! Pending admin clearance to unlock direct file downloads.');
      } catch (err) {
        console.error("Failed to sync purchase records to Firebase:", err);
        triggerToast('🎉 Order Transmitted! Pending admin clearance to unlock.');
      }
    } else {
      triggerToast('🎉 Order Transmitted! Pending admin clearance to unlock.');
    }
  };

  // Review Submissions Action
  const handleAddReview = (productId: string, newReview: Omit<Review, 'id' | 'date'>) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const generatedId = `rev-${Math.random().toString(36).substring(2, 6)}-${Date.now()}`;
    
    const configuredReview: Review = {
      ...newReview,
      id: generatedId,
      date: currentDate
    };

    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        if (prod.id !== productId) return prod;

        const updatedReviews = [configuredReview, ...prod.reviews];
        const sumRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
        const newAverageRating = parseFloat((sumRating / updatedReviews.length).toFixed(1));

        return {
          ...prod,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: newAverageRating
        };
      });
    });

    // Mirror change inside selectedDetail too, if active
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(prev => {
        if (!prev) return null;
        const updatedReviews = [configuredReview, ...prev.reviews];
        const sumRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
        const newAverageRating = parseFloat((sumRating / updatedReviews.length).toFixed(1));
        return {
          ...prev,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: newAverageRating
        };
      });
    }

    triggerToast('⭐ Thank you for writing feedback. Review recorded live!');
  };

  // Sign In custom profile
  const handleLoginSuccess = async (name: string, email: string, avatar: string) => {
    try {
      // 1. Fetch profile from Firestore
      const firebaseProfile = await getUserProfile(email);
      let finalName = name;
      let finalAvatar = avatar;
      let finalWishlist = user.wishlistIds;

      if (firebaseProfile) {
        finalName = firebaseProfile.name || finalName;
        finalAvatar = firebaseProfile.avatar || finalAvatar;
        finalWishlist = firebaseProfile.wishlistIds || [];
      } else {
        // Create user profile in Firestore
        await syncUserProfile(email, finalName, finalAvatar, finalWishlist);
      }

      // 2. Load historical purchases from Firestore
      const firebasePurchases = await getUserPurchases(email);
      const mergedPurchasedProducts = firebasePurchases && firebasePurchases.length > 0 
        ? firebasePurchases 
        : user.purchasedProducts;

      setUser({
        email,
        name: finalName,
        avatar: finalAvatar,
        isLoggedIn: true,
        isAdmin: firebaseProfile?.isAdmin || false,
        wishlistIds: finalWishlist,
        purchasedProducts: mergedPurchasedProducts
      });

      triggerToast(`👋 Welcome back, ${finalName}! Your Firebase profile was synchronized successfully.`);
    } catch (err) {
      console.error(err);
      // Fallback to local state if offline or failed rules
      setUser(prev => ({
        ...prev,
        name,
        email,
        avatar,
        isLoggedIn: true
      }));
      triggerToast(`👋 Welcome back, ${name}! (Local guest session initialized)`);
    }
  };

  // Edit core credentials profile metrics
  const handleUpdateProfile = (name: string, email: string) => {
    setUser(prev => ({
      ...prev,
      name,
      email
    }));
    triggerToast('⚙️ Profile metrics synchronized correctly!');
  };

  // Account Logout Actions
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Firebase logout warning:", e);
    }
    setUser({
      email: '',
      name: '',
      avatar: '',
      isLoggedIn: false,
      wishlistIds: [],
      purchasedProducts: []
    });
    setCart([]);
    triggerToast('🚪 Logged out safely.');
  };

  // Dynamic Filtering Logic
  const filteredProducts = products.filter(product => {
    // 1. Text Search matches title, tags, and category description
    const textQuery = searchQuery.toLowerCase().trim();
    const matchesKeyword = !textQuery || 
      product.title.toLowerCase().includes(textQuery) ||
      product.shortDescription.toLowerCase().includes(textQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(textQuery));

    // 2. Category Match
    const matchesCategory = activeCategory === 'All' || 
      (activeCategory === 'Downloads' 
        ? user.purchasedProducts.some(p => p.productId === product.id)
        : product.category === activeCategory);

    // 3. Price Match
    const matchesPrice = activeCategory === 'Downloads' || product.price <= maxPrice;

    // 4. Rating Match
    const matchesRating = activeCategory === 'Downloads' || product.rating >= minRating;

    return matchesKeyword && matchesCategory && matchesPrice && matchesRating;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    }
    if (sortBy === 'price_asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price_desc') {
      return b.price - a.price;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    // Default Sorting: Featured
    return b.reviewsCount - a.reviewsCount;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setMaxPrice(149);
    setMinRating(0);
    setSortBy('featured');
    triggerToast('🔄 Filters restored to catalog defaults!');
  };

  // Featured and trending asset definitions
  const trendingAssets = products.filter(p => p.rating >= 4.8).slice(0, 3);
  const spotlightProducts = products.filter(p => p.rating >= 4.7).slice(0, 3);

  // Synchronize path state on browser back/forward history transitions
  useEffect(() => {
    const handlePopState = () => {
      let path = window.location.pathname || '/';
      setCurrentPath(path);
    };
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Dual View controller
  if (currentPath.startsWith('/admin')) {
    return (
      <AdminDashboard 
        currentPath={currentPath}
        onNavigate={(path) => {
          window.history.pushState({}, '', path);
          setCurrentPath(path);
        }}
        onLogoutAdmin={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }}
        productsRef={products}
        onProductsUpdated={(pList) => {
          setProducts(pList);
          localStorage.setItem('aether-products', JSON.stringify(pList));
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 bg-zinc-50 text-zinc-900 dark:bg-[#050505] dark:text-slate-200 ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* 0. Luxury Sci-Fi Splash Screen loading overlay */}
      <AnimatePresence>
        {isSplashActive && (
          <motion.div
            id="aether-splash-screen"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              scale: 1.05,
              filter: "blur(8px)",
              transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
            }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#040406] text-white overflow-hidden p-4 sm:p-6 select-none"
          >
            {/* Background cyber mesh ambient lights */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
            <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-indigo-600/10 blur-[100px] sm:blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-violet-600/10 blur-[100px] sm:blur-[120px] pointer-events-none" />

            {/* Frosted Glass UI Card container */}
            <div className="w-full max-w-[90%] sm:max-w-md text-center p-6 sm:p-8 rounded-3xl bg-zinc-950/50 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative space-y-6 sm:space-y-8">
              
              {/* Spinning Logo Container */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 p-[1.5px] shadow-2xl shadow-indigo-500/30 flex items-center justify-center relative group"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 blur-md opacity-50" />
                <div className="w-full h-full rounded-2xl bg-zinc-950 flex items-center justify-center text-white relative z-10">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 stroke-[1.8] animate-pulse" />
                </div>
              </motion.div>

              {/* Title Header paired with tracking effects */}
              <div className="space-y-1 font-display">
                <motion.h1
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="font-black text-2xl sm:text-3xl tracking-tighter uppercase"
                >
                  Aether<span className="text-indigo-400 font-light">Vault</span>
                </motion.h1>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase"
                >
                  Premium Digital Artifacts Marketplace
                </motion.p>
              </div>

              {/* Progress Bar Loader & Labels */}
              <div className="space-y-3.5 pt-2">
                <div className="relative h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-full"
                    style={{ width: `${splashProgress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
                
                {/* Micro numbers and interactive status logs */}
                <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px]">
                  <div className="w-4/5 text-left text-zinc-300 truncate flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping shrink-0" />
                    <span className="truncate">{SPLASH_LOGS[splashLogIndex]}</span>
                  </div>
                  <span className="text-indigo-400 font-black ml-2 shrink-0">{splashProgress}%</span>
                </div>
              </div>

              {/* Secure sandbox protocol banner */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.6 }}
                className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase pt-4 sm:pt-6 border-t border-white/5"
              >
                Encrypted Connection SSL Secured • Build v2.4.1
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Announcement Sliding Promo Bar */}
      <div id="top-promo-slider" className="w-full bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 dark:from-zinc-950 dark:via-indigo-950/40 dark:to-zinc-950 border-b border-indigo-500/10 dark:border-white/5 py-2.5 sm:py-3 relative overflow-hidden text-white px-4">
        {/* Animated glowing border ray */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse" />
        
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono relative">
          
          {/* Previous Arrow Control */}
          <button 
            onClick={() => setAnnouncementIndex((prev) => (prev === 0 ? ANNOUNCEMENTS.length - 1 : prev - 1))}
            className="p-1 hover:text-indigo-400 dark:hover:text-amber-400 transition-colors shrink-0 text-slate-400 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
            title="Previous Announcement Item"
            aria-label="Previous Promo Notification"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
          </button>

          {/* Central Animated Text Content Area */}
          <div className="flex-1 overflow-hidden min-w-0 mx-4 h-5 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={announcementIndex}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="text-center text-[10px] sm:text-xs font-semibold text-slate-100 tracking-wide flex items-center justify-center gap-2 select-none"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">{ANNOUNCEMENTS[announcementIndex]}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Arrow Control */}
          <button 
            onClick={() => setAnnouncementIndex((next) => (next + 1) % ANNOUNCEMENTS.length)}
            className="p-1 hover:text-indigo-400 dark:hover:text-amber-400 transition-colors shrink-0 text-slate-400 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
            title="Next Announcement Item"
            aria-label="Next Promo Notification"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
          </button>
          
        </div>
      </div>
      
      {/* Top Welcome Notification Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 16, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            className="fixed top-0 left-1/2 z-50 transform -translate-x-1/2 flex items-center gap-2 px-4.5 py-3 rounded-xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-sans font-semibold shadow-2xl border border-zinc-800 dark:border-zinc-200"
          >
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header Navigation */}
      <Navbar
        theme={theme}
        setTheme={setTheme}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        user={user}
        setIsAuthModalOpen={setIsAuthModalOpen}
        setIsAdminPanelOpen={handleAdminOpen}
        setIsDashboardOpen={setIsDashboardOpen}
        onLogout={handleLogout}
        onBrandClick={() => {
          setActiveCategory('All');
          setSearchQuery('');
        }}
        onMenuClick={() => setIsMenuOpen(true)}
      />

      {/* Hero Head Banner */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pb-20 sm:pt-20 border-b border-zinc-200/50 dark:border-white/10 bg-white dark:bg-[#050505] transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-5 dark:opacity-[0.03]">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-indigo-500 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-violet-500 blur-3xl animate-bounce duration-10000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium tracking-wide bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 rounded-full border border-indigo-100/30 dark:border-indigo-500/25 mb-6 uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-spin duration-3000" />
            <span>Interactive Assets Sandbox Ready</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight leading-none text-zinc-900 dark:text-white max-w-4xl mx-auto uppercase">
            Build Faster with Premium <span className="bg-gradient-to-r from-indigo-600 via-violet-550 to-fuchsia-600 bg-clip-text text-transparent">Digital Assets</span>
          </h1>

          <p className="mt-4.5 text-base sm:text-lg text-zinc-500 dark:text-slate-450 max-w-2xl mx-auto">
            Browse premium React templates, figma UI kits, security backend scripts, and expert Gemini prompts. Experience secure instant unlocks delivered via Dropbox, Drive, or CDNs.
          </p>

          {/* Quick Mobile Search Bar Input */}
          <div className="mt-8 max-w-lg mx-auto md:hidden relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4.5 w-4.5 text-zinc-550 dark:text-zinc-500" />
            </div>
            <input
              id="mobile-search-banner"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search UI components, templates..."
              className="w-full pl-9.5 pr-4 py-3 text-xs bg-zinc-100 dark:bg-zinc-900 border border-transparent rounded-xl outline-none text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Space divider */}
          <div className="mt-8 border-t border-zinc-100 dark:border-white/10" />

        </div>
      </section>

      {/* Primary catalog dashboard layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Spotlight Carousel Banner - Smooth Animated Slider of Top Rated Assets with Premium Glass UI */}
        {searchQuery === '' && spotlightProducts.length > 0 && (
          <div 
            id="catalog-spotlight-carousel" 
            className="mb-10 backdrop-blur-xl bg-white/40 dark:bg-zinc-900/30 border border-white/40 dark:border-white/10 rounded-3xl p-5 sm:p-6 md:p-8 relative overflow-hidden shadow-[0_12px_44px_-10px_rgba(99,102,241,0.12)] dark:shadow-[0_12px_44px_-10px_rgba(0,0,0,0.5)] transition-all duration-300"
          >
            {/* Dynamic Glass Glow Highlights */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-[80px] pointer-events-none -mr-16 -mt-16 animate-pulse" />
            <div className="absolute left-10 bottom-0 w-56 h-56 rounded-full bg-indigo-600/10 dark:bg-indigo-500/10 blur-[70px] pointer-events-none -ml-16 -mb-16" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-505"></span>
                </span>
                <span className="text-[11px] font-mono tracking-widest text-indigo-600 dark:text-indigo-300 uppercase font-bold">Featured Spotlight</span>
              </div>
            </div>

            {/* Sliding Container with slide & crossfade effect */}
            <div className="relative min-h-[340px] sm:min-h-[260px] md:min-h-[220px] flex items-center relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={spotlightIndex}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragEnd={(e, info) => {
                    const swipeThreshold = 50;
                    if (info.offset.x < -swipeThreshold) {
                      setSpotlightIndex((prev) => (prev + 1) % spotlightProducts.length);
                    } else if (info.offset.x > swipeThreshold) {
                      setSpotlightIndex((prev) => (prev === 0 ? spotlightProducts.length - 1 : prev - 1));
                    }
                  }}
                  initial={{ opacity: 0, x: 80, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -80, filter: "blur(4px)" }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-center cursor-grab active:cursor-grabbing select-none"
                >
                  {/* Left Column for product image preview */}
                  <div className="col-span-1 md:col-span-4 lg:col-span-4 relative group w-full max-w-md mx-auto md:max-w-none">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/30 to-violet-500/30 opacity-60 blur-md group-hover:opacity-100 transition-opacity" />
                    <div className="aspect-video sm:aspect-[4/3] md:aspect-video w-full rounded-2xl overflow-hidden border border-white/50 dark:border-white/10 shadow-lg relative z-10 bg-zinc-150/50 dark:bg-black/40">
                      <img
                        src={spotlightProducts[spotlightIndex].previewImage}
                        alt={spotlightProducts[spotlightIndex].title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103 select-none pointer-events-none"
                      />
                    </div>
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider z-20 border border-white/10">
                      {spotlightProducts[spotlightIndex].category}
                    </div>
                  </div>

                  {/* Right Column for content summaries */}
                  <div className="col-span-1 md:col-span-8 lg:col-span-8 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400 text-xs">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-zinc-650 dark:text-zinc-400 font-mono text-[11px]">({spotlightProducts[spotlightIndex].reviewsCount} Verified Ratings)</span>
                      </div>
                      
                      <h3 className="text-lg sm:text-2xl font-display font-black text-zinc-900 dark:text-white leading-snug uppercase tracking-tight">
                        {spotlightProducts[spotlightIndex].title}
                      </h3>
                      
                      <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-slate-350 max-w-2xl leading-relaxed">
                        {spotlightProducts[spotlightIndex].shortDescription}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {spotlightProducts[spotlightIndex].tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[9px] sm:text-[10px] font-mono bg-zinc-200/50 dark:bg-white/5 border border-zinc-300/30 dark:border-white/5 py-1 px-2.5 rounded-md text-zinc-700 dark:text-slate-300 uppercase">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Interactive Triggers */}
                    <div className="flex flex-wrap items-center gap-3.5 pt-3 border-t border-zinc-200 dark:border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 dark:text-slate-500">Asset Cost</span>
                        <span className="text-lg sm:text-xl font-mono font-black text-indigo-650 dark:text-indigo-400">
                          {spotlightProducts[spotlightIndex].price === 0 ? 'FREE' : `$${spotlightProducts[spotlightIndex].price}`}
                        </span>
                      </div>
                      
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProduct(spotlightProducts[spotlightIndex])}
                          className="px-3.5 sm:px-4.5 py-2 bg-zinc-200/60 dark:bg-white/5 hover:bg-zinc-300/60 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-100 text-xs font-semibold rounded-xl active:scale-98 transition-all cursor-pointer font-sans border border-transparent dark:border-white/5"
                        >
                          Details
                        </button>

                        <button
                          onClick={() => handleBuyNow(spotlightProducts[spotlightIndex])}
                          className="px-4.5 sm:px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl active:scale-98 transition-all cursor-pointer font-sans shadow-md shadow-indigo-500/10"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Centered Spotlight Navigator arrows and dots at the bottom ("nicha") */}
            <div id="spotlight-navigator" className="flex items-center justify-center gap-3 mt-6 pb-2 relative z-20 select-none">
              <button
                id="spotlight-prev-arrow"
                onClick={() => setSpotlightIndex((prev) => (prev === 0 ? spotlightProducts.length - 1 : prev - 1))}
                className="w-9 h-9 rounded-full bg-zinc-200/60 hover:bg-zinc-300/85 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-zinc-300/30 dark:border-white/5 transition-all active:scale-90 cursor-pointer shadow-sm"
                title="Previous Spotlight Asset"
                aria-label="Previous Spotlight slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5 bg-zinc-200/40 dark:bg-white/5 py-2 px-3.5 rounded-full border border-zinc-300/30 dark:border-white/5">
                {spotlightProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSpotlightIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-350 cursor-pointer ${
                      spotlightIndex === idx 
                        ? 'w-6 bg-indigo-650 dark:bg-indigo-400' 
                        : 'w-2.5 bg-zinc-400/40 dark:bg-white/10 hover:bg-zinc-400/60 dark:hover:bg-white/20'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                id="spotlight-next-arrow"
                onClick={() => setSpotlightIndex((prev) => (prev + 1) % spotlightProducts.length)}
                className="w-9 h-9 rounded-full bg-zinc-200/60 hover:bg-zinc-300/85 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-zinc-300/30 dark:border-white/5 transition-all active:scale-90 cursor-pointer shadow-sm"
                title="Next Spotlight Asset"
                aria-label="Next Spotlight slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

         {/* Catalog List section - beautifully centered list of assets */}
        <div className="w-full space-y-6">
          
          {/* Main catalog items list */}
          <div className="w-full space-y-6">


            
            {/* Sorted list grids */}
            {sortedProducts.length === 0 ? (
              <div className="py-24 text-center space-y-4 bg-white dark:bg-zinc-950 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-900">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-350 dark:text-zinc-655 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-sans font-bold text-zinc-900 dark:text-zinc-50">No files matched search bounds!</h4>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm mx-auto">
                    Try checking other filter categories, tweaking search keyword expressions, or exploring tags.
                  </p>
                </div>
                <button
                  id="not-found-reset-btn"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white font-sans font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Restore Search Catalog Defaults
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                <AnimatePresence mode="popLayout">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={setSelectedProduct}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      isWishlisted={user.wishlistIds.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onOpenImage={setActiveFullImage}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Trending assets section */}
            {searchQuery === '' && activeCategory === 'All' && (
              <div className="pt-8 border-t border-zinc-200/50 dark:border-white/5">
                <div className="flex items-center gap-2 mb-6 font-sans">
                  <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
                  <h3 className="font-display font-black text-xs sm:text-sm uppercase tracking-wide text-zinc-900 dark:text-slate-205">Trending High-Rated Assets</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trendingAssets.map(asset => (
                    <div
                      id={`trending-card-${asset.id}`}
                      key={asset.id}
                      onClick={() => setSelectedProduct(asset)}
                      className="p-3.5 bg-white dark:bg-white/[0.015] hover:bg-zinc-100/10 dark:hover:bg-white/5 rounded-xl border border-zinc-200/50 dark:border-white/10 cursor-pointer flex gap-3.5 transition-colors group"
                    >
                      <img
                        src={asset.previewImage}
                        alt={asset.title}
                        className="w-16 h-12 object-cover rounded-lg shrink-0 border border-zinc-105 dark:border-white/10"
                      />
                      <div className="min-w-0 pr-1 flex flex-col justify-center font-sans">
                        <span className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-widest">{asset.category}</span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {asset.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[10.5px] text-amber-400 mt-0.5">
                          <span>★ {asset.rating}</span>
                          <span className="text-zinc-400">({asset.reviewsCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Recent Purchase Activity / Mini Widget */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-zinc-200/50 dark:border-white/5 pt-8 gap-4 font-mono text-[10px]">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-1.5">
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">A</div>
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">B</div>
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-amber-500 flex items-center justify-center text-[10px] text-white font-bold">C</div>
            </div>
            <p className="text-zinc-500 dark:text-slate-400 text-xs font-sans">
              <span className="text-zinc-900 dark:text-white font-semibold">4.8k+ creators</span> recently updated their assets library
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-[#070707] rounded-full border border-zinc-200 dark:border-[#1a1a1a] text-[10px] text-zinc-400 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Cloud Sync Active
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-[#070707] rounded-full border border-zinc-200 dark:border-[#1a1a1a] text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
              v2.4.1
            </div>
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="border-t border-zinc-200/60 dark:border-white/10 bg-white dark:bg-[#0a0a0a] transition-colors py-10 mt-16 text-xs text-zinc-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="font-sans font-bold text-sm text-zinc-750 dark:text-white uppercase tracking-tighter">
              Aether<span className="text-indigo-550 font-light">Vault</span>
            </span>
            <p className="text-[10px] mt-1 text-zinc-450 dark:text-slate-500">© 2026 Sandbox Asset Vault. All rights reserved.</p>
          </div>

          <div className="flex gap-4.5 text-[10px] font-semibold text-zinc-500">
            <span>PCI-DSS Secured Gateway</span>
            <span>•</span>
            <span>External Link Security Policy</span>
            <span>•</span>
            <span>No-Blob Zero Uploads</span>
          </div>
        </div>
      </footer>

      {/* RENDER MODAL OUTLETS */}
      
      {/* 1. Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onTriggerCheckout={handleTriggerCheckout}
          />
        )}
      </AnimatePresence>

      {/* 2. Secure Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            subtotal={cart.reduce((sum, item) => sum + item.product.price * (item.quantity || 1), 0)}
            discountAmount={discountAmount}
            discountCode={appliedPromo}
            onPurchaseSuccess={handlePurchaseSuccess}
            userEmail={user.email}
          />
        )}
      </AnimatePresence>

      {/* 3. Authentication Setup Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

      {/* 4. Customer User Dashboard Portal */}
      <AnimatePresence>
        {isDashboardOpen && (
          <Dashboard
            isOpen={isDashboardOpen}
            onClose={() => setIsDashboardOpen(false)}
            user={user}
            allProducts={products}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onAddToCart={handleAddToCart}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </AnimatePresence>

      {/* Upload Progress Timer HUD */}
      <AnimatePresence>
        {uploadingAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden relative"
            >
              {/* Corner Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />

              <div className="text-center space-y-4 relative z-10">
                {/* Spinner and Countdown Indicator */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="38"
                      className="stroke-zinc-100 dark:stroke-zinc-850"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="38"
                      className={`${uploadingAsset.type === 'logo' ? 'stroke-emerald-500 dark:stroke-emerald-400' : 'stroke-indigo-600 dark:stroke-indigo-400'}`}
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 38}
                      animate={{
                        strokeDashoffset: (2 * Math.PI * 38) * (1 - uploadingAsset.secondsLeft / uploadingAsset.totalSeconds)
                      }}
                      transition={{ duration: 0.95, ease: "linear" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-xl sm:text-2xl font-black text-zinc-850 dark:text-white leading-none">
                      {uploadingAsset.secondsLeft}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 leading-none mt-1">
                      sec
                    </span>
                  </div>
                </div>

                {/* Subtitle / Asset Description details */}
                <div className="space-y-1.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-full tracking-wider ${
                    uploadingAsset.type === 'logo' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/55' 
                      : 'bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 border border-indigo-100/55 dark:border-indigo-950/55'
                  }`}>
                    {uploadingAsset.type === 'logo' ? (
                      <>
                        <Compass className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
                        <span>Compiling Brand Logo</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
                        <span>Packaging Thumbnail</span>
                      </>
                    )}
                  </span>
                  <h3 className="text-base font-sans font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight truncate px-2">
                    {uploadingAsset.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-400 font-mono tracking-normal leading-relaxed max-w-xs mx-auto truncate">
                    {uploadingAsset.shortDescription}
                  </p>
                </div>

                {/* Simulated build system progress steps */}
                <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-850 p-3.5 rounded-2xl text-left space-y-2 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-850 pb-1.5 mb-1.5">
                    <span>PORTAL BUILD CORE: ACTIVE</span>
                    <span className="animate-pulse text-emerald-500 font-bold">● ONLINE</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${uploadingAsset.secondsLeft <= 5 ? 'bg-indigo-500' : 'bg-zinc-300'}`} />
                      <span className={uploadingAsset.secondsLeft <= 5 ? 'text-zinc-800 dark:text-zinc-200 font-bold' : 'text-zinc-450 dark:text-zinc-500'}>
                        [01] Ingesting source vectors & URLs...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${uploadingAsset.secondsLeft <= 4 ? 'bg-indigo-500' : 'bg-zinc-300'}`} />
                      <span className={uploadingAsset.secondsLeft <= 4 ? 'text-zinc-800 dark:text-zinc-200 font-bold' : 'text-zinc-455 dark:text-zinc-500'}>
                        [02] Verifying bounds & dimensions...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${uploadingAsset.secondsLeft <= 3 ? 'bg-indigo-500' : 'bg-zinc-300'}`} />
                      <span className={uploadingAsset.secondsLeft <= 3 ? 'text-zinc-800 dark:text-zinc-200 font-bold' : 'text-zinc-455 dark:text-zinc-500'}>
                        [03] Syncing secure S3 storage links...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${uploadingAsset.secondsLeft <= 2 ? 'bg-indigo-500' : 'bg-zinc-300'}`} />
                      <span className={uploadingAsset.secondsLeft <= 2 ? 'text-zinc-800 dark:text-zinc-200 font-bold' : 'text-zinc-455 dark:text-zinc-500'}>
                        [04] Injecting secure metadata headers...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${uploadingAsset.secondsLeft <= 1 ? 'bg-emerald-500 animate-ping' : 'bg-zinc-300'}`} />
                      <span className={uploadingAsset.secondsLeft <= 1 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-455 dark:text-zinc-500'}>
                        [05] Finalizing catalog persistence...
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-1 select-none">
                  DO NOT CLOSE TAB • SANDBOX INDEX SYNC LIVE
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Product Detail Modal panel */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isPurchased={user.purchasedProducts.some(p => p.productId === selectedProduct.id)}
            onAddReview={handleAddReview}
            user={user}
            setIsAuthModalOpen={setIsAuthModalOpen}
            onOpenImage={setActiveFullImage}
          />
        )}
      </AnimatePresence>

      {/* 6. High-end Glass Lightbox Modal for Product Images */}
      <AnimatePresence>
        {activeFullImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveFullImage(null)}
            className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="relative max-w-5xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-zinc-900/50 backdrop-blur-xl flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeFullImage}
                alt="Full Preview View"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              />
              <button
                onClick={() => setActiveFullImage(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-2.5 rounded-full border border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Sandbox Control Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-zinc-950/75 backdrop-blur-xs cursor-pointer"
            />

            {/* Content panel */}
            <div className="absolute inset-y-0 left-0 max-w-full flex">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-full max-w-md bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-850 shadow-2xl flex flex-col h-full"
              >
                {/* Header */}
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                  {menuSubView !== 'main' ? (
                    <button
                      onClick={() => setMenuSubView('main')}
                      className="flex items-center gap-2 text-indigo-650 hover:text-indigo-500 dark:text-indigo-400 hover:dark:text-indigo-300 font-sans font-bold text-xs uppercase cursor-pointer"
                    >
                      <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Back to Menu</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <Menu className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-sans font-black text-sm uppercase dark:text-zinc-100 tracking-tight">Main Portal Menu</h3>
                        <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Studio Portal</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">

                  {menuSubView === 'main' && (
                    <div className="space-y-6">
                      
                      {/* Customized Thumbnail studio prompt */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Thumbnail Studio</span>
                        <button
                          onClick={() => setMenuSubView('thumbnail-form')}
                          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50/75 to-violet-50/50 hover:from-indigo-100/70 hover:to-violet-100/50 dark:from-indigo-950/20 dark:to-violet-950/10 dark:hover:from-indigo-950/35 dark:hover:to-violet-950/25 border border-indigo-100/70 dark:border-indigo-950/40 rounded-2xl cursor-pointer text-left transition-all active:scale-99"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/25">
                              <Sparkles className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-xs font-sans font-bold text-zinc-850 dark:text-white uppercase tracking-tight">Customized Thumbnail</h4>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-450 leading-none mt-0.5">Configure custom image, label & price</p>
                            </div>
                          </div>
                          <div className="text-indigo-600 dark:text-indigo-400">
                            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      </div>

                      {/* Customized Logo brand studio prompt */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Logo Brand Studio</span>
                        <button
                          onClick={() => setMenuSubView('logo-form')}
                          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50/75 to-teal-50/50 hover:from-emerald-100/70 hover:to-teal-100/50 dark:from-emerald-950/20 dark:to-teal-950/10 dark:hover:from-emerald-950/35 dark:hover:to-teal-950/25 border border-emerald-100/70 dark:border-emerald-950/40 rounded-2xl cursor-pointer text-left transition-all active:scale-99"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/25">
                              <Compass className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-xs font-sans font-bold text-zinc-850 dark:text-white uppercase tracking-tight">Customized Logo Design</h4>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-450 leading-none mt-0.5">Set vector elements, badge concepts & price</p>
                            </div>
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400">
                            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      </div>

                      {/* Navigation shortcuts */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Navigation shortcuts</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              setActiveCategory('All');
                            }}
                            className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/55 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-855 text-left text-xs font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer shadow-xs transition-colors"
                          >
                            Explore Catalog
                          </button>
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              if (user.isLoggedIn) {
                                setIsDashboardOpen(true);
                              } else {
                                setIsAuthModalOpen(true);
                              }
                            }}
                            className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/55 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-855 text-left text-xs font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer shadow-xs transition-colors"
                          >
                            My Saved Library
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {menuSubView === 'thumbnail-form' && (
                    <div className="space-y-6">
                      <div className="border border-indigo-100 dark:border-indigo-950 bg-indigo-50/15 dark:bg-indigo-950/10 p-4.5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">Publish Customized Thumbnail</h4>
                        </div>
                        <p className="text-[11px] text-zinc-555 dark:text-zinc-400 leading-relaxed -mt-1.5">
                          Dynamically publish your custom assets with elegant custom image previews, thumbnail description subtitles, and custom pricing!
                        </p>

                        <form onSubmit={handleCustomAssetSubmit} className="space-y-3.5">
                          
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-455 dark:text-zinc-400 tracking-wide uppercase mb-1">Thumbnail Name / Label</label>
                            <input
                              type="text"
                              required
                              value={customShortDesc}
                              onChange={(e) => setCustomShortDesc(e.target.value)}
                              placeholder="e.g. Clean 24+ Layout Screen Components"
                              className="w-full text-xs p-2.5 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-zinc-455 dark:text-zinc-400 tracking-wide uppercase mb-1">PNG Image / Preview URL</label>
                            <input
                              type="url"
                              required
                              value={customPreviewImage}
                              onChange={(e) => setCustomPreviewImage(e.target.value)}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="w-full text-xs p-2.5 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-455 dark:text-zinc-400 tracking-wide uppercase mb-1">Category</label>
                              <select
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value as any)}
                                className="w-full text-xs p-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                              >
                                <option value="Web Templates">Web Templates</option>
                                <option value="UI Kits">UI Kits</option>
                                <option value="Scripts">Scripts</option>
                                <option value="Plugins">Plugins</option>
                                <option value="Graphics">Graphics</option>
                                <option value="SaaS Tools">SaaS Tools</option>
                                <option value="AI Prompts">AI Prompts</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-zinc-455 dark:text-zinc-405 tracking-wide uppercase mb-1">Price ($USD)</label>
                              <input
                                type="number"
                                min="0"
                                max="500"
                                required
                                value={customPrice}
                                onChange={(e) => setCustomPrice(Number(e.target.value))}
                                className="w-full text-xs p-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs rounded-xl active:scale-99 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            Publish Customized Thumbnail 🚀
                          </button>
                        </form>
                      </div>

                      {/* Sandbox helper instructions */}
                      <div className="flex gap-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-150 dark:border-zinc-850 rounded-2xl">
                        <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          Customized thumbnails persist inside active client storage! Easily add name, select custom category circles, specify PNG preview images, and try full shopping checkout flow instantly.
                        </p>
                      </div>
                    </div>
                  )}

                  {menuSubView === 'logo-form' && (
                    <div className="space-y-6">
                      <div className="border border-emerald-100 dark:border-emerald-950 bg-emerald-50/15 dark:bg-emerald-950/10 p-4.5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Publish Customized Logo</h4>
                        </div>
                        <p className="text-[11px] text-zinc-555 dark:text-zinc-400 leading-relaxed -mt-1.5">
                          Configure and publish your vector brand logo templates. Specify geometric concepts, custom design previews, and price!
                        </p>

                        <form onSubmit={handleCustomLogoSubmit} className="space-y-3.5">
                          <div>
                            <label className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-400 tracking-wide uppercase mb-1">Logo Name / Text</label>
                            <input
                              type="text"
                              required
                              value={logoTitle}
                              onChange={(e) => setLogoTitle(e.target.value)}
                              placeholder="e.g. Conqueror Apex Wordmark"
                              className="w-full text-xs p-2.5 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-805 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-white transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-400 tracking-wide uppercase mb-1">Short Description</label>
                            <input
                              type="text"
                              required
                              value={logoShortDesc}
                              onChange={(e) => setLogoShortDesc(e.target.value)}
                              placeholder="e.g. Modern geometric shield and dynamic lines vector logo"
                              className="w-full text-xs p-2.5 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-805 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-white transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-400 tracking-wide uppercase mb-1">Logo Image</label>
                            <input
                              type="url"
                              required
                              value={logoPreviewImage}
                              onChange={(e) => setLogoPreviewImage(e.target.value)}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="w-full text-xs p-2.5 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-805 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-white transition-colors"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-400 tracking-wide uppercase mb-1">Category</label>
                              <select
                                value={logoCategory}
                                onChange={(e) => setLogoCategory(e.target.value as any)}
                                className="w-full text-xs p-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-805 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-white transition-colors"
                              >
                                <option value="Graphics">Graphics</option>
                                <option value="UI Kits">UI Kits</option>
                                <option value="Web Templates">Web Templates</option>
                                <option value="SaaS Tools">SaaS Tools</option>
                                <option value="AI Prompts">AI Prompts</option>
                                <option value="Scripts">Scripts</option>
                                <option value="Plugins">Plugins</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-400 tracking-wide uppercase mb-1">Price ($USD)</label>
                              <input
                                type="number"
                                min="0"
                                max="500"
                                required
                                value={logoPrice}
                                onChange={(e) => setLogoPrice(Number(e.target.value))}
                                className="w-full text-xs p-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-805 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-white transition-colors"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs rounded-xl active:scale-99 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            Publish Customized Logo 🚀
                          </button>
                        </form>
                      </div>

                      {/* Sandbox helper instructions */}
                      <div className="flex gap-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-150 dark:border-zinc-850 rounded-2xl">
                        <Info className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          Customized Logos persist in active local storage sandbox! Seamlessly download vector structures inside the Checkout Simulator.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
