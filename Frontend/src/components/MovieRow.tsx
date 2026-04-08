import { Star, Play, Info, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { fetchGenres } from '../api/tmdb';
import { supabase } from '../lib/supabase';

/**
 * Enhanced Movie Interface
 * Supports both raw TMDB data and formatted data from Home.tsx
 */
interface Movie {
  id: number;
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
  genre_ids?: number[];
  overview?: string;
  // Backward compatibility fields
  poster?: string;
  rating?: number;
  year?: string;
  genre?: string;
  description?: string;
}

interface MovieRowProps {
  title: string;
  movies: Movie[];
  isLoading?: boolean;
  mediaType?: 'movie' | 'tv';
}

// Global genre cache to avoid repeated API calls
let genreCache: { [key: number]: string } = {};

/**
 * Animation Variants
 */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14
    }
  },
};

const MovieRow = ({ title, movies = [], isLoading = false, mediaType = 'movie' }: MovieRowProps) => {
  // --- STATE ---
  const [genres, setGenres] = useState<{ [key: number]: string }>(genreCache);
  const [savedMovies, setSavedMovies] = useState<number[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const rowRef = useRef<HTMLDivElement>(null);

  // --- FETCH GENRES ---
  useEffect(() => {
    if (Object.keys(genreCache).length > 0) return;
    
    const loadGenres = async () => {
      try {
        const genreList = await fetchGenres();
        const mapped = genreList.reduce((acc: any, g: any) => ({ ...acc, [g.id]: g.name }), {});
        genreCache = mapped;
        setGenres(mapped);
      } catch (err) {
        console.error("Failed to fetch genres:", err);
      }
    };
    loadGenres();
  }, []);

  // --- FETCH FAVORITES FROM SUPABASE ---
  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('movie_id')
        .eq('user_id', session.user.id);

      if (!error && data) {
        setSavedMovies(data.map(f => f.movie_id));
      }
    };
    fetchFavorites();
  }, []);

  // --- SCROLL LOGIC ---
  const checkScroll = useCallback(() => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const row = rowRef.current;
    if (row) {
      row.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        row.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll, movies.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const amount = window.innerWidth * 0.8;
      rowRef.current.scrollBy({ 
        left: direction === 'left' ? -amount : amount, 
        behavior: 'smooth' 
      });
    }
  };

  // --- DRAG TO SCROLL ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!rowRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - rowRef.current.offsetLeft);
    setScrollLeftState(rowRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    rowRef.current.scrollLeft = scrollLeftState - walk;
  };

  const stopDragging = () => setIsDragging(false);

  // --- ACTIONS ---
  const toggleSave = useCallback(async (movie: Movie) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const isSaved = savedMovies.includes(movie.id);

    try {
      if (isSaved) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('movie_id', movie.id);
        
        setSavedMovies(prev => prev.filter(id => id !== movie.id));
        setNotification("REMOVED_FROM_FAVORITES");
      } else {
        await supabase.from('favorites').insert({
          user_id: session.user.id,
          movie_id: movie.id,
          movie_title: movie.title,
          movie_poster: movie.poster_path || movie.poster
        });
        
        setSavedMovies(prev => [...prev, movie.id]);
        setNotification("ADDED_TO_FAVORITES");
      }
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setNotification("SYNC_ERROR_DETECTED");
      setTimeout(() => setNotification(null), 3000);
    }
  }, [savedMovies]);

  // --- VALIDATIONS ---
  const validMovies = useMemo(() => 
    movies.filter(m => m && m.id && m.title && (m.poster_path || m.backdrop_path || m.poster)),
  [movies]);

  if (!isLoading && validMovies.length === 0) return null;

  return (
    <section 
      className="group/row space-y-4 px-4 md:px-10 lg:px-16 py-6 overflow-visible relative select-none"
      onMouseEnter={() => setHoveredRow(true)}
      onMouseLeave={() => {
        setHoveredRow(false);
        setHoveredId(null);
      }}
    >
      {/* System Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-8 right-8 z-[200] bg-indigo-600/90 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-[0_0_50px_rgba(79,70,229,0.3)] flex items-center space-x-3"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-white">
              {notification}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className="flex justify-between items-end border-b border-white/5 pb-4">
        <div className="space-y-1.5">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl flex items-center gap-3"
          >
            <span className="w-1.5 h-8 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
            {title}
          </motion.h2>
        </div>
        <Link 
          to="/explore" 
          className="group/link text-[10px] font-black tracking-[0.2em] text-gray-500 hover:text-indigo-400 uppercase transition-all flex items-center gap-2"
        >
          VIEW_ALL
          <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </header>

      {/* NAVIGATION CONTROLS */}
      <AnimatePresence>
        {hoveredRow && !isDragging && (
          <>
            {showLeftArrow && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                onClick={() => scroll('left')}
                className="absolute left-2 md:left-6 top-[55%] -translate-y-1/2 bg-black/60 hover:bg-indigo-600 backdrop-blur-2xl text-white p-4 rounded-full border border-white/10 z-[60] transition-all shadow-3xl active:scale-90 group/btn"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={28} className="group-hover/btn:-translate-x-0.5 transition-transform" />
              </motion.button>
            )}

            {showRightArrow && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                onClick={() => scroll('right')}
                className="absolute right-2 md:right-6 top-[55%] -translate-y-1/2 bg-black/60 hover:bg-indigo-600 backdrop-blur-2xl text-white p-4 rounded-full border border-white/10 z-[60] transition-all shadow-3xl active:scale-90 group/btn"
                aria-label="Scroll Right"
              >
                <ChevronRight size={28} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </motion.button>
            )}
          </>
        )}
      </AnimatePresence>

      {/* MOVIE CAROUSEL */}
      <div className="relative -mx-4 md:-mx-10 lg:-mx-16 px-4 md:px-10 lg:px-16 overflow-visible">
        <motion.div
          ref={rowRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          className={`flex gap-4 md:gap-6 w-full overflow-x-auto overflow-y-visible pb-10 pr-[100px] scroll-smooth custom-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
        >
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="w-[220px] h-[330px] bg-white/5 rounded-2xl animate-pulse border border-white/5" />
            ))
          ) : (
            validMovies.map((movie, index) => {
              const isSaved = savedMovies.includes(movie.id);
              const isHovered = hoveredId === movie.id;
              const isNearRightEdge = index >= validMovies.length - 2;
              
              // Resolve image path
              const poster = movie.poster || 
                            (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null) || 
                            (movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : null);

              // Resolve metadata
              const rating = movie.vote_average || movie.rating;
              const year = (movie.release_date ? movie.release_date.split('-')[0] : null) || movie.year || '2024';
              const overview = movie.overview || movie.description || 'Experience a world of breathtaking visuals and compelling storytelling.';
              const primaryGenre = (movie.genre_ids && movie.genre_ids.length > 0 ? genres[movie.genre_ids[0]] : null) || movie.genre || 'DRAMA';

              return (
                <motion.div
                  key={movie.id}
                  variants={itemVariants}
                  onHoverStart={() => !isDragging && setHoveredId(movie.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  className="relative flex-shrink-0"
                >
                  <motion.div
                    animate={{
                      width: isHovered ? 440 : 220,
                      x: isHovered && isNearRightEdge ? -220 : 0,
                      scale: isHovered ? 1.05 : 1,
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                    }}
                    className={`relative h-[330px] bg-[#050510] rounded-2xl overflow-hidden shadow-2xl border transition-all duration-500 ${isHovered ? 'border-indigo-500/60 shadow-indigo-500/20 z-50' : 'border-white/5 z-10'}`}
                  >
                    {/* POSTER PART */}
                    <div className="absolute left-0 top-0 h-full w-[220px] overflow-hidden group/poster">
                      <Link to={`/${mediaType}/${movie.id}`} className="block w-full h-full">
                        <img
                          src={poster || '/fallback.jpg'}
                          alt={movie.title}
                          loading="lazy"
                          className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${isHovered ? 'scale-110 blur-[2px]' : 'scale-100'}`}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-90' : 'opacity-40'}`} />
                      </Link>

                      <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
                        <div className="bg-black/60 backdrop-blur-xl px-2.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-2xl">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-[11px] font-black text-white leading-none tracking-tighter">
                            {rating ? rating.toFixed(1) : 'TBA'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED CONTENT PANEL */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
                          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute top-0 left-[220px] h-full w-[220px] p-6 flex flex-col justify-between bg-gradient-to-br from-[#050510] via-[#050510]/98 to-[#0a0a1a] backdrop-blur-3xl border-l border-white/5"
                        >
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <h3 className="text-white font-black text-base leading-tight uppercase tracking-tight italic line-clamp-2">
                                {movie.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-[9px] font-black text-indigo-400 tracking-[0.2em] uppercase">
                                <span className="px-1.5 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                                  {year}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-indigo-500/40" />
                                <span className="line-clamp-1">{primaryGenre}</span>
                              </div>
                            </div>
                            
                            <p className="text-[11px] text-gray-400 line-clamp-4 leading-relaxed font-medium tracking-wide">
                              {overview}
                            </p>
                          </div>

                          <div className="flex flex-col gap-3">
                            <Link 
                              to={`/${mediaType}/${movie.id}`} 
                              className="w-full flex items-center justify-center gap-3 py-3 bg-white text-black rounded-xl font-black text-[10px] tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5 hover:shadow-indigo-500/40"
                            >
                              <Play size={14} fill="currentColor" />
                              PLAY_NOW
                            </Link>

                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleSave(movie);
                                }}
                                title={isSaved ? "Remove from List" : "Add to List"}
                                className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border transition-all active:scale-90 ${
                                  isSaved
                                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                }`}
                              >
                                {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                              </button>

                              <Link 
                                to={`/${mediaType}/${movie.id}`} 
                                title="More Info"
                                className="flex-1 flex items-center justify-center py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all active:scale-90"
                              >
                                <Info size={18} />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { 
          height: 12px; 
          display: block !important;
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: rgba(255,255,255,0.05); 
          border-radius: 999px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: linear-gradient(to right, #6366f1, #3b82f6); 
          border-radius: 999px; 
          border: 2px solid #050510;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: linear-gradient(to right, #818cf8, #60a5fa); 
        }
      `}</style>
    </section>
  );
};

export default MovieRow;
