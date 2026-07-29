'use client';

import { AlertTriangle, HelpCircle, RefreshCw } from 'lucide-react';

interface CauseCategory {
  category: string;
  causes: string[];
}

interface CauseEffectDiagramProps {
  data: CauseCategory[];
  problem: string;
}

const CATEGORY_COLORS = [
  '#0073ea', // Blue
  '#fdab3d', // Orange
  '#a25ddc', // Purple
  '#00c875', // Green
];

export function CauseEffectDiagram({ data = [], problem = 'Delayed Delivery' }: CauseEffectDiagramProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
        <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        No cause-and-effect data available.
      </div>
    );
  }

  const width = 900;
  const height = 440;
  const centerY = height / 2;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Ishikawa / Fishbone Diagram Analysis</h4>
            <p className="text-xs text-slate-500">Root-cause breakdown across key operational categories</p>
          </div>
        </div>

        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-md">
          {data.length} Categories Analyzed
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          <defs>
            <marker id="fishbone-arrow" markerWidth="12" markerHeight="12" refX="10" refY="4" orient="auto">
              <polygon points="0 0, 10 4, 0 8" fill="#1e293b" />
            </marker>
          </defs>

          {/* Main Central Spine */}
          <line
            x1={80}
            y1={centerY}
            x2={width - 150}
            y2={centerY}
            stroke="#1e293b"
            strokeWidth="4"
            markerEnd="url(#fishbone-arrow)"
          />

          {/* Problem Outcome Node Box (Right End) */}
          <g transform={`translate(${width - 145}, ${centerY - 35})`}>
            <rect width={130} height={70} rx={12} fill="#e2445c" className="shadow-lg" />
            <text x={65} y={30} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
              PROBLEM EFFECT
            </text>
            <text x={65} y={50} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="extrabold">
              {problem.length > 15 ? problem.substring(0, 15) + '…' : problem}
            </text>
          </g>

          {/* Category Ribs */}
          {data.map((cat, idx) => {
            const isTop = idx % 2 === 0;
            const xSpine = 150 + idx * 165;
            const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

            const ribEndY = isTop ? centerY - 140 : centerY + 140;

            return (
              <g key={cat.category}>
                {/* Angled Rib Line */}
                <line
                  x1={xSpine}
                  y1={centerY}
                  x2={xSpine - 40}
                  y2={ribEndY}
                  stroke={color}
                  strokeWidth="3"
                />

                {/* Category Badge Header */}
                <g transform={`translate(${xSpine - 95}, ${isTop ? ribEndY - 35 : ribEndY + 5})`}>
                  <rect width={110} height={30} rx={8} fill={color} />
                  <text x={55} y={19} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="extrabold">
                    {cat.category}
                  </text>
                </g>

                {/* Causes listing pills along the rib line */}
                {cat.causes.map((cause, cIdx) => {
                  const factor = (cIdx + 1) / (cat.causes.length + 1);
                  const causeX = xSpine - 40 * factor;
                  const causeY = isTop ? centerY - 140 * factor : centerY + 140 * factor;

                  return (
                    <g key={cIdx} transform={`translate(${causeX - 55}, ${causeY - 10})`}>
                      <rect width={110} height={20} rx={5} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                      <text x={55} y={14} textAnchor="middle" fill="#334155" fontSize="10" fontWeight="bold">
                        • {cause}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
