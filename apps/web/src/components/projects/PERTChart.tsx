'use client';

import { AlertOctagon, Network, Zap } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  storyPoints: number;
  dependencies?: string[];
  position: number;
}

interface PERTChartProps {
  tasks: Task[];
}

export function PERTChart({ tasks = [] }: PERTChartProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
        <Network className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        No tasks available to render PERT dependency network.
      </div>
    );
  }

  const calculations = new Map<
    string,
    { es: number; ef: number; ls: number; lf: number; slack: number }
  >();

  const sorted = [...tasks].sort((a, b) => a.position - b.position);

  // Early Start / Early Finish (forward pass)
  sorted.forEach(task => {
    const deps = task.dependencies || [];
    const es =
      deps.length > 0
        ? Math.max(...deps.map(d => calculations.get(d)?.ef ?? 0))
        : 0;
    const ef = es + (task.storyPoints || 1);
    calculations.set(task.id, { es, ef, ls: 0, lf: 0, slack: 0 });
  });

  // Late Start / Late Finish (backward pass)
  const maxProjectEnd = Math.max(
    1,
    ...sorted.map(t => calculations.get(t.id)?.ef ?? 0)
  );

  [...sorted].reverse().forEach(task => {
    const dependents = tasks.filter(t => (t.dependencies || []).includes(task.id));
    const lf =
      dependents.length > 0
        ? Math.min(...dependents.map(d => calculations.get(d.id)?.ls ?? maxProjectEnd))
        : maxProjectEnd;
    const ls = lf - (task.storyPoints || 1);
    const calc = calculations.get(task.id)!;
    calc.ls = Math.max(0, ls);
    calc.lf = lf;
    calc.slack = Math.max(0, lf - calc.ef);
  });

  const criticalPath = tasks.filter(t => calculations.get(t.id)?.slack === 0);

  return (
    <div className="space-y-4">
      {/* Critical Path Callout Banner */}
      {criticalPath.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-rose-900">Critical Path Identified</h4>
            <p className="text-xs font-semibold text-rose-700">
              {criticalPath.map(t => t.title).join(' → ')}
            </p>
          </div>
        </div>
      )}

      {/* SVG Diagram Canvas */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <svg
          width={Math.max(700, tasks.length * 200 + 100)}
          height={320}
          className="mx-auto"
        >
          <defs>
            <marker
              id="arrowhead-normal"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
            </marker>
            <marker
              id="arrowhead-critical"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#e2445c" />
            </marker>
          </defs>

          {tasks.map((task, idx) => {
            const calc = calculations.get(task.id)!;
            const x = idx * 200 + 110;
            const y = 140;
            const isCritical = calc.slack === 0;

            return (
              <g key={task.id}>
                {/* Dependency Connectors */}
                {(task.dependencies || []).map(depId => {
                  const depIdx = tasks.findIndex(t => t.id === depId);
                  if (depIdx < 0) return null;
                  const startX = depIdx * 200 + 170;
                  const endX = x - 70;

                  return (
                    <path
                      key={`${depId}-${task.id}`}
                      d={`M ${startX} ${y} C ${startX + 40} ${y}, ${endX - 40} ${y}, ${endX} ${y}`}
                      fill="none"
                      stroke={isCritical ? '#e2445c' : '#94a3b8'}
                      strokeWidth={isCritical ? 3 : 2}
                      strokeDasharray={isCritical ? 'none' : '4 4'}
                      markerEnd={isCritical ? 'url(#arrowhead-critical)' : 'url(#arrowhead-normal)'}
                    />
                  );
                })}

                {/* Node Box Outer Container */}
                <rect
                  x={x - 70}
                  y={y - 45}
                  width={140}
                  height={90}
                  rx={10}
                  fill={isCritical ? '#fff1f2' : '#f8fafc'}
                  stroke={isCritical ? '#e2445c' : '#cbd5e1'}
                  strokeWidth={isCritical ? 2.5 : 1.5}
                  className={isCritical ? 'animate-critical-pulse' : ''}
                />

                {/* Top Header Row (ES & EF) */}
                <rect x={x - 70} y={y - 45} width={140} height={22} rx={8} fill={isCritical ? '#ffe4e6' : '#e2e8f0'} />
                <text x={x - 35} y={y - 30} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
                  ES: {calc.es}
                </text>
                <line x1={x} y1={y - 45} x2={x} y2={y - 23} stroke="#cbd5e1" strokeWidth="1" />
                <text x={x + 35} y={y - 30} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
                  EF: {calc.ef}
                </text>

                {/* Node Title */}
                <text
                  x={x}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#0f172a"
                >
                  {task.title.length > 14 ? task.title.substring(0, 14) + '…' : task.title}
                </text>

                {/* Bottom Row (LS & LF) */}
                <line x1={x - 70} y1={y + 12} x2={x + 70} y2={y + 12} stroke="#e2e8f0" strokeWidth="1" />
                <text x={x - 35} y={y + 27} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b">
                  LS: {calc.ls}
                </text>
                <line x1={x} y1={y + 12} x2={x} y2={y + 45} stroke="#e2e8f0" strokeWidth="1" />
                <text x={x + 35} y={y + 27} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b">
                  LF: {calc.lf}
                </text>

                {/* Slack Badge */}
                <text
                  x={x}
                  y={y + 41}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="extrabold"
                  fill={isCritical ? '#e2445c' : '#64748b'}
                >
                  Slack: {calc.slack}d
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center gap-6 text-xs font-semibold text-slate-600 pl-2">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-rose-100 border-2 border-rose-500 rounded-md" />
          <span>Critical Path Node (Slack = 0)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-slate-100 border-2 border-slate-300 rounded-md" />
          <span>Normal Task Node</span>
        </div>
      </div>
    </div>
  );
}
