import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import HeroSection from '../components/HeroSection';
import type { Movie as HeroMovie } from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import Scene from '../components/ThreeBackground';
import { fetchTrendingMovies, fetchPopularMovies, fetchTopRatedMovies, fetchUpcomingMovies, fetchTrendingTV, fetchPopularTV } from '../api/tmdb';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Menu, X } from 'lucide-react';
import heroBg from '../assets/BG1.gif';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';



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
        await supabase.auth.signOut(); // Clear any stale local data
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

  // Animation Variants
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
            genre: 'Action', // Simplified for now
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
          // Mix trending movies and TV shows for hero section with higher randomness
          const allTrending = [
            ...formattedTrending.map(m => ({ ...m, type: 'movie' })),
            ...formattedTrendingTV.map(m => ({ ...m, type: 'tv' }))
          ];
          
          // Shuffle and pick 5
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
    <div className="flex min-h-screen text-white overflow-x-hidden selection:bg-indigo-500/30">

      {/* Background Image Layer */}
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
        {/* Subtle texture overlay for cinematic feel */}
        <div className="absolute inset-0 bg-[#050510]/40 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/80 via-transparent to-[#050510]" />
      </motion.div>
      
      {/* Sidebar Overlay for Mobile */}
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

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-24 px-6 flex items-center justify-between z-30 lg:hidden bg-gradient-to-b from-[#050510]/80 to-transparent pointer-events-none backdrop-blur-sm">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl text-white pointer-events-auto active:scale-90 transition-all hover:bg-white/10 hover:border-white/20 shadow-xl"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <div className="w-5 h-5 bg-white rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">NEXORA</span>
        </div>
        <div className="w-12" /> {/* Spacer to balance the layout */}
      </div>

      {/* Background */}
      <Scene />

      {/* Main Content */}
      <main className="flex-1 lg:pl-[280px] min-w-0 relative z-10 overflow-visible">
        <div className="px-4 md:px-10 lg:px-16 py-10 lg:py-12">
          <div className="max-w-[1600px] mx-auto space-y-12 md:space-y-24 overflow-visible">

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
                className="space-y-16 md:space-y-32"
              >
                {heroMovies.length > 0 && (
                  <motion.div variants={itemVariants} className="pt-20 lg:pt-0">
                    <HeroSection movies={heroMovies} />
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="space-y-16 md:space-y-32">
                  <MovieRow title="Trending_Now" movies={trending} />
                  <MovieRow title="Trending_Series" movies={trendingTV} mediaType="tv" />
                  <MovieRow title="Popular_Hits" movies={popular} />
                  <MovieRow title="Popular_Shows" movies={popularTV} mediaType="tv" />
                  <MovieRow title="Recommended_Nodes" movies={upcoming} />
                  <MovieRow title="Top_Rated_OS" movies={topRated} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <footer className="border-t border-white/5 pt-16 pb-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-[10px] tracking-[0.4em] text-gray-500 uppercase font-black">Core_System_Online</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/10 hidden md:block" />
              <div className="flex items-center gap-3">
                <span className="text-[10px] tracking-[0.4em] text-gray-600 uppercase font-black">Neural_Sync_v1.0.8</span>
              </div>
            </div>
            <p className="text-[10px] tracking-[0.5em] text-gray-600 uppercase font-black">
              © 2026 NEXORA_OS
            </p>
          </footer>
        </div>
      </div>
    </main>
  </div>
);
};

export default Home;