import { motion } from "framer-motion";

const COLOR_MAP = {
  iris: { bg: "bg-iris-500", glow: "shadow-glow", soft: "bg-iris-100 text-iris-700" },
  tangerine: { bg: "bg-tangerine-500", glow: "shadow-glow-tangerine", soft: "bg-tangerine-100 text-tangerine-700" },
  meadow: { bg: "bg-meadow-500", glow: "shadow-glow-meadow", soft: "bg-meadow-100 text-meadow-700" },
  blossom: { bg: "bg-blossom-500", glow: "shadow-glow-blossom", soft: "bg-blossom-100 text-blossom-700" },
  sky: { bg: "bg-sky-500", glow: "shadow-glow", soft: "bg-sky-100 text-sky-700" },
};

export default function StatCard({ icon: Icon, label, value, color = "iris", sub }) {
  const c = COLOR_MAP[color] || COLOR_MAP.iris;
  return (
    <motion.div
      className="glass-card flex items-center gap-4 p-5"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.bg} ${c.glow}`}>
        <Icon size={22} className="text-white" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
        <p className="font-display text-2xl font-bold text-ink">{value}</p>
        {sub && <p className="text-xs text-ink/50">{sub}</p>}
      </div>
    </motion.div>
  );
}
