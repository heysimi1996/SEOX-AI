import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode = 'signup',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0F0F0F] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-2xl bg-[#FF5E00] items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-[#FF5E00]/30 mb-1">
            S
          </div>
          <h3 className="text-2xl font-bold text-white">
            {mode === 'signup' ? 'Start Free with SEOX AI' : 'Welcome back to SEOX AI'}
          </h3>
          <p className="text-xs text-neutral-400">
            {mode === 'signup'
              ? 'Autonomous website audit & continuous crawler intelligence'
              : 'Sign in to access your domain telemetry workspace'}
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-neutral-900 border border-emerald-500/30 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white">Workspace Initialized</div>
            <div className="text-xs text-neutral-400">
              Welcome to SEOX AI! Redirecting to your dashboard...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Work Email</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-900 border border-white/[0.08] focus-within:border-[#FF5E00]/60">
                <Mail className="w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-neutral-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Password</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-900 border border-white/[0.08] focus-within:border-[#FF5E00]/60">
                <Lock className="w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-neutral-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#FF5E00] hover:bg-[#FF6D1A] transition-all shadow-lg shadow-[#FF5E00]/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{mode === 'signup' ? 'Create Free Workspace' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-neutral-400">
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[#FF8A3D] hover:underline font-semibold"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#FF8A3D] hover:underline font-semibold"
              >
                Start Free
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
