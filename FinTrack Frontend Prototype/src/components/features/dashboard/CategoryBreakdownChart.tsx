import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatMoney, formatPercent } from "@/lib/formatters";
import type { CategoryTotal } from "@/types";

export function CategoryBreakdownChart({ data }: { data: CategoryTotal[] }) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)] sm:items-center">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="label"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((item) => (
                <Cell key={item.categoryId} fill={`var(${item.colorToken})`} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name) => [formatMoney(value), String(name)]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--popover)",
                color: "var(--popover-foreground)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.categoryId} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: `var(${item.colorToken})` }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <span className="num shrink-0 font-semibold">{formatMoney(item.total)}</span>
            <span className="num w-10 shrink-0 text-right text-xs text-muted-foreground">
              {formatPercent(total > 0 ? item.total / total : 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
