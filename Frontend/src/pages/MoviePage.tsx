import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Film, Globe, Users, Loader2, ChevronRight, Download, History, Search, User, Bookmark, Share2, X } from 'lucide-react';
import { fetchMovieDetails, fetchMovieCast, fetchExternalIds, fetchMovieVideos, fetchSimilarMovies } from '../api/tmdb';
import { supabase } from '../lib/supabase';
import Scene from '../components/ThreeBackground';
import ReviewSection from '../components/ReviewSection';
import ShareModal from '../components/ShareModal';
import { useSocial } from '../context/SocialContext';
import { createRoom } from '../services/watchPartyService';
import { getPreviewMetadata } from '../services/shareService';

interface MovieDetail {
  id: number;
  title: string;
  backdrop_path: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  production_companies: { id: number; logo_path: string; name: string; origin_country: string }[];
  tagline: string;
  imdb_id?: string;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

interface VideoItem {
  id: string;
  type: string;
  site: string;
  key: string;
}

interface SimilarMovie {
  id: number;
  title: string;
  poster_path: string | null;
}

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const castRef = useRef<HTMLDivElement>(null);
  const similarRef = useRef<HTMLDivElement>(null);
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const social = useSocial();
  const [isPlaying, setIsPlaying] = useState(false);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPartyLoading, setIsPartyLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState<{ averageRating: number; totalReviews: number }>({
    averageRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    if (!movie) {
      setReviewStats({ averageRating: 0, totalReviews: 0 });
      return;
    }

    let isCancelled = false;

    const loadReviewStats = async () => {
      try {
        const stats = await social.getMovieStats(movie.id);
        if (!isCancelled) {
          setReviewStats(stats || { averageRating: 0, totalReviews: 0 });
        }
      } catch (err) {
        console.error('Failed to load review stats:', err);
      }
    };

    loadReviewStats();

    return () => {
      isCancelled = true;
    };
  }, [movie, social]);

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }

      try {
        const movieData = await fetchMovieDetails(parseInt(id));
        setMovie(movieData);
        
        // Fetch external IDs to get IMDb ID
        const externalIds = await fetchExternalIds(parseInt(id));
        setImdbId(externalIds.imdb_id);
        
        const castData = await fetchMovieCast(parseInt(id));
        setCast(castData.slice(0, 10)); // Limit to top 10 cast members

        // Fetch and filter for a YouTube trailer
        const videoData = await fetchMovieVideos(parseInt(id)) as VideoItem[];
        const trailer = videoData?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
        setTrailerKey(trailer ? trailer.key : null);

        // Fetch similar movies
        const similarData = await fetchSimilarMovies(parseInt(id));
        setSimilarMovies(similarData.slice(0, 12));

        // Check if bookmarked
        const { data: favorite, error: favoriteError } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('movie_id', parseInt(id))
          .maybeSingle();

        if (favoriteError) {
          console.error('Error checking favorites:', favoriteError);
          setIsBookmarked(false);
        } else {
          setIsBookmarked(!!favorite);
        }
      } catch (err) {
        console.error("Failed to fetch movie details:", err);
        setError("Failed to load movie details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [id, navigate]);

  useEffect(() => {
    const recordHistory = async () => {
      if (isPlaying && movie) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
          await supabase.from('watch_history').upsert({
            user_id: session.user.id,
            movie_id: movie.id,
            movie_title: movie.title,
            movie_poster: movie.poster_path,
            media_type: 'movie',
            watched_at: new Date().toISOString()
          }, { onConflict: 'user_id,movie_id' });
        } catch (err) {
          console.error("Failed to record watch history:", err);
        }
      }
    };
    recordHistory();
  }, [isPlaying, movie]);

  const toggleBookmark = async () => {
    if (!movie) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      if (isBookmarked) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('movie_id', movie.id);
      } else {
        await supabase.from('favorites').insert({
          user_id: session.user.id,
          movie_id: movie.id,
          movie_title: movie.title,
          movie_poster: movie.poster_path,
          media_type: 'movie'
        });
      }
      
      setNotification(isBookmarked ? "REMOVED_FROM_FAVORITES" : "ADDED_TO_FAVORITES");
      setIsBookmarked(!isBookmarked);
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      setNotification("SYNC_ERROR_DETECTED");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#050510] text-white items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex min-h-screen bg-[#050510] text-white items-center justify-center p-6 text-center">
        <p className="text-red-500 text-lg">{error || "Movie not found."}</p>
      </div>
    );
  }

  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const runtimeHours = Math.floor(movie.runtime / 60);
  const runtimeMinutes = movie.runtime % 60;
  const formattedRuntime = movie.runtime ? `${runtimeHours}h ${runtimeMinutes}m` : 'N/A';
  const country = movie.production_countries.length > 0 ? movie.production_countries[0].name : 'N/A';
  const studio = movie.production_companies.length > 0 ? movie.production_companies[0].name : 'N/A';

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden selection:bg-indigo-500/30 font-sans relative">
      {/* System Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
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

      {/* Movie Player Modal */}
      <AnimatePresence>
        {isPlaying && imdbId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          >
            <div className="p-4 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/5">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Play size={16} fill="white" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-widest">{movie.title}</h2>
              </div>
              <button 
                onClick={() => setIsPlaying(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 relative bg-black">
              <iframe
                src={`https://vidsrc-embed.ru/embed/movie/${imdbId}`}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            </div>

            {/* Player Footer */}
            <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5 flex justify-center">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.5em]">Secure_Streaming_Active</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trailer Player Modal */}
      <AnimatePresence>
        {isTrailerOpen && trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTrailerOpen(false)}
            className="fixed inset-0 z-[120] bg-[#050510]/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotateX: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl aspect-video bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(79,70,229,0.3)] relative"
            >
              <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Trailer_Preview // {movie.title}</span>
                </div>
                <button 
                  onClick={() => setIsTrailerOpen(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&modestbranding=1&rel=0`}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About System Info Modal */}
      <AnimatePresence>
        {isAboutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAboutOpen(false)}
            className="fixed inset-0 z-[110] bg-[#050510]/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
              {/* Scanning Line Effect */}
              <motion.div 
                animate={{ y: ["0%", "1000%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-px bg-indigo-500/30 z-0"
              />

              <div className="p-8 md:p-12 relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-2">
                      System_Info
                    </h2>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Data_Extraction_Complete</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAboutOpen(false)}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Log_Entry: {movie.title}</h3>
                    {movie.tagline && (
                      <p className="text-xl md:text-2xl font-bold italic text-indigo-100/90 leading-tight border-l-2 border-indigo-600 pl-6">
                        "{movie.tagline}"
                      </p>
                    )}
                    <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed">
                      {movie.overview}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                    {[
                      { label: 'Classification', value: movie.genres.map(g => g.name).slice(0, 2).join(' / ') },
                      { label: 'Origin_ID', value: imdbId || 'N/A' },
                      { label: 'Duration', value: formattedRuntime },
                      { label: 'Production', value: studio },
                    ].map((stat, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xs font-bold text-white uppercase">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center opacity-40"
        />
        {/* Cinematic Overlays: Gradient for readability, but keeping the image clear */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/60 to-[#050510]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050510] via-transparent to-transparent" />
      </div>

      <Scene />

      {/* Main Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col p-4 md:p-8 lg:p-12">
        
        {/* Top Section */}
        <div className="flex justify-between items-start relative z-20 w-full">
          {/* Movie Title - Top Left */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-none tracking-tighter uppercase drop-shadow-[0_10px_50px_rgba(0,0,0,1)] relative z-10 pointer-events-none select-none max-w-[250px] md:max-w-xs">
            {movie.title.split(':').map((part, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, x: -50, rotate: -2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ delay: 0.2 + (i * 0.1), duration: 0.6, ease: "easeOut" }}
                className="block"
              >
                {part.trim()}{i === 0 && movie.title.includes(':') ? ':' : ''}
              </motion.span>
            ))}
          </h1>

          {/* Breadcrumbs - Top Center */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-1 md:space-x-2 text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-4 md:pt-0">
            {[
              { label: 'Main', link: '/' },
              { label: 'Films', link: '/Explore' },
              { label: 'Nexora', link: '/Home' },
              { label: movie.title, active: true }
            ].map((crumb, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                className="flex items-center space-x-1 md:space-x-2"
              >
                {i > 0 && <ChevronRight size={10} className="text-gray-600" />}
                {crumb.link ? (
                  <Link to={crumb.link} className="hover:text-white transition-colors">{crumb.label}</Link>
                ) : (
                  <span className={`${crumb.active ? 'text-white' : 'hover:text-white transition-colors cursor-pointer'} line-clamp-1`}>{crumb.label}</span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Top Right Description */}
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-xs md:max-w-sm md:text-right space-y-2 md:space-y-4 ml-auto"
          >
            <p className="text-[10px] md:text-xs text-gray-300 leading-relaxed font-medium line-clamp-3 hover:text-white transition-colors cursor-default">
              {movie.overview}
            </p>
            <motion.div 
              whileHover={{ scale: 1.05, backgroundColor: "#4f46e5" }}
              className="inline-flex items-center space-x-1 md:space-x-2 bg-indigo-600 text-black px-2 md:px-4 py-1 md:py-1.5 rounded-full font-black text-[8px] md:text-[10px] tracking-tighter cursor-pointer"
            >
              <span className="uppercase italic">NEXORA</span>
              <span>{(movie.vote_average || 0).toFixed(1)}</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Middle Section: Info, Play Button, and Actions */}
        <div className="flex-1 min-h-[60vh] md:flex-row justify-start md:justify-between relative">
          
          {/* Left Floating Info Bar */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-y-2 md:gap-y-4 z-20">
            {[
              { label: 'Country:', value: country.split(',')[0], more: country.includes(',') },
              { label: 'Studio:', value: studio },
              { label: 'Time:', value: formattedRuntime },
              { label: 'Year:', value: releaseYear },
              { label: 'Date:', value: movie.release_date },
              { label: 'Rate:', value: '13+' }
            ].map((info, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + (i * 0.1), duration: 0.5 }}
                className="flex items-center space-x-2 md:space-x-4 group"
              >
                <span className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest w-12 md:w-16 group-hover:text-gray-400 transition-colors">{info.label}</span>
                <div className="flex gap-1 md:gap-2">
                  <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/5 border border-white/10 rounded-full text-[8px] md:text-[10px] font-bold group-hover:bg-white/10 group-hover:border-white/20 transition-all truncate max-w-[80px] md:max-w-[150px]">
                    {info.value}
                  </span>
                  {info.more && (
                    <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/5 border border-white/10 rounded-full text-[8px] md:text-[10px] font-bold group-hover:bg-white/10 transition-all">More</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Play Button - Centered in view or absolute middle */}


          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => imdbId && setIsPlaying(true)}
              disabled={!imdbId}
              className={`w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center group transition-all ${imdbId ? 'hover:bg-white/30 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]' : 'opacity-50 cursor-not-allowed'}`}
            >
              <Play fill="white" size={32} className="md:w-10 md:h-10 translate-x-1" />
            </motion.button>
          </div>

          {/* Right Floating Actions Bar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="hidden md:flex flex-col gap-1 md:gap-2 bg-black/40 backdrop-blur-2xl p-1 md:p-2 rounded-xl md:rounded-2xl border border-white/10 absolute right-0 top-1/2 -translate-y-1/2"
          >
            <button className="p-2 md:p-3 hover:bg-white/10 rounded-lg md:rounded-xl transition-all text-gray-400 hover:text-white">
              <Download size={16} />
            </button>
            <button className="p-2 md:p-3 hover:bg-white/10 rounded-lg md:rounded-xl transition-all text-gray-400 hover:text-white relative">
              <History size={16} />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-500 rounded-full" />
            </button>
            <button 
              onClick={() => imdbId && setIsPlaying(true)}
              className="p-2 md:p-3 hover:bg-white/10 rounded-lg md:rounded-xl transition-all text-gray-400 hover:text-white"
            >
              <Play size={16} />
            </button>
          </motion.div>
        </div>

      </div>

      <ReviewSection movieId={movie.id} movieTitle={movie.title} />

      <div className="relative z-10 mt-10 px-4 md:px-12 lg:px-24">
        <div className="rounded-[2rem] border border-white/10 bg-[#090a15]/85 backdrop-blur-2xl p-6 shadow-[0_30px_80px_rgba(8,15,40,0.55)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.35em] text-indigo-400/80">Community Control</p>
              <p className="max-w-2xl text-sm text-gray-300">Continue the experience after reviews — start a watch party with friends, share the mood, or save it for later.</p>
            </div>
            <div className="flex flex-wrap justify-start gap-3">
              <button
                type="button"
                onClick={async () => {
                  setIsPartyLoading(true);
                  const { data } = await supabase.auth.getSession();
                  if (!data.session) {
                    navigate('/login');
                    return;
                  }
                  const room = await createRoom(
                    {
                      id: data.session.user.id,
                      name: data.session.user.email?.split('@')[0] ?? 'Nexora',
                    },
                    {
                      mediaTitle: movie.title,
                      mediaPoster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
                    },
                  );
                  setIsPartyLoading(false);
                  navigate(`/watch/${room.roomId}`);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-black transition-all hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Users size={16} /> {isPartyLoading ? 'Opening...' : 'Watch Party'}
              </button>
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white/15"
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
              <span className="font-black text-white">{Number.isFinite(reviewStats.averageRating) ? reviewStats.averageRating.toFixed(1) : '0.0'}</span>
              <span className="text-gray-500">⭐</span>
              <span>{reviewStats.totalReviews} reviews</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={toggleBookmark}
                className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] transition-all ${isBookmarked ? 'text-indigo-400 border-indigo-400/30 bg-indigo-500/10' : 'text-white hover:bg-white/10'}`}
              >
                <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                {isBookmarked ? 'Bookmarked' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/Explore')}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white/15"
              >
                <Search size={16} /> Explore
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div ref={castRef} className="relative z-10 mt-32 px-4 md:px-12 lg:px-24 pb-48">
        <div className="flex items-center space-x-4 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/50" />
          <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">Featured_Cast</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/50" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4 md:gap-6">
          {cast.map((member, index) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 10) * 0.05 }}
              className="group text-center"
            >
              <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 mb-3 grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:border-indigo-500/50 shadow-2xl">
                {member.profile_path ? (
                  <img src={`https://image.tmdb.org/t/p/w185${member.profile_path}`} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center text-[8px] font-black text-gray-600">NO_DATA</div>
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-tighter line-clamp-1 text-white group-hover:text-indigo-400 transition-colors">{member.name}</p>
              <p className="text-[8px] text-gray-500 uppercase font-bold truncate">{member.character}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Similar Movies Section */}
      <div ref={similarRef} className="relative z-10 px-4 md:px-12 lg:px-24 pb-48">
        <div className="flex items-center space-x-4 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/50" />
          <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">Related_Nodes</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/50" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {similarMovies.map((m, index) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                navigate(`/movie/${m.id}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer relative aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 transition-all duration-500 hover:border-indigo-500/50 hover:shadow-[0_0_50px_rgba(79,70,229,0.2)]"
            >
              {m.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} 
                  alt={m.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-700">NULL_DATA</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                <p className="text-[10px] font-black uppercase italic tracking-tighter text-white leading-tight line-clamp-2">{m.title}</p>
                <div className="w-0 h-0.5 bg-indigo-500 mt-2 group-hover:w-full transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        metadata={getPreviewMetadata(
          movie.title,
          `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          movie.overview,
        )}
      />

      {/* Bottom Center Bar - Cinematic UI */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 max-w-xl w-[90%] z-[9999]"
      >
        <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-xl md:rounded-2xl flex items-center overflow-hidden">
          <div className="bg-indigo-600 p-3 md:p-4 text-black font-black text-[8px] md:text-xs uppercase italic tracking-tighter h-full flex items-center">
            NEXORA
          </div>
          <div className="flex-1 flex items-center justify-around px-2 md:px-6">
            {[
              { label: 'Menu', icon: Globe, action: () => navigate('/home') },
              { label: 'Actors', icon: Users, action: () => castRef.current?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'About', icon: Info, action: () => setIsAboutOpen(true) },
              { label: 'Similar', icon: Film, action: () => similarRef.current?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'Trailers', icon: Play, action: () => trailerKey && setIsTrailerOpen(true) },
            ].map((item, i) => (
              <motion.button
                key={i}
                onClick={() => item.action && item.action()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (i * 0.1), duration: 0.4 }}
                whileHover={{ scale: 1.1, y: -2 }}
                disabled={item.label === 'Trailers' && !trailerKey}
                className={`flex flex-col items-center group py-2 md:py-3 relative ${item.label === 'Trailers' && !trailerKey ? 'opacity-20 cursor-not-allowed' : ''}`}
              >
                <span className={`text-[6px] md:text-[8px] font-bold text-gray-500 uppercase tracking-[0.1em] md:tracking-[0.2em] transition-colors ${item.label === 'Trailers' && !trailerKey ? '' : 'group-hover:text-indigo-400'}`}>{item.label}</span>
                <item.icon size={12} className="mt-1 md:mt-2 text-gray-400 group-hover:text-white transition-colors" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 md:gap-1 pr-1 md:pr-4">
            <button 
              onClick={toggleBookmark}
              className={`p-2 md:p-3 hover:bg-white/5 rounded-lg md:rounded-xl transition-all ${isBookmarked ? 'text-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'text-gray-500 hover:text-white'}`}
            >
              <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button onClick={() => navigate('/Explore')} className="p-2 md:p-3 hover:bg-white/5 rounded-lg md:rounded-xl text-gray-500 hover:text-white transition-all"><Search size={14} /></button>
            <button onClick={() => navigate('/home')} className="p-2 md:p-3 hover:bg-white/5 rounded-lg md:rounded-xl text-gray-500 hover:text-white transition-all"><User size={14} /></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MoviePage;
