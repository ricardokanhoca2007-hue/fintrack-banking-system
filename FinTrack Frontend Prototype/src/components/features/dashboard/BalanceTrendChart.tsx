import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompactMoney, formatMoney } from "@/lib/formatters";
import type { BalancePoint } from "@/types";

interface BalanceTrendChartProps {
  data: BalancePoint[];
  /** Straight-line projection appended as the next point. */
  projected?: number;
}

/** Balance evolution plus the projected month-end value. */
export function BalanceTrendChart({ data, projected }: BalanceTrendChartProps) {
  const series =
    projected === undefined ? data : [...data, { label: "Previsão", balance: projected }];
  const last = data.at(-1)?.balance ?? 0;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="balance-trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatCompactMoney(value)}
          />
          <Tooltip
            formatter={(value: number) => [formatMoney(value), "Saldo"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              fontSize: 12,
            }}
          />
          <ReferenceLine y={last} stroke="var(--border)" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#balance-trend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
