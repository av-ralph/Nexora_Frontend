import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { Email, Lock, Person, Visibility, VisibilityOff, CheckCircle, Cancel, AutoAwesome } from '@mui/icons-material';

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
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
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
        },
      });
      if (error) throw error;
      if (!data.url) setError('Social login failed. Please try again.');
    } catch (err: any) {
      setError(err.message || 'Social login failed.');
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
          data: { full_name: fullName },
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
    { test: password.length >= 8, label: '8+ chars' },
    { test: /[A-Z]/.test(password), label: 'Uppercase' },
    { test: /[a-z]/.test(password), label: 'Lowercase' },
    { test: /[0-9]/.test(password), label: 'Number' },
  ];

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ['#374151', '#ef4444', '#f59e0b', '#22c55e', '#10b981'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: 'url(https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5d9e4751-11a9-4c69-a63a-95407c5bc596/dkwb84y-b78083ff-94f9-4c3e-8102-0c170bac079c.png/v1/fill/w_1920,h_1080,q_80,strp/new_forest_shrine_by_sophiesticatedarts_dkwb84y-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTA4MCIsInBhdGgiOiIvZi81ZDllNDc1MS0xMWE5LTRjNjktYTYzYS05NTQwN2M1YmM1OTYvZGt3Yjg0eS1iNzgwODNmZi05NGY5LTRjM2UtODEwMi0wYzE3MGJhYzA3OWMucG5nIiwid2lkdGgiOiI8PTE5MjAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.GGwA9bi4gnVKzvQwirh2_BEdReOIvF1F_JtvRxuhiLQ)' }} />
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* Glow effect */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 60px rgba(16, 185, 129, 0.3)',
            '0 0 80px rgba(16, 185, 129, 0.5)',
            '0 0 60px rgba(16, 185, 129, 0.3)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{ top: '10%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Card */}
        <div className="bg-slate-900/85 p-8 rounded-2xl border border-emerald-500/30 backdrop-blur-xl shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-decoration-none">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <div className="w-5 h-5 bg-white rotate-45" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-widest">NEXORA</span>
            </Link>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              Create Account
              <AutoAwesome className="text-emerald-400" style={{ fontSize: 18 }} />
            </h1>
            <p className="text-gray-400 text-sm mt-1">Join the future of entertainment</p>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className={`p-3 rounded-lg mb-4 border ${success ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}
              >
                <div className="flex items-center gap-2">
                  {success ? <CheckCircle style={{ fontSize: 18 }} /> : <Cancel style={{ fontSize: 18 }} />}
                  <span className="text-sm font-medium">{success || error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Person className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 20 }} />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-slate-800/60 pl-10 pr-4 py-3 rounded-lg border border-slate-600/40 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div className="relative">
              <Email className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 20 }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-slate-800/60 pl-10 pr-4 py-3 rounded-lg border border-slate-600/40 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 20 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-slate-800/60 pl-10 pr-12 py-3 rounded-lg border border-slate-600/40 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-all"
                >
                  {showPassword ? <Visibility style={{ fontSize: 20 }} /> : <VisibilityOff style={{ fontSize: 20 }} />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex-1 h-[3px] rounded-sm transition-all"
                        style={{ backgroundColor: req.test ? strengthColors[getPasswordStrength()] : 'rgba(55, 65, 81, 0.8)' }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {passwordRequirements.map((req, index) => (
                      <span 
                        key={index}
                        className="text-[10px] font-medium transition-all"
                        style={{ color: req.test ? '#34d399' : '#6b7280' }}
                      >
                        {req.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 20 }} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-slate-800/60 pl-10 pr-12 py-3 rounded-lg border border-slate-600/40 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-all"
                >
                  {showConfirmPassword ? <Visibility style={{ fontSize: 20 }} /> : <VisibilityOff style={{ fontSize: 20 }} />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-xs font-medium mt-1 ${password === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 rounded-lg font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : 'Create Account'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500 font-semibold tracking-wider">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="flex-1 py-3 bg-slate-800/60 border border-slate-600/40 rounded-lg text-gray-400 font-medium hover:bg-slate-700/60 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <FaGoogle style={{ fontSize: 20 }} />
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="flex-1 py-3 bg-slate-800/60 border border-slate-600/40 rounded-lg text-gray-400 font-medium hover:bg-slate-700/60 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <FaGithub style={{ fontSize: 20 }} />
                GitHub
              </motion.button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;