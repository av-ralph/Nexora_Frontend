import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Tv, MessageSquare, Star, TrendingUp, Clock, ArrowUpRight, Activity, Calendar } from "lucide-react";
import { getAdminStats, type AdminStats } from "../../api/admin";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.userCount || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      link: "/admin/users",
      trend: "+12%",
    },
    {
      label: "Watch Parties",
      value: stats?.activeWatchParties || 0,
      icon: Tv,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      link: "/admin/watch-parties",
      trend: "+5%",
    },
    {
      label: "Total Reviews",
      value: stats?.reviewCount || 0,
      icon: MessageSquare,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      link: "/admin/reviews",
      trend: "+18%",
    },
    {
      label: "Favorites",
      value: stats?.favoriteCount || 0,
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      link: "/admin/favorites",
      trend: "+24%",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white mb-2">
            System_Overview
          </h1>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em]">
            Real-time_Analytics_Node
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={stat.label}
            >
              <Link
                to={stat.link}
                className="group relative block p-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] hover:bg-white/[0.06] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon size={80} />
                </div>
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                    {stat.label}
                  </p>
                  
                  <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-black text-white tracking-tighter">
                      {stat.value.toLocaleString()}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                      <TrendingUp size={10} />
                      {stat.trend}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                New_Architects
              </h2>
            </div>
            <Link
              to="/admin/users"
              className="group flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              Access_Registry
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats?.recentUsers?.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">No_Data_Streams</p>
              </div>
            ) : (
              stats?.recentUsers?.map((user) => (
                <div
                  key={user.id}
                  className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-lg">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-[#0b0b1a] rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">
                        {user.name || "Unknown_Entity"}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Status</p>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                        user.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Neural_Feedback
              </h2>
            </div>
            <Link
              to="/admin/reviews"
              className="group flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              Analyze_All
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats?.recentReviews?.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">No_Neural_Inputs</p>
              </div>
            ) : (
              stats?.recentReviews?.map((review) => (
                <div
                  key={review.id}
                  className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">
                        {review.author_name}
                      </span>
                      <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-[10px] font-black">{review.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[8px] text-gray-500 font-black uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 italic">
                    "{review.content}"
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
