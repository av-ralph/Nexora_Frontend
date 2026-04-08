import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Star, ShieldCheck, Loader2, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  
  const navigate = useNavigate();

  // Reset states when switching modes
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [isLogin]);

  const validateForm = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      triggerError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 8) {
      triggerError('Password must be at least 8 characters long.');
      return false;
    }
    if (!isLogin) {
      if (fullName.trim().split(' ').length < 2) {
        triggerError('Please enter your full name (first and last name).');
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
      triggerError(err.message || 'An error occurred during social login');
    } finally {
      setLoading(false);
    }
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
        setSuccess('Welcome back! Redirecting...');
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
          triggerError('This email is already registered. Try logging in.');
        } else {
          setSuccess('Account created! Please check your email for a confirmation link.');
        }
      }
    } catch (err: any) {
      triggerError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: isLogin ? 20 : -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: isLogin ? -20 : 20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center p-4 md:p-6 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/50 relative z-10"
      >
        {/* Left Side: Brand Visuals */}
        <div className="md:w-[45%] bg-indigo-600 p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-900" />
          
          {/* Animated Patterns */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[size:32px_32px]" />
          </div>

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center space-x-3 mb-12 group">
              <motion.div 
                whileHover={{ rotate: 45 }}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-black/20"
              >
                <div className="w-6 h-6 bg-indigo-600 rounded-sm rotate-45" />
              </motion.div>
              <span className="text-3xl font-black tracking-tighter">NEXORA</span>
            </Link>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login-text' : 'signup-text'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h2 className="text-4xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                  {isLogin ? (
                    <>WELCOME <br /> BACK TO <br /> THE CORE.</>
                  ) : (
                    <>JOIN THE <br /> EVOLUTION <br /> OF CINEMA.</>
                  )}
                </h2>
                <p className="text-indigo-100/70 text-lg font-medium leading-relaxed max-w-xs">
                  {isLogin 
                    ? "Your personalized neural cinema experience is waiting." 
                    : "Create your identity and unlock the future of streaming."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 mt-8 flex items-center justify-between">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 overflow-hidden shadow-lg">
                  <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="user" />
                </div>
              ))}
            </div>
            <div className="text-[10px] font-black text-white/80 uppercase tracking-widest">
              +2.4M ARCHITECTS
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-[55%] p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-black/20">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-3xl font-black tracking-tight">
                {isLogin ? 'SIGN IN' : 'REGISTER'}
              </h3>
              <Link to="/" className="text-gray-500 hover:text-white transition-colors flex items-center space-x-1 text-xs font-bold uppercase tracking-widest">
                <ChevronLeft size={14} />
                <span>Back</span>
              </Link>
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">
              {isLogin ? 'Enter your credentials to continue' : 'Initialize your free account'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`mb-8 p-4 rounded-2xl flex items-start space-x-3 text-sm font-bold border ${
                  success
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {success ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                <span>{success || error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form 
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            onSubmit={handleSubmit} 
            className="space-y-5"
          >
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full bg-white/[0.03] border ${fullName.trim().split(' ').length >= 2 ? 'border-green-500/30' : 'border-white/10'} rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all font-medium text-white placeholder:text-gray-600`}
                      required
                      disabled={loading}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Terminal</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-white/[0.03] border ${email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? 'border-green-500/30' : 'border-white/10'} rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all font-medium text-white placeholder:text-gray-600`}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Access Key</label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest">Forgot?</button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white/[0.03] border ${password.length >= 8 ? 'border-green-500/30' : 'border-white/10'} rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all font-medium text-white placeholder:text-gray-600`}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-white text-black rounded-2xl font-black text-base hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'INITIALIZE SESSION' : 'CREATE IDENTITY'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </motion.form>

          <div className="mt-10">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <span className="relative bg-[#0b0b1a] px-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Neural Connect</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="flex items-center justify-center space-x-3 py-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all font-bold text-xs disabled:opacity-50"
              >
                <FaGoogle size={16} />
                <span className="tracking-widest">GOOGLE</span>
              </button>
              <button
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="flex items-center justify-center space-x-3 py-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all font-bold text-xs disabled:opacity-50"
              >
                <FaGithub size={16} />
                <span className="tracking-widest">GITHUB</span>
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
              className="group text-xs font-bold text-gray-500 hover:text-white transition-colors tracking-widest uppercase"
            >
              {isLogin ? "No identity yet?" : "Already an architect?"}
              <span className="ml-2 text-indigo-400 font-black group-hover:text-indigo-300 transition-colors">
                {isLogin ? 'Register' : 'Sign In'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
