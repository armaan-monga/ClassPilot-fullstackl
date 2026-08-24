import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Layers, IndianRupee, AlertCircle, TrendingUp, CalendarCheck2,
  UserPlus, Layers as LayersIcon, ClipboardList, Bell,
} from "lucide-react";
import { getDashboardStats } from "../api/dashboard";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import RevenueChart from "../components/dashboard/RevenueChart";
import BatchDistributionChart from "../components/dashboard/BatchDistributionChart";
import BirthdayList from "../components/dashboard/BirthdayList";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import TodaysClasses from "../components/dashboard/TodaysClasses";
import { formatCurrency } from "../utils/formatters";

const QUICK_ACTIONS = [
  { to: "/students", label: "Add Student", icon: UserPlus, color: "bg-iris-500 shadow-glow" },
  { to: "/batches", label: "Add Batch", icon: LayersIcon, color: "bg-sky-500 shadow-glow" },
  { to: "/attendance", label: "Mark Attendance", icon: ClipboardList, color: "bg-meadow-500 shadow-glow-meadow" },
  { to: "/notifications", label: "Send Reminders", icon: Bell, color: "bg-tangerine-500 shadow-glow-tangerine" },
];

export default function Dashboard() {
  const { teacher } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) return <Loader label="Loading your dashboard..." />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {greeting}, {teacher?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-ink/50">Here's what's happening at {teacher?.instituteName} today.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map(({ to, label, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="glass-card flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-1"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${color}`}>
              <Icon size={19} />
            </div>
            <span className="text-xs font-semibold text-ink/80">{label}</span>
          </Link>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="iris" />
        <StatCard icon={Layers} label="Active Batches" value={stats.activeBatches} color="sky" />
        <StatCard
          icon={AlertCircle}
          label="Pending Fees"
          value={stats.pendingFeeCount}
          color="tangerine"
          sub="students"
        />
        <StatCard
          icon={IndianRupee}
          label="Collected This Month"
          value={formatCurrency(stats.collectionThisMonth)}
          color="meadow"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-ink">Monthly Collection</h3>
              <p className="text-xs text-ink/45">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-meadow-100 px-3 py-1 text-xs font-semibold text-meadow-700">
              <TrendingUp size={13} /> {formatCurrency(stats.totalRevenue)} total
            </div>
          </div>
          <RevenueChart data={stats.charts.monthlyCollectionTrend} />
        </Card>

        {/* Attendance */}
        <Card className="flex flex-col items-center justify-center text-center">
          <h3 className="mb-4 self-start font-display text-base font-bold text-ink">Attendance</h3>
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg className="h-full w-full -rotate-90">
              <circle cx="64" cy="64" r="54" stroke="#F1EEFE" strokeWidth="12" fill="none" />
              <circle
                cx="64" cy="64" r="54" stroke="#3DB88B" strokeWidth="12" fill="none"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - stats.attendancePercentage / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-display text-2xl font-bold text-ink">{stats.attendancePercentage}%</span>
              <span className="flex items-center gap-1 text-[11px] text-ink/45"><CalendarCheck2 size={11} />present</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 font-display text-base font-bold text-ink">Today's Classes</h3>
          <TodaysClasses classes={stats.todaysClasses} />
        </Card>

        <Card>
          <h3 className="mb-3 font-display text-base font-bold text-ink">Upcoming Birthdays</h3>
          <BirthdayList birthdays={stats.upcomingBirthdays} />
        </Card>

        <Card>
          <h3 className="mb-3 font-display text-base font-bold text-ink">Students per Batch</h3>
          <BatchDistributionChart data={stats.charts.studentsPerBatch} />
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-display text-base font-bold text-ink">Recent Activity</h3>
        <ActivityFeed activity={stats.recentActivity} />
      </Card>
    </div>
  );
}
