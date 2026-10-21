import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompactMoney, formatMoney } from "@/lib/formatters";
import type { MonthlyFlow } from "@/types";

export function MonthlyFlowChart({ data }: { data: MonthlyFlow[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="flow-income" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="flow-expenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
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
            formatter={(value: number, name) => [
              formatMoney(value),
              name === "income" ? "Receitas" : "Despesas",
            ]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="var(--chart-2)"
            strokeWidth={2}
            fill="url(#flow-income)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#flow-expenses)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
