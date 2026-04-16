import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home');
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        navigate('/home');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (fullName.trim().split(' ').length < 2) {
      setError('Please enter both first and last name.');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return false;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Please enter a password.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    if (!password.match(/[A-Z]/)) {
      setError('Password must contain at least one uppercase letter.');
      return false;
    }
    if (!password.match(/[a-z]/)) {
      setError('Password must contain at least one lowercase letter.');
      return false;
    }
    if (!password.match(/[0-9]/)) {
      setError('Password must contain at least one number.');
      return false;
    }
    if (!password.match(/[^A-Za-z0-9]/)) {
      setError('Password must contain at least one special character.');
      return false;
    }
    if (!confirmPassword) {
      setError('Please confirm your password.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    setLoading(true);

    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/home`,
        },
      });
      if (error) throw error;
      
      if (data?.user?.identities?.length === 0) {
        setError('This email is already registered.');
      } else {
        setSuccess('Account created! Redirecting to home...');
        setTimeout(() => navigate('/home'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { test: password.length >= 8, label: '8+ characters' },
    { test: /[A-Z]/.test(password), label: 'Uppercase letter' },
    { test: /[a-z]/.test(password), label: 'Lowercase letter' },
    { test: /[0-9]/.test(password), label: 'Number' },
    { test: /[^A-Za-z0-9]/.test(password), label: 'Special character' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.08
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
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/053bae63-7a8e-416f-b3e9-d65a7f485fce/dfkccom-cbeb9dbc-4771-44df-97f2-ca5d6835258f.png/v1/fill/w_1115,h_717,q_70,strp/sound_of_nature_by_ryky_dfkccom-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTIzNCIsInBhdGgiOiIvZi8wNTNiYWU2My03YThlLTQxNmYtYjNlOS1kNjVhN2Y0ODVmY2UvZGZrY2NvbS1jYmViOWRiYy00NzcxLTQ0ZGYtOTdmMi1jYTVkNjgzNTI1OGYucG5nIiwid2lkdGgiOiI8PTE5MjAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.4rkF4GHAMF1Ev7H6X2V5_nDI2u4rvms0nzAMmHwS6YY)' }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
            <Link to="/" className="inline-flex items-center gap-3 justify-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-sm" />
              </div>
              <span className="text-3xl font-bold text-white">NEXORA</span>
            </Link>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-8"
          >
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Create Account</h2>
              <p className="text-gray-400 mt-2">Join us and start streaming</p>
            </motion.div>

            <AnimatePresence>
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-10 transition-opacity" />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <motion.input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    whileFocus={{ scale: 1.01 }}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-gray-900/80 outline-none transition-all text-white placeholder:text-gray-500"
                    required
                    disabled={loading}
                  />
                </div>
              </motion.div>

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
                    whileFocus={{ scale: 1.01 }}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-gray-900/80 outline-none transition-all text-white placeholder:text-gray-500"
                    required
                    disabled={loading}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-10 transition-opacity" />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    whileFocus={{ scale: 1.01 }}
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
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {passwordRequirements.map((req, index) => (
                      <motion.div
                        key={index}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: req.test ? 1 : 0 }}
                        className={`h-1 flex-1 rounded-full origin-left ${req.test ? 'bg-green-500' : 'bg-gray-700'}`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                    {passwordRequirements.map((req, index) => (
                      <p key={index} className={`text-xs flex items-center gap-1 ${req.test ? 'text-green-400' : 'text-gray-500'}`}>
                        {req.test ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {req.label}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-10 transition-opacity" />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                  <motion.input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    whileFocus={{ scale: 1.01 }}
                    className="w-full pl-12 pr-14 py-3.5 bg-gray-900/50 border border-gray-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-gray-900/80 outline-none transition-all text-white placeholder:text-gray-500"
                    required
                    disabled={loading}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircle size={12} /> Passwords match
                  </p>
                )}
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
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Loader2 size={22} />
                  </motion.div>
                ) : (
                  <>
                    <User size={20} />
                    Create Account
                  </>
                )}
              </motion.button>
            </form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="relative flex items-center my-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              <span className="px-4 text-sm text-gray-500 bg-gray-800">Or continue with</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSocialLogin('google')} disabled={loading} className="flex items-center justify-center gap-3 py-3.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl transition-all text-gray-300 disabled:opacity-50">
                <FaGoogle size={20} />
                <span className="font-medium">Google</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSocialLogin('github')} disabled={loading} className="flex items-center justify-center gap-3 py-3.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl transition-all text-gray-300 disabled:opacity-50">
                <FaGithub size={20} />
                <span className="font-medium">GitHub</span>
              </motion.button>
            </div>

            <motion.div variants={itemVariants} className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
