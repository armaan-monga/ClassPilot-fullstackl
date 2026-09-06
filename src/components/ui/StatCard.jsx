import { motion } from "framer-motion";

const COLOR_MAP = {
  petrol: { bg: "bg-petrol-500", soft: "bg-petrol-100 text-petrol-700" },
  ochre: { bg: "bg-ochre-500", soft: "bg-ochre-100 text-ochre-700" },
  meadow: { bg: "bg-meadow-500", soft: "bg-meadow-100 text-meadow-700" },
  oxblood: { bg: "bg-oxblood-500", soft: "bg-oxblood-100 text-oxblood-700" },
  slate: { bg: "bg-slate-500", soft: "bg-slate-100 text-slate-700" },
};

export default function StatCard({ icon: Icon, label, value, color = "petrol", sub }) {
  const c = COLOR_MAP[color] || COLOR_MAP.petrol;
  return (
    <motion.div
      className="glass-card flex items-center gap-4 p-5"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.bg}`}>
        <Icon size={22} className="text-white" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-ink/45">{label}</p>
        <p className="font-display text-2xl font-bold text-ink">{value}</p>
        {sub && <p className="text-xs text-ink/50">{sub}</p>}
      </div>
    </motion.div>
  );
}
