'use client';

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

export function PERTChart({ tasks }: PERTChartProps) {
  if (tasks.length === 0) return <p className="text-gray-500">No tasks to display</p>;

  // Build dependency graph
  const taskMap = new Map(tasks.map(t => [t.id, t]));

  // Calculate early start, early finish, late start, late finish
  const calculations = new Map<string, {
    es: number; ef: number; ls: number; lf: number; slack: number;
  }>();

  // Topological sort for early calculations
  const sorted = [...tasks].sort((a, b) => a.position - b.position);

  // Early Start / Early Finish (forward pass)
  sorted.forEach(task => {
    const deps = task.dependencies || [];
    const es = deps.length > 0
      ? Math.max(...deps.map(d => calculations.get(d)?.ef ?? 0))
      : 0;
    const ef = es + task.storyPoints;
    calculations.set(task.id, { es, ef, ls: 0, lf: 0, slack: 0 });
  });

  // Late Start / Late Finish (backward pass)
  const projectEnd = Math.max(...sorted.map(t => calculations.get(t.id)!.ef));
  sorted.reverse().forEach(task => {
    const dependents = tasks.filter(t => (t.dependencies || []).includes(task.id));
    const lf = dependents.length > 0
      ? Math.min(...dependents.map(d => calculations.get(d.id)!.ls))
      : projectEnd;
    const ls = lf - task.storyPoints;
    const calc = calculations.get(task.id)!;
    calc.ls = ls;
    calc.lf = lf;
    calc.slack = lf - calc.ef;
  });

  // Find critical path (slack = 0)
  const criticalPath = tasks.filter(t => calculations.get(t.id)!.slack === 0);

  return (
    <div className="space-y-6">
      {/* Critical Path Warning */}
      {criticalPath.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm font-semibold text-red-800">Critical Path Identified</p>
          <p className="text-xs text-red-600">
            {criticalPath.map(t => t.title).join(' → ')}
          </p>
        </div>
      )}

      {/* Task Nodes */}
      <div className="overflow-x-auto">
        <svg width={Math.max(600, tasks.length * 180 + 100)} height={300} className="border rounded bg-white">
          {tasks.map((task, idx) => {
            const calc = calculations.get(task.id)!;
            const x = idx * 180 + 90;
            const y = 120;
            const isCritical = calc.slack === 0;

            return (
              <g key={task.id}>
                {/* Dependencies */}
                {(task.dependencies || []).map(depId => {
                  const depIdx = tasks.findIndex(t => t.id === depId);
                  if (depIdx < 0) return null;
                  return (
                    <line
                      key={`${depId}-${task.id}`}
                      x1={depIdx * 180 + 90}
                      y1={140}
                      x2={x}
                      y2={y - 30}
                      stroke="#94A3B8"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}

                {/* Node */}
                <rect
                  x={x - 60}
                  y={y - 30}
                  width={120}
                  height={60}
                  rx={8}
                  fill={isCritical ? '#FEE2E2' : '#EFF6FF'}
                  stroke={isCritical ? '#EF4444' : '#3B82F6'}
                  strokeWidth={2}
                />

                {/* Task title */}
                <text x={x} y={y - 8} textAnchor="middle" className="text-xs font-semibold">
                  {task.title.length > 12 ? task.title.substring(0, 12) + '...' : task.title}
                </text>

                {/* ES/EF */}
                <text x={x} y={y + 8} textAnchor="middle" className="text-xs">
                  ES:{calc.es} EF:{calc.ef}
                </text>

                {/* Slack */}
                <text x={x} y={y + 24} textAnchor="middle" className={`text-xs ${isCritical ? 'fill-red-600 font-bold' : 'fill-gray-500'}`}>
                  Slack: {calc.slack}
                </text>
              </g>
            );
          })}

          {/* Arrowhead marker */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#94A3B8" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
          <span>Critical Path (Slack = 0)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-50 border-2 border-blue-500 rounded"></div>
          <span>Normal Task</span>
        </div>
      </div>
    </div>
  );
}
