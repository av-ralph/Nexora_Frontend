import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import HeroSection from '../components/HeroSection';
import type { Movie as HeroMovie } from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import Scene from '../components/ThreeBackground';
import { fetchTrendingMovies, fetchPopularMovies, fetchTopRatedMovies, fetchUpcomingMovies, fetchTrendingTV, fetchPopularTV } from '../api/tmdb';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Menu } from 'lucide-react';
import heroBg from '../assets/BG1.gif';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Box, Typography, IconButton } from '@mui/material';

interface Movie {
  id: number;
  title: string;
  poster: string;
  rating: number;
  backdrop?: string;
  overview?: string;
  description?: string;
  imageUrl?: string;
  year?: string;
  genre?: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [trendingTV, setTrendingTV] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroMovies, setHeroMovies] = useState<HeroMovie[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/login');
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15,
      },
    },
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendingData, popularData, topRatedData, upcomingData, trendingTVData, popularTVData] = await Promise.all([
          fetchTrendingMovies(),
          fetchPopularMovies(),
          fetchTopRatedMovies(),
          fetchUpcomingMovies(),
          fetchTrendingTV(),
          fetchPopularTV(),
        ]);

        const formatMovies = (movies: any[]) =>
          movies.map((m) => ({
            id: m.id,
            title: m.title || m.name,
            poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
            rating: m.vote_average,
            backdrop: `https://image.tmdb.org/t/p/original${m.backdrop_path}`,
            overview: m.overview,
            year: (m.release_date || m.first_air_date || '').split('-')[0],
            genre: 'Action',
          }));

        const formattedTrending = formatMovies(trendingData).map(m => ({ ...m, mediaType: 'movie' as const }));
        const formattedPopular = formatMovies(popularData).map(m => ({ ...m, mediaType: 'movie' as const }));
        const formattedTopRated = formatMovies(topRatedData).map(m => ({ ...m, mediaType: 'movie' as const }));
        const formattedUpcoming = formatMovies(upcomingData).map(m => ({ ...m, mediaType: 'movie' as const }));
        const formattedTrendingTV = formatMovies(trendingTVData).map(m => ({ ...m, mediaType: 'tv' as const }));
        const formattedPopularTV = formatMovies(popularTVData).map(m => ({ ...m, mediaType: 'tv' as const }));

        setTrending(formattedTrending);
        setPopular(formattedPopular);
        setTopRated(formattedTopRated);
        setUpcoming(formattedUpcoming);
        setTrendingTV(formattedTrendingTV);
        setPopularTV(formattedPopularTV);

        if (formattedTrending.length > 0 || formattedTrendingTV.length > 0) {
          const allTrending = [
            ...formattedTrending.map(m => ({ ...m, type: 'movie' })),
            ...formattedTrendingTV.map(m => ({ ...m, type: 'tv' }))
          ];
          
          const shuffledHero = allTrending
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

          setHeroMovies(shuffledHero.map(m => ({
            ...m,
            description: m.overview || '',
            imageUrl: m.backdrop || m.poster,
            mediaType: m.mediaType
          })));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', color: 'white', overflowX: 'hidden', '&::selection': { bgcolor: 'rgba(99,102,241,0.3)' } }}>
      <motion.div 
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.8 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="fixed inset-0 -z-20 pointer-events-none overflow-hidden"
      >
        <motion.img 
          src={heroBg} 
          alt="Sci-fi Background"
          className="w-full h-full object-cover scale-110"
          animate={{ 
            scale: [1.1, 1.15, 1.1],
            x: [0, -20, 0],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <div className="absolute inset-0 bg-[#050510]/40 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/80 via-transparent to-[#050510]" />
      </motion.div>
      
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="fixed top-0 left-0 right-0 h-24 z-30 lg:hidden px-3 flex items-center justify-between" style={{ background: 'linear-gradient(to bottom, rgba(5,5,16,0.8), transparent)', pointerEvents: 'none' }}>
        <IconButton 
          onClick={() => setIsSidebarOpen(true)}
          sx={{ 
            p: 2, 
            bgcolor: 'rgba(255,255,255,0.05)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }
          }}
        >
          <Menu sx={{ fontSize: 24 }} />
        </IconButton>
        <div className="flex flex-row items-center gap-1.5">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <div className="w-5 h-5 bg-white rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">NEXORA</span>
        </div>
        <div className="w-12" />
      </div>

      <Scene />

      <Box component="main" className="flex-1 lg:pl-[280px]" sx={{ minWidth: 0, position: 'relative', zIndex: 10, overflow: 'visible' }}>
        <Box sx={{ px: { xs: 3, md: 6, lg: 8 }, py: { xs: 6, lg: 8 } }}>
          <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: { xs: 6, md: 12 }, overflow: 'visible' }}>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[80vh] flex flex-col items-center justify-center space-y-10"
              >
                <div className="relative">
                  <Loader2 className="w-20 h-20 animate-spin text-indigo-500" />
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute inset-0 blur-3xl bg-indigo-500/40"
                  />
                </div>
                <div className="flex flex-col items-center space-y-4 text-center px-6">
                  <motion.p 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[10px] tracking-[0.8em] text-indigo-400 font-black uppercase leading-relaxed"
                  >
                    SYNCING_NEURAL_INTERFACE...
                  </motion.p>
                  <div className="w-64 max-w-full h-[2px] bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ left: "-100%" }}
                      animate={{ left: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {heroMovies.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <HeroSection movies={heroMovies} />
                  </motion.div>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 6, md: 12 } }}>
                  <MovieRow title="Trending_Now" movies={trending} />
                  <MovieRow title="Trending_Series" movies={trendingTV} mediaType="tv" />
                  <MovieRow title="Popular_Hits" movies={popular} />
                  <MovieRow title="Popular_Shows" movies={popularTV} mediaType="tv" />
                  <MovieRow title="Recommended_Nodes" movies={upcoming} />
                  <MovieRow title="Top_Rated_OS" movies={topRated} />
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="border-t border-white/5 pt-4 pb-3 flex flex-col md:flex-row justify-between items-center gap-3 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex flex-row items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] tracking-[0.4em] text-gray-500 uppercase font-black">Core_System_Online</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/10 hidden md:block" />
              <span className="text-[10px] tracking-[0.4em] text-gray-600 uppercase font-black">Neural_Sync_v1.0.8</span>
            </div>
            <span className="text-[10px] tracking-[0.5em] text-gray-600 uppercase font-black">
              © 2026 NEXORA_OS
            </span>
          </footer>

          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;