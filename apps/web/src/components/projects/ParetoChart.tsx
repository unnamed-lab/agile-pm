'use client';

interface ParetoDataItem {
  category: string;
  count: number;
}

interface ParetoChartProps {
  data: ParetoDataItem[];
}

export function ParetoChart({ data }: ParetoChartProps) {
  if (data.length === 0) return <p className="text-gray-500">No data available</p>;

  // Sort by count descending
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, d) => sum + d.count, 0);

  let cumulative = 0;
  const withCumulative = sorted.map(item => {
    cumulative += item.count;
    return {
      ...item,
      cumulative,
      cumulativePercent: (cumulative / total) * 100,
    };
  });

  const width = 800;
  const height = 300;
  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxCount = Math.max(...sorted.map(d => d.count));

  return (
    <div className="bg-white p-4 rounded-lg">
      <h4 className="font-semibold mb-4">Pareto Chart (80/20 Rule)</h4>
      <svg width={width} height={height} className="border rounded">
        {/* Bars */}
        {withCumulative.map((item, i) => (
          <rect
            key={i}
            x={padding + (i / sorted.length) * chartWidth + 5}
            y={padding + chartHeight - (item.count / maxCount) * chartHeight}
            width={chartWidth / sorted.length - 10}
            height={(item.count / maxCount) * chartHeight}
            fill="#3B82F6"
            opacity={0.8}
          />
        ))}

        {/* Cumulative line */}
        <polyline
          points={withCumulative.map((item, i) => {
            const x = padding + (i / (sorted.length - 1)) * chartWidth;
            const y = padding + chartHeight - (item.cumulativePercent / 100) * chartHeight;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
        />

        {/* 80% line */}
        <line
          x1={padding}
          y1={padding + chartHeight - (80 / 100) * chartHeight}
          x2={width - padding}
          y2={padding + chartHeight - (80 / 100) * chartHeight}
          stroke="#F59E0B"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Labels */}
        {withCumulative.map((item, i) => (
          <text
            key={i}
            x={padding + (i / sorted.length) * chartWidth + (chartWidth / sorted.length) / 2}
            y={height - padding + 20}
            fontSize="10"
            fill="#6B7280"
            textAnchor="middle"
          >
            {item.category.length > 10 ? item.category.substring(0, 10) + '...' : item.category}
          </text>
        ))}

        {/* Legend */}
        <rect x={width - 180} y={padding} width={12} height={12} fill="#3B82F6" opacity={0.8} />
        <text x={width - 160} y={padding + 10} fontSize="10" fill="#6B7280">Frequency</text>
        <rect x={width - 180} y={padding + 20} width={12} height={12} fill="#EF4444" />
        <text x={width - 160} y={padding + 30} fontSize="10" fill="#6B7280">Cumulative %</text>
        <line x1={width - 180} y1={padding + 40} x2={width - 168} y2={padding + 40} stroke="#F59E0B" strokeDasharray="3,3" />
        <text x={width - 160} y={padding + 43} fontSize="10" fill="#6B7280">80% line</text>
      </svg>
    </div>
  );
}
