'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Flame, TrendingDown, CheckCircle2, Zap } from 'lucide-react';

interface BurndownDataPoint {
  date: string;
  estimated: number;
  actual: number;
}

interface BurndownChartProps {
  data: BurndownDataPoint[];
  totalStoryPoints: number;
}

export function BurndownChart({ data = [], totalStoryPoints = 0 }: BurndownChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
        <Flame className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        No active sprint burndown data to display.
      </div>
    );
  }

  // Calculate ideal burndown trajectory curve points
  const pointsCount = data.length;
  const chartData = data.map((d, i) => {
    const ideal = Math.max(0, Math.round(totalStoryPoints - (i / (pointsCount - 1 || 1)) * totalStoryPoints));
    return {
      date: d.date,
      actual: d.actual,
      ideal: ideal,
    };
  });

  const latestActual = chartData[chartData.length - 1]?.actual ?? 0;
  const latestIdeal = chartData[chartData.length - 1]?.ideal ?? 0;
  const variance = latestActual - latestIdeal;

  return (
    <div className="space-y-4">
      {/* Top summary metric cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Scope</p>
            <p className="text-base font-extrabold text-slate-800">{totalStoryPoints} pts</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Remaining</p>
            <p className="text-base font-extrabold text-slate-800">{latestActual} pts</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Sprint Status</p>
            <p className={`text-xs font-bold ${variance <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {variance <= 0 ? 'Ahead of Schedule' : `${variance} pts behind`}
            </p>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00c875" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00c875" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="idealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-300">{label}</p>
                      <p className="text-[#00c875] font-semibold">
                        Actual Remaining: {payload[0]?.value} pts
                      </p>
                      <p className="text-slate-400 font-medium">
                        Ideal Guidance: {payload[1]?.value} pts
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

            <Area
              type="monotone"
              dataKey="actual"
              name="Actual Remaining"
              stroke="#00c875"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#actualGradient)"
              activeDot={{ r: 6, fill: '#00c875', stroke: '#ffffff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="ideal"
              name="Ideal Trajectory"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#idealGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
