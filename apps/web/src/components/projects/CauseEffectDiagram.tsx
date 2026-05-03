'use client';

interface CauseCategory {
  category: string;
  causes: string[];
}

interface CauseEffectDiagramProps {
  data: CauseCategory[];
  problem: string;
}

export function CauseEffectDiagram({ data, problem }: CauseEffectDiagramProps) {
  if (data.length === 0) return <p className="text-gray-500">No data available</p>;

  const width = 900;
  const height = 500;
  const centerY = height / 2;

  return (
    <div className="bg-white p-4 rounded-lg overflow-x-auto">
      <h4 className="font-semibold mb-4">Cause-Effect Diagram (Ishikawa/Fishbone)</h4>
      <svg width={width} height={height}>
        {/* Main spine (horizontal line) */}
        <line x1={100} y1={centerY} x2={width - 100} y2={centerY} stroke="#374151" strokeWidth="3" />

        {/* Problem box (right side) */}
        <rect x={width - 140} y={centerY - 30} width={80} height={60} fill="#EF4444" rx={8} />
        <text x={width - 100} y={centerY + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
          {problem.length > 10 ? problem.substring(0, 10) + '...' : problem}
        </text>

        {/* Categories (diagonal ribs) */}
        {data.map((cat, idx) => {
          const x = 150 + (idx * (width - 300)) / data.length + 50;
          const isTop = idx % 2 === 0;
          const ribY = isTop ? centerY - 20 : centerY + 20;

          return (
            <g key={cat.category}>
              {/* Rib line */}
              <line x1={x} y1={centerY} x2={x} y2={ribY - 40} stroke="#6B7280" strokeWidth="2" />

              {/* Category label */}
              <rect x={x - 40} y={ribY - 60} width={80} height={25} fill="#3B82F6" rx={4} />
              <text x={x} y={ribY - 43} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                {cat.category}
              </text>

              {/* Causes */}
              {cat.causes.map((cause, cIdx) => (
                <text key={cIdx} x={x} y={ribY - 70 - (cIdx + 1) * 15} textAnchor="middle" fontSize="9" fill="#374151">
                  • {cause}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
