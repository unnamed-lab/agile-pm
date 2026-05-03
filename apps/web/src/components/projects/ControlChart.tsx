'use client';

interface ControlDataPoint {
  sprint: string;
  actual: number;
  estimated: number;
  movingRange?: number;
}

interface ControlChartProps {
  data: ControlDataPoint[];
}

export function ControlChart({ data }: ControlChartProps) {
  if (data.length === 0) return <p className="text-gray-500">No data available</p>;

  const points = data.map(d => d.actual);
  const mean = points.reduce((a, b) => a + b, 0) / points.length;

  // Calculate moving ranges
  const ranges = [];
  for (let i = 1; i < points.length; i++) {
    ranges.push(Math.abs(points[i] - points[i - 1]));
  }
  const avgRange = ranges.length > 0 ? ranges.reduce((a, b) => a + b, 0) / ranges.length : 0;

  // Control limits (approximate using Western Electric rules)
  const ucl = mean + 2.66 * avgRange; // Upper Control Limit
  const lcl = Math.max(0, mean - 2.66 * avgRange); // Lower Control Limit

  const width = 800;
  const height = 300;
  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxVal = Math.max(ucl, ...points) * 1.1;
  const minVal = Math.min(lcl, ...points) * 0.9;

  const getX = (i: number) => padding + (i / (data.length - 1)) * chartWidth;
  const getY = (val: number) => padding + ((maxVal - val) / (maxVal - minVal)) * chartHeight;

  return (
    <div className="bg-white p-4 rounded-lg">
      <h4 className="font-semibold mb-4">Control Chart (Process Stability)</h4>
      <p className="text-xs text-gray-600 mb-2">
        Mean: {mean.toFixed(1)} | UCL: {ucl.toFixed(1)} | LCL: {lcl.toFixed(1)}
      </p>
      <svg width={width} height={height} className="border rounded">
        {/* UCL line */}
        <line x1={padding} y1={getY(ucl)} x2={width - padding} y2={getY(ucl)} stroke="#EF4444" strokeWidth="1" strokeDasharray="5,5" />
        <text x={width - padding + 5} y={getY(ucl) + 5} fontSize="10" fill="#EF4444">UCL</text>

        {/* Mean line */}
        <line x1={padding} y1={getY(mean)} x2={width - padding} y2={getY(mean)} stroke="#3B82F6" strokeWidth="1" strokeDasharray="5,5" />
        <text x={width - padding + 5} y={getY(mean) + 5} fontSize="10" fill="#3B82F6">Mean</text>

        {/* LCL line */}
        <line x1={padding} y1={getY(lcl)} x2={width - padding} y2={getY(lcl)} stroke="#EF4444" strokeWidth="1" strokeDasharray="5,5" />
        <text x={width - padding + 5} y={getY(lcl) + 5} fontSize="10" fill="#EF4444">LCL</text>

        {/* Actual line */}
        <polyline
          points={data.map((d, i) => `${getX(i)},${getY(d.actual)}`).join(' ')}
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const isOutOfControl = d.actual > ucl || d.actual < lcl;
          return (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.actual)}
              r="4"
              fill={isOutOfControl ? '#EF4444' : '#10B981'}
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={height - padding + 20} fontSize="10" fill="#6B7280" textAnchor="middle">
            {d.sprint.length > 8 ? d.sprint.substring(0, 8) : d.sprint}
          </text>
        ))}
      </svg>
    </div>
  );
}
