import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Loader2, 
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { adminLogin } from '../api/admin';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const adminUser = localStorage.getItem("adminUser");
        if (adminUser) {
          navigate('/admin/dashboard');
        } else {
          navigate('/home');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  }, []);

  const validateForm = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    return true;
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/home`,
          scopes: provider === 'github' ? 'user:email read:user' : undefined,
        },
      });

      if (error) throw error;
      
      if (!data.url) {
        setError('Social login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Social login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError('Please enter your email to reset your password.');
      return;
    }
    setSuccess('Password reset link has been sent to your email.');
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      try {
        const res = await adminLogin(email, password);
        if (res?.success && res.user?.isAdmin) {
          localStorage.setItem("adminUser", JSON.stringify(res.user));
          setSuccess('Welcome back, Admin! Redirecting to dashboard...');
          setTimeout(() => navigate('/admin/dashboard'), 1500);
          return;
        } else {
          localStorage.removeItem("adminUser");
        }
      } catch (adminErr) {
        console.log('Admin check failed:', adminErr);
        localStorage.removeItem("adminUser");
      }

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/home'), 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5d2f751b-0791-4cb6-a646-8cfecd441a73/dftidq9-225b64ad-03c8-4565-861d-ae93119ca12c.png/v1/fill/w_1095,h_730,q_70,strp/anime_sano_city_backdrop_5_by_ashurashuraya_dftidq9-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9ODk2IiwicGF0aCI6Ii9mLzVkMmY3NTFiLTA3OTEtNGNiNi1hNjQ2LThjZmVjZDQ0MWE3My9kZnRpZHE5LTIyNWI2NGFkLTAzYzgtNDU2NS04NjFkLWFlOTMxMTljYTEyYy5wbmciLCJ3aWR0aCI6Ijw9MTM0NCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.sW2pYxronmPzGFkPgzIFpewyPkzvH34XHMrjtEMseZg)' }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden"
        >
          {/* Header Banner */}
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
            <Link to="/" className="inline-flex items-center gap-3 justify-center">
              <motion.div 
                whileHover={{ rotate: 45, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
              >
                <div className="w-5 h-5 bg-white rounded-sm" />
              </motion.div>
              <span className="text-3xl font-bold text-white">NEXORA</span>
            </Link>
          </motion.div>

          {/* Form Content */}
          <motion.div variants={itemVariants} className="p-8">
            <div className="text-center mb-8">
              <motion.h2 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-bold text-white"
              >
                Welcome Back
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-400 mt-2"
              >
                Sign in to continue
              </motion.p>
            </div>

            <AnimatePresence>
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                    success 
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {success ? <CheckCircle size={20} className="shrink-0 mt-0.5" /> : <XCircle size={20} className="shrink-0 mt-0.5" />}
                  <span className="text-sm">{success || error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-5"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-10 transition-opacity" />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <motion.input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-gray-900/80 outline-none transition-all text-white placeholder:text-gray-500"
                    required
                    disabled={loading}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </motion.button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-10 transition-opacity" />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                    className="w-full pl-12 pr-14 py-3.5 bg-gray-900/50 border border-gray-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-gray-900/80 outline-none transition-all text-white placeholder:text-gray-500"
                    required
                    disabled={loading}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(99, 102, 241, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Loader2 size={22} />
                  </motion.div>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative flex items-center my-8"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              <span className="px-4 text-sm text-gray-500 bg-gray-800">Or continue with</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
            </motion.div>

            {/* Social Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(55, 65, 81, 0.8)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="flex items-center justify-center gap-3 py-3.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl transition-all text-gray-300 disabled:opacity-50"
              >
                <FaGoogle size={20} />
                <span className="font-medium">Google</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(55, 65, 81, 0.8)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="flex items-center justify-center gap-3 py-3.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl transition-all text-gray-300 disabled:opacity-50"
              >
                <FaGithub size={20} />
                <span className="font-medium">GitHub</span>
              </motion.button>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-400">
                Don't have an account?{' '}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                >
                  <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Sign up
                  </Link>
                </motion.span>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
