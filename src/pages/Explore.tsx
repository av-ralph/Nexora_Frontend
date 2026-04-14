import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Play, Star, Loader2, X, ChevronRight, SlidersHorizontal, Menu, Plus, Film, Tv } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchMovies, searchTV, fetchGenres, fetchMoviesByGenre, fetchTVByGenre, fetchTrendingMovies, fetchTrendingTV } from '../api/tmdb';
import Scene from '../components/ThreeBackground';
import Sidebar from '../components/Sidebar';
import heroBg from '../assets/BG1.gif';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
}

interface Genre {
  id: number;
  name: string;
}

const Explore = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Initial Load
  useEffect(() => {
    const initExplore = async () => {
      setLoading(true);
      try {
        const [genresData, trendingData] = await Promise.all([
          fetchGenres(),
          mediaType === 'movie' ? fetchTrendingMovies(1) : fetchTrendingTV(1)
        ]);
        setGenres(genresData);
        setMovies(trendingData);
        setPage(1);
        setHasMore(trendingData.length > 0);
      } catch (err) {
        console.error("Failed to initialize explore page:", err);
      } finally {
        setLoading(false);
      }
    };
    initExplore();
  }, [mediaType]);

  // Handle Search
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      const trending = mediaType === 'movie' ? await fetchTrendingMovies(1) : await fetchTrendingTV(1);
      setMovies(trending);
      setSelectedGenre(null);
      setPage(1);
      setHasMore(trending.length > 0);
      return;
    }
    
    setSearching(true);
    try {
      const results = mediaType === 'movie' 
        ? await searchMovies(searchQuery, 1) 
        : await searchTV(searchQuery, 1);
      setMovies(results);
      setSelectedGenre(null);
      setPage(1);
      setHasMore(results.length > 0);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  }, [mediaType]);

  // Handle Genre Selection
  const handleGenreSelect = async (genreId: number) => {
    if (selectedGenre === genreId) {
      const trending = mediaType === 'movie' ? await fetchTrendingMovies(1) : await fetchTrendingTV(1);
      setMovies(trending);
      setSelectedGenre(null);
      setPage(1);
      setHasMore(trending.length > 0);
      return;
    }

    setSearching(true);
    setSelectedGenre(genreId);
    setQuery('');
    try {
      const results = mediaType === 'movie' 
        ? await fetchMoviesByGenre(genreId, 1)
        : await fetchTVByGenre(genreId, 1);
      setMovies(results);
      setPage(1);
      setHasMore(results.length > 0);
    } catch (err) {
      console.error("Genre fetch failed:", err);
    } finally {
      setSearching(false);
    }
  };

  // Load More
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      let nextResults = [];
      if (query.trim()) {
        nextResults = mediaType === 'movie' 
          ? await searchMovies(query, nextPage)
          : await searchTV(query, nextPage);
      } else if (selectedGenre) {
        nextResults = mediaType === 'movie'
          ? await fetchMoviesByGenre(selectedGenre, nextPage)
          : await fetchTVByGenre(selectedGenre, nextPage);
      } else {
        nextResults = mediaType === 'movie'
          ? await fetchTrendingMovies(nextPage)
          : await fetchTrendingTV(nextPage);
      }

      if (nextResults.length === 0) {
        setHasMore(false);
      } else {
        setMovies(prev => [...prev, ...nextResults]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setLoadingMore(false);
    }
  };

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
    const timer = setTimeout(() => {
      if (query) handleSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

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

      {/* Cinematic Background Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-20">
        <motion.div 
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-full h-[50vh] bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent"
        />
      </div>
      

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
        <div className="w-12" />
      </div>

      <Scene />

      <main className="flex-1 lg:pl-[280px] min-w-0 relative z-10 transition-all duration-500">
        <div className="px-4 md:px-10 lg:px-16 py-10 lg:py-12">
          <div className="max-w-[1600px] mx-auto space-y-12 md:space-y-24">
          
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
              </motion.div>
            ) : (
              <motion.div
                key="content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-12 md:space-y-20 pt-20 lg:pt-0"
              >
                {/* Header Section */}
                <motion.header variants={itemVariants} className="mb-8 md:mb-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="relative">
                      <motion.h1 
                        initial={{ opacity: 0, x: -50, letterSpacing: "0.2em" }}
                        animate={{ opacity: 1, x: 0, letterSpacing: "-0.02em" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20"
                      >
                        Explore
                      </motion.h1>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="h-px w-full bg-gradient-to-r from-indigo-500 to-transparent origin-left mt-1"
                      />
                      <p className="text-indigo-400 text-[10px] md:text-xs font-black mt-3 tracking-[0.4em] uppercase">
                        Discover_Your_Next_Story
                      </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group max-w-xl w-full">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative"
                      >
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors z-10">
                          <Search size={20} />
                        </div>
                        <input
                          type="text"
                          placeholder="Search movies, actors, genres..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 backdrop-blur-2xl transition-all placeholder:text-gray-600 text-sm font-medium shadow-2xl relative z-0"
                        />
                        {query && (
                          <button
                            onClick={() => setQuery('')}
                            className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-white transition-colors z-10"
                          >
                            <X size={20} />
                          </button>
                        )}
                        {/* Search Bar Glow Effect */}
                        <div className="absolute inset-0 bg-indigo-500/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl -z-10" />
                      </motion.div>
                    </div>
                  </div>
                </motion.header>

                {/* Genres Filter */}
                <motion.div variants={itemVariants} className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Media Type Toggle */}
                    <div className="flex p-1.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shrink-0">
                      <button
                        onClick={() => setMediaType('movie')}
                        className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                          mediaType === 'movie' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                            : 'text-gray-500 hover:text-white'
                        }`}
                      >
                        <Film size={14} />
                        <span>Movies</span>
                      </button>
                      <button
                        onClick={() => setMediaType('tv')}
                        className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                          mediaType === 'tv' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                            : 'text-gray-500 hover:text-white'
                        }`}
                      >
                        <Tv size={14} />
                        <span>TV Shows</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide no-scrollbar flex-1">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shrink-0 text-indigo-400 cursor-default"
                      >
                        <SlidersHorizontal size={14} />
                        <span>Genres</span>
                      </motion.div>
                      {genres.map((genre) => (
                        <motion.button
                          key={genre.id}
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleGenreSelect(genre.id)}
                          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all shrink-0 ${
                            selectedGenre === genre.id
                              ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.2)]'
                              : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {genre.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Results Grid */}
                <motion.div variants={itemVariants} className="min-h-[50vh]">
                  {searching ? (
                    <div className="flex items-center justify-center py-32">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                        <motion.div 
                          animate={{ opacity: [0.2, 0.5, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute inset-0 bg-indigo-500 blur-xl rounded-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <motion.div 
                        layout
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8"
                      >
                        <AnimatePresence mode="popLayout">
                          {movies.map((movie, index) => (
                            <motion.div
                              key={movie.id}
                              layout
                              initial={{ opacity: 0, scale: 0.9, y: 30 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 20 }}
                              transition={{ 
                                delay: (index % 12) * 0.05,
                                type: "spring",
                                stiffness: 80,
                                damping: 12
                              }}
                              className="group relative"
                            >
                              <Link to={`/${mediaType}/${movie.id}`}>
                                <motion.div 
                                  whileHover={{ y: -10 }}
                                  className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-500 group-hover:border-indigo-500/50 group-hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.4)] relative"
                                >
                                  {movie.poster_path ? (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                      alt={movie.title}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700 uppercase font-black text-[10px] tracking-tighter p-4 text-center">
                                      NO_IMAGE_DATA
                                    </div>
                                  )}
                                  
                                  {/* Cinematic Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
                                    <motion.div 
                                      initial={{ y: 20, opacity: 0 }}
                                      whileHover={{ y: 0, opacity: 1 }}
                                      transition={{ duration: 0.3 }}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center gap-2 text-indigo-400">
                                        <Star size={12} fill="currentColor" />
                                        <span className="text-xs font-black tracking-tighter">{(movie.vote_average || 0).toFixed(1)}</span>
                                      </div>
                                      <h3 className="text-xs font-black uppercase tracking-tighter leading-tight line-clamp-2 text-white">
                                        {movie.title}
                                      </h3>
                                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          whileHover={{ width: "100%" }}
                                          transition={{ duration: 0.5 }}
                                          className="h-full bg-indigo-500"
                                        />
                                      </div>
                                    </motion.div>
                                  </div>

                                  {/* Corner Accent */}
                                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute top-[-8px] right-[-8px] w-4 h-4 bg-indigo-500 rotate-45" />
                                  </div>
                                </motion.div>
                              </Link>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>

                      {movies.length === 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-32"
                        >
                          <p className="text-indigo-400/40 font-black uppercase tracking-[0.6em] text-xs">NO_RESULTS_FOUND</p>
                          <button 
                            onClick={() => { setQuery(''); setSelectedGenre(null); handleSearch(''); }}
                            className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all shadow-xl"
                          >
                            RESET_INTERFACE
                          </button>
                        </motion.div>
                      )}

                      {/* Load More Button */}
                      {hasMore && movies.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-center mt-16 pb-12"
                        >
                          <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(79, 70, 229, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="group relative px-12 py-4 bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all"
                          >
                            <div className="relative z-10 flex items-center gap-3">
                              {loadingMore ? (
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                              ) : (
                                <Plus className="w-4 h-4 text-indigo-500 group-hover:rotate-90 transition-transform duration-300" />
                              )}
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-white transition-colors">
                                {loadingMore ? "SYNCING_DATA..." : "LOAD_MORE_RESULTS"}
                              </span>
                            </div>
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.button>
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  </div>
);
};

export default Explore;