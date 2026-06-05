import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Terminal, 
  Cpu, 
  Sparkles, 
  Compass, 
  LogOut,
  Layout,
  Layers,
  Code,
  Image,
  Menu
} from 'lucide-react';
import { UserProfile, CartItem } from '../types';

interface NavbarProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  user: UserProfile;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsAdminPanelOpen: (open: boolean) => void;
  setIsDashboardOpen: (open: boolean) => void;
  onLogout: () => void;
  onBrandClick: () => void;
  onMenuClick: () => void;
}

const CATEGORIES = [
  'All',
  'Web Templates',
  'UI Kits',
  'Scripts',
  'Plugins',
  'Graphics',
  'SaaS Tools',
  'AI Prompts'
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'All': <Compass className="w-3.5 h-3.5" />,
  'Web Templates': <Layout className="w-3.5 h-3.5" />,
  'UI Kits': <Layers className="w-3.5 h-3.5" />,
  'Scripts': <Code className="w-3.5 h-3.5" />,
  'Plugins': <Cpu className="w-3.5 h-3.5" />,
  'Graphics': <Image className="w-3.5 h-3.5" />,
  'SaaS Tools': <Terminal className="w-3.5 h-3.5" />,
  'AI Prompts': <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
};

export default function Navbar({
  theme,
  setTheme,
  cart,
  setIsCartOpen,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  user,
  setIsAuthModalOpen,
  setIsAdminPanelOpen,
  setIsDashboardOpen,
  onLogout,
  onBrandClick,
  onMenuClick
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/90 backdrop-blur-md transition-colors duration-200">
      <div id="nav-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          <div className="flex items-center gap-2">
            {/* Left Menu - Standard 3-Lines hamburger Menu Trigger */}
            <button
              id="nav-side-menu-trigger"
              onClick={onMenuClick}
              className="p-2 text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all cursor-pointer mr-1 relative flex items-center justify-center border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]"
              title="Open Customized Thumbnail Editor"
            >
              <Menu className="w-5.5 h-5.5 stroke-[2]" />
            </button>

            {/* Logo Brand */}
            <button 
              id="btn-brand"
              onClick={onBrandClick}
              className="flex items-center gap-2.5 transition-transform hover:scale-[1.01] cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <Sparkles className="w-5.5 h-5.5 stroke-[1.8]" />
              </div>
              <div>
                <span className="font-sans font-black text-lg sm:text-xl tracking-tighter bg-gradient-to-r from-zinc-900 to-indigo-950 dark:from-white dark:to-indigo-250 bg-clip-text text-transparent uppercase">
                  Aether<span className="text-indigo-500 font-light">Vault</span>
                </span>
                <p className="text-[10px] font-mono tracking-wider text-zinc-500 dark:text-slate-400 -mt-1 uppercase">Asset Vault Portal</p>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4.2 w-4.2 text-zinc-400 dark:text-slate-500" />
            </div>
            <input
              id="search-input-header"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, UI kits, scripts..."
              className="w-full pl-10 pr-5 py-2.5 text-sm bg-zinc-100 dark:bg-white/5 border border-transparent dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-full outline-none text-zinc-900 dark:text-slate-100 placeholder-zinc-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-indigo-500/25 transition-all"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3.5">

            {/* Admin Panel Trigger */}
            {user.isAdmin && (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="p-2.5 text-zinc-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 rounded-lg bg-zinc-100/50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 border border-transparent dark:border-white/10 transition-colors cursor-pointer"
                title="Admin Panel"
              >
                <Terminal className="w-5 h-5" />
              </button>
            )}
            <button
              id="wishlist-trigger-btn"
              onClick={() => {
                if (user.isLoggedIn) {
                  setIsDashboardOpen(true);
                  // Ensure we show wishlist
                  setTimeout(() => {
                    const wishTab = document.getElementById('tab-wishlist');
                    if (wishTab) wishTab.click();
                  }, 100);
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="p-2.5 text-zinc-500 hover:text-red-500 dark:text-slate-450 dark:hover:text-red-400 rounded-lg bg-zinc-100/50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 border border-transparent dark:border-white/10 transition-colors relative cursor-pointer"
              title="My Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {user.wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
              )}
            </button>

            {/* Shopping Cart Trigger */}
            <button
              id="cart-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 text-zinc-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 rounded-lg bg-zinc-100/50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 border border-transparent dark:border-white/10 transition-colors relative cursor-pointer"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Removed inline user profile and login/logout buttons from Navbar */}

          </div>
        </div>

        {/* Categories Bar */}
        <div id="categories-scroll-wrapper" className="relative border-t border-zinc-100 dark:border-white/10 mt-1 sm:mt-2">
          {/* Subtle horizontal fade mask to show swiping action */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-[#0a0a0a] to-transparent pointer-events-none z-10 opacity-30 sm:opacity-50" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-[#0a0a0a] to-transparent pointer-events-none z-10 opacity-30 sm:opacity-50" />

          <div className="py-2.5 sm:py-3.5 overflow-x-auto flex items-center scrollbar-none scroll-smooth touch-pan-x">
            <div className="flex gap-1.5 sm:gap-2.5">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <motion.button
                    id={`cat-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    whileHover={{ y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className={`flex items-center gap-2 px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full text-xs font-sans font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer select-none ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 scale-100 border border-transparent'
                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-slate-400 hover:bg-zinc-200/70 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white border border-transparent dark:border-white/5'
                    }`}
                  >
                    <span className="shrink-0">
                      {CATEGORY_ICONS[cat] || <Compass className="w-3.5 h-3.5" />}
                    </span>
                    <span>{cat}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
