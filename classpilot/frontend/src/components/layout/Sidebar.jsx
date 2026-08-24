import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Layers,
  CalendarCheck,
  Wallet,
  Bell,
  FileBarChart,
  CalendarDays,
  Settings as SettingsIcon,
  X,
  GraduationCap,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/students", label: "Students", icon: Users },
  { to: "/batches", label: "Batches", icon: Layers },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/fees", label: "Fees", icon: Wallet },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ mobileOpen, onClose, instituteName }) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar-gradient px-5 py-6 transition-transform duration-300 lg:static lg:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
              <GraduationCap size={22} className="text-white" strokeWidth={2.2} />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-white">ClassPilot</p>
              <p className="truncate max-w-[9rem] text-[11px] font-medium text-white/50">
                {instituteName || "Tuition Manager"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-white/70 hover:bg-white/10 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
            >
              <Icon size={18} strokeWidth={2.1} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-xs text-white/70">
          <p className="font-semibold text-white">Need a hand?</p>
          <p className="mt-1 leading-relaxed">Every screen keeps things simple — add a student, mark a class, chase a fee.</p>
        </div>
      </aside>
    </>
  );
}
