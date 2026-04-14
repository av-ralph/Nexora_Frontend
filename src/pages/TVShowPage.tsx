import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, Clock, CalendarDays, Film, Globe, Users, Award, Loader2, ChevronRight, Download, History, Search, User, Bookmark, X, ChevronDown, List } from 'lucide-react';
import { fetchTVDetails, fetchTVCast, fetchTVExternalIds, fetchTVVideos, fetchSimilarTV, fetchTVSeasons } from '../api/tmdb';
import { supabase } from '../lib/supabase';
import Scene from '../components/ThreeBackground';

interface TVShowDetail {
  id: number;
  name: string;
  backdrop_path: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  first_air_date: string;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  production_companies: { id: number; logo_path: string; name: string; origin_country: string }[];
  tagline: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: {
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    episode_count: number;
  }[];
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

const TVShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const castRef = useRef<HTMLDivElement>(null);
  const similarRef = useRef<HTMLDivElement>(null);
  const [tvShow, setTvShow] = useState<TVShowDetail | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similarShows, setSimilarShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // TV Specific State
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isSeasonSelectorOpen, setIsSeasonSelectorOpen] = useState(false);
  const [isEpisodeSelectorOpen, setIsEpisodeSelectorOpen] = useState(false);
  const [currentSeasonDetails, setCurrentSeasonDetails] = useState<any>(null);

  useEffect(() => {
    const loadTVDetails = async () => {
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
        const tvData = await fetchTVDetails(parseInt(id));
        setTvShow(tvData);
        
        // Fetch external IDs to get IMDb ID
        const externalIds = await fetchTVExternalIds(parseInt(id));
        setImdbId(externalIds.imdb_id);
        
        // For TV shows, cast is usually under /tv/{id}/credits, but fetchMovieCast might work if it uses /movie/{id}/credits
        // tmdb.ts has fetchMovieCast which uses /movie/${movieId}/credits. Let's add fetchTVCast to tmdb.ts later if needed.
        // For now, let's assume fetchMovieCast might not work for TV shows if the endpoint is strictly /movie/
        // Actually, TMDB has /tv/{id}/credits too.
        
        // Let's use fetchMovieCast but I should probably fix it in tmdb.ts to be more generic or add fetchTVCast.
        // Wait, I already updated tmdb.ts with many functions but forgot fetchTVCast.
        
        const castData = await fetchTVCast(parseInt(id));
        setCast(castData.slice(0, 10));

        const videoData = await fetchTVVideos(parseInt(id));
        const trailer = videoData?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        setTrailerKey(trailer ? trailer.key : null);

        const similarData = await fetchSimilarTV(parseInt(id));
        setSimilarShows(similarData.slice(0, 12));

        // Load first season details
        const seasonData = await fetchTVSeasons(parseInt(id), 1);
        setCurrentSeasonDetails(seasonData);

        // Check if bookmarked
        const { data: favorite } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('movie_id', parseInt(id)) // Reusing movie_id for tv_id in schema maybe?
          .maybeSingle();
        setIsBookmarked(!!favorite);
      } catch (err) {
        console.error("Failed to fetch TV details:", err);
        setError("Failed to load TV show details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadTVDetails();
  }, [id]);

  useEffect(() => {
    const loadSeasonDetails = async () => {
      if (!id || !selectedSeason) return;
      try {
        const seasonData = await fetchTVSeasons(parseInt(id), selectedSeason);
        setCurrentSeasonDetails(seasonData);
      } catch (err) {
        console.error("Failed to fetch season details:", err);
      }
    };
    loadSeasonDetails();
  }, [id, selectedSeason]);

  useEffect(() => {
    const recordHistory = async () => {
      if (isPlaying && tvShow) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
          await supabase.from('watch_history').upsert({
            user_id: session.user.id,
            movie_id: tvShow.id,
            movie_title: `${tvShow.name} - S${selectedSeason}E${selectedEpisode}`,
            movie_poster: tvShow.poster_path,
            media_type: 'tv',
            watched_at: new Date().toISOString()
          }, { onConflict: 'user_id,movie_id' });
        } catch (err) {
          console.error("Failed to record watch history:", err);
        }
      }
    };
    recordHistory();
  }, [isPlaying, tvShow, selectedSeason, selectedEpisode]);

  const toggleBookmark = async () => {
    if (!tvShow) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      if (isBookmarked) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('movie_id', tvShow.id);
      } else {
        await supabase.from('favorites').insert({
          user_id: session.user.id,
          movie_id: tvShow.id,
          movie_title: tvShow.name,
          movie_poster: tvShow.poster_path,
          media_type: 'tv'
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

  if (error || !tvShow) {
    return (
      <div className="flex min-h-screen bg-[#050510] text-white items-center justify-center p-6 text-center">
        <p className="text-red-500 text-lg">{error || "TV show not found."}</p>
      </div>
    );
  }

  const backdropUrl = `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`;
  const firstAirYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'N/A';
  const formattedRuntime = tvShow.episode_run_time.length > 0 ? `${tvShow.episode_run_time[0]}m` : 'N/A';
  const country = tvShow.production_countries.length > 0 ? tvShow.production_countries[0].name : 'N/A';
  const studio = tvShow.production_companies.length > 0 ? tvShow.production_companies[0].name : 'N/A';

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

      {/* TV Player Modal */}
      <AnimatePresence>
        {isPlaying && (imdbId || tvShow.id) && (
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
                <h2 className="text-lg font-black uppercase tracking-widest">
                  {tvShow.name} - S{selectedSeason}E{selectedEpisode}
                </h2>
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
                src={`https://vidsrc-embed.ru/embed/tv/${imdbId || tvShow.id}/${selectedSeason}/${selectedEpisode}`}
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
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Trailer_Preview // {tvShow.name}</span>
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
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Log_Entry: {tvShow.name}</h3>
                    {tvShow.tagline && (
                      <p className="text-xl md:text-2xl font-bold italic text-indigo-100/90 leading-tight border-l-2 border-indigo-600 pl-6">
                        "{tvShow.tagline}"
                      </p>
                    )}
                    <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed">
                      {tvShow.overview}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                    {[
                      { label: 'Classification', value: tvShow.genres.map(g => g.name).slice(0, 2).join(' / ') },
                      { label: 'Origin_ID', value: imdbId || 'N/A' },
                      { label: 'Duration', value: formattedRuntime },
                      { label: 'Production', value: studio },
                      { label: 'Seasons', value: tvShow.number_of_seasons.toString() },
                      { label: 'Episodes', value: tvShow.number_of_episodes.toString() },
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
          alt={tvShow.name}
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/60 to-[#050510]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050510] via-transparent to-transparent" />
      </div>

      <Scene />

      {/* Main Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col p-4 md:p-8 lg:p-12">
        
        {/* Top Section */}
        <div className="flex justify-between items-start relative z-20 w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-none tracking-tighter uppercase drop-shadow-[0_10px_50px_rgba(0,0,0,1)] relative z-10 pointer-events-none select-none max-w-[250px] md:max-w-xs">
            {tvShow.name.split(':').map((part, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, x: -50, rotate: -2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ delay: 0.2 + (i * 0.1), duration: 0.6, ease: "easeOut" }}
                className="block"
              >
                {part.trim()}{i === 0 && tvShow.name.includes(':') ? ':' : ''}
              </motion.span>
            ))}
          </h1>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-1 md:space-x-2 text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-4 md:pt-0">
            {[
              { label: 'Main', link: '/' },
              { label: 'TV Shows', link: '/Explore' },
              { label: 'Nexora', link: '/Home' },
              { label: tvShow.name, active: true }
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

          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-xs md:max-w-sm md:text-right space-y-2 md:space-y-4 ml-auto"
          >
            <p className="text-[10px] md:text-xs text-gray-300 leading-relaxed font-medium line-clamp-3 hover:text-white transition-colors cursor-default">
              {tvShow.overview}
            </p>
            <motion.div 
              whileHover={{ scale: 1.05, backgroundColor: "#4f46e5" }}
              className="inline-flex items-center space-x-1 md:space-x-2 bg-indigo-600 text-black px-2 md:px-4 py-1 md:py-1.5 rounded-full font-black text-[8px] md:text-[10px] tracking-tighter cursor-pointer"
            >
              <span className="uppercase italic">NEXORA</span>
              <span>{(tvShow.vote_average || 0).toFixed(1)}</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Middle Section: Play Button and Actions */}
        <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center relative">
          
          <div className="flex flex-col items-center space-y-8 z-20">
            {/* Big Play Button */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (imdbId || tvShow.id) && setIsPlaying(true)}
              className="w-32 h-32 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center group transition-all hover:bg-white/30 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]"
            >
              <Play fill="white" size={32} className="md:w-12 md:h-12 translate-x-1" />
            </motion.button>
          </div>

          {/* Left Floating Info Bar */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-y-2 md:gap-y-4 z-20">
            {[
              { label: 'Country:', value: country.split(',')[0], more: country.includes(',') },
              { label: 'Studio:', value: studio },
              { label: 'Time:', value: formattedRuntime },
              { label: 'Air Date:', value: tvShow.first_air_date },
              { label: 'Status:', value: 'ON_AIR' }
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
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Episode Selection Matrix */}
      <div className="relative z-[60] mt-12 px-4 md:px-12 lg:px-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative group/matrix"
        >
          {/* Scanning Line Effect */}
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 h-full w-px bg-indigo-500/20 blur-sm z-0"
            />
          </div>

          <div className="relative z-10">
            <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter text-white mb-2">
              {tvShow.name}
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em]">Ready_to_Stream</span>
            </div>
          </div>

          <div className="flex space-x-4 relative z-10">
            <div className="relative">
              <button 
                onClick={() => setIsSeasonSelectorOpen(!isSeasonSelectorOpen)}
                className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center space-x-3 hover:bg-white/10 transition-all min-w-[140px]"
              >
                <List size={16} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest">Season {selectedSeason}</span>
                <ChevronDown size={14} className={`transition-transform ${isSeasonSelectorOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isSeasonSelectorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-4 left-0 w-full bg-[#050510]/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar z-[70] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-indigo-500/20"
                  >
                    {tvShow.seasons.map((season) => (
                      <button
                        key={season.id}
                        onClick={() => {
                          setSelectedSeason(season.season_number);
                          setSelectedEpisode(1);
                          setIsSeasonSelectorOpen(false);
                        }}
                        className={`w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between group ${selectedSeason === season.season_number ? 'bg-indigo-600 text-black' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                      >
                        <span>{season.name}</span>
                        {selectedSeason === season.season_number && <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsEpisodeSelectorOpen(!isEpisodeSelectorOpen)}
                className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center space-x-3 hover:bg-white/10 transition-all min-w-[140px]"
              >
                <Play size={16} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest">Episode {selectedEpisode}</span>
                <ChevronDown size={14} className={`transition-transform ${isEpisodeSelectorOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isEpisodeSelectorOpen && currentSeasonDetails && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-4 left-0 w-72 bg-[#050510]/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden max-h-80 overflow-y-auto custom-scrollbar z-[70] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-indigo-500/20"
                  >
                    {currentSeasonDetails.episodes.map((episode: any) => (
                      <button
                        key={episode.id}
                        onClick={() => {
                          setSelectedEpisode(episode.episode_number);
                          setIsEpisodeSelectorOpen(false);
                        }}
                        className={`w-full px-5 py-4 text-left transition-all flex items-center justify-between group ${selectedEpisode === episode.episode_number ? 'bg-indigo-600 text-black' : 'hover:bg-white/10'}`}
                      >
                        <div className="flex flex-col">
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedEpisode === episode.episode_number ? 'text-black' : 'text-indigo-400'}`}>Ep {episode.episode_number}</p>
                          <p className={`text-[9px] font-bold truncate max-w-[180px] ${selectedEpisode === episode.episode_number ? 'text-black/70' : 'text-gray-500 group-hover:text-white'}`}>{episode.name}</p>
                        </div>
                        {selectedEpisode === episode.episode_number && <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
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

      {/* Similar Shows Section */}
      <div ref={similarRef} className="relative z-10 px-4 md:px-12 lg:px-24 pb-48">
        <div className="flex items-center space-x-4 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-500/50" />
          <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">Related_Series</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-500/50" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {similarShows.map((s, index) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                navigate(`/tv/${s.id}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer relative aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 transition-all duration-500 hover:border-indigo-500/50 hover:shadow-[0_0_50px_rgba(79,70,229,0.2)]"
            >
              {s.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w500${s.poster_path}`} 
                  alt={s.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-700">NULL_DATA</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                <p className="text-[10px] font-black uppercase italic tracking-tighter text-white leading-tight line-clamp-2">{s.name}</p>
                <div className="w-0 h-0.5 bg-indigo-500 mt-2 group-hover:w-full transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

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

export default TVShowPage;
