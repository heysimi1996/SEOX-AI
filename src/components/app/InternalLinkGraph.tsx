import React, { useState, useMemo } from 'react';
import { Search, ZoomIn, ZoomOut, Filter, GitBranch, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface GraphNode {
  id: string;
  url: string;
  title: string;
  depth: number;
  inDegree: number;
  outDegree: number;
  score: number;
  isOrphan: boolean;
  isHub: boolean;
  isWeak: boolean;
}

interface GraphEdge {
  source: string;
  target: string;
  anchor: string;
}

export const InternalLinkGraph: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'orphan' | 'hub' | 'weak'>('all');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Demo site tree hierarchy: Homepage -> Categories -> Articles -> Supporting
  const demoNodes: GraphNode[] = useMemo(
    () => [
      { id: 'n-1', url: 'https://example.com/', title: 'Homepage', depth: 0, inDegree: 24, outDegree: 14, score: 96, isOrphan: false, isHub: true, isWeak: false },
      { id: 'n-2', url: 'https://example.com/features', title: 'Product Features Hub', depth: 1, inDegree: 12, outDegree: 8, score: 91, isOrphan: false, isHub: true, isWeak: false },
      { id: 'n-3', url: 'https://example.com/pricing', title: 'Pricing & Plans', depth: 1, inDegree: 10, outDegree: 4, score: 88, isOrphan: false, isHub: false, isWeak: false },
      { id: 'n-4', url: 'https://example.com/blog', title: 'Blog & Insights Hub', depth: 1, inDegree: 18, outDegree: 12, score: 94, isOrphan: false, isHub: true, isWeak: false },
      { id: 'n-5', url: 'https://example.com/blog/technical-seo-guide', title: 'Deep Technical SEO Guide', depth: 2, inDegree: 7, outDegree: 5, score: 89, isOrphan: false, isHub: false, isWeak: false },
      { id: 'n-6', url: 'https://example.com/blog/core-web-vitals-benchmarks', title: 'Core Web Vitals Benchmarks', depth: 2, inDegree: 5, outDegree: 3, score: 84, isOrphan: false, isHub: false, isWeak: false },
      { id: 'n-7', url: 'https://example.com/blog/schema-markup-patterns', title: 'Schema JSON-LD Patterns', depth: 2, inDegree: 4, outDegree: 2, score: 82, isOrphan: false, isHub: false, isWeak: false },
      { id: 'n-8', url: 'https://example.com/blog/case-study-fintech-migration', title: 'Fintech Case Study Migration', depth: 3, inDegree: 2, outDegree: 2, score: 76, isOrphan: false, isHub: false, isWeak: true },
      { id: 'n-9', url: 'https://example.com/legacy-archive/page-2022', title: 'Legacy Archived Campaign URL', depth: 4, inDegree: 0, outDegree: 1, score: 58, isOrphan: true, isHub: false, isWeak: true },
    ],
    []
  );

  const demoEdges: GraphEdge[] = useMemo(
    () => [
      { source: 'n-1', target: 'n-2', anchor: 'Features' },
      { source: 'n-1', target: 'n-3', anchor: 'Pricing' },
      { source: 'n-1', target: 'n-4', anchor: 'Blog' },
      { source: 'n-4', target: 'n-5', anchor: 'SEO Guide' },
      { source: 'n-4', target: 'n-6', anchor: 'Web Vitals' },
      { source: 'n-4', target: 'n-7', anchor: 'Schema Patterns' },
      { source: 'n-5', target: 'n-8', anchor: 'Case Study' },
    ],
    []
  );

  const filteredNodes = demoNodes.filter((n) => {
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.url.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType === 'orphan') return n.isOrphan;
    if (filterType === 'hub') return n.isHub;
    if (filterType === 'weak') return n.isWeak;
    return true;
  });

  // Calculate coordinates by depth tier
  const tierPositions: Record<number, { x: number; y: number }[]> = {
    0: [{ x: 400, y: 50 }],
    1: [{ x: 180, y: 150 }, { x: 400, y: 150 }, { x: 620, y: 150 }],
    2: [{ x: 480, y: 260 }, { x: 620, y: 260 }, { x: 740, y: 260 }],
    3: [{ x: 620, y: 360 }],
    4: [{ x: 150, y: 360 }], // Orphan disconnected
  };

  const nodeCoords = useMemo(() => {
    const coords: Record<string, { x: number; y: number }> = {};
    const depthCounts: Record<number, number> = {};

    demoNodes.forEach((node) => {
      const idx = depthCounts[node.depth] || 0;
      depthCounts[node.depth] = idx + 1;
      const positions = tierPositions[node.depth];
      if (positions && positions[idx]) {
        coords[node.id] = positions[idx];
      } else {
        coords[node.id] = { x: 200 + idx * 140, y: 80 + node.depth * 90 };
      }
    });

    return coords;
  }, [demoNodes]);

  return (
    <div className="rounded-3xl bg-[#0D0D0D] border border-white/[0.08] p-6 space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#FF5E00]" />
            <span>Site Graph & Link Equity Hierarchy</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Visualize click-depth, anchor flow, hub distribution, and orphaned page nodes.
          </p>
        </div>

        {/* Filter buttons & Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/[0.06] text-xs">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pages..."
              className="bg-transparent text-white focus:outline-none w-28 text-xs"
            />
          </div>

          {/* Filter Types */}
          <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-white/[0.06] text-xs">
            {(['all', 'hub', 'orphan', 'weak'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                  filterType === t ? 'bg-[#FF5E00] text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
              className="p-1 text-neutral-400 hover:text-white"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-neutral-400 px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
              className="p-1 text-neutral-400 hover:text-white"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative w-full h-[420px] rounded-2xl bg-[#080808] border border-white/[0.06] overflow-hidden flex items-center justify-center">
        {/* Tier hierarchy guidelines */}
        <div className="absolute top-2 left-3 text-[10px] font-mono text-neutral-600 flex flex-col gap-20 pointer-events-none select-none">
          <span>TIER 0 · ROOT / HOME</span>
          <span>TIER 1 · PRIMARY HUBS</span>
          <span>TIER 2 · TOPIC CLUSTERS</span>
          <span>TIER 3+ · SUPPORTING / DEEP</span>
        </div>

        <svg
          className="w-full h-full cursor-grab active:cursor-grabbing"
          viewBox="0 0 900 440"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="16" refY="3.5" orient="auto">
              <polygon points="0 0, 7 3.5, 0 7" fill="#FF5E00" opacity="0.6" />
            </marker>
          </defs>

          {/* Render edges */}
          {demoEdges.map((edge) => {
            const src = nodeCoords[edge.source];
            const tgt = nodeCoords[edge.target];
            if (!src || !tgt) return null;

            return (
              <g key={`${edge.source}-${edge.target}`}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="#FF5E00"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}

          {/* Render nodes */}
          {demoNodes.map((node) => {
            const coord = nodeCoords[node.id];
            if (!coord) return null;
            const isSelected = selectedNode?.id === node.id;
            const isDimmed = searchQuery && !filteredNodes.some((f) => f.id === node.id);

            return (
              <g
                key={node.id}
                transform={`translate(${coord.x}, ${coord.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
                opacity={isDimmed ? 0.2 : 1}
              >
                {/* Outer Glow on hover/select */}
                <circle
                  r={node.isHub ? 24 : 18}
                  fill={node.isOrphan ? '#EF4444' : node.isHub ? '#FF5E00' : '#3B82F6'}
                  fillOpacity={isSelected ? 0.35 : 0.15}
                  stroke={node.isOrphan ? '#EF4444' : node.isHub ? '#FF5E00' : '#475569'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* Inner Core */}
                <circle
                  r={node.isHub ? 10 : 7}
                  fill={node.isOrphan ? '#EF4444' : node.isHub ? '#FF5E00' : '#94A3B8'}
                />

                {/* Label */}
                <text
                  y={node.isHub ? 34 : 28}
                  textAnchor="middle"
                  fill="#E2E8F0"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {node.title.slice(0, 16)}...
                </text>
                <text
                  y={node.isHub ? 45 : 39}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="sans-serif"
                >
                  {node.inDegree} in · {node.outDegree} out
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details HUD */}
        {selectedNode && (
          <div className="absolute bottom-3 right-3 max-w-sm rounded-2xl bg-[#141414]/95 backdrop-blur-md border border-white/[0.1] p-4 shadow-xl text-xs space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{selectedNode.title}</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-[11px] font-mono text-neutral-400 break-all">{selectedNode.url}</div>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/[0.06]">
              <div>
                <span className="text-neutral-500">Depth: </span>
                <span className="font-bold text-white">{selectedNode.depth} clicks</span>
              </div>
              <div>
                <span className="text-neutral-500">Incoming: </span>
                <span className="font-bold text-emerald-400">{selectedNode.inDegree}</span>
              </div>
              <div>
                <span className="text-neutral-500">Outgoing: </span>
                <span className="font-bold text-[#FF8A3D]">{selectedNode.outDegree}</span>
              </div>
            </div>
            {selectedNode.isOrphan && (
              <div className="text-red-400 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Orphan Page: 0 incoming links found from site hierarchy.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
