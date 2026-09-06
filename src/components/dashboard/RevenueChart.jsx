import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatCurrency } from "../../utils/formatters";

export default function RevenueChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1F6F6B" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#1F6F6B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E9E5F5" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#98A1A8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#98A1A8" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          contentStyle={{ borderRadius: 14, border: "1px solid #E9E5F5", fontSize: 13 }}
        />
        <Area type="monotone" dataKey="amount" stroke="#1F6F6B" strokeWidth={2.5} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
