'use client';

interface BurndownDataPoint {
  date: string;
  estimated: number;
  actual: number;
}

interface BurndownChartProps {
  data: BurndownDataPoint[];
  totalStoryPoints: number;
}

export function BurndownChart({ data, totalStoryPoints }: BurndownChartProps) {
  if (data.length === 0) return <p className="text-gray-500">No data available</p>;

  const width = 800;
  const height = 300;
  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxPoints = totalStoryPoints;
  const maxDays = data.length;

  const getX = (index: number) => padding + (index / (maxDays - 1)) * chartWidth;
  const getY = (points: number) => padding + (points / maxPoints) * chartHeight;

  return (
    <div className="bg-white p-4 rounded-lg">
      <h4 className="font-semibold mb-4">Sprint Burndown Chart</h4>
      <svg width={width} height={height} className="border rounded">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line
            key={ratio}
            x1={padding}
            y1={getY(maxPoints * (1 - ratio))}
            x2={width - padding}
            y2={getY(maxPoints * (1 - ratio))}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}

        {/* Ideal line */}
        <line
          x1={getX(0)}
          y1={getY(maxPoints)}
          x2={getX(maxDays - 1)}
          y2={getY(0)}
          stroke="#94A3B8"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Actual line */}
        <polyline
          points={data.map((d, i) => `${getX(i)},${getY(d.actual)}`).join(' ')}
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(d.actual)}
            r="4"
            fill="#EF4444"
          />
        ))}

        {/* Labels */}
        <text x={padding} y={height - 20} fontSize="12" fill="#6B7280">
          {data[0]?.date}
        </text>
        <text x={width - padding - 50} y={height - 20} fontSize="12" fill="#6B7280">
          {data[data.length - 1]?.date}
        </text>
        <text x="10" y={padding + 20} fontSize="12" fill="#6B7280" transform={`rotate(-90 10 ${padding + 20})`}>
          Story Points
        </text>

        {/* Legend */}
        <rect x={width - 200} y={padding} width={12} height={12} fill="#94A3B8" />
        <text x={width - 180} y={padding + 10} fontSize="10" fill="#6B7280">Ideal</text>
        <rect x={width - 200} y={padding + 20} width={12} height={12} fill="#EF4444" />
        <text x={width - 180} y={padding + 30} fontSize="10" fill="#6B7280">Actual</text>
      </svg>
    </div>
  );
}
