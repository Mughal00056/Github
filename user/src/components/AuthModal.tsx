import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Mail, Lock, User, ShieldCheck, UserCheck, LogIn, Plus } from 'lucide-react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string, email: string, avatar: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
];

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_PRESETS[0]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorText('');

    try {
      if (isSignUp) {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        await updateProfile(credential.user, {
          displayName: name.trim(),
          photoURL: selectedAvatar
        });

        const userId = email.trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
        await setDoc(doc(db, 'users', userId), {
          email: email.trim(),
          name: name.trim() || email.trim().split('@')[0],
          avatar: selectedAvatar,
          isAdmin: email.trim().toLowerCase() === 'mrflop786@gmail.com',
          wishlistIds: [],
          blocked: false
        }, { merge: true });

        onLoginSuccess(name.trim() || email.trim().split('@')[0], email.trim(), selectedAvatar);
      } else {
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const displayName = credential.user.displayName || credential.user.email?.split('@')[0] || 'Member';
        const photoURL = credential.user.photoURL || selectedAvatar;
        
        onLoginSuccess(displayName, credential.user.email || email.trim(), photoURL);
      }
      
      onClose();
    } catch (err: any) {
      console.warn("Authentication failed:", err);
      let showMsg = err.message || "An authentication error occurred.";
      if (showMsg.includes("auth/weak-password")) {
        showMsg = "Password must be at least 6 characters long.";
      } else if (showMsg.includes("auth/email-already-in-use")) {
        showMsg = "This email is already registered.";
      } else if (showMsg.includes("auth/invalid-credential") || showMsg.includes("auth/wrong-password") || showMsg.includes("auth/user-not-found")) {
        showMsg = "Invalid registered email or password.";
      }
      setErrorText(showMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-modal-panel-root" className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs flex justify-center items-start sm:items-center p-4 overflow-y-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative my-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl w-full max-w-sm sm:max-w-md shadow-2xl p-5 sm:p-7"
      >
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-150 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-650 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="text-base font-sans font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">
            {isSignUp ? "Create Account" : "Access Portal"}
          </h3>
          <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-normal">
            {isSignUp 
              ? "Join AetherVault to secure your private keys, unlock dynamic source codes, and curate your personalized assets cockpit."
              : "Sign in with your registered developer account to instantly manage active orders & sync digital products."
            }
          </p>
        </div>

        {errorText && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-center">
            <p className="text-xs font-sans font-medium text-red-650 dark:text-red-400">{errorText}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-[10px] font-mono text-zinc-455 dark:text-zinc-400 tracking-wide uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="auth-input-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full text-xs p-2.5 pl-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-455 dark:text-zinc-455 uppercase tracking-wide mb-1.5">
                  Select Custom Avatar
                </label>
                <div className="flex justify-start gap-2.5">
                  {AVATAR_PRESETS.map((preset, index) => {
                    const isSelected = selectedAvatar === preset;
                    return (
                      <button
                        id={`auth-modal-avatar-${index}`}
                        type="button"
                        key={preset}
                        onClick={() => setSelectedAvatar(preset)}
                        className={`relative rounded-xl overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                          isSelected 
                            ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900 scale-105' 
                            : 'opacity-60 hover:opacity-90'
                        }`}
                      >
                        <img src={preset} className="w-8 h-8 object-cover" alt="Profile selector preset" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-mono text-zinc-455 dark:text-zinc-400 tracking-wide uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                id="auth-input-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@aethervault.io"
                className="w-full text-xs p-2.5 pl-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-white transition-colors"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-455 dark:text-zinc-405 tracking-wide uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="auth-input-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-2.5 pl-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-505 text-zinc-900 dark:text-white transition-colors"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] font-sans font-bold text-xs text-white rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : isSignUp ? (
              <>
                <Plus className="w-4 h-4" />
                <span>Create Secure Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In ⚡</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            id="toggle-auth-mode-btn"
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-indigo-650 hover:text-indigo-505 dark:text-indigo-400 dark:hover:text-indigo-305 font-medium transition-colors cursor-pointer"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need a professional developer account? Sign Up"}
          </button>
        </div>

        <div className="flex justify-center items-center gap-1.5 text-[9px] text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-[280px] mx-auto text-center pt-5 border-t border-zinc-100 dark:border-zinc-900 mt-5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Equipped with enterprise SSL guards. Admin: mrflop786@gmail.com</span>
        </div>
      </motion.div>
    </div>
  );
}
