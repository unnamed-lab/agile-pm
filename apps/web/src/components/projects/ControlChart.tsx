'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ControlDataPoint {
  sprint: string;
  actual: number;
  estimated: number;
  movingRange?: number;
}

interface ControlChartProps {
  data: ControlDataPoint[];
}

export function ControlChart({ data = [] }: ControlChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        No sprint data available for process control chart.
      </div>
    );
  }

  const points = data.map(d => d.actual);
  const mean = points.reduce((a, b) => a + b, 0) / (points.length || 1);

  // Moving ranges for 3-sigma control limits calculation
  const ranges: number[] = [];
  for (let i = 1; i < points.length; i++) {
    ranges.push(Math.abs(points[i] - points[i - 1]));
  }
  const avgRange = ranges.length > 0 ? ranges.reduce((a, b) => a + b, 0) / ranges.length : 1;

  const ucl = Math.round((mean + 2.66 * avgRange) * 10) / 10;
  const lcl = Math.max(0, Math.round((mean - 2.66 * avgRange) * 10) / 10);

  const outOfControlPoints = data.filter(d => d.actual > ucl || d.actual < lcl);
  const isStable = outOfControlPoints.length === 0;

  return (
    <div className="space-y-4">
      {/* Metrics & Stability Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
              isStable ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {isStable ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Process Stability Indicator</h4>
            <p className={`text-xs font-extrabold ${isStable ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isStable ? 'Process In Statistical Control' : `${outOfControlPoints.length} Sprint Anomalies Detected`}
            </p>
          </div>
        </div>

        {/* Statistical Control Bounds */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md border border-rose-200">
            UCL: {ucl}
          </span>
          <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md border border-sky-200">
            Mean: {mean.toFixed(1)}
          </span>
          <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md border border-rose-200">
            LCL: {lcl}
          </span>
        </div>
      </div>

      {/* Recharts LineChart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 25, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="sprint" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = Number(payload[0]?.value || 0);
                  const isAnomaly = val > ucl || val < lcl;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-300">{label}</p>
                      <p className="text-[#00c875] font-extrabold">
                        Velocity Completed: {val} tasks
                      </p>
                      {isAnomaly && (
                        <p className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Out of Control Limit
                        </p>
                      )}
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

            {/* Reference Limits */}
            <ReferenceLine
              y={ucl}
              label={{ value: 'UCL', fill: '#ef4444', fontSize: 10, fontWeight: 800, position: 'right' }}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={1.5}
            />
            <ReferenceLine
              y={mean}
              label={{ value: 'Mean', fill: '#0284c7', fontSize: 10, fontWeight: 800, position: 'right' }}
              stroke="#0284c7"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <ReferenceLine
              y={lcl}
              label={{ value: 'LCL', fill: '#ef4444', fontSize: 10, fontWeight: 800, position: 'right' }}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={1.5}
            />

            <Line
              type="monotone"
              dataKey="actual"
              name="Completed Velocity"
              stroke="#00c875"
              strokeWidth={3}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const isAnomaly = payload.actual > ucl || payload.actual < lcl;
                return (
                  <circle
                    key={props.index}
                    cx={cx}
                    cy={cy}
                    r={isAnomaly ? 6 : 4}
                    fill={isAnomaly ? '#ef4444' : '#00c875'}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
