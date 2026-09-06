import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function BatchDistributionChart({ data = [] }) {
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          innerRadius={55}
          outerRadius={82}
          paddingAngle={3}
          cornerRadius={6}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color || "#1F6F6B"} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E9E5F5", fontSize: 13 }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "#57626B" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
