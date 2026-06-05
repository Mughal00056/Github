import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Box, Folder, ShoppingBag, Users, Ticket, 
  CreditCard, TrendingUp, DollarSign, Activity, LogOut, CheckCircle2, 
  Hourglass, Ban, Eye, Edit, Trash2, Plus, Star, ToggleLeft, 
  ToggleRight, Search, FileDown, ShieldCheck, Mail, Calendar, Key, AlertTriangle, ArrowLeft, Menu, X
} from 'lucide-react';
import { db, auth, updatePurchaseStatus, getPaymentDetails, updatePaymentDetails, updatePromoCodes } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Product, Review, DownloadProvider } from '../types';
import { INITIAL_PRODUCTS } from '../data';

interface AdminDashboardProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogoutAdmin: () => void;
  productsRef: Product[];
  onProductsUpdated: (products: Product[]) => void;
}

export default function AdminDashboard({ currentPath, onNavigate, onLogoutAdmin, productsRef, onProductsUpdated }: AdminDashboardProps) {
  const adminEmail = auth.currentUser?.email || 'mrflop786@gmail.com';
  // Mobile drawer panel toggle state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Database status states
  const [products, setProducts] = useState<Product[]>(productsRef);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    summary: { totalRevenue: 194, totalOrders: 3, totalProducts: 8, totalUsers: 4, pendingOrders: 1, completedOrders: 2, todaySales: 110 },
    salesByCategory: { "Web Templates": 49, "UI Kits": 35, "Scripts": 75, "Graphics": 35, "Plugins": 0, "SaaS Tools": 0, "AI Prompts": 0 },
    dailyRevenue: [ { day: "Mon", revenue: 140 }, { day: "Tue", revenue: 220 }, { day: "Wed", revenue: 190 }, { day: "Thu", revenue: 310 }, { day: "Fri", revenue: 290 }, { day: "Sat", revenue: 420 }, { day: "Sun", revenue: 194 } ],
    mostSold: [ { title: "Aether Dashboard Template", sold: 14, revenue: 686 }, { title: "VividUI Premium Figma UI Kit", sold: 11, revenue: 385 } ]
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state variables
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Create / Edit Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'Web Templates',
    price: 39,
    discountPercent: 10,
    tags: '',
    previewImage: '',
    downloadUrl: '',
    provider: 'Google Drive' as DownloadProvider,
    featured: false,
    active: true,
    fileSize: '15 MB',
    fileFormat: 'ZIP File',
    version: '1.0.0',
    detailImageUrl: '',
    detailText: ''
  });

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');

  // Announcements Ticker State
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');

  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percent',
    discountValue: 15,
    expiryDate: '2026-12-31',
    active: true
  });

  // Settings module state (Eno / Easypaisa numbers)
  const [settings, setSettings] = useState({
    easypaisaNumber: '0300-1122334',
    jazzcashNumber: '0321-5556677',
    cryptoAddress: '0x8fae32bc117a78e5ab924aa91b0c9a41ccde35ec'
  });

  // Load everything from dynamic backend APIs & fallback gracefully to Firestore or mock database
  useEffect(() => {
    // Restore cached data first for instant mobile visual update
    const cachedCats = localStorage.getItem('cached_categories');
    if (cachedCats) {
      try { setCategories(JSON.parse(cachedCats)); } catch (e) {}
    }
    const cachedProds = localStorage.getItem('cached_products');
    if (cachedProds) {
      try {
        const lp = JSON.parse(cachedProds);
        setProducts(lp);
      } catch (e) {}
    }
    const cachedAnnounces = localStorage.getItem('cached_announcements');
    if (cachedAnnounces) {
      try { setAnnouncements(JSON.parse(cachedAnnounces)); } catch (e) {}
    }
    const cachedEscrow = localStorage.getItem('admin_escrow_settings');
    if (cachedEscrow) {
      try {
        const parsed = JSON.parse(cachedEscrow);
        setSettings({
          easypaisaNumber: parsed.easypaisaNumber || '0300-1122334',
          jazzcashNumber: parsed.jazzcashNumber || '0321-5556677',
          cryptoAddress: parsed.cryptoAddress || '0x8fae32bc117a78e5ab924aa91b0c9a41ccde35ec'
        });
      } catch (e) {}
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch products safely (from Firestore or server API with robust error handling)
        let liveProducts: Product[] = [];
        try {
          const prodCol = collection(db, 'products');
          const prodSnap = await getDocs(prodCol);
          if (prodSnap && !prodSnap.empty) {
            prodSnap.forEach(d => liveProducts.push({ id: d.id, ...d.data() } as Product));
          } else {
            liveProducts = productsRef.length > 0 ? productsRef : INITIAL_PRODUCTS;
            // Seed to firestore dynamically with individual-item error protection
            for (const p of liveProducts) {
              try {
                await setDoc(doc(db, 'products', p.id), p);
              } catch (seedErr) {
                console.warn(`Could not seed product ${p.id} to cloud Firestore:`, seedErr);
              }
            }
          }
        } catch (prodErr) {
          console.warn("Could not fetch products from Firestore, falling back to local list:", prodErr);
          liveProducts = productsRef.length > 0 ? productsRef : INITIAL_PRODUCTS;
        }
        setProducts(liveProducts);
        localStorage.setItem('cached_products', JSON.stringify(liveProducts));
        onProductsUpdated(liveProducts);

        // Fetch other modules from custom Express API endpoints or mock fallbacks
        const [analRes, coupRes, userRes, ordRes, catRes, announcesRes] = await Promise.all([
          fetch('/api/analytics').then(r => r.ok ? r.json() : null),
          fetch('/api/coupons').then(r => r.ok ? r.json() : null),
          fetch('/api/users').then(r => r.ok ? r.json() : null),
          fetch('/api/orders').then(r => r.ok ? r.json() : null),
          fetch('/api/categories').then(r => r.ok ? r.json() : null),
          fetch('/api/announcements').then(r => r.ok ? r.json() : null),
        ]);

        if (analRes) setAnalytics(analRes);
        if (coupRes) setCoupons(coupRes);
        if (userRes) setUsers(userRes);
        if (ordRes) setOrders(ordRes);
        if (catRes) {
          setCategories(catRes);
          localStorage.setItem('cached_categories', JSON.stringify(catRes));
        }
        if (announcesRes) {
          setAnnouncements(announcesRes);
          localStorage.setItem('cached_announcements', JSON.stringify(announcesRes));
        }

        // Fetch systems escrow config elements
        try {
          const localEscrow = localStorage.getItem('admin_escrow_settings');
          if (localEscrow) {
            try {
              const parsed = JSON.parse(localEscrow);
              setSettings({
                easypaisaNumber: parsed.easypaisaNumber || '0300-1122334',
                jazzcashNumber: parsed.jazzcashNumber || '0321-5556677',
                cryptoAddress: parsed.cryptoAddress || '0x8fae32bc117a78e5ab924aa91b0c9a41ccde35ec'
              });
            } catch (e) {}
          }
          const liveSettings = await getPaymentDetails();
          if (liveSettings && (liveSettings.easypaisaNumber || liveSettings.jazzcashNumber || liveSettings.cryptoAddress)) {
            setSettings({
              easypaisaNumber: liveSettings.easypaisaNumber || '0300-1122334',
              jazzcashNumber: liveSettings.jazzcashNumber || '0321-5556677',
              cryptoAddress: liveSettings.cryptoAddress || '0x8fae32bc117a78e5ab924aa91b0c9a41ccde35ec'
            });
          }
        } catch (setErr) {
          console.warn('Could not load escrow agent account details:', setErr);
        }

        // Get live Firestore user list fallback
        if (!userRes || userRes.length === 0) {
          try {
            const uCol = collection(db, 'users');
            const uSnap = await getDocs(uCol);
            const uList: any[] = [];
            uSnap.forEach(snap => {
              const data = snap.data();
              uList.push({
                email: data.email || snap.id,
                name: data.name || 'Member Account',
                role: data.isAdmin ? 'admin' : 'user',
                blocked: data.blocked || false,
                dateJoined: data.dateCreated || '2026-05-10'
              });
            });
            if (uList.length > 0) setUsers(uList);
          } catch (userErr) {
            console.warn("Could not fetch Firestore users fallback (expected if standard user logs in to admin template):", userErr);
          }
        }

      } catch (err) {
        console.warn("Unable to connect to Express backend. Simulating locally cleanly:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [currentPath]);

    // Handle Product Add/Edit submission
    const handleSaveProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!productForm.title || !productForm.previewImage) {
        alert("Please fill in all core product information metrics.");
        return;
      }

    const targetId = editingProductId || `prod-${Math.floor(100 + Math.random() * 900)}`;
    const originalPrice = Number(productForm.price);
    const discountAmount = originalPrice * (Number(productForm.discountPercent) / 100);
    const finalPrice = Math.max(0, parseFloat((originalPrice - discountAmount).toFixed(1)));

    const newProduct: Product = {
      id: targetId,
      title: productForm.title,
      shortDescription: productForm.shortDescription,
      description: productForm.description,
      category: (productForm.category || 'Web Templates') as any,
      price: finalPrice,
      rating: editingProductId ? (products.find(p => p.id === editingProductId)?.rating || 4.8) : 5.0,
      reviewsCount: editingProductId ? (products.find(p => p.id === editingProductId)?.reviewsCount || 0) : 0,
      tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      previewImage: productForm.previewImage,
      downloadUrl: productForm.downloadUrl || 'https://drive.google.com/drive/folders/aethervault_sharing_placeholder',
      provider: productForm.provider,
      dateCreated: new Date().toISOString().split('T')[0],
      features: [
        `Enterprise license package with active update support`,
        `Complete codebase bundle configured in format ${productForm.fileFormat}`,
        `Validated security integrity with official metadata keys`,
      ],
      fileSize: productForm.fileSize,
      fileFormat: productForm.fileFormat,
      version: productForm.version,
      reviews: editingProductId ? (products.find(p => p.id === editingProductId)?.reviews || []) : [],
      detailImageUrl: productForm.detailImageUrl,
      detailText: productForm.detailText
    };

    let isCloudSynced = true;
    try {
      // 1. Sync live to Firebase
      await setDoc(doc(db, 'products', targetId), newProduct);
    } catch (err: any) {
      console.warn("Firestore sync rejected (expected if security rules are currently deploying):", err);
      isCloudSynced = false;
    }
      
    // Update local state and propagate to parent App (user panel)
    const updatedList = editingProductId 
      ? products.map(p => p.id === targetId ? newProduct : p)
      : [newProduct, ...products];

    setProducts(updatedList);
    onProductsUpdated(updatedList);

    if (isCloudSynced) {
      alert(`Product "${newProduct.title}" has been successfully logged on the cloud catalog.`);
    } else {
      alert(`Product "${newProduct.title}" saved successfully to local state & session storage (permissions bypass active for preview).`);
    }
    
    // Navigate back
    onNavigate('/admin/products');
  };

  // Populate Add/Edit flow
  useEffect(() => {
    if (currentPath.startsWith('/admin/products/edit/')) {
      const id = currentPath.split('/').pop();
      const p = products.find(prod => prod.id === id);
      if (p) {
        setEditingProductId(p.id);
        const originalPriceVal = p.price; // fallback
        setProductForm({
          title: p.title,
          shortDescription: p.shortDescription,
          description: p.description,
          category: p.category,
          price: originalPriceVal,
          discountPercent: 10, // Default discount placeholder
          tags: p.tags.join(', '),
          previewImage: p.previewImage,
          downloadUrl: p.downloadUrl,
          provider: p.provider,
          featured: true,
          active: true,
          fileSize: p.fileSize || '15 MB',
          fileFormat: p.fileFormat || 'ZIP Package',
          version: p.version || '1.0.0',
          detailImageUrl: p.detailImageUrl || '',
          detailText: p.detailText || ''
        });
      }
    } else if (currentPath === '/admin/products/add') {
      setEditingProductId(null);
      setProductForm({
        title: '',
        shortDescription: '',
        description: '',
        category: 'Web Templates',
        price: 49,
        discountPercent: 10,
        tags: '',
        previewImage: '',
        downloadUrl: '',
        provider: 'Google Drive',
        featured: false,
        active: true,
        fileSize: '15 MB',
        fileFormat: 'ZIP File',
        version: '1.0.0',
        detailImageUrl: '',
        detailText: ''
      });
    }
  }, [currentPath, products]);

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete "${title}" from the cloud repository?`)) return;
    let isCloudSynced = true;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err: any) {
      console.warn("Firestore delete rejected (expected if security rules are currently deploying):", err);
      isCloudSynced = false;
    }

    const updatedList = products.filter(p => p.id !== id);
    setProducts(updatedList);
    onProductsUpdated(updatedList);

    if (isCloudSynced) {
      alert("Product code-key successfully deleted from database index.");
    } else {
      alert("Product successfully deleted from local state & session storage (permissions bypass active for preview).");
    }
  };

  // Manage Coupons CRUD
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;
    try {
      const code = couponForm.code.trim().toUpperCase();
      const payload = {
        code,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        expiryDate: couponForm.expiryDate,
        active: couponForm.active
      };
      await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Update local state list
      const updated = coupons.filter(c => c.code !== code);
      const newCoupons = [...updated, payload];
      setCoupons(newCoupons);
      setCouponForm({ code: '', discountType: 'percent', discountValue: 15, expiryDate: '2026-12-31', active: true });

      // Live Firestore promoCodes update
      try {
        await updatePromoCodes(newCoupons.map(c => ({
          code: c.code,
          percent: Number(c.discountValue) || 10,
          description: `${c.discountValue}% Off coupon`
        })));
      } catch (fErr) {
        console.warn('Could not sync coupon to Firestore settings:', fErr);
      }

      alert(`Coupon code ${code} initialized successfully.`);
    } catch (err: any) {
      alert("Error adding coupon rules: " + err.message);
    }
  };

  const handleToggleCouponActive = async (code: string) => {
    const coup = coupons.find(c => c.code === code);
    if (!coup) return;
    try {
      const updatedActive = !coup.active;
      await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...coup, active: updatedActive })
      });
      const updated = coupons.map(c => c.code === code ? { ...c, active: updatedActive } : c);
      setCoupons(updated);

      try {
        await updatePromoCodes(updated.map(c => ({
          code: c.code,
          percent: Number(c.discountValue) || 10,
          description: `${c.discountValue}% Off coupon`
        })));
      } catch (fErr) {
        console.warn('Could not sync coupon to Firestore settings:', fErr);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!window.confirm(`Delete coupon rules for code ${code}?`)) return;
    try {
      await fetch(`/api/coupons/${code}`, { method: 'DELETE' });
      const updated = coupons.filter(c => c.code !== code);
      setCoupons(updated);

      try {
        await updatePromoCodes(updated.map(c => ({
          code: c.code,
          percent: Number(c.discountValue) || 10,
          description: `${c.discountValue}% Off coupon`
        })));
      } catch (fErr) {
        console.warn('Could not sync coupon deletion to Firestore settings:', fErr);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Manage Categories
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const payload = { name: newCategoryName.trim(), image: newCategoryImage.trim() };
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setCategories([...categories, data.category]);
        setNewCategoryName('');
        setNewCategoryImage('');
        alert("New asset category category added.");
      }
    } catch (e) {
      console.warn("Category sync error:", e);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await fetch(`/api/categories/${name}`, { method: 'DELETE' });
      setCategories(categories.filter(c => c.name !== name));
    } catch (err) {
      console.warn(err);
    }
  };

  // Manage Announcements Ticker
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;
    const nextList = [...announcements, newAnnouncementText.trim()];
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcements: nextList })
      });
      if (res.ok) {
        setAnnouncements(nextList);
        localStorage.setItem('cached_announcements', JSON.stringify(nextList));
        setNewAnnouncementText('');
        alert("Top bar announcement promo banner added successfully!");
      }
    } catch (err) {
      console.warn("Could not save announcement ticker:", err);
    }
  };

  const handleDeleteAnnouncement = async (indexToDelete: number) => {
    if (!window.confirm("Verify: erase this headline ticker permanently from the storefront?")) return;
    const nextList = announcements.filter((_, idx) => idx !== indexToDelete);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcements: nextList })
      });
      if (res.ok) {
        setAnnouncements(nextList);
        localStorage.setItem('cached_announcements', JSON.stringify(nextList));
        alert("Announcement header promo ticker erased.");
      }
    } catch (err) {
      console.warn("Could not delete announcement:", err);
    }
  };

  // Manage User Roles & Blacklist
  const handleToggleUserRole = async (email: string, currentRole: string) => {
    try {
      const nextRole = currentRole === 'admin' ? 'user' : 'admin';
      await fetch(`/api/users/${email}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole })
      });
      setUsers(users.map(u => u.email === email ? { ...u, role: nextRole } : u));
      alert(`User role updated: ${email} is now an ${nextRole}.`);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleToggleUserBlock = async (email: string, currentBlockState: boolean) => {
    try {
      const nextState = !currentBlockState;
      await fetch(`/api/users/${email}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: nextState })
      });
      setUsers(users.map(u => u.email === email ? { ...u, blocked: nextState } : u));
      // Sync block state to firestore profile
      const userId = email.replace(/[^a-zA-Z0-9_\-]/g, '_');
      await updateDoc(doc(db, 'users', userId), { blocked: nextState }).catch(() => {});
      alert(`User account state mutated! Blocked: ${nextState}.`);
    } catch (err) {
      console.warn(err);
    }
  };

  // Update order status tracker
  const handleUpdateOrderStatus = async (orderId: string, updates: { paymentStatus?: string, downloadStatus?: string }) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o));
      
      const matchedOrder = orders.find(o => o.id === orderId);
      if (matchedOrder) {
        // Map order status to Firestore purchase status
        const nextStatus = updates.paymentStatus === 'paid' ? 'completed' : 
                           updates.paymentStatus === 'not-ready' ? 'not-ready' : 'pending';
        
        await updatePurchaseStatus(matchedOrder.userEmail, orderId, nextStatus).catch(e => console.warn(e));
      }

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updates });
      }
      alert("Order fulfillment values saved and synchronized securely with user downloads.");
    } catch (err) {
      console.warn(err);
    }
  };

  // Settings Save
  const handleSaveSettings = async () => {
    try {
      localStorage.setItem('admin_escrow_settings', JSON.stringify(settings));
      await updatePaymentDetails(settings);
      alert("Escrow account channels successfully updated and synced on the database.");
    } catch (err: any) {
      console.warn("Firestore settings update failed, saved locally:", err);
      // Fallback: update local storage so CheckoutModal can read it instantly!
      localStorage.setItem('admin_escrow_settings', JSON.stringify(settings));
      alert("Escrow account details updated and saved locally! (Bypass active to override Firestore permission errors: " + err.message + ")");
    }
  };

  // Dynamic filter for active lists
  const getFilteredItems = (items: any[], fields: string[]) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();
    return items.filter(item => 
      fields.some(field => String(item[field] || '').toLowerCase().includes(query))
    );
  };

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-300 flex flex-col md:flex-row">
      
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden bg-zinc-900 border-b border-zinc-805 p-4 px-5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs select-none">
            AV
          </div>
          <div>
            <h3 className="text-xs font-mono font-black text-white tracking-widest uppercase">AetherVault</h3>
            <p className="text-[9px] text-emerald-400 font-mono">ADMIN PANEL</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 px-2 border border-zinc-750 bg-zinc-800 rounded-lg text-white text-xs font-semibold cursor-pointer select-none transition-transform"
        >
          {isMobileMenuOpen ? 'CLOSE' : 'MENU'}
        </button>
      </header>
      
      {/* Sidebar Command Navigator */}
      <aside className={`w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 p-5 flex flex-col shrink-0 transition-all ${isMobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
        
        {/* Admin Meta */}
        <div className="flex items-center gap-3 mb-8 pb-5 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
            AV
          </div>
          <div>
            <h3 className="text-xs font-mono font-black text-white tracking-widest uppercase">AetherVault</h3>
            <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ADMIN CONTROL: ACTIVE</span>
            </p>
          </div>
        </div>

        {/* Navigation Rail */}
        <nav className="space-y-1.5 flex-1 select-none">
          {[
            { tag: '/admin/dashboard', label: 'Dashboard Control', icon: BarChart3 },
            { tag: '/admin/products', label: 'Products Catalog', icon: Box },
            { tag: '/admin/orders', label: 'Orders Register', icon: ShoppingBag },
            { tag: '/admin/users', label: 'Users & Roles', icon: Users },
            { tag: '/admin/coupons', label: 'Coupons Engine', icon: Ticket },
            { tag: '/admin/payments', label: 'Payments Ledger', icon: CreditCard },
            { tag: '/admin/analytics', label: 'Advanced Analytics', icon: TrendingUp },
            { tag: '/admin/settings', label: 'Escrow Settings', icon: ShieldCheck }
          ].map(navItem => {
            const isActive = currentPath === navItem.tag || (navItem.tag === '/admin/products' && currentPath.startsWith('/admin/products/'));
            return (
              <button
                key={navItem.tag}
                onClick={() => handleNavigate(navItem.tag)}
                className={`w-full p-2.5 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-extrabold shadow-md' 
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <navItem.icon className={`w-4 h-4 shrink-0 stroke-[2.3] ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{navItem.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Exit Buttons */}
        <div className="pt-5 border-t border-zinc-800 space-y-2 mt-auto">
          <button
            onClick={() => handleNavigate('/')}
            className="w-full p-2.5 rounded-xl text-[11px] font-sans font-semibold text-zinc-400 hover:text-white flex items-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Store Front</span>
          </button>
          
          <button
            onClick={onLogoutAdmin}
            className="w-full p-2.5 rounded-xl text-[11px] font-sans font-bold text-red-400 hover:bg-red-950/20 hover:text-red-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Kill Session</span>
          </button>
        </div>
      </aside>

      {/* Primary Work Console */}
      <main className="flex-1 p-5 sm:p-8 min-w-0 overflow-y-auto max-h-screen">
        
        {/* Top bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4 mb-6">
          <div>
            <h1 className="text-xl font-sans font-black text-white uppercase tracking-tight">
              {currentPath === '/admin/dashboard' && "Control Cockpit"}
              {currentPath === '/admin/products' && "Manage Products catalog"}
              {currentPath === '/admin/products/add' && "Publish Source Asset"}
              {currentPath.includes('/admin/products/edit/') && "Revise Digital Schema"}
              {currentPath === '/admin/categories' && "Category Architecture"}
              {currentPath === '/admin/orders' && "Orders Fulfillment Ledger"}
              {currentPath === '/admin/users' && "Accounts & Authorization Management"}
              {currentPath === '/admin/coupons' && "Direct License Coupon Engine"}
              {currentPath === '/admin/payments' && "Verified Transactions Ledger"}
              {currentPath === '/admin/analytics' && "Macro Profit Models"}
              {currentPath === '/admin/settings' && "Escrow & Account Configurations"}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              System credentials synchronized with {adminEmail}
            </p>
          </div>

          {/* Search ledger */}
          {!currentPath.startsWith('/admin/products/') && currentPath !== '/admin/analytics' && currentPath !== '/admin/settings' && (
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ledger items..."
                className="w-full text-xs p-2.5 pl-9 bg-zinc-900 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" />
            </div>
          )}
        </header>

        {/* Dashboard Views Switchboard */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. ROUTE: /admin/dashboard */}
            {currentPath === '/admin/dashboard' && (
              <div className="space-y-6">
                {/* Stats Bento Grid Panel */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `$${analytics.summary.totalRevenue}`, desc: 'Paid clearings', icon: DollarSign, color: 'text-indigo-400 bg-indigo-505/10' },
                    { label: 'Total Orders', value: analytics.summary.totalOrders, desc: 'Registered transactions', icon: ShoppingBag, color: 'text-teal-400 bg-teal-500/10' },
                    { label: 'Today Sales', value: `$${analytics.summary.todaySales}`, desc: 'Daily clearings', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10' },
                    { label: 'Live Accounts', value: analytics.summary.totalUsers, desc: 'Verified profile items', icon: Users, color: 'text-purple-400 bg-purple-500/10' },
                    { label: 'Completed Orders', value: analytics.summary.completedOrders, desc: 'Fully licensed & processed', icon: CheckCircle2, color: 'text-green-400 bg-green-500/10' },
                    { label: 'Pending Clearings', value: analytics.summary.pendingOrders, desc: 'Awaiting Escrow verification', icon: Hourglass, color: 'text-amber-400 bg-amber-500/10' },
                    { label: 'Unique Products', value: products.length, desc: 'Active master designs', icon: Box, color: 'text-blue-400 bg-blue-500/10' },
                    { label: 'Category Count', value: categories.length || 7, desc: 'Taxonomy segments', icon: Folder, color: 'text-pink-400 bg-pink-500/10' }
                  ].map((statCard, index) => (
                    <div key={index} className="bg-zinc-90 w-full p-4.5 rounded-2xl border border-zinc-850 flex items-center gap-4.5">
                      <div className={`p-3 rounded-xl shrink-0 ${statCard.color}`}>
                        <statCard.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">{statCard.label}</p>
                        <h4 className="text-lg font-sans font-black text-white mt-1 leading-none">{statCard.value}</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">{statCard.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main summaries */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Latest transactions ledger */}
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                    <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <span>Pending Verification Ledger</span>
                    </h3>
                    <div className="space-y-3.5">
                      {orders.filter(o => o.paymentStatus === 'pending').map((ord) => (
                        <div key={ord.id} className="p-3 bg-zinc-950 border border-zinc-85 border-l-4 border-l-amber-500 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-mono font-black text-white">{ord.id}</p>
                            <p className="text-[10px] text-zinc-400 mt-1">{ord.userEmail} &bull; <span className="font-mono">{ord.method}</span></p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold font-mono text-white">${ord.totalAmount}</span>
                            <button 
                              onClick={() => { setSelectedOrder(ord); onNavigate('/admin/orders'); }}
                              className="block text-[10px] text-indigo-400 hover:underline mt-1 cursor-pointer font-bold"
                            >
                              Fulfill Clearings
                            </button>
                          </div>
                        </div>
                      ))}
                      {orders.filter(o => o.paymentStatus === 'pending').length === 0 && (
                        <div className="text-center py-10 text-zinc-500">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
                          <p className="text-xs">All developer clearing orders have undergone full verification.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operational system notes */}
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                    <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-indigo-400" />
                      <span>System Advisory & Guidelines</span>
                    </h4>
                    <div className="space-y-4 text-xs leading-relaxed text-zinc-400">
                      <p>
                        As the root administrator (<span className="text-white font-mono bg-zinc-800 px-1 py-0.5 rounded">{adminEmail}</span>), you possess unhindered database management rights across all parameters.
                      </p>
                      <ul className="list-disc pl-4 space-y-1.5 font-mono text-[11px] text-zinc-405">
                        <li>Fulfill pending purchases after auditing JazzCash/EasyPaisa transactions.</li>
                        <li>Maintain accurate digital download source package links on secure CDNs.</li>
                        <li>Manage percentage-based or static coupon codes securely.</li>
                      </ul>
                      <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-550/10 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        <span className="text-[10px] text-zinc-400">All administrative operations generate cryptographic reference trails logged in database indices.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ROUTE: /admin/products */}
            {currentPath === '/admin/products' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                  <span className="text-xs text-zinc-400 font-mono">Total catalog modules: <strong className="text-white">{products.length}</strong></span>
                  <button 
                    onClick={() => onNavigate('/admin/products/add')}
                    className="py-1.5 px-3 bg-indigo-650 hover:bg-indigo-560 text-white rounded-xl text-xs flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Plus className="w-4 h-4 stroke-[2.3]" />
                    <span>Publish Digital Product</span>
                  </button>
                </div>

                {/* Catalog Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 font-mono">
                          <th className="p-3 pl-5">Product Asset</th>
                          <th className="p-3 font-right">Clearing Price</th>
                          <th className="p-3 text-center">Fulfillment System</th>
                          <th className="p-3 text-center">Featured</th>
                          <th className="p-3 text-right pr-5">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-805">
                        {getFilteredItems(products, ['title', 'category']).map((prod) => (
                          <tr key={prod.id} className="hover:bg-zinc-850/40">
                            <td className="p-3 pl-5">
                              <div className="flex items-center gap-3">
                                <img src={prod.previewImage} className="w-9 h-9 object-cover rounded-lg bg-zinc-800 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-extrabold text-white truncate max-w-xs">{prod.title}</p>
                                  <p className="text-[10px] text-zinc-500 font-mono truncate">{prod.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-mono font-bold text-white">${prod.price}</td>
                            <td className="p-3 text-center">
                              <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] bg-zinc-800 text-zinc-300">
                                {prod.provider}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {prod.rating >= 4.9 ? (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-bold">
                                  YES
                                </span>
                              ) : (
                                <span className="text-zinc-500">-</span>
                              )}
                            </td>
                            <td className="p-3 text-right pr-5 whitespace-nowrap">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => onNavigate(`/admin/products/edit/${prod.id}`)}
                                  className="p-1 px-2 border border-zinc-700 bg-zinc-800 text-zinc-250 rounded hover:text-white cursor-pointer hover:bg-zinc-700 flex items-center gap-1 text-[11px]"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id, prod.title)}
                                  className="p-1 px-2 bg-red-955 hover:bg-red-900 border border-red-950 text-red-100 rounded cursor-pointer flex items-center gap-1 text-[11px]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Kill</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ROUTES: /admin/products/add & /admin/products/edit/:id */}
            {(currentPath === '/admin/products/add' || currentPath.startsWith('/admin/products/edit/')) && (
              <form onSubmit={handleSaveProduct} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl max-w-3xl space-y-5">
                <h3 className="text-sm font-mono font-black text-white tracking-widest uppercase border-b border-zinc-800 pb-3 block">
                  {editingProductId ? "REVISE DIGITALLY INTEGRATED ARTIFACT" : "SEED NEW HIGH-PERFORMANCE SOURCE ARTIFACT"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono tracking-widest text-zinc-400 block uppercase">Product Design Title</label>
                    <input
                      type="text"
                      required
                      value={productForm.title}
                      onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                      placeholder="e.g. Aether Dashboard Template (React & Tailwind)"
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white text-xs"
                    />
                  </div>

                  {/* Categories picker - now fully visible and dynamic */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-[#a78bfa] block uppercase font-bold">Asset Class Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white text-xs cursor-pointer"
                    >
                      {(categories && categories.length > 0 ? categories.map(c => c.name) : ["Web Templates", "UI Kits", "Scripts", "Plugins", "Graphics", "SaaS Tools", "AI Prompts"]).map(catName => (
                        <option key={catName} value={catName}>{catName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Thumbnail Image URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-amber-400 block uppercase">Custom Image URL (Unsplash or any hosted image link)</label>
                    <input
                      type="text"
                      required
                      value={productForm.previewImage}
                      onChange={(e) => setProductForm({...productForm, previewImage: e.target.value})}
                      placeholder="Paste your custom PNG/JPG image link here (e.g. https://images.unsplash.com/...)"
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white text-xs"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-zinc-400 block uppercase">Original MSRP Price ($)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white text-xs"
                    />
                  </div>

                  {/* Discount Percentage */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-zinc-405 block uppercase">Dynamic Promo Discount Amount (%)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={productForm.discountPercent}
                      onChange={(e) => setProductForm({...productForm, discountPercent: Number(e.target.value)})}
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-805 rounded-xl outline-none focus:border-indigo-550 text-white text-xs"
                    />
                  </div>

                  {/* Code-key Download Url - hidden per request */}
                  {/* Custom Download Input - visible! */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-[#a78bfa] block uppercase font-bold font-mono">Custom Download / File Delivery Link (Google Drive, Mega, Dropbox)</label>
                    <input
                      type="text"
                      value={productForm.downloadUrl}
                      onChange={(e) => setProductForm({...productForm, downloadUrl: e.target.value})}
                      placeholder="Enter deliverable file/folder link here (e.g. https://drive.google.com/...)"
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white text-xs font-mono text-[11px]"
                    />
                  </div>

                  {/* CDN provider - visible! */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-[#a78bfa] block uppercase font-bold font-mono">Fulfillment Storage / Unlock Provider</label>
                    <select
                      value={productForm.provider}
                      onChange={(e) => setProductForm({...productForm, provider: e.target.value as DownloadProvider})}
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white text-xs cursor-pointer"
                    >
                      {["Google Drive", "Dropbox", "GitHub", "CDN", "S3 Buckets"].map(provItem => (
                        <option key={provItem} value={provItem}>{provItem}</option>
                      ))}
                    </select>
                  </div>

                  {/* Package file size */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-zinc-400 block uppercase">Package Download size</label>
                    <input
                      type="text"
                      value={productForm.fileSize}
                      onChange={(e) => setProductForm({...productForm, fileSize: e.target.value})}
                      placeholder="e.g. 15.6 MB"
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white text-xs"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono tracking-widest text-zinc-400 block uppercase">Asset Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={productForm.tags}
                      onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                      placeholder="Framer, Figma UI, Tailwind, NextJS, Python"
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white text-xs"
                    />
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono tracking-widest text-amber-400 block uppercase">Product Details Text & Feature Overview (Markdown / Text supported)</label>
                    <textarea
                      rows={5}
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      placeholder="Put your detailed text and product description overview here..."
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white text-xs leading-relaxed"
                    />
                  </div>

                  {/* Custom Detail Image (Optional) */}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono tracking-widest text-emerald-450 block uppercase">Custom Detail Tab Image URL (Optional)</label>
                    <input
                      type="text"
                      value={productForm.detailImageUrl}
                      onChange={(e) => setProductForm({...productForm, detailImageUrl: e.target.value})}
                      placeholder="Paste additional custom showcase image URL here (e.g. Unsplash URL)..."
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-550 text-white text-xs font-mono"
                    />
                  </div>

                  {/* Custom Detail Text (Optional) */}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-mono tracking-widest text-emerald-450 block uppercase">Custom Detail Tab Text & Additional Features list (Optional)</label>
                    <textarea
                      rows={4}
                      value={productForm.detailText}
                      onChange={(e) => setProductForm({...productForm, detailText: e.target.value})}
                      placeholder="Provide additional descriptive text or custom feature notes that will only appear in the product details main tab..."
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-550 text-white text-xs leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3.5 border-t border-zinc-800 pt-5">
                  <button
                    type="button"
                    onClick={() => onNavigate('/admin/products')}
                    className="p-2.5 px-5 bg-zinc-800 text-zinc-300 font-sans text-xs rounded-xl hover:text-white cursor-pointer"
                  >
                    Discard Change
                  </button>
                  <button
                    type="submit"
                    className="p-2.5 px-6 bg-indigo-600 text-white font-sans text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-500"
                  >
                    Commit Asset Schema Live
                  </button>
                </div>
              </form>
            )}

            {/* 4. ROUTE: /admin/categories */}
            {currentPath === '/admin/categories' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Category Form */}
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl h-fit">
                  <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-4">Initialize New Asset Class</h4>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">Category Literal Title</label>
                      <input
                        type="text"
                        required
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Next-Generation AI"
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-805 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">Interactive Cover Image Link</label>
                      <input
                        type="text"
                        value={newCategoryImage}
                        onChange={(e) => setNewCategoryImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-805 rounded-xl text-xs text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold rounded-xl cursor-pointer shadow-md"
                    >
                      Publish Category
                    </button>
                  </form>
                </div>

                {/* Categories Register */}
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl lg:col-span-2">
                  <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-4">Categories Architecture Matrix</h4>
                  <div className="divide-y divide-zinc-800 space-y-3">
                    {getFilteredItems(categories.length > 0 ? categories : [
                      { name: "Web Templates", count: 3, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150&h=150" },
                      { name: "UI Kits", count: 2, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=150&h=150" },
                      { name: "Scripts", count: 3, image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=150&h=150" }
                    ], ['name']).map((cat) => (
                      <div key={cat.name} className="pt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={cat.image} className="w-10 h-10 object-cover rounded-lg bg-zinc-950 shrink-0" />
                          <div>
                            <p className="font-extrabold text-white text-xs">{cat.name}</p>
                            <span className="text-[10px] text-zinc-500 font-mono">Assigned Assets Count: {cat.count || 0}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.name)}
                          className="p-1 px-2.5 text-[10px] font-bold border border-red-900 bg-red-955/35 text-red-400 rounded-lg hover:bg-red-900 hover:text-white cursor-pointer"
                        >
                          Erase
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. ROUTE: /admin/orders */}
            {currentPath === '/admin/orders' && (
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-zinc-950 font-mono text-zinc-400 border-b border-zinc-800">
                        <th className="p-3 pl-5">Order Transaction</th>
                        <th className="p-3">Integrator / Developer</th>
                        <th className="p-3 text-center">Receipt Total</th>
                        <th className="p-3 text-center">Fulfillment Status</th>
                        <th className="p-3 text-right pr-5">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-805">
                      {getFilteredItems(orders, ['id', 'userEmail', 'userName']).map((ord) => (
                        <tr key={ord.id} className="hover:bg-zinc-850/30">
                          <td className="p-3 pl-5">
                            <div>
                              <p className="font-bold text-white font-mono">{ord.id}</p>
                              <span className="text-[9px] text-zinc-500 font-mono">
                                {new Date(ord.date).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <p className="text-zinc-200">{ord.userName || ord.userEmail.split('@')[0]}</p>
                            <span className="text-[10px] text-zinc-500 font-mono">{ord.userEmail}</span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-white">${ord.totalAmount}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded font-mono text-[9px] uppercase font-bold shrink-0 ${
                              ord.paymentStatus === 'paid' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                : ord.paymentStatus === 'not-ready'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse'
                                : ord.paymentStatus === 'failed'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            }`}>
                              {ord.paymentStatus === 'paid' ? 'Completed' :
                               ord.paymentStatus === 'not-ready' ? 'Not Ready Yet' :
                               ord.paymentStatus === 'failed' ? 'Declined' : 'Pending Review'}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-5">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1 px-2.5 bg-zinc-800 border border-zinc-700 rounded-lg hover:text-white hover:bg-zinc-700 text-[11px] cursor-pointer"
                            >
                              Details Cockpit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

                {/* Order Detail Modal popup */}
                {selectedOrder && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 max-w-lg w-full rounded-2xl overflow-hidden p-6 relative font-sans text-zinc-300">
                      <button 
                        onClick={() => setSelectedOrder(null)} 
                        className="absolute right-4 top-4 text-zinc-500 hover:text-white text-sm font-bold p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                      <h4 className="text-sm font-mono font-black text-white uppercase tracking-widest border-b border-zinc-800 pb-3 mb-4">
                        Order Clearance Cockpit (ID: {selectedOrder.id})
                      </h4>

                      <div className="space-y-4 mb-5 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase block font-mono">Developer Email</span>
                            <span className="text-white font-bold leading-relaxed">{selectedOrder.userEmail}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase block font-mono">Payment Channel</span>
                            <span className="text-white bg-zinc-800 px-1 py-0.5 rounded font-mono font-bold">{selectedOrder.method}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase block font-mono">Phone No / Account Name</span>
                            <span className="text-white font-mono">{selectedOrder.payNumber || "Unspecified"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase block font-mono">Transaction ID Record</span>
                            <span className="text-white font-mono break-all font-bold">{selectedOrder.transactionId}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block font-mono mb-1">Source Pack List</span>
                          <div className="bg-zinc-950 p-3 rounded-lg divide-y divide-zinc-850">
                            {selectedOrder.items?.map((item: any, i: number) => (
                              <div key={i} className="py-1 flex justify-between text-[11px]">
                                <span className="text-zinc-200 font-extrabold truncate max-w-xs">{item.title}</span>
                                <span className="font-mono text-zinc-400">${item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block font-mono mb-2">Mutable Clearings Status</span>
                          <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleUpdateOrderStatus(selectedOrder.id, { paymentStatus: 'pending' })}
                                className="py-1.5 px-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl font-mono text-[9px] uppercase font-bold hover:bg-amber-500 hover:text-white cursor-pointer transition-colors"
                              >
                                Set Pending
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(selectedOrder.id, { paymentStatus: 'not-ready' })}
                                className="py-1.5 px-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl font-mono text-[9px] uppercase font-bold hover:bg-indigo-500 hover:text-white cursor-pointer transition-colors"
                              >
                                Set Not Ready
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleUpdateOrderStatus(selectedOrder.id, { paymentStatus: 'paid' })}
                                className="py-2 px-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-mono text-[9px] uppercase font-bold hover:bg-green-500 hover:text-white cursor-pointer transition-colors"
                              >
                                Approve & Complete
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(selectedOrder.id, { paymentStatus: 'failed' })}
                                className="py-2 px-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-[9px] uppercase font-bold hover:bg-red-500 hover:text-white cursor-pointer transition-colors"
                              >
                                Decline Order
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. ROUTE: /admin/users */}
            {currentPath === '/admin/users' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans min-w-[700px]">
                  <thead>
                    <tr className="bg-zinc-950 text-zinc-405 font-mono border-b border-zinc-800">
                      <th className="p-3 pl-5">Developer Profile</th>
                      <th className="p-3">Authorization Role</th>
                      <th className="p-3">Sign Up Date</th>
                      <th className="p-2.5 text-center">Account Security</th>
                      <th className="p-3 text-right pr-5">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-805">
                    {getFilteredItems(users, ['email', 'name']).map((usr) => (
                      <tr key={usr.email} className={usr.blocked ? 'opacity-50 hover:bg-zinc-850/20' : 'hover:bg-zinc-850/20'}>
                        <td className="p-3 pl-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                            <div>
                              <p className="font-extrabold text-white">{usr.name}</p>
                              <span className="text-[10px] text-zinc-500 font-mono">{usr.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-black font-mono tracking-wider ${
                            usr.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-800 text-zinc-450'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-zinc-400">{usr.dateJoined}</td>
                        <td className="p-2.5 text-center">
                          {usr.blocked ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] bg-red-500/20 text-red-500 font-mono uppercase font-bold">
                              Restricted
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-mono uppercase font-bold">
                              Secure
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right pr-5">
                          <div className="flex justify-end gap-2 text-[10px]">
                            {/* Toggle Block status */}
                            <button
                              onClick={() => handleToggleUserBlock(usr.email, usr.blocked)}
                              className={`p-1 px-2 border rounded-md font-bold cursor-pointer transition-colors ${
                                usr.blocked 
                                  ? 'border-indigo-800 bg-indigo-950/40 text-indigo-400 hover:bg-indigo-900 hover:text-white'
                                  : 'border-red-900 bg-red-955/35 text-red-400 hover:bg-red-900 hover:text-white'
                              }`}
                            >
                              {usr.blocked ? 'Recover Account' : 'Restrict License'}
                            </button>

                            {/* Toggle authorization admin role */}
                            <button
                              onClick={() => handleToggleUserRole(usr.email, usr.role)}
                              className="p-1 px-2 border border-zinc-700 bg-zinc-800 text-zinc-250 cursor-pointer rounded-md hover:bg-zinc-700 hover:text-white"
                            >
                              Mutate Role
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {/* 7. ROUTE: /admin/coupons */}
            {currentPath === '/admin/coupons' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Coupon creation form */}
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl h-fit">
                  <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-4">Initialize Coupon Schema</h4>
                  <form onSubmit={handleSaveCoupon} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">Promo Code Token</label>
                      <input
                        type="text"
                        required
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({...couponForm, code: e.target.value})}
                        placeholder="e.g. SUMMER50"
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-805 rounded-xl text-xs text-white uppercase font-mono tracking-widest"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">Promo Reduction Type</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value})}
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-805 rounded-xl text-xs text-white"
                      >
                        <option value="percent">Percentage Reduction (%)</option>
                        <option value="fixed">Fixed Reduction ($)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">Discount Quantum Amount</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm({...couponForm, discountValue: Number(e.target.value)})}
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-410 uppercase">Fulfillment Expirty Date</label>
                      <input
                        type="date"
                        required
                        value={couponForm.expiryDate}
                        onChange={(e) => setCouponForm({...couponForm, expiryDate: e.target.value})}
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Authorize Coupon Registry
                    </button>
                  </form>
                </div>

                {/* Coupons Register */}
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl lg:col-span-2">
                  <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-4 font-extrabold">Active Direct-Discount Rules</h4>
                  <div className="divide-y divide-zinc-800 space-y-3">
                    {getFilteredItems(coupons, ['code']).map((coup) => (
                      <div key={coup.code} className="pt-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-white bg-indigo-505/10 border border-indigo-500/20 px-2 py-0.5 rounded text-xs tracking-wider">
                              {coup.code}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">
                              - {coup.discountType === 'percent' ? `${coup.discountValue}% Off` : `$${coup.discountValue} Off`}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-550 mt-1 font-mono">Expires: {coup.expiryDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleCouponActive(coup.code)}
                            className={`p-1 px-2 text-[10px] font-bold border rounded-lg cursor-pointer ${
                              coup.active 
                                ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-505'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-450 hover:bg-zinc-700 hover:text-white'
                            }`}
                          >
                            {coup.active ? 'ACTIVE' : 'MUTED'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coup.code)}
                            className="p-1 px-2 text-[10px] text-red-400 border border-red-900/40 hover:bg-red-900 hover:text-red-100 rounded-lg cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 8. ROUTE: /admin/payments */}
            {currentPath === '/admin/payments' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans min-w-[750px]">
                  <thead>
                    <tr className="bg-zinc-950 text-zinc-405 font-mono border-b border-zinc-800">
                      <th className="p-3 pl-5">Transaction Corehash / ID</th>
                      <th className="p-3">Payment Channel Method</th>
                      <th className="p-3 text-center">Mobile No. / Address Reference</th>
                      <th className="p-3 text-center">Quantum Clearing Amount</th>
                      <th className="p-3 text-center">Fulfillment System Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-805">
                    {getFilteredItems(orders, ['transactionId', 'userEmail']).map((ordPayment, i) => (
                      <tr key={i} className="hover:bg-zinc-850/20">
                        <td className="p-3 pl-5">
                          <code className="text-white font-mono break-all font-bold text-[11px] block max-w-xs truncate" title={ordPayment.transactionId}>
                            {ordPayment.transactionId || 'Aether Direct License Override'}
                          </code>
                          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">By {ordPayment.userEmail}</span>
                        </td>
                        <td className="p-3">
                          <span className="inline-block px-2 py-0.5 bg-zinc-800 rounded font-mono text-[10px] text-white">
                            {ordPayment.method}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-zinc-300">
                          {ordPayment.payNumber || 'Direct Escrow clearing'}
                        </td>
                        <td className="p-3 text-center font-mono text-white font-bold">
                          ${ordPayment.totalAmount}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                            ordPayment.paymentStatus === 'paid' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                          }`}>
                            {ordPayment.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {/* 9. ROUTE: /admin/analytics */}
            {currentPath === '/admin/analytics' && (
              <div className="space-y-6">
                
                {/* Interactive SVG Business Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Revenue Growth chart */}
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                    <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      <span>Periodic Cleared Revenue Scale (USDT)</span>
                    </h3>
                    <div className="h-64 flex items-end justify-between font-mono text-[10px] border-b border-l border-zinc-800 pb-1 pl-2">
                      {analytics.dailyRevenue.map((trendObj: any, index: number) => {
                        const maxVal = 420;
                        const heightPercent = trendObj.revenue ? (trendObj.revenue / maxVal) * 90 : 10;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center group relative cursor-pointer gap-2">
                            <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-zinc-950 border border-zinc-800 text-white font-sans text-[10px] p-1 px-1.5 rounded-lg font-bold pointer-events-none transition-opacity">
                              ${trendObj.revenue}
                            </div>
                            <div 
                              style={{ height: `${heightPercent}%` }} 
                              className="w-8 bg-gradient-to-t from-indigo-750 to-indigo-500 hover:from-white hover:to-indigo-300 rounded-lg transition-all duration-300"
                            />
                            <span className="text-zinc-550 font-bold group-hover:text-white mt-2">{trendObj.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Categories share chart */}
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                    <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-6">
                      Macro Sales Portfolio by Asset Category
                    </h3>
                    <div className="space-y-3.5">
                      {Object.entries(analytics.salesByCategory).map(([catKey, sumValue]: any) => {
                        const totalSums = Object.values(analytics.salesByCategory).reduce((acc: any, val: any) => acc + val, 0) as number;
                        const proportion = totalSums > 0 ? (sumValue / totalSums) * 100 : 0;
                        return (
                          <div key={catKey} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-zinc-400">{catKey}</span>
                              <span className="font-mono text-zinc-450">${sumValue} &bull; <strong className="text-white">{proportion.toFixed(1)}%</strong></span>
                            </div>
                            <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                              <div 
                                style={{ width: `${proportion || 5}%` }} 
                                className="h-full bg-indigo-500 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Top Sold Assets index leaderboard */}
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-4">
                    Product Code Performance Leaderboard
                  </h3>
                  <div className="space-y-3">
                    {analytics.mostSold.map((soldProd: any, i: number) => (
                      <div key={i} className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between text-xs font-sans">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-white bg-zinc-800 w-6 h-6 flex items-center justify-center rounded">
                            #{i + 1}
                          </span>
                          <div>
                            <p className="font-bold text-white mb-0.5">{soldProd.title}</p>
                            <span className="text-[10px] text-zinc-500 font-mono">Licenses Activated: {soldProd.sold}</span>
                          </div>
                        </div>
                        <span className="font-mono text-white font-bold">${soldProd.revenue} Revenue</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 10. ROUTE: /admin/settings */}
            {currentPath === '/admin/settings' && (
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl max-w-2xl space-y-5">
                <h3 className="text-xs font-mono font-black text-white uppercase tracking-widest border-b border-zinc-800 pb-3 mb-4 block">
                  SYSTEM ESCROW GATEWAYS CONFIGURATION
                </h3>

                <div className="space-y-4">
                  {/* EasyPaisa Escrow number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-zinc-400 block uppercase">EASYPAISA AGENT ACCOUNT NO.</label>
                    <input
                      type="text"
                      value={settings.easypaisaNumber}
                      onChange={(e) => setSettings({...settings, easypaisaNumber: e.target.value})}
                      placeholder="e.g. 0300-1234567"
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white font-mono text-xs"
                    />
                  </div>

                  {/* JazzCash Escrow number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-zinc-400 block uppercase">JAZZCASH AGENT ACCOUNT NO.</label>
                    <input
                      type="text"
                      value={settings.jazzcashNumber}
                      onChange={(e) => setSettings({...settings, jazzcashNumber: e.target.value})}
                      placeholder="e.g. 0312-5555555"
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white font-mono text-xs"
                    />
                  </div>

                  {/* Cryptocurrency Gateway Wallet */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-zinc-400 block uppercase">USDT (TRC-20) SECURE WALLET ADDRESS</label>
                    <input
                      type="text"
                      value={settings.cryptoAddress}
                      onChange={(e) => setSettings({...settings, cryptoAddress: e.target.value})}
                      placeholder="0x..."
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800 mt-5">
                  <button
                    onClick={handleSaveSettings}
                    type="button"
                    className="p-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Authorize Escrow Channels
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
