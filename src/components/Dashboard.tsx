import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Heart, 
  UserCog, 
  ShoppingCart, 
  Copy, 
  Check, 
  Trash2, 
  Inbox,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, Product, Purchase } from '../types';

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  allProducts: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onUpdateProfile: (name: string, email: string) => void;
}

export default function Dashboard({
  isOpen,
  onClose,
  user,
  allProducts,
  onRemoveFromWishlist,
  onAddToCart,
  onUpdateProfile
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'downloads' | 'wishlist' | 'profile'>('downloads');
  const [nameInput, setNameInput] = useState<string>(user.name);
  const [emailInput, setEmailInput] = useState<string>(user.email);
  const [copiedId, setCopiedId] = useState<string>('');
  const [profileSuccess, setProfileSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Track matching wishlist items
  const wishlistProducts = allProducts.filter(p => user.wishlistIds.includes(p.id));

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(nameInput.trim(), emailInput.trim());
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  return (
    <div id="dashboard-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-sm">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl w-full max-w-3xl h-[85vh] overflow-hidden flex flex-col shadow-2xl"
      >
        
        {/* Close Button top-right */}
        <div className="absolute top-4 right-4">
          <button
            id="close-dashboard-btn"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Header Card */}
        <div className="px-6 py-6 border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/15 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 dark:border-indigo-950/80 shadow-inner"
          />
          <div>
            <h2 className="text-lg font-sans font-bold text-zinc-900 dark:text-zinc-50">{user.name}</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono -mt-0.5">{user.email}</p>
            <div className="mt-1.5 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="px-2 py-0.5 text-[9px] font-mono bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-md border border-indigo-100/30">
                Purchased: {user.purchasedProducts.length}
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400 rounded-md border border-red-100/20">
                Wishlist: {user.wishlistIds.length}
              </span>
            </div>
          </div>
        </div>

        {/* Inner Tab bar selector */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-900 overflow-x-auto">
          <button
            id="tab-downloads"
            onClick={() => setActiveTab('downloads')}
            className={`pb-3 pt-4 text-xs sm:text-sm font-sans font-semibold border-b-2 px-6 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'downloads'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-750 dark:hover:text-zinc-200'
            }`}
          >
            My Downloads
          </button>
          <button
            id="tab-wishlist"
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 pt-4 text-xs sm:text-sm font-sans font-semibold border-b-2 px-6 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'wishlist'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-750 dark:hover:text-zinc-200'
            }`}
          >
            Saved Items Wishlist
          </button>
          <button
            id="tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 pt-4 text-xs sm:text-sm font-sans font-semibold border-b-2 px-6 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-750 dark:hover:text-zinc-200'
            }`}
          >
            Profile Customizations
          </button>
        </div>

        {/* Scrollable list content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Downloads Panel */}
          {activeTab === 'downloads' && (
            <div className="space-y-4">
              {user.purchasedProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3 p-6 border border-dashed border-zinc-150 dark:border-zinc-850 rounded-2xl">
                  <Inbox className="w-10 h-10 text-zinc-300 dark:text-zinc-750 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-500">You have no purchased elements yet!</p>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Once you checkout any templates, UI designs, or prompt files, they will unlock here permanently with external cloud download access.
                  </p>
                  <button
                    id="trigger-start-discovering"
                    onClick={onClose}
                    className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Start discovering files
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.purchasedProducts.map((p: Purchase) => {
                    const isCompleted = !p.status || p.status === 'completed';
                    const isPending = p.status === 'pending';
                    const isNotReady = p.status === 'not-ready';
                    
                    return (
                      <div
                        key={p.id}
                        className="p-4 bg-zinc-50/60 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-sans font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {p.productTitle}
                            </h4>
                            {isPending && (
                              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-500/10 text-amber-500 rounded border border-amber-500/25 uppercase tracking-wider animate-pulse">
                                Pending Approval
                              </span>
                            )}
                            {isNotReady && (
                              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-500 rounded border border-indigo-500/25 uppercase tracking-wider animate-pulse">
                                Preparing Assets
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/25 uppercase tracking-wider">
                                Unlocked
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                            <span>Purchased on: <span className="font-mono">{p.purchaseDate}</span></span>
                            <span>•</span>
                            <span>Price: <span className="font-mono text-zinc-700 dark:text-zinc-300">${p.amountPaid}</span></span>
                          </div>

                          {/* Direct Raw URL display */}
                          <div className="pt-2">
                            {isCompleted ? (
                              <div className="bg-white dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 shadow-inner">
                                <span className="text-zinc-400 block mb-0.5 text-[9px] uppercase tracking-wider">Direct Download URL:</span>
                                <a href={p.downloadUrl} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                                  {p.downloadUrl}
                                </a>
                              </div>
                            ) : (
                              <div className="bg-zinc-100 dark:bg-zinc-950/80 p-2.5 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-850 text-[10px] font-mono text-zinc-400 dark:text-zinc-550 italic">
                                {isPending ? "🔒 Download options locked. Waiting for secure admin payment clearing..." : "🔒 Download options locked. Admin is preparing your package assets..."}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Download link button */}
                        <div className="sm:self-center shrink-0">
                          {isCompleted ? (
                            <a
                              id={`dash-dl-${p.id}`}
                              href={p.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-sans font-semibold py-2 px-4 rounded-xl transition-all shadow-sm cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download File</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="flex items-center justify-center gap-1.5 bg-zinc-150 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs font-sans font-semibold py-2 px-4 rounded-xl cursor-not-allowed"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>{isPending ? "Awaiting Approval" : "Preparing Assets"}</span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Panel */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              {wishlistProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3 p-6 border border-dashed border-zinc-150 dark:border-zinc-850 rounded-2xl">
                  <Heart className="w-10 h-10 text-zinc-300 dark:text-zinc-750 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-500">Your wishlist is empty!</p>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    Save elements you love by clipping heart targets as you explore.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {wishlistProducts.map((p: Product) => (
                    <div
                      key={p.id}
                      className="p-3 bg-zinc-50/60 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-900/60 flex gap-3"
                    >
                      <img
                        src={p.previewImage}
                        alt={p.title}
                        className="w-20 h-16 object-cover rounded-lg shrink-0 border border-zinc-150 dark:border-zinc-900"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h5 className="text-[11.5px] font-bold text-zinc-900 dark:text-zinc-100 truncate">{p.title}</h5>
                          <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">${p.price}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 pt-1 border-t border-zinc-150/50 dark:border-zinc-850/50">
                          {/* Add to Cart */}
                          <button
                            id={`wish-add-${p.id}`}
                            onClick={() => onAddToCart(p)}
                            className="text-[10px] font-sans font-bold text-indigo-600 dark:text-indigo-450 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Add to Cart</span>
                          </button>
                          
                          <span className="text-zinc-300 text-xs">|</span>

                          {/* Delete wishlist */}
                          <button
                            id={`wish-del-${p.id}`}
                            onClick={() => onRemoveFromWishlist(p.id)}
                            className="text-[10px] font-sans text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Panel */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-[11px] font-mono text-zinc-405 dark:text-zinc-400 uppercase tracking-wide mb-1">Developer Full Name</label>
                <input
                  id="profile-name-textbox"
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-405 dark:text-zinc-400 uppercase tracking-wide mb-1">Email Address</label>
                <input
                  id="profile-email-textbox"
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                />
              </div>

              {profileSuccess && (
                <p className="text-xs text-emerald-500 font-semibold text-center">Settings upgraded safely!</p>
              )}

              <button
                id="save-profile-btn"
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-sans font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
              >
                Sync Profile Metrics
              </button>

              <div className="p-3.5 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/50 dark:border-zinc-800 text-center text-[10px] text-zinc-450 leading-relaxed">
                <span>🛡️ Developer Credentials sync directly within this device space. We value your safety: no tracking tags enabled.</span>
              </div>
            </form>
          )}

        </div>

      </motion.div>
    </div>
  );
}
