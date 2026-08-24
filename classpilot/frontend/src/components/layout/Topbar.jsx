import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, LogOut, ChevronDown, User, Layers } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getStudents } from "../../api/students";
import { getBatches } from "../../api/batches";
import { initials } from "../../utils/formatters";

export default function Topbar({ onMenuClick }) {
  const { teacher, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setResults(null);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timeout = setTimeout(async () => {
      const [studentsRes, batchesRes] = await Promise.all([
        getStudents({ search: query, limit: 5 }),
        getBatches({ search: query }),
      ]);
      setResults({
        students: studentsRes.data.data,
        batches: batchesRes.data.data.slice(0, 5),
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const goTo = (path) => {
    navigate(path);
    setQuery("");
    setResults(null);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink/5 bg-cream/80 px-4 py-3 backdrop-blur-lg sm:px-6">
      <button onClick={onMenuClick} className="rounded-xl p-2 text-ink/60 hover:bg-white lg:hidden">
        <Menu size={22} />
      </button>

      <div ref={searchRef} className="relative flex-1 max-w-md">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students, batches, parents..."
          className="w-full rounded-full border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-iris-300"
        />
        {results && (
          <div className="absolute left-0 right-0 top-12 z-40 max-h-80 overflow-y-auto rounded-2xl border border-ink/5 bg-white p-2 shadow-xl scrollbar-thin">
            {results.students.length === 0 && results.batches.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-ink/40">No matches found</p>
            )}
            {results.students.length > 0 && (
              <div className="mb-1">
                <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink/35">Students</p>
                {results.students.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => goTo(`/students/${s._id}`)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-iris-50"
                  >
                    <User size={15} className="text-iris-500" />
                    <span className="font-medium text-ink">{s.fullName}</span>
                    <span className="text-xs text-ink/40">{s.batch?.batchName}</span>
                  </button>
                ))}
              </div>
            )}
            {results.batches.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink/35">Batches</p>
                {results.batches.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => goTo(`/batches/${b._id}`)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-iris-50"
                  >
                    <Layers size={15} style={{ color: b.colorTag }} />
                    <span className="font-medium text-ink">{b.batchName}</span>
                    <span className="text-xs text-ink/40">{b.class}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-ink/10 bg-white py-1.5 pl-1.5 pr-3 hover:border-iris-300"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-iris-500 text-xs font-bold text-white">
            {initials(teacher?.name || "T")}
          </div>
          <span className="hidden text-sm font-semibold text-ink sm:block">{teacher?.name}</span>
          <ChevronDown size={15} className="text-ink/40" />
        </button>

        {profileOpen && (
          <div className="absolute right-4 mt-2 w-48 rounded-2xl border border-ink/5 bg-white p-1.5 shadow-xl sm:right-6">
            <button
              onClick={() => goTo("/settings")}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink hover:bg-iris-50"
            >
              <User size={15} /> Profile & Settings
            </button>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-blossom-600 hover:bg-blossom-50"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
