import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Cpu,
  Zap,
  Sparkles,
  Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminLogin } from "../../api/admin";
import { supabase } from "../../lib/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminUser = localStorage.getItem("adminUser");
    if (adminUser) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => {
      setError(null);
      setShake(false);
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // First, verify with Supabase to ensure password is correct
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) throw supabaseError;

      // Then check if user has admin privileges
      const res = await adminLogin(email, password);
      if (res.success && res.user) {
        localStorage.setItem("adminUser", JSON.stringify(res.user));
        navigate("/admin/dashboard");
      } else {
        triggerError(res.message || "Access Denied: Non-Root Identity Detected");
      }
    } catch (err: any) {
      triggerError(
        err.message || err.response?.data?.message || "Secure Handshake Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center p-4 md:p-6 selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-2xl shadow-black/50 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-50" />
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Fingerprint className="w-32 h-32 md:w-40 md:h-40 text-white" />
          </div>

          {/* Header */}
          <div className="text-center mb-10 md:mb-12 relative">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl shadow-indigo-500/30 relative group"
            >
              <ShieldCheck size={32} md={40} className="text-white relative z-10" />
              <div className="absolute inset-0 bg-white/20 rounded-xl md:rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-500" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-2">
              Root_Console
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-0.5 w-6 md:w-8 bg-indigo-600 rounded-full" />
              <p className="text-[8px] md:text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em]">
                Secure_Neural_Access
              </p>
              <div className="h-0.5 w-6 md:w-8 bg-indigo-600 rounded-full" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 md:mb-8 p-4 md:p-5 bg-red-500/10 border border-red-500/20 rounded-xl md:rounded-2xl flex items-start space-x-3 md:space-x-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-400 shadow-lg shadow-red-500/5 backdrop-blur-xl"
              >
                <AlertCircle size={16} md={18} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form 
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            onSubmit={handleSubmit} 
            className="space-y-4 md:space-y-6"
          >
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">
                Admin_Identifier
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors"
                  size={16} md={18}
                />
                <input
                  type="email"
                  placeholder="root@nexora.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 pl-12 md:pl-14 pr-6 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all font-bold text-xs md:text-sm text-white placeholder:text-gray-600"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">
                Security_Vault_Key
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors"
                  size={16} md={18}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 pl-12 md:pl-14 pr-6 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all font-bold text-xs md:text-sm text-white placeholder:text-gray-600"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.2)" }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-5 md:py-6 bg-white text-black rounded-xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all duration-500 flex items-center justify-center space-x-3 md:space-x-4 shadow-2xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed mt-6 md:mt-8 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center gap-3 md:gap-4">
                {loading ? (
                  <Loader2 size={20} md={24} className="animate-spin" />
                ) : (
                  <>
                    <span>INITIALIZE_ROOT</span>
                    <ArrowRight size={18} md={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>
          </motion.form>

          {/* Footer Accents */}
          <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-white/5 flex flex-col items-center space-y-4 md:space-y-6">
            <Link to="/login" className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-gray-500 hover:text-white transition-all tracking-widest group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              RETURN_TO_BASE
            </Link>
            
            <div className="flex items-center gap-6 md:gap-8 opacity-20 pointer-events-none">
              <div className="flex items-center gap-2">
                <Zap size={10} md={12} className="text-indigo-500" />
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.5em]">ROOT_STABLE</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={10} md={12} className="text-purple-500" />
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.5em]">SYSTEM_ENCRYPTED</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
