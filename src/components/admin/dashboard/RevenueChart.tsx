"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ErrorState, Panel, Spinner } from "@/components/admin/ui";
import { peso, useApi } from "@/lib/admin/api";
import type { RevenuePoint } from "@/types/admin";

const RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "12m", label: "Last 12 months" },
] as const;

function ChartTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as RevenuePoint;
  return (
    <div className="rounded-md border border-adm-border bg-adm-card2 px-3 py-2 text-xs shadow-xl">
      <p className="text-adm-muted">{p.label}</p>
      <p className="mt-0.5 text-sm font-semibold text-adm-text">{peso(p.revenue)}</p>
    </div>
  );
}

/** Revenue from confirmed and completed events (Events → contract amount). */
export function RevenueChart() {
  const [range, setRange] = useState<(typeof RANGES)[number]["value"]>("7d");
  const { data, meta, error, loading, reload } = useApi<RevenuePoint[]>(`/api/admin/revenue?range=${range}`);

  return (
    <Panel
      title="Revenue Overview"
      action={
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as typeof range)}
          aria-label="Time range"
          className="h-8 rounded-md border border-adm-border bg-adm-card2 px-2 text-xs text-adm-text outline-none focus:border-adm-red"
        >
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      }
      bodyClassName="p-4"
    >
      <p className="text-xs text-adm-muted">
        Total for the period: <span className="font-semibold text-adm-text">{peso(Number(meta.total ?? 0))}</span>
      </p>
      <div className="mt-3 h-[260px] w-full">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data ? (
          <div className="grid h-full place-items-center">{loading && <Spinner />}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart key={range} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f20d1b" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f20d1b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1d2c35" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: "#a4b2bf", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#1d2c35" }} interval="preserveStartEnd" minTickGap={16} />
              <YAxis
                tick={{ fill: "#a4b2bf", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v: number) => (v >= 1000 ? `₱${Math.round(v / 1000)}k` : `₱${v}`)}
              />
              <Tooltip content={ChartTooltip} cursor={{ stroke: "#f20d1b", strokeOpacity: 0.4 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f20d1b"
                strokeWidth={2.5}
                fill="url(#revFill)"
                dot={{ r: 3, fill: "#f20d1b", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#f20d1b", stroke: "#050b0f", strokeWidth: 2 }}
                isAnimationActive
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
}
