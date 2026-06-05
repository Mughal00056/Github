import React from 'react';
import { motion } from 'motion/react';
import { Star, Heart, ArrowRight, HardDrive, ShoppingCart, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onOpenImage?: (imageUrl: string) => void;
}

export default function ProductCard({
  product,
  onOpenDetails,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  onOpenImage
}: ProductCardProps) {
  return (
    <motion.div
      id={`product-card-${product.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group bg-white dark:bg-white/[0.02] border border-zinc-200/65 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col h-full hover:border-[#6366f1]/50 hover:shadow-xl hover:shadow-indigo-500/[0.02] dark:hover:shadow-indigo-500/[0.04] transition-all duration-300"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-[#070707] border-b border-zinc-100 dark:border-white/10">
        <img
          src={product.previewImage}
          alt={product.title}
          onClick={() => onOpenImage?.(product.previewImage)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] cursor-zoom-in"
          title="Click to view full image"
        />
        
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-mono font-medium tracking-wide bg-white/95 text-zinc-900 dark:bg-black/60 dark:backdrop-blur-md dark:text-slate-200 rounded-lg shadow-sm border border-zinc-200/50 dark:border-white/10 uppercase">
            {product.category}
          </span>
        </div>

        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
            isWishlisted
              ? 'bg-red-50 dark:bg-red-950/40 text-red-500 border-red-200/60 dark:border-red-900/40 scale-110 shadow-sm'
              : 'bg-white/90 text-zinc-400 border-zinc-200/55 dark:bg-black/60 dark:border-white/10 hover:text-red-500 hover:scale-105'
          }`}
          title={isWishlisted ? 'Remove from Saved' : 'Save Product to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono text-zinc-300 bg-black/60 backdrop-blur-md rounded-md border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span>Deliver to {product.provider}</span>
        </div>
      </div>

      <div className="p-4.5 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{product.rating}</span>
            <span className="text-zinc-400">({product.reviewsCount})</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-505 dark:text-slate-400">
            <HardDrive className="w-3 h-3 text-zinc-400" />
            <span>{product.fileSize}</span>
          </div>
        </div>

        <h3 id={`header-${product.id}`} className="font-sans font-bold text-[15px] sm:text-base leading-snug text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1.5">
          {product.title}
        </h3>
        
        <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1 mb-4">
          {product.shortDescription}
        </p>

        <div className="flex flex-wrap gap-1 mb-4.5">
          {product.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 text-zinc-[505] dark:text-slate-300 text-[10px] font-medium font-mono rounded-md border border-transparent dark:border-white/5"
            >
              #{tag}
            </span>
          ))}
          {product.tags.length > 3 && (
            <span className="px-1.5 py-0.5 bg-zinc-50 dark:bg-white/5 text-[10px] font-mono text-zinc-400 dark:text-slate-400 border border-transparent dark:border-white/5 rounded">
              +{product.tags.length - 3}
            </span>
          )}
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-white/10 flex items-center justify-between gap-3 mt-auto">
          <div>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Price</p>
            <span className="font-mono text-lg sm:text-xl font-bold text-zinc-900 dark:text-indigo-400">
              {product.price === 0 ? (
                <span className="text-emerald-500 dark:text-emerald-400 font-sans tracking-tight">FREE</span>
              ) : (
                `$${product.price}`
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id={`quick-details-${product.id}`}
              onClick={() => onOpenDetails(product)}
              className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
              title="Overview Product Specs"
            >
              <Info className="w-5 h-5" />
            </button>

            <button
              id={`add-to-cart-btn-${product.id}`}
              onClick={() => onAddToCart(product)}
              className="p-2 text-zinc-650 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>

            <button
              id={`buy-btn-${product.id}`}
              onClick={() => onBuyNow(product)}
              className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-850 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-sans font-semibold px-3 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Instant Buy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
