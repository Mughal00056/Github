import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Tag, ArrowRight, ShieldCheck, ShoppingCart, Percent } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onTriggerCheckout: (discountCode: string, discountValue: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onClearCart,
  onTriggerCheckout
}: CartDrawerProps) {
   const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoError, setPromoError] = useState<string>('');
  const [promoSuccess, setPromoSuccess] = useState<string>('');
  const [promoCodesList, setPromoCodesList] = useState<{ code: string; percent: number; description?: string }[]>([]);

  useEffect(() => {
    import('../firebase').then(f => f.getPromoCodes()).then(list => {
      if (list && list.length > 0) {
        setPromoCodesList(list);
      }
    }).catch(err => {
      console.warn('Unable to get live promos, using local static values:', err);
    });
  }, [isOpen]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();

    if (!code) return;

    // Direct dynamic catalog search with fallback representation
    const defaultPromos = [
      { code: 'AETHER20', percent: 20 },
      { code: 'WELCOME20', percent: 20 },
      { code: 'FREEBIE', percent: 100 }
    ];
    // Combine both static and live list to ensure AETHER20 and FREEBIE always work
    const activePromos = [...defaultPromos];
    if (promoCodesList && promoCodesList.length > 0) {
      promoCodesList.forEach(dynamicPromo => {
        if (dynamicPromo && dynamicPromo.code && !activePromos.some(p => p.code.toUpperCase() === dynamicPromo.code.toUpperCase())) {
          activePromos.push(dynamicPromo);
        }
      });
    }

    const matched = activePromos.find(p => p.code.trim().toUpperCase() === code);
    if (matched) {
      setAppliedPromo(code);
      setDiscountPercent(matched.percent);
      setPromoSuccess(`Promo ${code} applied! ${matched.percent}% discount subtracted.`);
      setPromoError('');
    } else {
      setPromoError('Unknown promo code. Try AETHER20 or FREEBIE!');
      setPromoSuccess('');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo('');
    setDiscountPercent(0);
    setPromoCode('');
    setPromoSuccess('');
    setPromoError('');
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * (item.quantity || 1), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const netTotal = Math.max(0, subtotal - discountAmount);

  return (
    <motion.div
      id="cart-drawer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Dim Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/75 backdrop-blur-xs"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full sm:w-screen sm:max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-150 dark:border-zinc-900 shadow-2xl flex flex-col h-full"
        >
          {/* Header */}
          <div className="px-5 py-6 border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">Your Shopping Cart</h3>
              <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 rounded-full font-bold">
                {cart.length}
              </span>
            </div>
            
            <button
              id="close-cart-btn"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 flex items-center justify-center mx-auto">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-zinc-500">Your cart is completely empty!</p>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Browse our high-quality dashboard templates, UI design kits, and prompt packages to start building.
                </p>
                <button
                  id="checkout-resume-browsing"
                  onClick={onClose}
                  className="mt-2 text-xs font-sans font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Continue browsing elements
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-900/50 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors"
                  >
                    <img
                      src={item.product.previewImage}
                      alt={item.product.title}
                      className="w-16 h-12 object-cover rounded-lg shrink-0 border border-zinc-100 dark:border-zinc-900"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{item.product.category}</span>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.product.title}</h4>
                      <p className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-300 mt-1 flex items-center gap-2">
                        <span>{item.product.price === 0 ? 'FREE' : `$${item.product.price}`}</span>
                        {(item.quantity || 1) > 1 && (
                          <span className="text-[9px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-100/30 dark:border-indigo-800/20">
                            Qty: {item.quantity}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      id={`remove-item-${item.product.id}`}
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-zinc-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0 self-center transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}

                <div className="flex justify-end pr-1">
                  <button
                    id="clear-all-cart-items-btn"
                    onClick={onClearCart}
                    className="text-xs text-zinc-400 hover:text-red-500 hover:underline transition-colors font-sans font-semibold cursor-pointer"
                  >
                    Empty Entire Cart
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer containing Summary & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="border-t border-zinc-200 dark:border-zinc-900 p-5 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-4">
              
              {/* Promo Fields */}
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="promo-code-input"
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError('');
                      }}
                      disabled={!!appliedPromo}
                      placeholder="WELCOME20, FREEBIE"
                      className="w-full text-xs pl-8.5 pr-2.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 disabled:opacity-50 focus:border-indigo-500 uppercase"
                    />
                  </div>
                  {appliedPromo ? (
                    <button
                      id="remove-promo-button"
                      type="button"
                      onClick={handleRemovePromo}
                      className="py-1.5 px-3 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      id="apply-promo-button"
                      type="submit"
                      className="py-1.5 px-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-sans font-semibold rounded-lg hover:opacity-95 cursor-pointer"
                    >
                      Apply
                    </button>
                  )}
                </div>

                {promoError && <p className="text-[10px] text-red-500 font-medium">{promoError}</p>}
                {promoSuccess && <p className="text-[10px] text-emerald-500 font-semibold">{promoSuccess}</p>}
                {!appliedPromo && (
                  <p className="text-[10.5px] text-zinc-400">
                    💡 Tip: Enter <span className="font-mono font-bold text-zinc-505 dark:text-zinc-300">AETHER20</span> (20% off) or <span className="font-mono font-bold text-zinc-505 dark:text-zinc-300">FREEBIE</span> (100% off) for test discount!
                  </p>
                )}
              </form>

              {/* Price list */}
              <div className="space-y-1.5 text-xs text-zinc-650 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">${subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      Discount ({discountPercent}%):
                    </span>
                    <span className="font-mono">-${discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Merchant Processing Tax:</span>
                  <span className="font-mono text-zinc-400">$0.00</span>
                </div>
                
                <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-150 dark:border-zinc-900/60">
                  <span>Amount Due:</span>
                  <span className="font-mono">${netTotal}</span>
                </div>
              </div>

              {/* Security confirmation */}
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 text-left bg-zinc-100 dark:bg-zinc-900/60 p-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Processed fully SSL encrypted. Digital unlock triggers instantly upon clearing checkout.</span>
              </div>

              {/* Checkout Trigger */}
              <button
                id="cart-checkout-cta"
                onClick={() => onTriggerCheckout(appliedPromo, discountAmount)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-550 text-white font-sans font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </motion.div>
      </div>
    </motion.div>
  );
}
