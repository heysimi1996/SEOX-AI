import React, { useState } from 'react';
import { Globe, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface URLAnalyzerInputProps {
  onAnalyze: (url: string) => void;
  isLoading?: boolean;
  initialValue?: string;
  size?: 'default' | 'large';
  placeholder?: string;
  buttonLabel?: string;
}

export const URLAnalyzerInput: React.FC<URLAnalyzerInputProps> = ({
  onAnalyze,
  isLoading = false,
  initialValue = '',
  size = 'large',
  placeholder = 'https://yourwebsite.com',
  buttonLabel = 'ANALYZE',
}) => {
  const [url, setUrl] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = url.trim();
    if (!cleanUrl) {
      cleanUrl = 'https://example.com';
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      new URL(cleanUrl);
      setError(null);
      onAnalyze(cleanUrl);
    } catch {
      setError('Please enter a valid URL (e.g., domain.com)');
    }
  };

  const quickPresets = ['linear.app', 'stripe.com', 'vercel.com'];

  return (
    <div className="w-full space-y-3">
      <form
        onSubmit={handleSubmit}
        className={`relative group rounded-2xl bg-[#121212]/90 backdrop-blur-xl border border-white/[0.12] transition-all duration-300 focus-within:border-[#FF5E00]/60 focus-within:shadow-[0_0_30px_-5px_rgba(255,94,0,0.3)] shadow-xl shadow-black/60 p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2`}
      >
        <div className="flex-1 flex items-center gap-3 px-3 min-w-0">
          <Globe className="w-5 h-5 text-neutral-400 group-focus-within:text-[#FF5E00] transition-colors shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-white placeholder-neutral-500 font-mono text-sm sm:text-base focus:outline-none focus:ring-0 truncate"
            aria-label="Target website URL for SEO analysis"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`h-11 sm:h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#FF5E00] to-[#FF4500] hover:from-[#FF6B00] hover:to-[#FF5500] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#FF5E00]/25 hover:shadow-xl hover:shadow-[#FF5E00]/40 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <span>{buttonLabel}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {error && <p className="text-xs text-red-400 font-medium px-2">{error}</p>}

      {/* Quick Test Presets */}
      <div className="flex flex-wrap items-center gap-2 px-1 text-xs text-neutral-400">
        <span className="font-medium text-neutral-500">Quick scan demo:</span>
        {quickPresets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setUrl(`https://${preset}`);
              onAnalyze(`https://${preset}`);
            }}
            className="px-2.5 py-1 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/[0.06] hover:border-[#FF5E00]/40 transition-all font-mono text-[11px] cursor-pointer"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
};
