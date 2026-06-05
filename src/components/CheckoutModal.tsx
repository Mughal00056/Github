import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  CreditCard, 
  CheckCircle, 
  Lock, 
  ExternalLink,
  Loader2, 
  Download, 
  Copy,
  Check,
  ShieldAlert,
  Terminal
} from 'lucide-react';
import { Product, CartItem, DownloadProvider } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountCode: string;
  onPurchaseSuccess: (
    email: string, 
    itemsPaid: { id: string; price: number; title: string; downloadUrl: string; provider: DownloadProvider }[],
    paymentMeta: { method: string; payNumber: string; transactionId: string }
  ) => void;
  userEmail: string;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  subtotal,
  discountAmount,
  discountCode,
  onPurchaseSuccess,
  userEmail
}: CheckoutModalProps) {
  const [email, setEmail] = useState<string>(userEmail || '');
  const [fullName, setFullName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('');
  const [cvc, setCvc] = useState<string>('');
  const [clientWalletId, setClientWalletId] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<'checkout' | 'pending' | 'success'>('checkout');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'easypaisa' | 'jazzcash' | 'crypto'>('card');
  const [errorText, setErrorText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string>('');
  const [unlockedKeys, setUnlockedKeys] = useState<{ productId: string; token: string }[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<{ easypaisaNumber: string; jazzcashNumber: string; cryptoAddress: string }>({ easypaisaNumber: '', jazzcashNumber: '', cryptoAddress: '' });

  React.useEffect(() => {
    import('../firebase').then(f => f.getPaymentDetails()).then(setPaymentDetails);
  }, []);

  if (!isOpen) return null;

  const actualAmountDue = Math.max(0, subtotal - discountAmount);

  // Format credit card string nicely as user types (xxxx xxxx xxxx xxxx)
  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 16) input = input.slice(0, 16);
    const parts = [];
    for (let i = 0; i < input.length; i += 4) {
      parts.push(input.slice(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Format expiry nicely (MM/YY)
  const handleExpiryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 4) input = input.slice(0, 4);
    if (input.length >= 2) {
      setExpiry(`${input.slice(0, 2)}/${input.slice(2)}`);
    } else {
      setExpiry(input);
    }
  };

  const handleCvcInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvc(input);
  };

  // Trigger copy
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!email.trim() || !email.includes('@')) {
      setErrorText('Please enter a valid developer email address.');
      return;
    }

    if (actualAmountDue > 0) {
      if (paymentMethod === 'card') {
        if (!fullName.trim()) {
          setErrorText('Please enter the cardholder Name.');
          return;
        }
        if (cardNumber.replace(/\s+/g, '').length < 16) {
          setErrorText('Please enter a valid 16-digit credit card.');
          return;
        }
        if (expiry.length < 5) {
          setErrorText('Please specify expiration details in MM/YY format.');
          return;
        }
        if (cvc.length < 3) {
          setErrorText('Pin code (CVC) must be at least 3 digits.');
          return;
        }
      } else if (['easypaisa', 'jazzcash', 'crypto'].includes(paymentMethod)) {
        if (!clientWalletId.trim()) {
          setErrorText(`Please enter your Sender Wallet ID / Account Number for ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}.`);
          return;
        }
        if (!transactionId.trim()) {
          setErrorText('Please enter the Transaction ID / Reference TxID.');
          return;
        }
      }
    }

    // Launch loading spinners
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      
      // Generate secure local unlocked keys list
      const keys = cart.map(item => ({
        productId: item.product.id,
        token: `LIC-CODE-${item.product.provider.toUpperCase().split(' ')[0]}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      }));
      setUnlockedKeys(keys);

      // Perform real purchase logging
      const itemsPaid = cart.map(item => ({
        id: item.product.id,
        price: item.product.price,
        title: item.product.title,
        downloadUrl: item.product.downloadUrl,
        provider: item.product.provider
      }));
      
      onPurchaseSuccess(email, itemsPaid, {
        method: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'easypaisa' ? 'EasyPaisa' : paymentMethod === 'jazzcash' ? 'JazzCash' : 'Cryptocurrency',
        payNumber: paymentMethod === 'card' ? cardNumber.replace(/\d(?=\d{4})/g, "*") : clientWalletId,
        transactionId: paymentMethod === 'card' ? `TX-CARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : transactionId
      });
      setStep('pending');
    }, 2205);
  };

  return (
    <div id="checkout-modal-panel" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header bar */}
        <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              {step === 'checkout' ? 'Aether Encrypted Gateway' : 'Order Assets Certified'}
            </h3>
          </div>
          <button
            id="checkout-close-top-btn"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-100 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content switch */}
        {step === 'checkout' ? (
          <form onSubmit={handlePaySubmit} className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            
            {/* Cart summary preview */}
            <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 text-xs">
              <span className="font-mono text-zinc-400 uppercase tracking-widest text-[10px]">Purchase elements ({cart.length})</span>
              <div className="space-y-1 mt-1 font-sans">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between font-medium">
                    <span className="truncate text-zinc-700 dark:text-zinc-300 max-w-[250px]">{item.product.title}</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-150">${item.product.price}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-850 mt-2 flex justify-between items-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                <span>Secure Total Due:</span>
                <span className="font-mono">{paymentMethod === 'card' ? `$${actualAmountDue}` : `Rs. ${actualAmountDue * 300}`}</span>
              </div>
            </div>

            {/* Form controls */}
            <div className="space-y-3">
              {/* Payment method selector */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-405 dark:text-zinc-400 uppercase tracking-wide mb-1">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value as any);
                    setCardNumber(''); // Clear numeric inputs
                  }}
                  className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                >
                  <option value="card">Credit/Debit Card (USD)</option>
                  <option value="easypaisa">Easypaisa (PKR)</option>
                  <option value="jazzcash">JazzCash (PKR)</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>

              {/* Product email */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-405 dark:text-zinc-400 uppercase tracking-wide mb-1">Receipt & Delivery Email</label>
                <input
                  id="checkout-input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                />
              </div>

              {actualAmountDue > 0 && paymentMethod === 'card' ? (
                <>
                  {/* Card Name */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-405 dark:text-zinc-400 uppercase tracking-wide mb-1">Cardholder Name</label>
                    <input
                      id="card-name-field"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alexander Hamilton"
                      className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors uppercase"
                    />
                  </div>

                  {/* Card digits */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-405 dark:text-zinc-400 uppercase tracking-wide mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        id="card-number-field"
                        type="text"
                        value={cardNumber}
                        onChange={handleCardInput}
                        placeholder="4111 2222 3333 4444"
                        className="w-full pl-9 pr-3 text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Grid CVV or Expiry */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-405 dark:text-zinc-400 uppercase tracking-wide mb-1">Expiration (MM/YY)</label>
                      <input
                        id="card-expiry-field"
                        type="text"
                        value={expiry}
                        onChange={handleExpiryInput}
                        placeholder="12/28"
                        className="w-full text-center text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-405 dark:text-zinc-400 uppercase tracking-wide mb-1">Security Code (CVC)</label>
                      <input
                        id="card-cvc-field"
                        type="password"
                        value={cvc}
                        onChange={handleCvcInput}
                        placeholder="•••"
                        className="w-full text-center text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>
                </>
              ) : actualAmountDue > 0 && ['easypaisa', 'jazzcash', 'crypto'].includes(paymentMethod) ? (
                <div className="space-y-3">
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-2xl text-center space-y-2">
                    <p className="font-semibold text-xs text-zinc-700 dark:text-zinc-300">
                      Transfer to Admin {paymentMethod === 'crypto' ? 'Wallet Address' : 'Account Number'}
                    </p>
                    <div className="flex items-center justify-center gap-2 p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                      <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 select-all truncate max-w-[220px]">
                        {paymentMethod === 'easypaisa' ? paymentDetails.easypaisaNumber : 
                         paymentMethod === 'jazzcash' ? paymentDetails.jazzcashNumber : 
                         paymentDetails.cryptoAddress}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(
                          paymentMethod === 'easypaisa' ? paymentDetails.easypaisaNumber : 
                          paymentMethod === 'jazzcash' ? paymentDetails.jazzcashNumber : 
                          paymentDetails.cryptoAddress,
                          'admin-payment-detail'
                        )}
                        className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0 cursor-pointer"
                        title="Copy Account ID"
                      >
                        {copiedId === 'admin-payment-detail' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      Please copy the ID above, complete your transfer of <strong className="text-zinc-800 dark:text-zinc-200">{paymentMethod === 'crypto' ? `$${actualAmountDue}` : `Rs. ${actualAmountDue * 300}`}</strong>, then enter transfer details below.
                    </p>
                  </div>

                  {/* Client Payment Verification Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-405 dark:text-zinc-400 uppercase tracking-wide mb-1">
                        Your Sender {paymentMethod === 'crypto' ? 'Wallet Address / ID' : 'Mobile Number / Account ID'}
                      </label>
                      <input
                        id="checkout-client-wallet-id"
                        type="text"
                        required
                        value={clientWalletId}
                        onChange={(e) => setClientWalletId(e.target.value)}
                        placeholder={paymentMethod === 'crypto' ? '0x...' : '03xx xxx xxxx'}
                        className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-405 dark:text-zinc-400 uppercase tracking-wide mb-1">
                        Transaction ID / Reference TxID
                      </label>
                      <input
                        id="checkout-tx-id"
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="TRX-9876543210-REF"
                        className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ) : actualAmountDue > 0 ? (
                <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-xs">
                    Please transfer amount to the CRYPTO wallet provided after submission.
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-left">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-sans font-semibold">Free License Selected</p>
                  <p className="text-[11px] text-zinc-505 dark:text-zinc-400 mt-0.5">Under applied promotional factors, this transaction contains $0 debt. No bank elements are requested.</p>
                </div>
              )}
            </div>

            {errorText && (
              <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-150 dark:border-red-900/40">{errorText}</p>
            )}

            {isProcessing ? (
              <button
                id="checkout-pay-btn-loading"
                type="button"
                disabled
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 opacity-90"
              >
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span className="font-sans text-xs sm:text-sm">Verifying blockchain token registry...</span>
              </button>
            ) : (
              <button
                id="checkout-pay-btn"
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs sm:text-sm rounded-xl cursor-pointer shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {actualAmountDue === 0 ? 'Claim License Free' : paymentMethod === 'card' ? `Securely Pay $${actualAmountDue}` : `Securely Pay Rs. ${actualAmountDue * 300}`}
                </span>
              </button>
            )}

            <div className="flex justify-center items-center gap-1.5 text-[10px] text-zinc-400">
              <span>🔒 PCI-DSS Compliant Encryption Standard</span>
            </div>

            <div className="pt-2.5 border-t border-zinc-150 dark:border-zinc-900/60 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.history.pushState({}, '', '/admin/dashboard');
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-sans font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-indigo-500/10 cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-indigo-500" />
                <span>Go to Admin Portal / Dashboard</span>
              </button>
            </div>

          </form>
        ) : step === 'pending' ? (
          /* PENDING STATE PANEL */
          <div className="p-6 text-center space-y-5 overflow-y-auto flex-1 min-h-0">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto ring-4 ring-amber-500/5">
              <Loader2 className="w-8 h-8 animate-spin stroke-[2.5]" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-sans font-black text-zinc-900 dark:text-white uppercase tracking-tight">Transaction Pending</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Thank you! Your payment verification proof has been transmitted and is now awaiting administrator review.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-850 text-left space-y-2.5 text-xs font-sans">
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-1.5 font-mono text-[10px] uppercase text-zinc-400">
                <span>Verification Receipt</span>
                <span className="text-amber-500 font-bold">Awaiting Audit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Receiver Email:</span>
                <span className="font-semibold text-zinc-850 dark:text-white">mrflop786@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Sender Email:</span>
                <span className="font-mono text-zinc-850 dark:text-white truncate max-w-[190px]">{email}</span>
              </div>
              {paymentMethod !== 'card' && clientWalletId && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sender Wallet/Account:</span>
                  <span className="font-mono text-zinc-850 dark:text-white truncate max-w-[190px]">{clientWalletId}</span>
                </div>
              )}
              {paymentMethod !== 'card' && transactionId && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[195px] select-all">{transactionId}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 border-t border-zinc-100 dark:border-zinc-900/60 font-bold">
                <span className="text-zinc-900 dark:text-zinc-200 font-sans">Total Transferred:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                  {paymentMethod === 'card' ? `$${actualAmountDue}` : `Rs. ${actualAmountDue * 300}`}
                </span>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl text-left text-[11px] text-amber-600 dark:text-amber-400/95 leading-relaxed font-sans">
              🔒 <strong>Escrow Guarantee:</strong> Admins review and match transaction proofs dynamically. Typical confirmation of the source file download unlocks takes between 5 to 15 minutes. Once checked, the dynamic downloads will instantly unlock on your dashboard registers.
            </div>

            <div className="pt-2 border-t border-zinc-150 dark:border-zinc-905 flex flex-col gap-2">
              <button
                onClick={() => {
                  onClose();
                  // Open dashboard where products they purchased can be monitored
                  const dashboardTrig = document.getElementById('user-dashboard-trigger');
                  if (dashboardTrig) dashboardTrig.click();
                }}
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 font-sans font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-all"
              >
                Go to Dashboard
              </button>

              <button
                onClick={() => {
                  onClose();
                  window.history.pushState({}, '', '/admin/dashboard');
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-sans font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-indigo-500/10 cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-indigo-505" />
                <span>Go to Admin Portal / Dashboard</span>
              </button>

              <button
                onClick={onClose}
                className="text-xs text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 hover:underline cursor-pointer py-1.5"
              >
                Return to Assets Catalogue
              </button>
            </div>
          </div>
        ) : (
          /* SUCCESS STATE PANEL */
          <div className="p-6 text-center space-y-5 overflow-y-auto flex-1 min-h-0">
            
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-sans font-bold text-zinc-900 dark:text-white">Transaction Complete!</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Your secure licenses have been written and attached. Check your digital dashboard to view, copy, or reload links.
              </p>
                       {/* Generated Unlocked Assets */}
            <div className="space-y-3 text-left">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest pl-1">Direct Download Links</span>
              <div className="space-y-2.5">
                {cart.map(item => {
                  return (
                    <div
                      key={item.product.id}
                      className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-xl"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[285px]">{item.product.title}</span>
                      </div>

                      {/* Direct Raw URL display */}
                      <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 text-[10px] font-mono mb-2 break-all text-indigo-600 dark:text-indigo-400 shadow-inner">
                        <span className="text-zinc-400 block mb-0.5 text-[9px] uppercase tracking-wider">Direct URL:</span>
                        <a href={item.product.downloadUrl} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                          {item.product.downloadUrl}
                        </a>
                      </div>

                      {/* Download Link anchor */}
                      <a
                        id={`direct-dl-${item.product.id}`}
                        href={item.product.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-sans font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Instant Download Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>   </div>

            {/* Quick close redirect buttons */}
            <div className="pt-3 border-t border-zinc-150 dark:border-zinc-900 flex flex-col gap-2">
              <button
                id="success-dashboard-cta"
                onClick={() => {
                  onClose();
                  // Trigger open dashboard which displays downloads
                  const dashboardTrig = document.getElementById('user-dashboard-trigger');
                  if (dashboardTrig) dashboardTrig.click();
                }}
                className="w-full py-2.5 bg-zinc-900 border hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 font-sans font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
              >
                View Purchased Products Dashboard
              </button>
              <button
                id="success-close-btn"
                onClick={onClose}
                className="text-xs text-zinc-400 hover:text-zinc-650 hover:underline cursor-pointer"
              >
                Close & Return to Assets Catalogue
              </button>
            </div>

          </div>
        )}

      </motion.div>
    </div>
  );
}
