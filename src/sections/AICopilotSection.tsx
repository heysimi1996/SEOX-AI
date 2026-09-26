import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  Code2,
  FileCode,
  X,
} from 'lucide-react';
import { INITIAL_COPILOT_CONVERSATION } from '../data/seoData';
import { CopilotMessage } from '../types/seo';

export const AICopilotSection: React.FC = () => {
  const [messages, setMessages] = useState<CopilotMessage[]>(INITIAL_COPILOT_CONVERSATION);
  const [inputValue, setInputValue] = useState('');
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    'How do I fix the duplicate title tags?',
    'What caused the mobile LCP spike?',
    'Generate schema snippet for our software page',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI Copilot response tailored to SEO context
    setTimeout(() => {
      let aiReply = '';
      let actions: string[] = [];

      if (text.toLowerCase().includes('duplicate') || text.toLowerCase().includes('title')) {
        aiReply =
          'To fix the 14 duplicate title tags:\n\n1. Identify dynamic parameter variations in category query strings.\n2. Set strict canonical URLs pointing to root category pages.\n3. Add localized dynamic template modifiers: `<title>{Category} | Verified Benchmarks | Brand</title>`.\n\nThis will immediately eliminate keyword cannibalization.';
        actions = [
          'Add canonical link rel tags',
          'Deploy template title variable script',
          'Submit updated URLs for Googlebot priority recrawl',
        ];
      } else if (text.toLowerCase().includes('mobile') || text.toLowerCase().includes('lcp')) {
        aiReply =
          'Mobile LCP increased by 0.9s primarily due to an uncompressed 2.4MB hero banner image and 3 blocking analytics tags.\n\nRecommended actions:\n1. Convert hero banner to WebP/AVIF with srcset.\n2. Add `fetchpriority="high"` on hero img tag.\n3. Defer GTM and external font scripts.';
        actions = [
          'Compress hero assets to <120KB',
          'Inject preload priority tag in head',
          'Verify INP impact in Chrome UX report',
        ];
      } else {
        aiReply = `I analyzed your query: "${text}". Based on your website's crawl data, our engine recommends prioritizing the 2 critical architectural blocks before tuning on-page semantics. This delivers the highest PageRank equity uplift in current search engine updates.`;
        actions = [
          'Review technical issues in audit tab',
          'Export priority action plan to engineering ticket queue',
        ];
      }

      const copilotMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'copilot',
        timestamp: 'Just now',
        text: aiReply,
        actionItems: actions,
        suggestedRoadmap: true,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <section id="copilot" className="py-24 relative overflow-hidden bg-[#0A0A0A]/40 border-t border-white/[0.05]">
      {/* Glow */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[350px] bg-[#FF5E00]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Description Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-white/[0.08]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5E00]" />
              <span className="text-[11px] font-semibold tracking-wider text-neutral-300 uppercase">
                Autonomous Reasoning
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Don't Just Find Problems.{' '}
              <span className="bg-gradient-to-r from-[#FF5E00] via-[#FF7A1A] to-[#FFA726] bg-clip-text text-transparent">
                Understand Them.
              </span>
            </h2>

            <p className="text-base text-neutral-400 font-normal leading-relaxed">
              Standard SEO tools hand you spreadsheets of 5,000 raw warnings. SEOX AI Copilot
              synthesizes root causes across crawl logs, algorithm shift benchmarks, and code
              repositories into plain, executable roadmaps.
            </p>

            <div className="pt-2 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#FF5E00]/20 flex items-center justify-center text-[#FF5E00] shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-sm text-neutral-300">
                  <strong className="text-white">Root Cause Attribution:</strong> Connects drops to exact code commits, sitemap changes, or search engine updates.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#FF5E00]/20 flex items-center justify-center text-[#FF5E00] shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-sm text-neutral-300">
                  <strong className="text-white">Direct Code Solutions:</strong> Ready-to-commit HTML meta, robots directives, and Schema.org snippets.
                </div>
              </div>
            </div>

            {/* Quick interactive prompts */}
            <div className="pt-4">
              <span className="text-xs text-neutral-400 font-medium">Try asking the Copilot:</span>
              <div className="mt-2.5 flex flex-col gap-2">
                {samplePrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSendMessage(p)}
                    className="text-left text-xs font-medium text-neutral-300 hover:text-white bg-[#121212] hover:bg-[#1A1A1A] p-2.5 rounded-xl border border-white/[0.06] hover:border-[#FF5E00]/40 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span>"{p}"</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#FF5E00] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right AI Copilot Chat Interface */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#0D0D0D] border border-white/[0.1] shadow-2xl shadow-black overflow-hidden flex flex-col h-[560px]">
              {/* Copilot Header */}
              <div className="px-5 py-4 bg-[#141414] border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FF5E00] flex items-center justify-center text-white shadow-md shadow-[#FF5E00]/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>SEOX Copilot</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[11px] text-neutral-400">Context: 1,284 URLs Scanned</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/[0.06]">
                  DEMO COPILOT
                </span>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-lg bg-[#FF5E00]/20 border border-[#FF5E00]/40 flex items-center justify-center text-[#FF5E00] shrink-0 mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-[#FF5E00] text-white font-medium rounded-tr-sm shadow-md shadow-[#FF5E00]/20'
                            : 'bg-[#161616] text-neutral-200 border border-white/[0.08] rounded-tl-sm'
                        }`}
                      >
                        <div className="whitespace-pre-line">{msg.text}</div>

                        {/* Action items from AI */}
                        {msg.actionItems && msg.actionItems.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-2">
                            <div className="text-xs font-bold text-white uppercase tracking-wider">
                              Recommended Actions:
                            </div>
                            <div className="space-y-1.5">
                              {msg.actionItems.map((act) => (
                                <div key={act} className="flex items-start gap-2 text-xs text-neutral-300">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF8A3D] mt-1.5 shrink-0" />
                                  <span>{act}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* View Roadmap button */}
                        {msg.suggestedRoadmap && (
                          <div className="mt-4 pt-3 border-t border-white/[0.08]">
                            <button
                              onClick={() => setShowRoadmapModal(true)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 border border-[#FF5E00]/40 hover:border-[#FF5E00] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                              <span>View Roadmap</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#FF5E00]" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-white shrink-0 mt-1">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-3 items-center text-xs text-neutral-400 pl-10">
                    <div className="w-2 h-2 rounded-full bg-[#FF5E00] animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-[#FF5E00] animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-[#FF5E00] animate-bounce [animation-delay:0.4s]" />
                    <span className="font-mono text-[11px] ml-1">Copilot reasoning...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3.5 bg-[#121212] border-t border-white/[0.08]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2 bg-[#0A0A0A] p-2 rounded-xl border border-white/[0.08] focus-within:border-[#FF5E00]/50"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask Copilot about any ranking issue or code patch..."
                    className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-lg bg-[#FF5E00] hover:bg-[#FF6E1A] text-white transition-colors cursor-pointer"
                    aria-label="Send query to Copilot"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Modal */}
      {showRoadmapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#0E0E0E] border border-white/[0.12] rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5E00]" />
                <h4 className="text-base font-bold text-white">Copilot 30-Day Fix Roadmap</h4>
              </div>
              <button
                onClick={() => setShowRoadmapModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#141414] border border-white/[0.06] flex items-start gap-3">
                <span className="font-mono font-bold text-[#FF8A3D] px-2 py-0.5 rounded bg-neutral-900 border border-white/[0.04]">
                  Phase 1
                </span>
                <div>
                  <div className="font-bold text-white">Critical Architecture (Days 1–5)</div>
                  <div className="text-neutral-400 mt-0.5">
                    Resolve duplicate title tags on 14 category hubs and flatten crawl depth. Estimated gain: +6 points.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141414] border border-white/[0.06] flex items-start gap-3">
                <span className="font-mono font-bold text-[#FF8A3D] px-2 py-0.5 rounded bg-neutral-900 border border-white/[0.04]">
                  Phase 2
                </span>
                <div>
                  <div className="font-bold text-white">Core Web Vitals Budget (Days 6–15)</div>
                  <div className="text-neutral-400 mt-0.5">
                    Compress mobile hero assets, inject priority preload tags, and purge unused CSS.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141414] border border-white/[0.06] flex items-start gap-3">
                <span className="font-mono font-bold text-[#FF8A3D] px-2 py-0.5 rounded bg-neutral-900 border border-white/[0.04]">
                  Phase 3
                </span>
                <div>
                  <div className="font-bold text-white">Schema & Entity Graph (Days 16–30)</div>
                  <div className="text-neutral-400 mt-0.5">
                    Deploy JSON-LD SoftwareApplication schema to unlock rich search badges and AI citation indices.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowRoadmapModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5E00] hover:bg-[#FF6D1A]"
              >
                Close Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
