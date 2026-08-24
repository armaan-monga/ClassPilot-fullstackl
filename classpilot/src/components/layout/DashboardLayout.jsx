import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { teacher } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        instituteName={teacher?.instituteName}
      />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
