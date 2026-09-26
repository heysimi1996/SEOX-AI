import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Code2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FixGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueTitle: string;
  issueId: string;
  category: string;
  defaultSnippet?: string;
  targetUrl: string;
}

export const FixGeneratorModal: React.FC<FixGeneratorModalProps> = ({
  isOpen,
  onClose,
  issueTitle,
  issueId,
  category,
  defaultSnippet,
  targetUrl,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('html');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState(defaultSnippet || `<link rel="canonical" href="${targetUrl}" />`);
  const [explanation, setExplanation] = useState(
    'This patch ensures search engines identify the authoritative canonical source and consolidates link equity.'
  );

  if (!isOpen) return null;

  const formats = [
    { id: 'html', label: 'HTML <head>' },
    { id: 'jsonld', label: 'JSON-LD Schema' },
    { id: 'robots', label: 'robots.txt' },
    { id: 'htaccess', label: '.htaccess' },
    { id: 'wordpress', label: 'WordPress functions.php' },
  ];

  const handleGenerate = async (fmt: string) => {
    setSelectedFormat(fmt);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/generate-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId,
          ruleName: issueTitle,
          targetUrl,
          language: fmt,
          contextData: { category },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.code) setCode(data.code);
        if (data.explanation) setExplanation(data.explanation);
      }
    } catch {
      // Fallback
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0F0F0F] border border-white/[0.12] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#FF8A3D] bg-[#FF5E00]/10 px-2 py-0.5 rounded border border-[#FF5E00]/20">
                {issueId}
              </span>
              <span className="text-xs font-semibold text-neutral-400 capitalize">· {category}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{issueTitle}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Warning */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Production Safety:</strong> SEOX AI never modifies production server files directly. Review, test in staging, and apply manually.
          </span>
        </div>

        {/* Format Selectors */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-300">Select Fix Format</label>
          <div className="flex flex-wrap gap-2">
            {formats.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => handleGenerate(fmt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedFormat === fmt.id
                    ? 'bg-[#FF5E00] text-white font-bold shadow-md shadow-[#FF5E00]/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Preview Block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-400">Generated Code Snippet</span>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold text-[#FF8A3D] hover:text-[#FFA766] flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-2xl bg-[#080808] border border-white/[0.1] p-4 font-mono text-xs text-neutral-200 overflow-x-auto max-h-56">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-neutral-500 py-6 justify-center">
                <div className="w-4 h-4 border-2 border-[#FF5E00] border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing code fix with Gemini...</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap">{code}</pre>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.06] text-xs text-neutral-300 space-y-1">
          <div className="text-neutral-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5E00]" />
            <span>AI Implementation Note</span>
          </div>
          <p className="leading-relaxed">{explanation}</p>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-neutral-500">Target: {targetUrl}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08]"
            >
              Done
            </button>
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF5E00] hover:bg-[#FF6E1A] shadow-md shadow-[#FF5E00]/25 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Fix</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
