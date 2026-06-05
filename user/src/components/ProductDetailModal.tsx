import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Star, 
  HardDrive, 
  Check, 
  Calendar, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Send, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import { Product, Review, UserProfile } from '../types';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  isPurchased: boolean;
  onAddReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
  user: UserProfile;
  setIsAuthModalOpen: (open: boolean) => void;
  onOpenImage?: (imageUrl: string) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isPurchased,
  onAddReview,
  user,
  setIsAuthModalOpen,
  onOpenImage
}: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [customUsername, setCustomUsername] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = customUsername.trim() || user.name || 'Anonymous User';

    if (!newReviewText.trim()) {
      setReviewError('Review text cannot be left blank.');
      return;
    }

    onAddReview(product.id, {
      username: finalName,
      rating: newReviewRating,
      text: newReviewText.trim()
    });

    setNewReviewText('');
    setCustomUsername('');
    setNewReviewRating(5);
    setReviewError('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  return (
    <div id="modal-container" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 2, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            id={`modal-close-btn-${product.id}`}
            onClick={onClose}
            className="p-2 bg-white/90 dark:bg-zinc-900/90 text-zinc-[505] hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full border border-zinc-200/60 dark:border-zinc-800 transition-colors shadow-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div 
            onClick={() => onOpenImage?.(product.previewImage)}
            className="relative aspect-[21/9] w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden cursor-zoom-in group/image"
            title="Click to view full image"
          >
            <img
              src={product.previewImage}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/30 to-transparent" />
            <div className="absolute top-4 left-4 bg-zinc-950/60 backdrop-blur-md opacity-0 group-hover/image:opacity-100 transition-opacity text-white text-[10px] font-mono py-1 px-2.5 rounded-lg border border-white/10">
              🔍 Click to open full-screen preview
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-2.5 py-1 text-[10px] font-mono font-medium tracking-wider bg-indigo-600 text-white rounded-lg uppercase shadow-sm">
                {product.category}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold text-white tracking-tight mt-2.5">
                {product.title}
              </h2>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex border-b border-zinc-100 dark:border-zinc-900">
                <button
                  id="tab-details-toggle"
                  onClick={() => setActiveTab('details')}
                  className={`pb-3 text-sm font-sans font-semibold border-b-2 px-4 transition-colors cursor-pointer ${
                    activeTab === 'details'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  Product Details
                </button>
                <button
                  id="tab-reviews-toggle"
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 text-sm font-sans font-semibold border-b-2 px-4 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  Reviews ({product.reviews.length})
                </button>
              </div>

              {activeTab === 'details' ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">Description Overview</h4>
                    <p className="text-sm sm:text-base text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-line bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900/50">
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-3">Key Product Features</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {product.features.map((feat, idx) => (
                        <li key={idx} className="flex gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                          <div className="p-0.5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-955/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3.5 items-start p-4 rounded-xl border border-indigo-100/40 dark:border-indigo-955/20 bg-indigo-50/20 dark:bg-indigo-950/10">
                    <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-sans font-semibold text-zinc-900 dark:text-zinc-100">Verified Aether Seller License</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Purchasing grants direct, lifetime personal and commercial project permissions. Future framework upgrades are always free.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {product.reviews.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-zinc-150 dark:border-zinc-900 rounded-2xl">
                        <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm font-medium text-zinc-500">There are no client review logs for this product yet.</p>
                        <p className="text-xs text-zinc-400 mt-1">Be the first to leave feedback below!</p>
                      </div>
                    ) : (
                      product.reviews.map((rev) => (
                        <div key={rev.id} className="p-4 bg-zinc-50/60 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-900/60">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {rev.avatar ? (
                                <img src={rev.avatar} className="w-7 h-7 rounded-full object-cover" alt={rev.username} />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-955/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                                  {rev.username.charAt(0)}
                                </div>
                              )}
                              <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">{rev.username}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">{rev.date}</span>
                          </div>
                          
                          <div className="flex gap-0.5 mb-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'text-amber-400 fill-current' : 'text-zinc-200 dark:text-zinc-800'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed">
                            {rev.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-900 pt-6">
                    <h4 className="text-sm font-sans font-bold text-zinc-900 dark:text-zinc-100 mb-3.5 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      Submit Your Product Review
                    </h4>

                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wide mb-1.5">Your Name / Username</label>
                        <input
                          id="review-name-input"
                          type="text"
                          value={customUsername}
                          onChange={(e) => setCustomUsername(e.target.value)}
                          placeholder="e.g. Alexa, Robert Full-Stack, Guest Creator"
                          className="w-full text-sm p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-[10px] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wide mb-1.5">Your Rating Scale</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((stars) => (
                            <button
                              id={`select-star-btn-${stars}`}
                              key={stars}
                              type="button"
                              onClick={() => setNewReviewRating(stars)}
                              className="p-1 hover:scale-115 transition-transform text-amber-400 cursor-pointer"
                            >
                              <Star className={`w-6 h-6 ${stars <= newReviewRating ? 'fill-current' : 'stroke-zinc-300 dark:stroke-zinc-700'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wide mb-1.5">Review message</label>
                        <textarea
                          id="review-message-textarea"
                          value={newReviewText}
                          onChange={(e) => {
                            setNewReviewText(e.target.value);
                            setReviewError('');
                          }}
                          placeholder="Write down details on format, styling quality, and documentation satisfaction..."
                          rows={3}
                          className="w-full text-sm p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-805 rounded-xl focus:border-indigo-505 dark:focus:border-indigo-400 focus:bg-white outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-405 transition-all"
                        />
                      </div>

                      {reviewError && (
                        <p className="text-xs text-red-500 font-medium">{reviewError}</p>
                      )}
                      
                      {reviewSuccess && (
                        <p className="text-xs text-emerald-500 font-semibold">Your review was submitted! Thank you for the support.</p>
                      )}

                      <button
                        id="submit-review-btn"
                        type="submit"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-sans font-semibold py-2 px-4 rounded-xl transition-colors cursor-pointer"
                      >
                        <span>Send Review</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 lg:border-l lg:border-zinc-150 lg:dark:border-zinc-900 lg:pl-6">
              <div className="space-y-2.5">
                <div className="flex justify-between items-baseline px-1.5">
                  <span className="text-xs font-mono text-zinc-405">License Cost:</span>
                  <span className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {product.price === 0 ? 'FREE' : `$${product.price}`}
                  </span>
                </div>

                {isPurchased ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5 justify-center py-1 bg-emerald-500/10 rounded-lg">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlocked & Active Sandbox License Owned</span>
                    </p>
                    <a
                      id="unlocked-download-anchor"
                      href={product.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-555 text-white font-sans font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      <span>Download File Asset ({product.provider})</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <>
                    <button
                      id="details-buy-btn"
                      onClick={() => onBuyNow(product)}
                      className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-[505] dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-sans font-bold text-sm rounded-xl active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Purchase License Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      id="details-add-to-cart-btn"
                      onClick={() => onAddToCart(product)}
                      className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-sans font-semibold text-xs rounded-xl active:scale-98 transition-all cursor-pointer"
                    >
                      Add to Shopping Cart
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
