import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Shield, Bell, Palette, LogOut, ChevronRight, Menu, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import Scene from '../components/ThreeBackground';
import heroBg from '../assets/BG1.gif';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden font-sans selection:bg-indigo-500/30">
      <Scene />
      
      {/* Background Image */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <img src={heroBg} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-transparent to-[#050510]" />
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`relative z-10 transition-all duration-500 ${isSidebarOpen ? 'pl-0 md:pl-80' : 'pl-0'}`}>
        {/* Top Header */}
        <header className="p-6 md:p-12 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl md:hidden"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
            <div>
              <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">System_Config</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Node_Status: Operational</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 pb-24">
          <div className="space-y-8">
            {/* Profile Section */}
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-6">User_Profile</h2>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 backdrop-blur-xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-500/20">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left space-y-1">
                  <p className="text-2xl font-bold">{user?.email}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Member Since: {new Array(new Date(user?.created_at).toLocaleDateString()).join('')}</p>
                </div>
                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Edit_Profile</button>
              </div>
            </section>

            {/* Settings Categories */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Security', icon: Shield, desc: 'Passwords, 2FA, Neural Encryption' },
                { label: 'Notifications', icon: Bell, desc: 'Release alerts, Stream updates' },
                { label: 'Appearance', icon: Palette, desc: 'Visual themes, UI scaling' },
                { label: 'Privacy', icon: User, desc: 'Data logging, Profile visibility' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-6 cursor-pointer group transition-all backdrop-blur-lg"
                >
                  <div className="p-4 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500 group-hover:text-black transition-all">
                    <item.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold uppercase tracking-wider">{item.label}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </motion.div>
              ))}
            </section>

            {/* Danger Zone */}
            <section className="space-y-4 pt-12">
              <h2 className="text-[10px] font-black text-red-500/50 uppercase tracking-[0.5em] mb-6">Danger_Zone</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={handleLogout}
                  className="flex-1 p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center gap-4 group hover:bg-red-500/10 hover:border-red-500/20 transition-all backdrop-blur-md"
                >
                  <LogOut size={20} className="text-gray-500 group-hover:text-red-500 transition-colors" />
                  <span className="font-black uppercase tracking-widest text-xs group-hover:text-red-500 transition-colors">Terminate_Session</span>
                </button>
                <button className="flex-1 p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center gap-4 group hover:bg-red-500/10 hover:border-red-500/20 transition-all backdrop-blur-md">
                  <Trash2 size={20} className="text-gray-500 group-hover:text-red-500 transition-colors" />
                  <span className="font-black uppercase tracking-widest text-xs group-hover:text-red-500 transition-colors">Purge_Neural_Data</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
