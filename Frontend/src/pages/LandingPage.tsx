import { Link, useNavigate } from 'react-router-dom';
import { Play, Zap, ArrowRight, PlayCircle, Sparkles, Monitor, Layers, Cpu, Radio, Shield, Star } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Scene from '../components/Scene';
import heroBg from '../assets/2.gif';
import { fetchTrendingMovies, fetchTrendingTV } from '../api/tmdb';
import { supabase } from '../lib/supabase';
import UserAvatar from '../components/UserAvatar';

interface Movie {
  id: number;
  title: string;
  year: string;
  rating: string;
  img: string;
  mediaType: 'movie' | 'tv';
}

const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const opacityTransform = useTransform(scrollY, [0, 400], [1, 0.2]);
  const scaleTransform = useTransform(scrollY, [0, 400], [1, 0.95]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const dx = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig);
  const dy = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), springConfig);

  const [scrolled, setScrolled] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleProtectedAction = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 20
      } 
    }
  };

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const [movieData, tvData] = await Promise.all([
          fetchTrendingMovies(),
          fetchTrendingTV()
        ]);

        const formatItem = (m: any, type: 'movie' | 'tv') => ({
          id: m.id,
          title: m.title || m.name,
          year: (m.release_date || m.first_air_date || '').split('-')[0],
          rating: m.vote_average.toFixed(1),
          img: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
          mediaType: type
        });

        const formatted = [
          ...movieData.map((m: any) => formatItem(m, 'movie')),
          ...tvData.map((m: any) => formatItem(m, 'tv'))
        ]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

        setMovies(formatted);
      } catch (error) {
        console.error("Failed to fetch movies for landing page:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden relative z-10 font-['Poppins']">
      {/* 3D Scene Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene />
      </div>
      
      {/* Background Image Layer with Zoom & Parallax */}
      <motion.div 
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        style={{ x: dx, y: dy }}
        className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      >
        <motion.img 
          src={heroBg} 
          alt="Sci-fi Background"
          className="w-full h-full object-cover"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        {/* Subtle cinematic overlay */}
        <div className="absolute inset-0 bg-[#050510]/40 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/80 via-transparent to-[#050510]" />
      </motion.div>

      {/* Floating HUD Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hidden lg:block"
        >
          <Cpu className="text-indigo-500 mb-2" size={24} />
          <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              animate={{ x: [-128, 128] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-indigo-500"
            />
          </div>
          <p className="text-[8px] font-black mt-2 tracking-[0.2em] text-gray-500">CORE_LINK: ACTIVE</p>
        </motion.div>

        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[30%] right-[10%] p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hidden lg:block"
        >
          <Radio className="text-indigo-500 mb-2" size={24} />
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <motion.div 
                key={i}
                animate={{ height: [4, 12, 4] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 bg-indigo-500 rounded-full"
              />
            ))}
          </div>
          <p className="text-[8px] font-black mt-2 tracking-[0.2em] text-gray-500">DATA_STREAM: 12GB/S</p>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'bg-[#050510]/60 backdrop-blur-3xl py-4 border-b border-white/5 shadow-2xl shadow-black/20' : 'bg-transparent py-6 md:py-8'}`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className={`flex items-center justify-between transition-all duration-500`}>
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-9 h-9 md:w-11 md:h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden">
                <div className="w-4 h-4 md:w-5 md:h-5 bg-white rounded-sm rotate-45 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">NEXORA</span>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-12 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
              {['Features', 'Movies', 'About'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white hover:tracking-[0.5em] transition-all duration-500 relative group">
                  {item}
                  <motion.span 
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-500" 
                  />
                </a>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 md:space-x-6"
            >
              {user ? (
                <UserAvatar user={user} onSignOut={handleSignOut} />
              ) : (
                <>
                  <Link to="/login" className="hidden sm:block px-4 md:px-6 py-2 text-[10px] md:text-xs font-black text-gray-400 hover:text-white transition-all hover:tracking-widest uppercase tracking-widest">
                    Login
                  </Link>
                  <Link to="/register" className="relative group px-6 md:px-10 py-3 md:py-4 bg-white text-black rounded-2xl text-[10px] md:text-xs font-black hover:scale-105 active:scale-95 transition-all duration-500 shadow-2xl shadow-white/5 uppercase tracking-[0.2em] overflow-hidden">
                    <span className="relative z-10 group-hover:text-white transition-colors duration-500 uppercase">Sign Up</span>
                    <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 md:pt-40 pb-20 px-6 flex flex-col items-center justify-center min-h-[90vh]">
        <motion.div 
          style={{ y: y1, opacity: opacityTransform, scale: scaleTransform }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto text-center space-y-8 md:space-y-10 relative z-10"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-3 px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] md:text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase backdrop-blur-md"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>The Future of Cinema is Here</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-7xl md:text-9xl lg:text-[12rem] font-black tracking-tighter leading-[0.8] text-white"
          >
            STREAM <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-500 to-indigo-800">BEYOND</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-sm sm:text-lg md:text-2xl text-gray-400 font-medium leading-relaxed"
          >
            Next-gen streaming architecture powered by AI. 
            Experience 12K clarity with zero latency.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-8 md:pt-12"
          >
            <Link 
              to="/home"
              className="group relative flex items-center space-x-3 md:space-x-4 px-6 sm:px-12 py-4 md:py-6 bg-indigo-600 text-white rounded-2xl font-black text-sm sm:text-base md:text-xl hover:scale-110 active:scale-95 transition-all duration-500 shadow-2xl shadow-indigo-600/40 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Play fill="currentColor" size={20} className="relative z-10 sm:w-6 sm:h-6" />
              <span className="relative z-10">ENTER NEXORA</span>
              <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            
            <button 
              onClick={() => handleProtectedAction('/reel')}
              className="group flex items-center space-x-3 md:space-x-4 px-6 sm:px-12 py-4 md:py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm sm:text-base md:text-xl hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xl"
            >
              <PlayCircle size={20} className="group-hover:rotate-12 transition-transform sm:w-6 sm:h-6" />
              <span>WATCH REEL</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 opacity-30"
        >
          <div className="w-px h-20 bg-gradient-to-b from-indigo-500 to-transparent" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase rotate-90 mt-12">Scroll</span>
        </motion.div>
      </header>

      {/* Stats Section */}
      <section className="py-20 md:py-40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-20">
            {[
              { label: 'Neural Nodes', value: '4.2k' },
              { label: 'Global Cache', value: '128TB' },
              { label: 'Active Streams', value: '1.2M' },
              { label: 'Latency', value: '0.2ms' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2 md:space-y-4 group cursor-default"
              >
                <div className="text-3xl sm:text-4xl md:text-6xl font-black text-white group-hover:text-indigo-500 transition-colors duration-500">{stat.value}</div>
                <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 md:py-60 px-6 relative">
        <div className="absolute inset-0 bg-indigo-500/[0.02] -z-10" />
        <div className="max-w-7xl mx-auto space-y-20 md:space-y-40">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
            <div className="space-y-4 md:space-y-6 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[9px] md:text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase mb-4"
              >
                System Architecture
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none"
              >
                CORE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">PROTOCOLS</span>
              </motion.h2>
              <p className="text-base md:text-xl text-gray-500 font-medium leading-relaxed max-xl">
                Nexora is not just a streaming service. It's a high-performance 
                data delivery network designed for the next generation of digital media.
              </p>
            </div>
            <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-indigo-500/50 to-transparent mx-20 mb-10" />
            <div className="text-left md:text-right">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] opacity-50">01 — TECH STACK</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Monitor,
                title: 'NATIVE 12K',
                desc: 'Bypassing standard compression for true pixel-perfect delivery on any device.',
                color: 'from-blue-600 to-cyan-500',
                tag: 'DISPLAY'
              },
              {
                icon: Zap,
                title: 'QUANTUM SYNC',
                desc: 'Instant state synchronization across all your devices for a seamless switch.',
                color: 'from-amber-500 to-orange-600',
                tag: 'NETWORK'
              },
              {
                icon: Layers,
                title: 'AI UPSCALING',
                desc: 'Real-time neural networks enhance classic content to modern standards.',
                color: 'from-purple-600 to-pink-500',
                tag: 'NEURAL'
              },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -20, rotateX: 2, rotateY: 2 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 20
                }}
                className="group relative p-8 md:p-12 bg-white/[0.03] border border-white/5 rounded-[2rem] md:rounded-[3rem] hover:bg-white/[0.07] hover:border-indigo-500/30 transition-all duration-500 backdrop-blur-3xl overflow-hidden"
              >
                {/* Glowing Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Animated Scanning Line */}
                <motion.div 
                  animate={{ top: ['-10%', '110%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent z-10"
                />

                <div className="relative z-20">
                  <div className="flex justify-between items-start mb-12">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                      <feature.icon size={32} className="text-white" />
                    </div>
                    <span className="text-[8px] font-black tracking-[0.4em] text-gray-600 group-hover:text-indigo-400 transition-colors uppercase">
                      {feature.tag}
                    </span>
                  </div>
                  
                  <h3 className="text-3xl font-black mb-6 tracking-tight group-hover:translate-x-2 transition-transform duration-500">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-lg font-medium leading-relaxed group-hover:text-gray-300 transition-colors duration-500">
                    {feature.desc}
                  </p>
                  
                  <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between group/btn cursor-pointer">
                    <span className="text-[10px] font-black tracking-[0.3em] text-gray-500 group-hover/btn:text-white transition-colors">INIT_PROTOCOL</span>
                    <ArrowRight size={16} className="text-gray-600 group-hover/btn:text-indigo-500 group-hover/btn:translate-x-2 transition-all" />
                  </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute -bottom-10 -right-10 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 -rotate-12">
                  <feature.icon size={200} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Movies Showcase Section */}
      <section id="movies" className="py-32 md:py-60 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase"
            >
              Trending Now
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
              FEATURED <span className="text-indigo-500">STREAMS</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-3xl border border-white/5" />
              ))
            ) : (
              movies.map((movie, i) => (
                <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative aspect-[2/3] rounded-3xl overflow-hidden border border-white/10"
              >
                <Link to={`/${movie.mediaType}/${movie.id}`}>
                  <img src={movie.img} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[8px] font-black px-1.5 py-0.5 bg-indigo-500 text-white rounded uppercase tracking-widest">
                        {movie.mediaType}
                      </span>
                    </div>
                    <h3 className="text-white font-black text-lg uppercase italic tracking-tighter line-clamp-2">{movie.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400 font-bold">{movie.year}</span>
                      <div className="flex items-center gap-1">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] text-white font-black">{movie.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
              ))
            )}
          </div>

          <div className="flex justify-center pt-12">
            <Link to="/Explore" className="group flex items-center space-x-4 px-12 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xl hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xl">
              <span>EXPLORE ALL</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 md:py-60 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="inline-block px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase">
                  Our Mission
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                  STREAMING <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-300">WITHOUT LIMITS</span>
                </h2>
                <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-xl">
                  Nexora was born from a simple idea: that high-quality digital entertainment should be accessible instantly, anywhere, without the friction of traditional streaming. We've built a neural network that understands your connection and delivers perfect clarity, every time.
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  { label: 'Neural Nodes', value: '4,200+', detail: 'Global distribution' },
                  { label: 'Uptime', value: '99.99%', detail: 'Quantum reliability' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md"
                  >
                    <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{stat.label}</div>
                    <div className="text-xs text-gray-500 font-medium">{stat.detail}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square"
            >
              {/* Futuristic Decorative Element */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full max-w-[400px] max-h-[400px]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-8 border border-indigo-500/10 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-indigo-600 rounded-3xl rotate-45 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)]">
                      <div className="w-16 h-16 bg-white rounded-xl rotate-45" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 md:py-40 px-6 relative border-t border-white/5 overflow-hidden">
        {/* Footer Glow Background */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[800px] h-[200px] md:h-[400px] bg-indigo-600/10 blur-[100px] md:blur-[150px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-20 pb-20 md:pb-40">
            {/* Branding & Mission */}
            <div className="sm:col-span-2 space-y-6 md:space-y-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center space-x-4"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-sm rotate-45" />
                </div>
                <span className="text-2xl md:text-3xl font-black tracking-tighter uppercase">NEXORA</span>
              </motion.div>
              <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-sm">
                Redefining the boundaries of digital media through neural delivery and quantum-sync protocols.
              </p>
              <div className="flex flex-wrap gap-4 md:gap-6">
                {['Twitter', 'Instagram', 'Github', 'Discord'].map((social, i) => (
                  <motion.a
                    key={social}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    href="#"
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all duration-300 group"
                  >
                    <span className="text-[10px] font-black tracking-widest uppercase group-hover:scale-110 block">
                      {social.substring(0, 2)}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6 md:space-y-8">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.4em]">Navigation</h4>
              <ul className="space-y-3 md:space-y-4">
                {['Explore', 'Pricing', 'API Docs', 'Status'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 hover:text-indigo-400 font-bold transition-colors duration-300 text-sm tracking-wide">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Support */}
            <div className="space-y-6 md:space-y-8">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.4em]">Support</h4>
              <ul className="space-y-3 md:space-y-4">
                {['Help Center', 'Security', 'Contact', 'Community'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 hover:text-indigo-400 font-bold transition-colors duration-300 text-sm tracking-wide">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-10 md:pt-20 border-t border-white/5 gap-8 md:gap-12">
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[10px] font-black text-gray-600 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-gray-600 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-center md:text-left"
            >
              © 2026 NEXORA SYSTEMS — <span className="text-indigo-500/50">ORBITAL_STATION_01</span>
            </motion.p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
