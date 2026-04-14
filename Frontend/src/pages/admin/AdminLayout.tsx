import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Film,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Tv,
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/admin/watch-parties", label: "Watch Parties", icon: Tv },
  { path: "/admin/favorites", label: "Favorites", icon: Star },
  { path: "/admin/watch-history", label: "Watch History", icon: Film },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const adminUser = localStorage.getItem("adminUser");
    if (!adminUser) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogout = async () => {
    localStorage.removeItem("adminUser");
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#050510]" : "bg-gray-50"} transition-colors duration-300 font-sans`}>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-20"
        } ${darkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-gray-200"} border-r backdrop-blur-xl hidden lg:flex flex-col`}
      >
        <div className={`p-8 mb-4 flex items-center ${sidebarOpen ? "justify-between" : "justify-center"}`}>
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-sm font-black tracking-tighter italic uppercase ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Nexora_Root
                  </h1>
                  <p className="text-[8px] text-indigo-400 font-black uppercase tracking-[0.2em]">
                    Admin_Console
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20"
              >
                <ShieldCheck className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : darkMode
                    ? "text-gray-500 hover:text-white hover:bg-white/[0.05]"
                    : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-xs font-black uppercase tracking-widest"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!sidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-2 mb-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              darkMode ? "text-gray-500 hover:text-yellow-400 hover:bg-white/[0.05]" : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest">{darkMode ? "Light_Mode" : "Dark_Mode"}</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              darkMode ? "text-gray-500 hover:text-red-400 hover:bg-white/[0.05]" : "text-gray-500 hover:text-red-600 hover:bg-red-50"
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Terminate_Session</span>}
          </button>
        </div>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute -right-3 top-24 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
            darkMode ? "bg-[#0b0b1a] border-white/10 text-gray-500 hover:text-white" : "bg-white border-gray-200 text-gray-500 hover:text-indigo-600"
          } shadow-xl z-50`}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-6 left-6 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-3 rounded-2xl ${darkMode ? "bg-white/[0.05] text-white border-white/10" : "bg-white text-gray-800 border-gray-200"} border backdrop-blur-xl shadow-2xl`}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Main content */}
      <main
        className={`transition-all duration-500 ${
          sidebarOpen ? "lg:ml-72" : "lg:ml-20"
        } min-h-screen relative overflow-hidden`}
      >
        {/* Decorative elements */}
        {darkMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
          </div>
        )}

        <div className="p-8 lg:p-12 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
