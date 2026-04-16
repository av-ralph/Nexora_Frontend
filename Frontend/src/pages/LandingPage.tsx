import { Link, useNavigate } from 'react-router-dom';
import { Play, Zap, ArrowRight, PlayCircle, Sparkles, Monitor, Layers, Star, Menu, X } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useState, useEffect } from 'react';
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

  const y1 = useTransform(scrollY, [0, 500], [0, 80]);
  const opacityTransform = useTransform(scrollY, [0, 400], [1, 0.3]);
  const scaleTransform = useTransform(scrollY, [0, 400], [1, 0.97]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const dx = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { damping: 25, stiffness: 120 });
  const dy = useSpring(useTransform(mouseY, [-0.5, 0.5], [-15, 15]), { damping: 25, stiffness: 120 });

  const [scrolled, setScrolled] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleProtectedAction = (path: string) => {
    user ? navigate(path) : navigate('/login');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
        ].slice(0, 6);

        setMovies(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          mouseX.set(e.clientX / window.innerWidth - 0.5);
          mouseY.set(e.clientY / window.innerHeight - 0.5);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen text-white font-['Poppins'] overflow-x-hidden relative">

      {/* BACKGROUND */}
      <motion.div
        style={{ x: dx, y: dy }}
        className="fixed inset-0 -z-10"
      >
        <img src={heroBg} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDI3RkYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      </motion.div>

      {/* NAV */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-xl py-4 shadow-2xl' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
            <span className="text-xl font-black tracking-tighter">NEXORA</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#trending" className="text-sm text-gray-400 hover:text-white transition">Trending</a>
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition">Features</a>
            
            <div className="flex items-center gap-4">
              {user ? (
                <UserAvatar user={user} onSignOut={handleSignOut} />
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-gray-400 hover:text-white transition">Login</Link>
                  <Link to="/register" className="bg-white text-black px-5 py-2.5 rounded-xl font-medium hover:scale-105 transition">Sign Up</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl p-6 flex flex-col gap-4"
          >
            <a href="#trending" className="text-gray-400">Trending</a>
            <a href="#features" className="text-gray-400">Features</a>
            {user ? (
              <button onClick={handleSignOut} className="text-left text-gray-400">Sign Out</button>
            ) : (
              <>
                <Link to="/login" className="text-gray-400">Login</Link>
                <Link to="/register" className="bg-white text-black px-5 py-2.5 rounded-xl text-center">Sign Up</Link>
              </>
            )}
          </motion.div>
        )}
      </nav>

      {/* HERO */}
      <header className="pt-32 pb-20 text-center min-h-screen flex flex-col justify-center">
        <motion.div
          style={{ y: y1, opacity: opacityTransform, scale: scaleTransform }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">The Future of Cinema</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-black tracking-tight leading-none">
            STREAM <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-500">BEYOND</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-gray-400 text-lg max-w-xl mx-auto">
            Experience next-gen streaming powered by AI with zero latency and 12K clarity on any device.
          </motion.p>

          <motion.div variants={itemVariants} className="flex justify-center gap-4 pt-4">
            <Link to="/home" className="group bg-indigo-600 px-8 py-4 rounded-2xl flex gap-3 items-center font-medium hover:scale-105 active:scale-95 transition shadow-lg shadow-indigo-600/30">
              <Play fill="currentColor" className="w-5 h-5" />
              <span>ENTER NEXORA</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>

            <button onClick={() => handleProtectedAction('/reel')} className="border border-white/20 px-8 py-4 rounded-2xl font-medium hover:bg-white/10 hover:scale-105 active:scale-95 transition">
              <PlayCircle className="w-5 h-5 inline mr-2" />
              WATCH REEL
            </button>
          </motion.div>

          {/* Featured Movie */}
          {movies[0] && (
            <motion.div variants={itemVariants} className="mt-16 flex justify-center">
              <div className="flex items-center gap-5 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl hover:bg-white/10 transition cursor-pointer">
                <div className="relative">
                  <img src={movies[0].img} className="w-20 rounded-xl shadow-lg" alt={movies[0].title} />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Play fill="white" className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Featured</p>
                  <h3 className="font-bold text-lg">{movies[0].title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>{movies[0].year}</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {movies[0].rating}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
        >
          <div className="w-px h-16 bg-gradient-to-b from-indigo-500 to-transparent" />
          <span className="text-xs tracking-widest uppercase">Scroll</span>
        </motion.div>
      </header>

      {/* STATS */}
      <section className="py-12 border-y border-white/10 bg-black/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Neural Nodes', value: '4.2k' },
              { label: 'Global Cache', value: '128TB' },
              { label: 'Active Streams', value: '1.2M' },
              { label: 'Latency', value: '0.2ms' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-indigo-400">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs font-medium text-indigo-400 uppercase tracking-wider mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-6xl font-black">CORE PROTOCOLS</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Monitor, title: 'NATIVE 12K', desc: 'True pixel-perfect delivery on any device', color: 'from-blue-600 to-cyan-500' },
              { icon: Zap, title: 'QUANTUM SYNC', desc: 'Instant state sync across all your devices', color: 'from-amber-500 to-orange-600' },
              { icon: Layers, title: 'AI UPSCALING', desc: 'Neural networks enhance classic content', color: 'from-purple-600 to-pink-500' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -10 }}
                className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/[0.08] hover:border-indigo-500/30 transition"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-black mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MOVIES */}
      <section id="trending" className="py-20 px-6 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Discover</span>
              <h2 className="text-4xl font-black">TRENDING</h2>
            </div>
            <Link to="/Explore" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-white/10 animate-pulse rounded-xl" />
              ))
            ) : (
              movies.map((movie, i) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/${movie.mediaType}/${movie.id}`} className="block group">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
                      <img src={movie.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={movie.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="text-xs font-medium px-2 py-1 bg-indigo-600 rounded">{movie.mediaType}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium mt-2 line-clamp-1 group-hover:text-indigo-400 transition">{movie.title}</h3>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{movie.year}</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {movie.rating}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          <div className="md:hidden mt-8 text-center">
            <Link to="/Explore" className="inline-flex items-center gap-2 text-gray-400">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-xl font-black">NEXORA</span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <Link to="/Explore" className="hover:text-white transition">Explore</Link>
              <Link to="/login" className="hover:text-white transition">Login</Link>
              <Link to="/register" className="hover:text-white transition">Sign Up</Link>
            </div>

            <p className="text-xs text-gray-600">© 2026 NEXORA</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;