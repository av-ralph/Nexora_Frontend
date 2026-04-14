import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft,
  Eye,
  EyeOff,
  Sparkles,
  Zap
} from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { adminLogin } from '../api/admin';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const adminUser = localStorage.getItem("adminUser");
        if (adminUser) {
          navigate('/admin/dashboard');
        } else {
          navigate('/home');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  // Reset states when switching modes
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  }, [isLogin]);

  const validateForm = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      triggerError('Please enter a valid neural terminal address.');
      return false;
    }
    if (password.length < 8) {
      triggerError('Access key must be at least 8 characters long.');
      return false;
    }
    if (!isLogin) {
      if (fullName.trim().split(' ').length < 2) {
        triggerError('Please provide your full architect identity (First & Last Name).');
        return false;
      }
    }
    return true;
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      triggerError(err.message || 'Neural connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      triggerError('Enter your email to initiate recovery.');
      return;
    }
    setSuccess('Recovery link dispatched to your neural terminal.');
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Check if user is admin and redirect accordingly
        try {
          const res = await adminLogin(email, password);
          if (res?.success && res.user?.isAdmin) {
            localStorage.setItem("adminUser", JSON.stringify(res.user));
            setSuccess('Welcome back, Admin! Synchronizing dashboard...');
            setTimeout(() => navigate('/admin/dashboard'), 1500);
            return;
          } else {
            localStorage.removeItem("adminUser");
          }
        } catch (adminErr) {
          console.log('Admin check failed:', adminErr);
          localStorage.removeItem("adminUser");
        }

        setSuccess('Identity verified. Redirecting to Core...');
        setTimeout(() => navigate('/home'), 1500);
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        
        if (data?.user?.identities?.length === 0) {
          triggerError('This identity is already registered in the registry.');
        } else {
          setSuccess('Identity created! Dispatching confirmation link to terminal.');
        }
      }
    } catch (err: any) {
      triggerError(err.message || 'System error. Failed to initialize session.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/50 relative z-10"
      >
        {/* Left Side: Brand Visuals */}
        <div className="md:w-[45%] bg-indigo-600 p-8 sm:p-12 md:p-16 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-950" />
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center space-x-3 md:space-x-4 mb-10 md:mb-16 group">
              <motion.div 
                whileHover={{ rotate: 90, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl shadow-black/40"
              >
                <div className="w-5 h-5 md:w-7 md:h-7 bg-indigo-600 rounded rotate-45 group-hover:rotate-0 transition-transform duration-500" />
              </motion.div>
              <span className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase">NEXORA</span>
            </Link>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login-text' : 'signup-text'}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="space-y-1 md:space-y-2">
                  <p className="text-indigo-200/60 font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em]">System_Status: Online</p>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tighter uppercase italic">
                    {isLogin ? (
                      <>Access <br className="hidden md:block" /> The <br className="hidden md:block" /> Core_</>
                    ) : (
                      <>Forge <br className="hidden md:block" /> Your <br className="hidden md:block" /> Legend_</>
                    )}
                  </h2>
                </div>
                <p className="text-indigo-100/70 text-base md:text-lg font-medium leading-relaxed max-w-xs border-l-2 border-white/20 pl-4 md:pl-6">
                  {isLogin 
                    ? "Re-establish neural link with your personalized cinema experience." 
                    : "Initialize your architect profile and unlock the future of streaming."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-10 pt-6 md:pt-10 border-t border-white/10 mt-8 md:mt-10 flex items-center justify-between">
            <div className="flex -space-x-3 md:-space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border-2 border-indigo-600 bg-indigo-400 overflow-hidden shadow-2xl relative group">
                  <img src={`https://i.pravatar.cc/150?u=${i+20}`} alt="user" className="group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-indigo-600/20 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
            <div className="text-right">
              <div className="text-[8px] md:text-[10px] font-black text-white/80 uppercase tracking-widest mb-1">+2.4M ARCHITECTS</div>
              <div className="flex items-center justify-end gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[7px] md:text-[8px] font-black text-indigo-200 uppercase tracking-widest">Global_Sync_Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-[55%] p-8 sm:p-12 md:p-16 lg:p-20 flex flex-col justify-center bg-black/40 relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 text-white" />
          </div>

          <motion.div variants={itemVariants} className="mb-8 md:mb-12 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-3xl md:text-4xl font-black tracking-tight italic uppercase">
                {isLogin ? 'Initialize' : 'Register'}
              </h3>
              <Link to="/" className="group text-gray-500 hover:text-white transition-all flex items-center space-x-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span>Abort</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 md:w-12 bg-indigo-600 rounded-full" />
              <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[8px] md:text-[9px]">
                {isLogin ? 'Authentication_Protocol_v4.2' : 'Identity_Genesis_Protocol'}
              </p>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`mb-6 md:mb-8 p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] flex items-start space-x-3 md:space-x-4 text-[10px] md:text-xs font-black uppercase tracking-widest border backdrop-blur-xl relative z-10 ${
                  success
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5'
                    : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-lg shadow-red-500/5'
                }`}
              >
                {success ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                <span className="leading-relaxed">{success || error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form 
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            onSubmit={handleSubmit} 
            className="space-y-4 md:space-y-6 relative z-10"
          >
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="space-y-1.5 md:space-y-2 overflow-hidden"
                >
                  <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Architect_Alias</label>
                  <div className="relative group">
                    <User className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={16} md={18} />
                    <input
                      type="text"
                      placeholder="Enter Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 pl-12 md:pl-14 pr-6 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all font-bold text-xs md:text-sm text-white placeholder:text-gray-600"
                      required
                      disabled={loading}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Terminal_Link</label>
              <div className="relative group">
                <Mail className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={16} md={18} />
                <input
                  type="email"
                  placeholder="name@nexus.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 pl-12 md:pl-14 pr-6 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all font-bold text-xs md:text-sm text-white placeholder:text-gray-600"
                  required
                  disabled={loading}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5 md:space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Access_Key</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-[9px] md:text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Lost_Key?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={16} md={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 pl-12 md:pl-14 pr-12 md:pr-14 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all font-bold text-xs md:text-sm text-white placeholder:text-gray-600"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} md={18} /> : <Eye size={16} md={18} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.2)" }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 md:py-6 bg-white text-black rounded-xl md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all duration-500 flex items-center justify-center space-x-3 md:space-x-4 shadow-2xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed mt-6 md:mt-8 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center gap-3 md:gap-4">
                {loading ? (
                  <Loader2 size={20} md={24} className="animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Initialize_Session' : 'Genesis_Protocol'}</span>
                    <ArrowRight size={18} md={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>
          </motion.form>

          <motion.div variants={itemVariants} className="mt-10 md:mt-12 relative z-10">
            <div className="relative flex items-center justify-center mb-8 md:mb-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <span className="relative bg-[#0b0b1a] px-4 md:px-6 text-[8px] md:text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] md:tracking-[0.4em]">Neural_Connect</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="flex items-center justify-center space-x-3 md:space-x-4 py-4 md:py-5 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all font-black text-[9px] md:text-[10px] uppercase tracking-widest disabled:opacity-50 group"
              >
                <FaGoogle size={16} md={18} className="group-hover:scale-110 transition-transform" />
                <span>Google</span>
              </button>
              <button
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="flex items-center justify-center space-x-3 md:space-x-4 py-4 md:py-5 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all font-black text-[9px] md:text-[10px] uppercase tracking-widest disabled:opacity-50 group"
              >
                <FaGithub size={16} md={18} className="group-hover:scale-110 transition-transform" />
                <span>Github</span>
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-12 md:mt-16 text-center relative z-10">
            <button
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
              className="group text-[9px] md:text-[10px] font-black text-gray-500 hover:text-white transition-all tracking-[0.2em] md:tracking-[0.3em] uppercase"
            >
              {isLogin ? "New_Architect_ID?" : "Existing_Credential?"}
              <span className="ml-2 md:ml-3 text-indigo-400 font-black group-hover:text-indigo-300 transition-colors border-b border-indigo-400/30 pb-1">
                {isLogin ? 'Register_Now' : 'Sign_In_Now'}
              </span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative footer tags */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-indigo-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.5em]">Neural_Link_Stable</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-purple-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.5em]">Encrypted_Stream_Active</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
