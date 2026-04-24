import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { adminLogin } from '../api/admin';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  InputAdornment, 
  IconButton,
  Paper,
  Link as MuiLink,
  CircularProgress
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, CheckCircle, Cancel, AutoAwesome } from '@mui/icons-material';
import { FaGithub, FaGoogle } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const adminUser = localStorage.getItem("adminUser");
        navigate(adminUser ? '/admin/dashboard' : '/home');
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const adminUser = localStorage.getItem("adminUser");
        navigate(adminUser ? '/admin/dashboard' : '/home');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

  const handleForgotPassword = () => {
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    setSuccess('Password reset link sent to your email.');
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      try {
        const res = await adminLogin(email, password);
        if (res?.success && res.user?.isAdmin) {
          localStorage.setItem("adminUser", JSON.stringify(res.user));
          setSuccess('Welcome back, Admin! Redirecting...');
          setTimeout(() => navigate('/admin/dashboard'), 1500);
          return;
        } else {
          localStorage.removeItem("adminUser");
        }
      } catch (adminErr) {
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5d9e4751-11a9-4c69-a63a-95407c5bc596/dlupd7m-4e4b55cb-45fc-4516-8536-69a2699796ff.png/v1/fill/w_1920,h_1080,q_80,strp/sound_of_blue_by_sophiesticatedarts_dlupd7m-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTA4MCIsInBhdGgiOiIvZi81ZDllNDc1MS0xMWE5LTRjNjktYTYzYS05NTQwN2M1YmM1OTYvZGx1cGQ3bS00ZTRiNTVjYi00NWZjLTQ1MTYtODUzNi02OWEyNjk5Nzk2ZmYucG5nIiwid2lkdGgiOiI8PTE5MjAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.BLLtFPbAk9cGw2wa8wDdMMKzs3zCtKhV44BOtpUsaBg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -2,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          zIndex: -1,
        },
      }}
    >
      {/* Animated glow effects */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 60px rgba(79, 70, 229, 0.3)',
            '0 0 80px rgba(79, 70, 229, 0.5)',
            '0 0 60px rgba(79, 70, 229, 0.3)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        sx={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 5,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'rgba(79, 70, 229, 0.3)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Logo Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <MuiLink 
                component={Link} 
                to="/" 
                sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  textDecoration: 'none' 
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(79, 70, 229, 0.4)',
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: 'white',
                      borderRadius: 1,
                      transform: 'rotate(45deg)',
                    }}
                  />
                </Box>
                <Typography 
                  variant="h4" 
                  component="span" 
                  sx={{ 
                    fontWeight: 800, 
                    color: 'white',
                    letterSpacing: '0.15em',
                    textShadow: '0 0 30px rgba(79, 70, 229, 0.5)',
                  }}
                >
                  NEXORA
                </Typography>
              </MuiLink>
            </motion.div>
          </Box>

          {/* Title Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                color: 'white', 
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              Welcome Back
              <AutoAwesome sx={{ fontSize: 18, color: 'primary.main' }} />
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Sign in to continue your journey
            </Typography>
          </Box>

          {/* Alerts */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity={success ? 'success' : 'error'}
                  icon={success ? <CheckCircle /> : <Cancel />}
                  sx={{ 
                    mb: 3,
                    bgcolor: success ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid',
                    borderColor: success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: success ? 'success.main' : 'error.main',
                    },
                    '& .MuiAlert-message': {
                      color: success ? 'success.main' : 'error.main',
                      fontWeight: 500,
                    },
                  }}
                >
                  {success || error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              fullWidth
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <motion.div
                      animate={{ 
                        color: focusedField === 'email' ? '#818cf8' : '#6b7280',
                        scale: focusedField === 'email' ? 1.1 : 1
                      }}
                    >
                      <Email />
                    </motion.div>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(30, 41, 59, 0.6)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '& fieldset': { 
                    borderColor: focusedField === 'email' ? 'rgba(129, 140, 248, 0.5)' : 'rgba(71, 85, 105, 0.4)',
                    transition: 'all 0.3s ease',
                  },
                  '&:hover fieldset': { borderColor: 'rgba(129, 140, 248, 0.5)' },
                  '&.Mui-focused fieldset': { 
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.15)',
                  },
                },
                '& .MuiInputLabel-root': { 
                  color: focusedField === 'email' ? 'primary.light' : 'text.secondary',
                },
                '& .MuiInputBase-input': { 
                  color: 'white',
                  fontWeight: 500,
                },
              }}
            />

            <Box>
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                fullWidth
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <motion.div
                        animate={{ 
                          color: focusedField === 'password' ? '#818cf8' : '#6b7280',
                          scale: focusedField === 'password' ? 1.1 : 1
                        }}
                      >
                        <Lock />
                      </motion.div>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ 
                          color: 'text.secondary',
                          transition: 'all 0.3s ease',
                          '&:hover': { color: 'primary.light' },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '& fieldset': { 
                      borderColor: focusedField === 'password' ? 'rgba(129, 140, 248, 0.5)' : 'rgba(71, 85, 105, 0.4)',
                      transition: 'all 0.3s ease',
                    },
                    '&:hover fieldset': { borderColor: 'rgba(129, 140, 248, 0.5)' },
                    '&.Mui-focused fieldset': { 
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.15)',
                    },
                  },
                  '& .MuiInputLabel-root': { 
                    color: focusedField === 'password' ? 'primary.light' : 'text.secondary',
                  },
                  '& .MuiInputBase-input': { 
                    color: 'white',
                    fontWeight: 500,
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  onClick={handleForgotPassword}
                  size="small"
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      bgcolor: 'transparent', 
                      color: 'primary.light',
                      textDecoration: 'none',
                    },
                  }}
                >
                  Forgot password?
                </Button>
              </Box>
            </Box>

            <motion.div
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
                sx={{
                  py: 1.8,
                  bgcolor: 'primary.main',
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    bgcolor: 'primary.dark',
                    boxShadow: '0 6px 25px rgba(79, 70, 229, 0.5)',
                  },
                  '&:disabled': { 
                    bgcolor: 'rgba(79, 70, 229, 0.5)',
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : 'Sign In'}
              </Button>
            </motion.div>
          </Box>

          {/* Divider */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em' }}>
                OR CONTINUE WITH
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <motion.div
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{ flex: 1 }}
              >
                <Button
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  fullWidth
                  startIcon={<FaGoogle style={{ fontSize: 20 }} />}
                  sx={{
                    py: 1.5,
                    bgcolor: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid',
                    borderColor: 'rgba(71, 85, 105, 0.4)',
                    borderRadius: 2,
                    color: 'text.secondary',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      bgcolor: 'rgba(71, 85, 105, 0.3)', 
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  Google
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{ flex: 1 }}
              >
                <Button
                  onClick={() => handleSocialLogin('github')}
                  disabled={loading}
                  fullWidth
                  startIcon={<FaGithub style={{ fontSize: 20 }} />}
                  sx={{
                    py: 1.5,
                    bgcolor: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid',
                    borderColor: 'rgba(71, 85, 105, 0.4)',
                    borderRadius: 2,
                    color: 'text.secondary',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      bgcolor: 'rgba(71, 85, 105, 0.3)', 
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  GitHub
                </Button>
              </motion.div>
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center', pt: 2, borderTop: '1px solid', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <MuiLink 
                component={Link} 
                to="/register" 
                sx={{ 
                  color: 'primary.light',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    color: 'white',
                    textShadow: '0 0 10px rgba(129, 140, 248, 0.5)',
                  },
                }}
              >
                Sign up
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Login;