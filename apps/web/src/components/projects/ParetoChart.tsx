'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { PieChart, Zap } from 'lucide-react';

interface ParetoDataItem {
  category: string;
  count: number;
}

interface ParetoChartProps {
  data: ParetoDataItem[];
}

export function ParetoChart({ data = [] }: ParetoChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
        <PieChart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        No data available for Pareto analysis.
      </div>
    );
  }

  // Sort descending by count
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, d) => sum + d.count, 0) || 1;

  let cumulative = 0;
  const chartData = sorted.map(item => {
    cumulative += item.count;
    return {
      category: item.category,
      count: item.count,
      cumulativePercent: Math.round((cumulative / total) * 100),
    };
  });

  const topCategory = chartData[0];
  const topPercent = topCategory ? topCategory.cumulativePercent : 0;

  return (
    <div className="space-y-4">
      {/* Pareto 80/20 Insight Card */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Pareto Principle (80/20 Rule) Insight</h4>
            <p className="text-xs text-slate-600 font-medium">
              Top driver <strong>{topCategory?.category}</strong> accounts for{' '}
              <strong className="text-amber-700">{topPercent}%</strong> of total task volume.
            </p>
          </div>
        </div>

        <div className="bg-white text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm shrink-0">
          80% Threshold Marker Enabled
        </div>
      </div>

      {/* Recharts ComposedChart (Bar + Line) */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-300">{label}</p>
                      <p className="text-[#0073ea] font-semibold">
                        Frequency: {payload[0]?.value} tasks
                      </p>
                      <p className="text-[#e2445c] font-semibold">
                        Cumulative: {payload[1]?.value}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 600 }}
              formatter={(value) => <span className="text-slate-700">{value}</span>}
            />

            <ReferenceLine
              yAxisId="right"
              y={80}
              label={{ value: '80% Cutoff', fill: '#fdab3d', fontSize: 10, fontWeight: 800, position: 'insideTopLeft' }}
              stroke="#fdab3d"
              strokeDasharray="4 4"
              strokeWidth={2}
            />

            <Bar
              yAxisId="left"
              dataKey="count"
              name="Task Frequency"
              fill="#0073ea"
              radius={[6, 6, 0, 0]}
              barSize={40}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulativePercent"
              name="Cumulative %"
              stroke="#e2445c"
              strokeWidth={3}
              dot={{ r: 4, fill: '#e2445c' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
